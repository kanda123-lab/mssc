'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  PerformanceMonitor, 
  MemoryManager, 
  BundleOptimizer, 
  OptimizedStorage,
  useDebounced
} from '@/lib/performance';
import { StorageManager } from '@/lib/storage';

interface PerformanceConfig {
  toolId: string;
  enableMetrics?: boolean;
  enableMemoryCleanup?: boolean;
  enableStorageOptimization?: boolean;
  debounceStorage?: number;
}

export function usePerformanceOptimization({
  toolId,
  enableMetrics = true,
  enableMemoryCleanup = true,
  enableStorageOptimization = true,
  debounceStorage = 1000
}: PerformanceConfig) {
  const metricsRef = useRef<{ [key: string]: number }>({});
  const cleanupTasksRef = useRef<Set<() => void>>(new Set());

  // Start performance monitoring
  useEffect(() => {
    if (!enableMetrics) return;

    PerformanceMonitor.startMeasure(`tool-mount-${toolId}`);
    
    return () => {
      PerformanceMonitor.endMeasure(`tool-mount-${toolId}`);
    };
  }, [toolId, enableMetrics]);

  // Memory cleanup registration
  useEffect(() => {
    if (!enableMemoryCleanup) return;

    const cleanupTask = () => {
      // Clear component-specific caches
      cleanupTasksRef.current.forEach(task => {
        try {
          task();
        } catch (error) {
          console.error(`Cleanup task failed for ${toolId}:`, error);
        }
      });
      
      // Clear metrics for this tool
      const allMetrics = PerformanceMonitor.getAllMetrics();
      Object.keys(allMetrics).forEach(key => {
        if (key.includes(toolId)) {
          delete metricsRef.current[key];
        }
      });
    };

    const unregister = MemoryManager.registerCleanupTask(cleanupTask);
    
    return unregister;
  }, [toolId, enableMemoryCleanup]);

  // Debounced storage updates
  const debouncedStorageUpdate = useDebounced(
    useCallback((key: string, value: any) => {
      if (enableStorageOptimization) {
        OptimizedStorage.queueWrite(key, value);
      } else {
        StorageManager.updateField(key as any, value);
      }
    }, [enableStorageOptimization]),
    debounceStorage
  );

  // Optimized storage operations
  const optimizedStorage = useMemo(() => ({
    updateField: debouncedStorageUpdate,
    
    updateArrayField: (field: string, updater: (current: any[]) => any[]) => {
      const currentData = StorageManager.getData();
      const currentArray = (currentData as any)[field] || [];
      const updatedArray = updater(currentArray);
      debouncedStorageUpdate(field, updatedArray);
    },
    
    batchUpdate: (updates: Record<string, any>) => {
      Object.entries(updates).forEach(([key, value]) => {
        debouncedStorageUpdate(key, value);
      });
    }
  }), [debouncedStorageUpdate]);

  // Performance measurement utilities
  const measureOperation = useCallback((
    operationName: string,
    operation: () => void | Promise<void>
  ) => {
    const measurementKey = `${toolId}-${operationName}`;
    
    PerformanceMonitor.startMeasure(measurementKey);
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        PerformanceMonitor.endMeasure(measurementKey);
      });
    } else {
      PerformanceMonitor.endMeasure(measurementKey);
      return result;
    }
  }, [toolId]);

  // Memory monitoring
  const memoryStatus = useMemo(() => {
    return PerformanceMonitor.checkMemoryUsage();
  }, []);

  // Register cleanup task
  const registerCleanupTask = useCallback((task: () => void) => {
    cleanupTasksRef.current.add(task);
    
    return () => {
      cleanupTasksRef.current.delete(task);
    };
  }, []);

  // Preload related tools
  const preloadRelatedTools = useCallback((relatedToolIds: string[]) => {
    relatedToolIds.forEach(async (relatedToolId) => {
      try {
        // Preload tool page
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = `/tools/${relatedToolId}`;
        document.head.appendChild(link);
        
        console.log(`Preloaded related tool: ${relatedToolId}`);
      } catch (error) {
        console.error(`Failed to preload related tool ${relatedToolId}:`, error);
      }
    });
  }, []);

  // Get performance metrics for this tool
  const getToolMetrics = useCallback(() => {
    const allMetrics = PerformanceMonitor.getAllMetrics();
    return Object.fromEntries(
      Object.entries(allMetrics).filter(([key]) => key.includes(toolId))
    );
  }, [toolId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear component-specific data
      cleanupTasksRef.current.clear();
      
      // Clear metrics if memory is low
      const memory = PerformanceMonitor.checkMemoryUsage();
      if (memory.warning) {
        PerformanceMonitor.clearMetrics();
      }
    };
  }, []);

  return {
    // Storage operations
    storage: optimizedStorage,
    
    // Performance utilities
    measureOperation,
    getToolMetrics,
    memoryStatus,
    
    // Cleanup utilities
    registerCleanupTask,
    
    // Optimization utilities
    preloadRelatedTools
  };
}

// Hook for optimizing large lists and data operations
export function useDataOptimization<T>(data: T[], options: {
  pageSize?: number;
  virtualScrolling?: boolean;
  searchable?: boolean;
  sortable?: boolean;
} = {}) {
  const {
    pageSize = 50,
    virtualScrolling = false,
    searchable = false,
    sortable = false
  } = options;

  // Chunked data processing
  const processedData = useMemo(() => {
    PerformanceMonitor.startMeasure('data-processing');
    
    // Process data in chunks to avoid blocking UI
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += pageSize) {
      chunks.push(data.slice(i, i + pageSize));
    }
    
    PerformanceMonitor.endMeasure('data-processing');
    return chunks;
  }, [data, pageSize]);

  // Virtual scrolling configuration
  const virtualScrollConfig = useMemo(() => {
    if (!virtualScrolling) return null;
    
    return {
      itemHeight: 60, // Default item height
      containerHeight: 400, // Default container height
      overscan: 5
    };
  }, [virtualScrolling]);

  // Search and filter optimization
  const searchConfig = useMemo(() => {
    if (!searchable) return null;
    
    return {
      debounceMs: 300,
      maxResults: 1000 // Limit results for performance
    };
  }, [searchable]);

  // Memory cleanup for large datasets
  useEffect(() => {
    if (data.length > 10000) {
      console.warn(`Large dataset detected (${data.length} items). Consider pagination or virtual scrolling.`);
      
      // Register cleanup task for large datasets
      const cleanup = () => {
        console.log('Cleaning up large dataset references');
      };
      
      return MemoryManager.registerCleanupTask(cleanup);
    }
  }, [data.length]);

  return {
    processedData,
    virtualScrollConfig,
    searchConfig,
    totalItems: data.length,
    totalChunks: processedData.length
  };
}

// Hook for component-level performance monitoring
export function useComponentPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  
  // Track render count
  renderCountRef.current++;
  
  // Measure render time
  useEffect(() => {
    const renderTime = Date.now() - mountTimeRef.current;
    PerformanceMonitor.startMeasure(`${componentName}-render`);
    
    setTimeout(() => {
      PerformanceMonitor.endMeasure(`${componentName}-render`);
    }, 0);
    
    // Log performance warnings
    if (renderTime > 100) {
      console.warn(`Slow render detected for ${componentName}: ${renderTime}ms`);
    }
    
    if (renderCountRef.current > 100) {
      console.warn(`High render count for ${componentName}: ${renderCountRef.current} renders`);
    }
  });
  
  return {
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current
  };
}