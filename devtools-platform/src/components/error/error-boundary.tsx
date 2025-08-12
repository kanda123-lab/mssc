'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StorageManager } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { PlatformError } from '@/types';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Home,
  RotateCcw
} from 'lucide-react';

interface Props {
  children: ReactNode;
  toolId?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  showDetails: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: number[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.logError(error, errorInfo);
    
    this.setState({
      errorInfo,
      errorId,
      retryCount: this.state.retryCount + 1
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error) && this.state.retryCount < this.maxRetries) {
      const timeout = window.setTimeout(() => {
        this.handleRetry();
      }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
      
      this.retryTimeouts.push(timeout);
    }
  }

  componentWillUnmount() {
    // Clear any pending timeouts
    this.retryTimeouts.forEach(timeout => {
      window.clearTimeout(timeout);
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo): string {
    const errorId = generateId();
    
    try {
      const platformError: PlatformError = {
        id: errorId,
        toolId: this.props.toolId || 'unknown',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack || ''
        } as Error,
        timestamp: Date.now(),
        resolved: false
      };

      // Store error in localStorage for debugging
      const data = StorageManager.getData();
      const errors = data.platformErrors || [];
      errors.unshift(platformError);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(50);
      }
      
      StorageManager.updateField('platformErrors', errors);
      
      // Log to console for development
      console.error(`Error ${errorId}:`, error);
      console.error('Error Info:', errorInfo);
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
    
    return errorId;
  }

  private shouldAutoRetry(error: Error): boolean {
    // Auto-retry for network errors, timeout errors, etc.
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'AbortError',
      'ChunkLoadError',
      'Loading chunk'
    ];
    
    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || 
      error.name.includes(pattern)
    );
  }

  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'medium'; // Usually fixable with retry
    }
    
    if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
      return 'high'; // Likely a coding error
    }
    
    if (error.name === 'ReferenceError') {
      return 'critical'; // Definitely a coding error
    }
    
    return 'medium'; // Default severity
  }

  private getErrorCategory(error: Error): string {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network';
    }
    
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading')) {
      return 'Loading';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'JavaScript';
    }
    
    if (error.message.includes('localStorage') || error.message.includes('storage')) {
      return 'Storage';
    }
    
    return 'General';
  }

  private getSuggestion(error: Error): string {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'Try refreshing the page or clearing your browser cache.';
    }
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Check your internet connection and try again.';
    }
    
    if (error.message.includes('localStorage')) {
      return 'Your browser storage might be full. Try clearing some data.';
    }
    
    return 'Try refreshing the page. If the problem persists, contact support.';
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopyError = () => {
    if (this.state.error) {
      const errorText = `
Error ID: ${this.state.errorId}
Tool: ${this.props.toolId || 'unknown'}
Timestamp: ${new Date().toISOString()}
Error: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
      `.trim();
      
      navigator.clipboard.writeText(errorText).then(() => {
        // Could show a toast notification here
      });
    }
  };

  private handleReportError = () => {
    // Open GitHub issues or support system
    const url = 'https://github.com/your-repo/issues/new';
    window.open(url, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, showDetails, retryCount } = this.state;
      const severity = error ? this.getErrorSeverity(error) : 'medium';
      const category = error ? this.getErrorCategory(error) : 'General';
      const suggestion = error ? this.getSuggestion(error) : '';
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-96 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  severity === 'critical' ? 'bg-red-100 text-red-600' :
                  severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category} Error in {this.props.toolId || 'Application'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Message */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Error Message:
                </p>
                <p className="text-sm font-mono bg-background px-3 py-2 rounded border">
                  {error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {/* Suggestion */}
              {suggestion && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Suggestion:</strong> {suggestion}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again {retryCount > 0 && `(${retryCount}/${this.maxRetries})`}
                  </Button>
                )}
                
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Advanced Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.handleCopyError}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy Error Details
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.handleReportError}
                  className="flex items-center gap-2"
                >
                  <Bug className="h-3 w-3" />
                  Report Issue
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="flex items-center gap-2"
                >
                  {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  Technical Details
                </Button>
              </div>

              {/* Technical Details */}
              {showDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Error ID:</p>
                    <p className="text-xs font-mono bg-background px-2 py-1 rounded border">
                      {errorId}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Timestamp:</p>
                    <p className="text-xs font-mono bg-background px-2 py-1 rounded border">
                      {new Date().toISOString()}
                    </p>
                  </div>
                  
                  {error?.stack && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Stack Trace:</p>
                      <pre className="text-xs font-mono bg-background px-2 py-1 rounded border overflow-x-auto whitespace-pre-wrap">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Component Stack:</p>
                      <pre className="text-xs font-mono bg-background px-2 py-1 rounded border overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping tools with error boundaries
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  toolId?: string
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary toolId={toolId}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting
export function useErrorHandler(toolId?: string) {
  const reportError = (error: Error, context?: string) => {
    const errorId = generateId();
    
    try {
      const platformError: PlatformError = {
        id: errorId,
        toolId: toolId || 'unknown',
        error,
        timestamp: Date.now(),
        resolved: false
      };

      const data = StorageManager.getData();
      const errors = data.platformErrors || [];
      errors.unshift(platformError);
      
      if (errors.length > 50) {
        errors.splice(50);
      }
      
      StorageManager.updateField('platformErrors', errors);
      
      console.error(`Manual error report ${errorId}:`, error);
      if (context) {
        console.error('Context:', context);
      }
      
    } catch (loggingError) {
      console.error('Failed to report error:', loggingError);
    }
    
    return errorId;
  };

  return { reportError };
}