'use client';

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';
import { useAppStore } from '@/lib/store/app-store';

// Route-based code splitting configuration
interface LazyRouteConfig {
  path: string;
  component: () => Promise<{ default: ComponentType<any> }>;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

// Performance metrics tracking
interface LoadMetrics {
  componentId: string;
  loadTime: number;
  size?: number;
  timestamp: number;
  fromCache: boolean;
}

class LazyLoadingManager {
  private loadedComponents = new Map<string, ComponentType<any>>();
  private loadingPromises = new Map<string, Promise<ComponentType<any>>>();
  private preloadedComponents = new Set<string>();
  private loadMetrics: LoadMetrics[] = [];
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.setupIntersectionObserver();
    this.setupPreloading();
  }

  // Setup intersection observer for lazy loading
  private setupIntersectionObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const componentId = entry.target.getAttribute('data-lazy-component');
            if (componentId && !this.loadedComponents.has(componentId)) {
              this.loadComponent(componentId);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }

  // Setup preloading for high-priority components
  private setupPreloading() {
    if (typeof window === 'undefined') return;

    // Preload high-priority components after initial load
    setTimeout(() => {
      this.preloadHighPriorityComponents();
    }, 2000);

    // Preload on user interaction hints
    ['mousedown', 'touchstart'].forEach(event => {
      document.addEventListener(event, (e) => {
        const target = e.target as HTMLElement;
        const componentId = target.getAttribute('data-preload-component');
        if (componentId && !this.preloadedComponents.has(componentId)) {
          this.preloadComponent(componentId);
        }
      }, { passive: true });
    });
  }

  // Load component with metrics tracking
  async loadComponent(componentId: string): Promise<ComponentType<any> | null> {
    const startTime = performance.now();
    
    // Check if already loaded
    if (this.loadedComponents.has(componentId)) {
      this.recordMetrics(componentId, 0, true);
      return this.loadedComponents.get(componentId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(componentId)) {
      return this.loadingPromises.get(componentId)!;
    }

    try {
      const loadPromise = this.loadComponentModule(componentId);
      this.loadingPromises.set(componentId, loadPromise);

      const Component = await loadPromise;
      
      const loadTime = performance.now() - startTime;
      this.loadedComponents.set(componentId, Component);
      this.loadingPromises.delete(componentId);
      
      this.recordMetrics(componentId, loadTime, false);
      
      // Record in app store
      useAppStore.getState().recordLoadTime(componentId, loadTime);

      return Component;
    } catch (error) {
      this.loadingPromises.delete(componentId);
      console.error(`Failed to load component ${componentId}:`, error);
      useAppStore.getState().incrementErrorCount();
      return null;
    }
  }

  // Load component module based on ID
  private async loadComponentModule(componentId: string): Promise<ComponentType<any>> {
    const componentMap: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
      // API Tools
      'api-tester': () => import('@/app/tools/api-tester/page'),
      'websocket-tester': () => import('@/app/tools/websocket-tester/page'),
      'mock-server': () => import('@/app/tools/mock-server/page'),
      
      // Data Tools
      'json-formatter': () => import('@/app/tools/json-formatter/page'),
      'base64-encoder': () => import('@/app/tools/base64/page'),
      
      // Database Tools
      'sql-query-builder': () => import('@/app/tools/sql-query-builder/page'),
      'mongodb-query-builder': () => import('@/app/tools/mongodb-query-builder/page'),
      'database-connection-builder': () => import('@/app/tools/connection-string-builder/page'),
      'visual-query-builder': () => import('@/app/tools/visual-query-builder/page'),
      
      // Development Tools
      'npm-analyzer': () => import('@/app/tools/npm-package-analyzer/page'),
      'env-manager': () => import('@/app/tools/environment-variable-manager/page'),
      
      // Special components
      'test-dashboard': () => import('@/components/testing/test-dashboard'),
      'settings-panel': () => import('@/components/settings/settings-panel'),
      'onboarding-flow': () => import('@/components/onboarding/onboarding-flow'),
    };

    const loader = componentMap[componentId];
    if (!loader) {
      throw new Error(`Unknown component: ${componentId}`);
    }

    const module = await loader();
    return module.default;
  }

  // Preload component
  async preloadComponent(componentId: string): Promise<void> {
    if (this.preloadedComponents.has(componentId) || this.loadedComponents.has(componentId)) {
      return;
    }

    this.preloadedComponents.add(componentId);
    
    try {
      await this.loadComponent(componentId);
    } catch (error) {
      this.preloadedComponents.delete(componentId);
      console.warn(`Failed to preload component ${componentId}:`, error);
    }
  }

