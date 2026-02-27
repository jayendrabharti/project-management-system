import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Palette,
  Shield,
  Sun,
  Moon,
  Monitor,
  Database,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useTheme } from '../components/theme-provider';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';
import seedService from '../services/seed.service';
import type { ColorPreset } from '../components/theme-provider';

const presets: { name: string; value: ColorPreset; color: string }[] = [
  { name: 'Violet', value: 'violet', color: '#7c3aed' },
  { name: 'Blue', value: 'blue', color: '#3b82f6' },
  { name: 'Green', value: 'green', color: '#10b981' },
  { name: 'Orange', value: 'orange', color: '#f59e0b' },
  { name: 'Rose', value: 'rose', color: '#f43f5e' },
  { name: 'Zinc', value: 'zinc', color: '#71717a' },
];

export default function Settings() {
  const { user, checkAuth } = useAuth();
  const { theme, setTheme, colorPreset, setColorPreset } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name, email });
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedService.seedDemoData();
      toast.success('Demo data populated! Please log in again.');
      // Clear auth and redirect since users were cleared
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (e: any) {
      toast.error(e.message || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <UserIcon className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your name and email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-1.5">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Theme Mode</Label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          theme === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-border/80 hover:bg-muted/50'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${theme === option.value ? 'text-primary' : 'text-muted-foreground'}`}
                        />
                        <span
                          className={`text-sm font-medium ${theme === option.value ? 'text-primary' : ''}`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Color Preset */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Accent Color</Label>
                <div className="grid grid-cols-6 gap-3 max-w-md">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setColorPreset(preset.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        colorPreset === preset.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-[11px] font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={saving}
                variant="outline"
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Demo Data
              </CardTitle>
              <CardDescription>
                Populate the database with sample data for demonstration. This will{' '}
                <strong>clear all existing data</strong> and create fresh demo projects, tasks, and
                users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleSeedData}
                disabled={seeding}
                className="gap-1.5"
              >
                {seeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Populating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Populate Demo Data
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                After seeding, log in with: <strong>jayendra@example.com</strong> /{' '}
                <strong>password123</strong>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
