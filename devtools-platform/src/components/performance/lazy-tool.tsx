'use client';

import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { PerformanceMonitor, BundleOptimizer, useIntersectionObserver } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface LazyToolProps {
  toolId: string;
  toolName: string;
  description: string;
  importFunction: () => Promise<{ default: React.ComponentType<any> }>;
  fallbackComponent?: React.ComponentType;
  loadingComponent?: React.ComponentType;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
  lazyLoad?: boolean;
  children?: React.ReactNode;
}

// Default loading component
const DefaultLoadingComponent = () => (
  <Card className="w-full max-w-4xl mx-auto">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <CardTitle>Loading Tool...</CardTitle>
      </div>
      <CardDescription>
        Initializing the tool interface and dependencies
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Default error component
const DefaultErrorComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
  <Card className="w-full max-w-4xl mx-auto border-destructive">
    <CardHeader>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <CardTitle className="text-destructive">Failed to Load Tool</CardTitle>
      </div>
      <CardDescription>
        There was an error loading this tool. This might be due to a network issue or a temporary problem.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm font-medium text-destructive">Error Details:</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
        <Button
          onClick={retry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Lazy tool wrapper component
export function LazyTool({
  toolId,
  toolName,
  description,
  importFunction,
  fallbackComponent: FallbackComponent,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  preload = false,
  lazyLoad = false,
  children,
  ...props
}: LazyToolProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Create lazy component
  const LazyComponent = lazy(async () => {
    try {
      PerformanceMonitor.startMeasure(`lazy-load-${toolId}`);
      
      const module = await BundleOptimizer.loadModule(toolId, importFunction);
      
      PerformanceMonitor.endMeasure(`lazy-load-${toolId}`);
      setIsLoaded(true);
      setLoadError(null);
      
      return module;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Failed to load tool ${toolId}:`, err);
      setLoadError(err);
      throw err;
    }
  });

  // Preload effect
  useEffect(() => {
    if (preload && !isLoaded && !loadError) {
      // Preload the component when requested
      importFunction().catch(error => {
        console.error(`Preload failed for ${toolId}:`, error);
      });
    }
  }, [preload, toolId, importFunction, isLoaded, loadError]);

  // Lazy load effect
  useEffect(() => {
    if (lazyLoad && isVisible && !isLoaded && !loadError) {
      // Load component when it becomes visible
      const timer = setTimeout(() => {
        importFunction().catch(error => {
          const err = error instanceof Error ? error : new Error('Unknown error occurred');
          setLoadError(err);
        });
      }, 100); // Small delay to avoid loading during rapid scrolling

      return () => clearTimeout(timer);
    }
  }, [lazyLoad, isVisible, toolId, importFunction, isLoaded, loadError]);

  const retryLoad = () => {
    setLoadError(null);
    setRetryCount(prev => prev + 1);
    setIsLoaded(false);
  };

  // If there's a fallback component and we haven't loaded yet
  if (FallbackComponent && !isLoaded && !loadError) {
    return (
      <div ref={containerRef}>
        <FallbackComponent />
      </div>
    );
  }

  // If there's an error, show error component
  if (loadError && ErrorComponent) {
    return (
      <div ref={containerRef}>
        <ErrorComponent error={loadError} retry={retryLoad} />
      </div>
    );
  }

  // For lazy loading, don't render until visible
  if (lazyLoad && !isVisible) {
    return (
      <div ref={containerRef} className="h-96 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Tool will load when visible</div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              importFunction().catch(error => {
                const err = error instanceof Error ? error : new Error('Unknown error occurred');
                setLoadError(err);
              });
            }}
          >
            Load Now
          </Button>
        </div>
      </div>
    );
  }

  // Render the lazy component with suspense
  return (
    <div ref={containerRef}>
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props}>
          {children}
        </LazyComponent>
      </Suspense>
    </div>
  );
}

// Hook for creating lazy tool components
export function useLazyTool(toolId: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  const preloadTool = async (importFunction: () => Promise<any>) => {
    if (isPreloaded) return;

    try {
      await importFunction();
      setIsPreloaded(true);
      console.log(`Tool ${toolId} preloaded successfully`);
    } catch (error) {
      console.error(`Failed to preload tool ${toolId}:`, error);
    }
  };

  return {
    isPreloaded,
    preloadTool
  };
}

// Virtual scrolling component for large lists
interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className,
  onScroll
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={keyExtractor(item, startIndex + index)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Performance metrics display component
export function PerformanceMetrics({ toolId }: { toolId: string }) {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [memoryStatus, setMemoryStatus] = useState<any>({});

  useEffect(() => {
    const updateMetrics = () => {
      const allMetrics = PerformanceMonitor.getAllMetrics();
      const memory = PerformanceMonitor.checkMemoryUsage();
      
      setMetrics(allMetrics);
      setMemoryStatus(memory);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toolMetrics = Object.entries(metrics).filter(([key]) => 
    key.includes(toolId)
  );

  if (toolMetrics.length === 0 && !memoryStatus.used) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-xs">
          {toolMetrics.map(([name, data]) => (
            <div key={name} className="flex justify-between">
              <span className="text-muted-foreground">{name}:</span>
              <span>{data.average?.toFixed(2)}ms avg</span>
            </div>
          ))}
          
          {memoryStatus.used > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory:</span>
              <span className={cn(
                memoryStatus.warning && "text-yellow-600",
                memoryStatus.critical && "text-red-600"
              )}>
                {Math.round(memoryStatus.used / 1024 / 1024)}MB
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}