  // Preload high-priority components
  private preloadHighPriorityComponents() {
    const highPriorityComponents = [
      'json-formatter', // Most commonly used
      'api-tester',     // Core functionality
      'settings-panel', // Frequently accessed
    ];

    highPriorityComponents.forEach(componentId => {
      this.preloadComponent(componentId);
    });
  }

  // Record load metrics
  private recordMetrics(componentId: string, loadTime: number, fromCache: boolean) {
    const metric: LoadMetrics = {
      componentId,
      loadTime,
      timestamp: Date.now(),
      fromCache,
    };

    this.loadMetrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.loadMetrics.length > 100) {
      this.loadMetrics = this.loadMetrics.slice(-100);
    }
  }

  // Get performance metrics
  getMetrics(): LoadMetrics[] {
    return [...this.loadMetrics];
  }

  // Get average load time for a component
  getAverageLoadTime(componentId: string): number {
    const componentMetrics = this.loadMetrics.filter(m => 
      m.componentId === componentId && !m.fromCache
    );
    
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, m) => sum + m.loadTime, 0);
    return total / componentMetrics.length;
  }

  // Get loaded component (public accessor)
  getLoadedComponent(componentId: string): ComponentType<any> | null {
    return this.loadedComponents.get(componentId) || null;
  }

  // Check if component is loaded
  isComponentLoaded(componentId: string): boolean {
    return this.loadedComponents.has(componentId);
  }

  // Observe element for lazy loading
  observeElement(element: HTMLElement, componentId: string) {
    if (this.observer && element) {
      element.setAttribute('data-lazy-component', componentId);
      this.observer.observe(element);
    }
  }

  // Unobserve element
  unobserveElement(element: HTMLElement) {
    if (this.observer && element) {
      this.observer.unobserve(element);
    }
  }

  // Cleanup
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Export singleton instance
export const lazyLoadingManager = new LazyLoadingManager();

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  componentId: string,
  fallback?: ComponentType<any>
): LazyExoticComponent<ComponentType<P>> {
  return lazy(async () => {
    const Component = await lazyLoadingManager.loadComponent(componentId);
    return { default: Component || fallback || (() => null) };
  });
}

// Component for lazy loading with intersection observer
interface LazyComponentProps {
  componentId: string;
  fallback?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onLoad?: (componentId: string) => void;
}

export function LazyComponent({ 
  componentId, 
  fallback, 
  className,
  children,
  onLoad 
}: LazyComponentProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if component is already loaded
    const loadedComponent = lazyLoadingManager.getLoadedComponent(componentId);
    if (loadedComponent) {
      setComponent(loadedComponent);
      setIsLoaded(true);
      onLoad?.(componentId);
      return;
    }

    // Setup intersection observer
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoaded) {
          try {
            const loadedComponent = await lazyLoadingManager.loadComponent(componentId);
            if (loadedComponent) {
              setComponent(loadedComponent);
              setIsLoaded(true);
              onLoad?.(componentId);
            }
          } catch (error) {
            console.error(`Failed to lazy load ${componentId}:`, error);
          }
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [componentId, isLoaded, onLoad]);

  if (Component && isLoaded) {
    return (
      <div ref={elementRef} className={className}>
        <Component>{children}</Component>
      </div>
    );
  }

  return (
    <div ref={elementRef} className={className}>
      {fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

// Hook for using lazy loading
export function useLazyLoading(componentId: string) {
  const [isLoaded, setIsLoaded] = React.useState(
    lazyLoadingManager.isComponentLoaded(componentId)
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await lazyLoadingManager.loadComponent(componentId);
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [componentId, isLoaded, isLoading]);

  const preloadComponent = React.useCallback(async () => {
    await lazyLoadingManager.preloadComponent(componentId);
  }, [componentId]);

  return {
    isLoaded,
    isLoading,
    error,
    loadComponent,
    preloadComponent,
    metrics: lazyLoadingManager.getAverageLoadTime(componentId),
  };
}

// Preload hint directive
export function PreloadHint({ componentId, children }: { 
  componentId: string; 
  children: React.ReactNode;
}) {
  const handleMouseEnter = React.useCallback(() => {
    lazyLoadingManager.preloadComponent(componentId);
  }, [componentId]);

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      data-preload-component={componentId}
    >
      {children}
    </div>
  );
}

export type { LoadMetrics, LazyRouteConfig };