import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  Image as ImageIcon,
  Send,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { incidentService } from '@/services/incidents';

const incidentSchema = z.object({
  title: z.string().trim().min(10, 'Title must be at least 10 characters').max(100, 'Title too long'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select priority'),
  address: z.string().trim().min(10, 'Please enter complete address').max(200, 'Address too long'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode'),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

const categories = [
  { value: 'pothole', label: 'Pothole / Road Damage' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'garbage', label: 'Garbage / Sanitation' },
  { value: 'streetlight', label: 'Streetlight Issue' },
  { value: 'water_leakage', label: 'Water Leakage' },
  { value: 'electricity', label: 'Electricity Issue' },
  { value: 'drainage', label: 'Drainage / Sewer' },
  { value: 'safety', label: 'Safety / Security' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low - Minor inconvenience' },
  { value: 'medium', label: 'Medium - Needs attention' },
  { value: 'high', label: 'High - Urgent issue' },
  { value: 'critical', label: 'Critical - Emergency' },
];

const ReportIncident = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState('');

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    mode: 'onBlur',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files).slice(0, 5 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocationError('Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (data: IncidentFormData) => {
    if (images.length === 0) {
      toast({
        title: "Photos Required",
        description: "Please upload at least one photo of the incident.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const incidentData = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        location: `${data.address}, Pincode: ${data.pincode}`,
        latitude: coords?.lat ?? 0,
        longitude: coords?.lon ?? 0,
        images: images.map(img => img.file),
      };

      const response = await incidentService.createIncident(incidentData);

      if (response.success) {
        toast({
          title: "Report Submitted!",
          description: "Your incident report has been submitted successfully. You'll receive updates on its progress.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Submission Failed",
          description: response.error || "Failed to submit report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Report an Incident
          </h1>
          <p className="text-muted-foreground">
            Provide details about the civic issue you've encountered.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <Label>Photos of Incident *</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img 
                    src={img.preview} 
                    alt={`Upload ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Add Photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-muted-foreground">
              Upload up to 5 photos. Clear images help in faster resolution.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Large pothole causing traffic issues"
              {...form.register('title')}
              className={cn(
                form.formState.errors.title && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. Include any relevant information that might help in resolution..."
              rows={4}
              {...form.register('description')}
              className={cn(
                "resize-none",
                form.formState.errors.description && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select onValueChange={(val) => form.setValue('category', val)}>
                <SelectTrigger className={cn(
                  form.formState.errors.category && "border-destructive"
                )}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select onValueChange={(val) => form.setValue('priority', val)}>
                <SelectTrigger className={cn(
                  form.formState.errors.priority && "border-destructive"
                )}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">Location Details</span>
          </div>
          {locationError && (
            <p className="text-xs text-muted-foreground">{locationError}</p>
          )}

            <div className="space-y-2">
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter the complete address where the incident is located"
                rows={2}
                {...form.register('address')}
                className={cn(
                  "resize-none",
                  form.formState.errors.address && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="123456"
                maxLength={6}
                {...form.register('pincode')}
                className={cn(
                  "w-32",
                  form.formState.errors.pincode && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {form.formState.errors.pincode && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pincode.message}
                </p>
              )}
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-3 p-4 bg-warning/10 rounded-xl border border-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Important Notice</p>
              <p className="text-muted-foreground">
                False or misleading reports may result in account suspension. Please ensure all information provided is accurate.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Report
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ReportIncident;
