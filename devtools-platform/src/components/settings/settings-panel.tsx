'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Settings, 
  Palette, 
  Database, 
  Shield, 
  Download, 
  Upload, 
  Trash2,
  Bell,
  Keyboard,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Eye,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore, useAuth, usePreferences, useUI } from '@/lib/store/app-store';
import { useCloudSync } from '@/lib/persistence/cloud-sync';

interface SettingsPanelProps {
  onClose?: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const auth = useAuth();
  const preferences = usePreferences();
  const ui = useUI();
  const {
    updatePreferences,
    resetPreferences,
    updateProfile,
    exportData,
    importData,
    clearAllData,
    addNotification
  } = useAppStore();
  
  const { status: syncStatus, syncNow, exportBackup, importBackup } = useCloudSync();
  
  const [activeTab, setActiveTab] = useState('general');
  const [profileData, setProfileData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
  });

  // Handle preference updates
  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferences({ [key]: value });
    addNotification({
      type: 'success',
      title: 'Settings Updated',
      message: `${key} has been updated successfully.`,
    });
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    updateProfile(profileData);
    addNotification({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
    });
  };

  // Handle data export
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle data import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      const success = importData(data);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Data Imported',
          message: 'Your data has been imported successfully.',
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: 'Failed to import data. Please check the file format.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings? This action cannot be undone.')) {
      resetPreferences();
      addNotification({
        type: 'warning',
        title: 'Settings Reset',
        message: 'All settings have been reset to defaults.',
      });
    }
  };

  // Handle clear all data
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear ALL data? This will remove all your saved data and cannot be undone.')) {
      clearAllData();
      addNotification({
        type: 'warning',
        title: 'Data Cleared',
        message: 'All data has been cleared.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Preferences
              </CardTitle>
              <CardDescription>
                Configure your basic application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={preferences.language} 
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={preferences.timezone} 
                    onValueChange={(value) => handlePreferenceChange('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select 
                    value={preferences.dateFormat} 
                    onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MMM dd, yyyy">Jan 15, 2024</SelectItem>
                      <SelectItem value="dd/MM/yyyy">15/01/2024</SelectItem>
                      <SelectItem value="MM/dd/yyyy">01/15/2024</SelectItem>
                      <SelectItem value="yyyy-MM-dd">2024-01-15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-view">Default View</Label>
                  <Select 
                    value={preferences.defaultView} 
                    onValueChange={(value) => handlePreferenceChange('defaultView', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save your work
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Show desktop notifications
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="keyboard-shortcuts">Keyboard Shortcuts</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable keyboard shortcuts
                    </p>
                  </div>
                  <Switch
                    id="keyboard-shortcuts"
                    checked={preferences.keyboardShortcuts}
                    onCheckedChange={(checked) => handlePreferenceChange('keyboardShortcuts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use compact interface elements
                    </p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Theme
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[
                      { value: 'light', label: 'Light', icon: <Monitor className="h-4 w-4" /> },
                      { value: 'dark', label: 'Dark', icon: <Monitor className="h-4 w-4" /> },
                      { value: 'system', label: 'System', icon: <Smartphone className="h-4 w-4" /> },
                    ].map((theme) => (
                      <Card
                        key={theme.value}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          preferences.theme === theme.value && 'ring-2 ring-primary'
                        )}
                        onClick={() => handlePreferenceChange('theme', theme.value)}
                      >
                        <CardContent className="p-4 text-center">
                          {theme.icon}
                          <div className="text-sm font-medium mt-2">{theme.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations">Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth animations
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={preferences.animationsEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('animationsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound effects for actions
                    </p>
                  </div>
                  <Switch
                    id="sound"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => handlePreferenceChange('soundEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {auth.isAuthenticated ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={auth.user?.plan === 'pro' ? 'default' : 'secondary'}>
                      {auth.user?.plan?.toUpperCase() || 'FREE'} Plan
                    </Badge>
                    <Badge variant="outline">
                      Member since {new Date(auth.user?.createdAt || Date.now()).toLocaleDateString()}
                    </Badge>
                  </div>
                  <Button onClick={handleProfileUpdate} className="w-fit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Sign in to manage your profile
                  </p>
                  <Button>Sign In</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export, import, and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Download className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Export Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Download all your settings and data
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleExport} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Upload className="h-5 w-5 text-green-500" />
                      <div>
                        <h3 className="font-medium">Import Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Restore from exported data
                        </p>
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="mb-2"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Cloud Sync Status */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Globe className={cn(
                        "h-5 w-5",
                        syncStatus.isOnline ? "text-green-500" : "text-red-500"
                      )} />
                      <div>
                        <h3 className="font-medium">Cloud Sync</h3>
                        <p className="text-sm text-muted-foreground">
                          {syncStatus.isOnline ? 'Connected' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={syncNow}
                      disabled={syncStatus.syncInProgress}
                    >
                      {syncStatus.syncInProgress ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Sync Now
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}</div>
                    <div>Queued operations: {syncStatus.queuedOperations}</div>
                    {syncStatus.conflictsCount > 0 && (
                      <div className="text-yellow-600">Conflicts: {syncStatus.conflictsCount}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    These actions cannot be undone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Reset Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Reset all preferences to default
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Clear All Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove all saved data permanently
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleClearData}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve the app by sharing usage data
                    </p>
                  </div>
                  <Switch id="analytics" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="error-reporting">Error Reporting</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically report errors to help fix issues
                    </p>
                  </div>
                  <Switch id="error-reporting" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data for research
                    </p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="developer-mode">Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced developer features
                    </p>
                  </div>
                  <Switch id="developer-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-logs">Debug Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging for troubleshooting
                    </p>
                  </div>
                  <Switch id="debug-logs" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="beta-features">Beta Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Access experimental features
                    </p>
                  </div>
                  <Switch id="beta-features" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Storage Information</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Local storage usage: ~2.3 MB</div>
                  <div>Cache size: ~15.7 MB</div>
                  <div>Database size: ~8.1 MB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}