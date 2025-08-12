'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Database,
  Globe,
  FileText,
  Code,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Loading skeleton components
export function ToolSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded animate-pulse" />
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-80 border-r bg-background p-4 space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className="h-10 w-10 bg-muted rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-8 w-16 bg-muted rounded animate-pulse" />
    </div>
  );
}

// Progress indicators
interface ProgressIndicatorProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressIndicator({ 
  value, 
  max, 
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md'
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500', 
    error: 'bg-red-500'
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">{label}</span>
          {showPercentage && <span className="text-muted-foreground">{percentage}%</span>}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(sizeClasses[size], variantClasses[variant])}
      />
    </div>
  );
}

// Loading states for different scenarios
interface LoadingStateProps {
  type: 'initial' | 'processing' | 'saving' | 'loading' | 'connecting';
  title?: string;
  description?: string;
  progress?: number;
  showCancel?: boolean;
  onCancel?: () => void;
  duration?: number;
}

export function LoadingState({
  type,
  title,
  description,
  progress,
  showCancel = false,
  onCancel,
  duration
}: LoadingStateProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!duration) return;
    
    const interval = setInterval(() => {
      setElapsed(prev => Math.min(prev + 1, duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  const getIcon = () => {
    switch (type) {
      case 'initial':
        return <Zap className="h-5 w-5 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'saving':
        return <FileText className="h-5 w-5 animate-pulse" />;
      case 'loading':
        return <Code className="h-5 w-5 animate-pulse" />;
      case 'connecting':
        return <Globe className="h-5 w-5 animate-pulse" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getDefaultText = () => {
    switch (type) {
      case 'initial':
        return { title: 'Initializing...', description: 'Setting up the interface' };
      case 'processing':
        return { title: 'Processing...', description: 'Please wait while we process your request' };
      case 'saving':
        return { title: 'Saving...', description: 'Your data is being saved securely' };
      case 'loading':
        return { title: 'Loading...', description: 'Fetching data from the server' };
      case 'connecting':
        return { title: 'Connecting...', description: 'Establishing connection to the service' };
      default:
        return { title: 'Loading...', description: 'Please wait' };
    }
  };

  const defaults = getDefaultText();
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2 text-primary">
            {getIcon()}
            <h3 className="text-lg font-semibold">{displayTitle}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            {displayDescription}
          </p>

          {progress !== undefined && (
            <div className="w-full">
              <ProgressIndicator 
                value={progress} 
                max={100} 
                showPercentage={true}
              />
            </div>
          )}

          {duration && (
            <div className="text-xs text-muted-foreground">
              {elapsed}s / {duration}s
            </div>
          )}

          {showCancel && onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Status indicators
interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  compact?: boolean;
  showIcon?: boolean;
}

export function StatusIndicator({ 
  status, 
  message, 
  compact = false,
  showIcon = true 
}: StatusIndicatorProps) {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {showIcon && getIcon()}
        {message && <span className="text-xs">{message}</span>}
      </div>
    );
  }

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1">
      {showIcon && getIcon()}
      {message || status}
    </Badge>
  );
}

// Connection status component
interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  onRetry?: () => void;
  lastPing?: number;
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  error,
  onRetry,
  lastPing
}: ConnectionStatusProps) {
  const getStatus = () => {
    if (isConnecting) return 'connecting';
    if (error) return 'error';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const getStatusColor = () => {
    switch (getStatus()) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (getStatus()) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error':
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getStatusIcon()}
        <span className="font-medium capitalize">{getStatus()}</span>
      </div>
      
      {lastPing && isConnected && (
        <span className="text-xs text-muted-foreground">
          ({lastPing}ms)
        </span>
      )}
      
      {error && (
        <span className="text-xs text-red-500 max-w-48 truncate" title={error}>
          {error}
        </span>
      )}
      
      {onRetry && (error || !isConnected) && (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Data loading states
export function EmptyState({
  icon: Icon = FileText,
  title = "No data available",
  description = "There's no data to display at the moment.",
  action
}: {
  icon?: any;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  showDetails = false
}: {
  error: Error | string;
  onRetry?: () => void;
  showDetails?: boolean;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' ? error.stack : undefined;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4 max-w-sm">{errorMessage}</p>
      
      {showDetails && errorStack && (
        <details className="text-xs text-muted-foreground max-w-md mb-4">
          <summary className="cursor-pointer hover:text-foreground">
            Show technical details
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto">
            {errorStack}
          </pre>
        </details>
      )}
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}