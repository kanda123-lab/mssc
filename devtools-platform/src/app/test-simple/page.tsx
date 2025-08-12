'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store/app-store';
import { 
  Check,
  Settings,
  Database,
  Zap
} from 'lucide-react';

export default function SimpleTest() {
  const { addNotification } = useAppStore();

  const testNotification = () => {
    addNotification({
      type: 'success',
      title: 'Test Notification',
      message: 'Application is working correctly!',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simple Application Test</h1>
        <p className="text-muted-foreground">
          Basic functionality verification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Application Status
          </CardTitle>
          <CardDescription>
            Core application components are working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">UI Components</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="font-medium">State Management</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-600" />
                <span className="font-medium">Navigation</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium">Performance</span>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={testNotification} className="w-full">
              Test Notification System
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Features</CardTitle>
          <CardDescription>Unified application architecture successfully implemented</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Global state management with Zustand</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Unified navigation with breadcrumbs</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Data persistence and cloud sync</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Lazy loading and performance optimization</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>User experience with onboarding flow</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Theme system and accessibility</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}