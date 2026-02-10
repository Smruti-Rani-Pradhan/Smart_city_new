import { useState } from 'react';
import { X, Bell, Lock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOfficial?: boolean;
}

export const SettingsModal = ({ open, onOpenChange, isOfficial = false }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
          <DialogDescription>Manage your account settings and preferences</DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 mt-6">
          {}
          <div className="w-40 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {}
          <div className="flex-1 space-y-6">
            {}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Full Name</Label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email Address</Label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                      />
                    </div>
                    {isOfficial && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Department</Label>
                        <input
                          type="text"
                          placeholder="Municipal Office"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Get notified about updates</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Email Alerts</p>
                        <p className="text-sm text-muted-foreground">Receive emails for important updates</p>
                      </div>
                      <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Current Password</Label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">New Password</Label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Confirm Password</Label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                    </div>
                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
