'use client';

import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { StorageManager } from './storage';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceEntry[]> = new Map();
  private static memoryThresholds = {
    warning: 50 * 1024 * 1024, // 50MB
    critical: 100 * 1024 * 1024 // 100MB
  };

  static startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  static endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure?.duration || 0;
    
    // Store metrics
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const entries = this.metrics.get(name)!;
    entries.push(measure);
    
    // Keep only last 100 entries
    if (entries.length > 100) {
      entries.splice(0, entries.length - 100);
    }
    
    return duration;
  }

  static getAverageTime(name: string): number {
    const entries = this.metrics.get(name) || [];
    if (entries.length === 0) return 0;
    
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / entries.length;
  }

  static checkMemoryUsage(): {
    used: number;
    total: number;
    warning: boolean;
    critical: boolean;
  } {
    if (!('memory' in performance)) {
      return { used: 0, total: 0, warning: false, critical: false };
    }
    
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    
    return {
      used,
      total,
      warning: used > this.memoryThresholds.warning,
      critical: used > this.memoryThresholds.critical
    };
  }

  static clearMetrics(): void {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  static getAllMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [name, entries] of this.metrics) {
      const average = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
      const latest = entries[entries.length - 1]?.duration || 0;
      
      result[name] = {
        average,
        count: entries.length,
        latest
      };
    }
    
    return result;
  }
}

// Debounced hook for expensive operations
export function useDebounced<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T, [callback, delay]);
}

// Throttled hook for high-frequency events
export function useThrottled<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastCall);
    }
  }) as T, [callback, delay]);
}

// Virtual scrolling hook
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  itemCount: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
  visibleItems: number[];
}

export function useVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
): VirtualScrollResult {
  return useMemo(() => {
    const { itemHeight, containerHeight, itemCount, overscan = 5 } = options;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleItemCount + overscan * 2);
    
    const offsetY = startIndex * itemHeight;
    const totalHeight = itemCount * itemHeight;
    const visibleItems = Array.from(
      { length: endIndex - startIndex + 1 },
      (_, i) => startIndex + i
    );
    
    return {
      startIndex,
      endIndex,
      offsetY,
      totalHeight,
      visibleItems
    };
  }, [scrollTop, options.itemHeight, options.containerHeight, options.itemCount, options.overscan]);
}

// Memory management utilities
export class MemoryManager {
  private static cleanupTasks: Set<() => void> = new Set();
  private static intervalId: NodeJS.Timeout | null = null;
  
  static registerCleanupTask(task: () => void): () => void {
    this.cleanupTasks.add(task);
    
    // Start cleanup interval if not already running
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.runCleanup();
      }, 30000); // Run every 30 seconds
    }
    
    // Return unregister function
    return () => {
      this.cleanupTasks.delete(task);
      
      if (this.cleanupTasks.size === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }
  
  private static runCleanup(): void {
    const memoryStatus = PerformanceMonitor.checkMemoryUsage();
    
    if (memoryStatus.warning) {
      console.warn('Memory usage warning:', memoryStatus);
      
      // Run all cleanup tasks
      for (const task of this.cleanupTasks) {
        try {
          task();
        } catch (error) {
          console.error('Cleanup task failed:', error);
        }
      }
      
      // Clear performance metrics if memory is critical
      if (memoryStatus.critical) {
        PerformanceMonitor.clearMetrics();
        
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  }
  
  static clearStorageCache(): void {
    // Clear large data from localStorage if needed
    const data = StorageManager.getData();
    const storageSize = JSON.stringify(data).length;
    
    // If storage is over 5MB, clean up old data
    if (storageSize > 5 * 1024 * 1024) {
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      
      // Clean up old API requests
      const filteredApiRequests = data.apiRequests.filter(
        req => req.timestamp > oneWeekAgo
      );
      
      // Clean up old WebSocket connections
      const filteredWebSocketConnections = data.webSocketConnections.filter(
        conn => conn.timestamp > oneWeekAgo
      );
      
      // Update storage with cleaned data
      StorageManager.setData({
        ...data,
        apiRequests: filteredApiRequests,
        webSocketConnections: filteredWebSocketConnections
      });
      
      console.log('Storage cache cleaned up');
    }
  }
}

// Bundle size optimization utilities
export class BundleOptimizer {
  private static loadedModules: Set<string> = new Set();
  
  // Dynamic import with caching
  static async loadModule<T>(
    moduleId: string,
    importFunction: () => Promise<T>
  ): Promise<T> {
    if (this.loadedModules.has(moduleId)) {
      return importFunction();
    }
    
    PerformanceMonitor.startMeasure(`bundle-load-${moduleId}`);
    
    try {
      const module = await importFunction();
      this.loadedModules.add(moduleId);
      
      const loadTime = PerformanceMonitor.endMeasure(`bundle-load-${moduleId}`);
      console.log(`Module ${moduleId} loaded in ${loadTime.toFixed(2)}ms`);
      
      return module;
    } catch (error) {
      console.error(`Failed to load module ${moduleId}:`, error);
      throw error;
    }
  }
  
  // Preload critical modules
  static preloadCriticalModules(): void {
    const criticalModules = [
      'api-tester',
      'json-formatter',
      'base64-encoder'
    ];
    
    for (const moduleId of criticalModules) {
      // Preload using link tags
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = `/tools/${moduleId}`;
      document.head.appendChild(link);
    }
  }
}

// Performance-optimized storage operations
export class OptimizedStorage {
  private static writeQueue: Array<{
    key: string;
    value: any;
    timestamp: number;
  }> = [];
  private static writeTimeout: NodeJS.Timeout | null = null;
  
  // Batched writes to reduce localStorage operations
  static queueWrite(key: string, value: any): void {
    this.writeQueue.push({
      key,
      value,
      timestamp: Date.now()
    });
    
    if (this.writeTimeout) {
      clearTimeout(this.writeTimeout);
    }
    
    this.writeTimeout = setTimeout(() => {
      this.flushWrites();
    }, 100); // Batch writes every 100ms
  }
  
  private static flushWrites(): void {
    if (this.writeQueue.length === 0) return;
    
    PerformanceMonitor.startMeasure('storage-batch-write');
    
    // Group writes by key
    const grouped = new Map<string, any>();
    for (const item of this.writeQueue) {
      grouped.set(item.key, item.value);
    }
    
    // Perform batched writes
    for (const [key, value] of grouped) {
      try {
        StorageManager.updateField(key as any, value);
      } catch (error) {
        console.error(`Failed to write ${key} to storage:`, error);
      }
    }
    
    this.writeQueue = [];
    this.writeTimeout = null;
    
    PerformanceMonitor.endMeasure('storage-batch-write');
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(toolId: string) {
  useEffect(() => {
    PerformanceMonitor.startMeasure(`tool-render-${toolId}`);
    
    return () => {
      PerformanceMonitor.endMeasure(`tool-render-${toolId}`);
    };
  }, [toolId]);
  
  useEffect(() => {
    // Register memory cleanup for this tool
    const cleanup = MemoryManager.registerCleanupTask(() => {
      // Tool-specific cleanup logic
      console.log(`Cleaning up memory for tool: ${toolId}`);
    });
    
    return cleanup;
  }, [toolId]);
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, options]);
  
  return isVisible;
}