import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Captcha } from '@/components/ui/Captcha';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth';

interface OfficialLoginData {
  email: string;
  password: string;
  captcha: string;
}

export const OfficialLoginFormComponent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OfficialLoginData>({
    mode: 'onBlur',
  });

  const handleSubmit = async (data: OfficialLoginData) => {
    if (!isCaptchaValid) {
      toast({
        title: "Captcha Required",
        description: "Please solve the captcha correctly",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });
      if (response.success && response.data?.user.userType === 'official') {
        toast({
          title: "Official Login Successful",
          description: "Redirecting to official dashboard"
        });
        setTimeout(() => navigate('/official/dashboard'), 500);
      } else if (response.success) {
        toast({
          title: "Access Denied",
          description: "Official account required",
          variant: "destructive",
        });
        await authService.logout();
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Official Login</h1>
          <p className="text-muted-foreground">Sign in as municipal or society admin</p>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Official Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="official@safelive.in"
              autoComplete="email"
              {...form.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              })}
              className={cn(
                form.formState.errors.email && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                {...form.register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={cn(
                  "pr-10",
                  form.formState.errors.password && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Security Check</Label>
            <Captcha
              value={captchaValue}
              onChange={(val) => {
                setCaptchaValue(val);
                form.setValue('captcha', val);
              }}
              onValidChange={setIsCaptchaValid}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-accent hover:opacity-90 transition-opacity"
            size="lg"
            disabled={isSubmitting || !isCaptchaValid}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In as Official
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Register Here
              </Link>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose "Official" during registration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Local user?{' '}
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
