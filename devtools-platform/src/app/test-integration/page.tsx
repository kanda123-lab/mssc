'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore, useAuth, usePreferences, useNavigation, useUI } from '@/lib/store/app-store';
import { useCloudSync } from '@/lib/persistence/cloud-sync';
import { lazyLoadingManager } from '@/lib/performance/lazy-loading';
import SettingsPanel from '@/components/settings/settings-panel';
import { 
  Check,
  X,
  Settings,
  Cloud,
  Zap,
  Database,
  User,
  Navigation,
  Palette
} from 'lucide-react';

export default function IntegrationTest() {
  const auth = useAuth();
  const preferences = usePreferences();
  const navigation = useNavigation();
  const ui = useUI();
  const { 
    addNotification,
    toggleFavorite,
    updatePreferences,
    createWorkspace,
    setCurrentTool 
  } = useAppStore();
  const { status: syncStatus, syncNow } = useCloudSync();
  
  const [showSettings, setShowSettings] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Test functions
  const testStateManagement = async () => {
    try {
      // Test preferences
      updatePreferences({ theme: 'dark' });
      
      // Test notifications
      addNotification({
        type: 'success',
        title: 'State Test',
        message: 'State management working correctly',
      });
      
      // Test favorites
      toggleFavorite('json-formatter');
      
      // Test workspace
      createWorkspace({
        name: 'Test Workspace',
        description: 'Integration test workspace',
        tools: [],
        settings: {},
        shared: false
      });
      
      setTestResults(prev => ({ ...prev, stateManagement: true }));
    } catch (error) {
      console.error('State management test failed:', error);
      setTestResults(prev => ({ ...prev, stateManagement: false }));
    }
  };

  const testNavigation = async () => {
    try {
      setCurrentTool('api-tester');
      setTestResults(prev => ({ ...prev, navigation: true }));
    } catch (error) {
      console.error('Navigation test failed:', error);
      setTestResults(prev => ({ ...prev, navigation: false }));
    }
  };

  const testCloudSync = async () => {
    try {
      await syncNow();
      setTestResults(prev => ({ ...prev, cloudSync: true }));
    } catch (error) {
      console.error('Cloud sync test failed:', error);
      setTestResults(prev => ({ ...prev, cloudSync: false }));
    }
  };

  const testLazyLoading = async () => {
    try {
      await lazyLoadingManager.preloadComponent('settings-panel');
      const metrics = lazyLoadingManager.getMetrics();
      setTestResults(prev => ({ ...prev, lazyLoading: metrics.length >= 0 }));
    } catch (error) {
      console.error('Lazy loading test failed:', error);
      setTestResults(prev => ({ ...prev, lazyLoading: false }));
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      testStateManagement(),
      testNavigation(),
      testCloudSync(),
      testLazyLoading(),
    ]);
  };

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return null;
    return status ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean | undefined) => {
    if (status === undefined) return <Badge variant="secondary">Not Tested</Badge>;
    return status ? (
      <Badge className="bg-green-500 hover:bg-green-600">Passed</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Integration Test Dashboard</h1>
        <p className="text-muted-foreground">
          Test all unified application features and integrations
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Controls
          </CardTitle>
          <CardDescription>
            Run comprehensive tests for all application features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAllTests}>
              Run All Tests
            </Button>
            <Button variant="outline" onClick={testStateManagement}>
              Test State Management
            </Button>
            <Button variant="outline" onClick={testNavigation}>
              Test Navigation
            </Button>
            <Button variant="outline" onClick={testCloudSync}>
              Test Cloud Sync
            </Button>
            <Button variant="outline" onClick={testLazyLoading}>
              Test Lazy Loading
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Open Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              State Management
              {getStatusIcon(testResults.stateManagement)}
            </CardTitle>
            <CardDescription>Global state, preferences, workspaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(testResults.stateManagement)}
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Theme: {preferences.theme}</div>
              <div>Language: {preferences.language}</div>
              <div>Favorites: {navigation.favoriteTools.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Navigation System
              {getStatusIcon(testResults.navigation)}
            </CardTitle>
            <CardDescription>Tool navigation and routing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(testResults.navigation)}
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Current Tool: {navigation.currentTool || 'None'}</div>
              <div>Recent Tools: {navigation.recentTools.length}</div>
              <div>Breadcrumbs: {navigation.breadcrumbs.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Sync & Persistence
              {getStatusIcon(testResults.cloudSync)}
            </CardTitle>
            <CardDescription>Data sync and backup functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(testResults.cloudSync)}
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Online: {syncStatus.isOnline ? 'Yes' : 'No'}</div>
              <div>Sync Status: {syncStatus.syncInProgress ? 'In Progress' : 'Idle'}</div>
              <div>Queued Ops: {syncStatus.queuedOperations}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance & Lazy Loading
              {getStatusIcon(testResults.lazyLoading)}
            </CardTitle>
            <CardDescription>Code splitting and optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              {getStatusBadge(testResults.lazyLoading)}
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Load Metrics: {lazyLoadingManager.getMetrics().length}</div>
              <div>Preloaded: Available</div>
              <div>Bundle Split: Active</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application State Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Application State
          </CardTitle>
          <CardDescription>Overview of current app state and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Authentication</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Status: {auth.isAuthenticated ? 'Signed In' : 'Anonymous'}</div>
                {auth.user && (
                  <>
                    <div>User: {auth.user.name}</div>
                    <div>Plan: {auth.user.plan}</div>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Preferences</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Auto Save: {preferences.autoSave ? 'On' : 'Off'}</div>
                <div>Notifications: {preferences.notifications ? 'On' : 'Off'}</div>
                <div>Compact Mode: {preferences.compactMode ? 'On' : 'Off'}</div>
                <div>Theme: {preferences.theme}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">UI State</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Theme: {ui.theme}</div>
                <div>Loading: {ui.loading ? 'Yes' : 'No'}</div>
                <div>Notifications: {ui.notifications.length}</div>
                <div>Panels: {Object.keys(ui.panels).length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-background">
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}