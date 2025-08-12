// Performance monitoring and quality metrics collection

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  metadata?: Record<string, any>
}

interface ErrorReport {
  id: string
  message: string
  stack?: string
  url: string
  timestamp: number
  userAgent: string
  userId?: string
  metadata?: Record<string, any>
}

interface UserAnalytics {
  sessionId: string
  userId?: string
  event: string
  properties?: Record<string, any>
  timestamp: number
}

class QualityMetricsManager {
  private metrics: PerformanceMetric[] = []
  private errors: ErrorReport[] = []
  private analytics: UserAnalytics[] = []
  private sessionId: string
  private isEnabled: boolean = true

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeMonitoring()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // Core Web Vitals monitoring
    this.initializeWebVitals()
    
    // Error tracking
    this.initializeErrorTracking()
    
    // Performance observer
    this.initializePerformanceObserver()
    
    // User interaction tracking
    this.initializeUserTracking()

    // Bundle size monitoring
    this.monitorBundleSize()
  }

  private initializeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('LCP', entry.startTime, {
          element: (entry as any).element?.tagName,
          size: (entry as any).size,
        })
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime
        this.recordMetric('FID', fid, {
          eventType: (entry as any).name,
        })
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          this.recordMetric('CLS', clsValue)
        }
      }
    }).observe({ entryTypes: ['layout-shift'] })

    // Time to First Byte (TTFB)
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const ttfb = (entry as any).responseStart - entry.startTime
        this.recordMetric('TTFB', ttfb)
      }
    }).observe({ entryTypes: ['navigation'] })
  }

  private initializeErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: 'Unhandled Promise Rejection',
        stack: event.reason?.stack || String(event.reason),
      })
    })

    // React error boundary integration
    this.monitorReactErrors()
  }

  private initializePerformanceObserver() {
    // Resource loading performance
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming
        this.recordMetric('ResourceLoad', resource.duration, {
          name: resource.name,
          type: this.getResourceType(resource.name),
          size: resource.transferSize,
          cached: resource.transferSize === 0,
        })
      }
    }).observe({ entryTypes: ['resource'] })

    // Long tasks monitoring
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('LongTask', entry.duration, {
          startTime: entry.startTime,
        })
      }
    }).observe({ entryTypes: ['longtask'] })
  }

  private initializeUserTracking() {
    // Page views
    this.trackEvent('page_view', {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        this.trackEvent('click', {
          element: target.tagName,
          text: target.textContent?.slice(0, 50),
          className: target.className,
        })
      }
    })

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      this.trackEvent('form_submit', {
        formId: form.id,
        action: form.action,
        method: form.method,
      })
    })

    // Page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics()
    })
  }

  private monitorBundleSize() {
    // Monitor JavaScript bundle size
    if ('performance' in window && 'navigation' in performance) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry) {
        this.recordMetric('PageSize', navEntry.transferSize || 0, {
          type: 'initial_load',
        })
      }
    }
  }

  private monitorReactErrors() {
    // This would typically be integrated with React Error Boundaries
    const originalConsoleError = console.error
    console.error = (...args) => {
      const errorMessage = args.join(' ')
      if (errorMessage.includes('React') || errorMessage.includes('Warning:')) {
        this.recordError({
          message: errorMessage,
          type: 'react_error',
        })
      }
      originalConsoleError.apply(console, args)
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    return 'other'
  }

  // Public API methods
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata,
    }

    this.metrics.push(metric)
    this.limitArraySize(this.metrics, 1000)

    // Send critical metrics immediately
    if (['LCP', 'FID', 'CLS'].includes(name)) {
      this.sendMetrics([metric])
    }
  }

  recordError(error: Partial<ErrorReport>) {
    if (!this.isEnabled) return

    const errorReport: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metadata: error.metadata,
      ...error,
    }

    this.errors.push(errorReport)
    this.limitArraySize(this.errors, 100)

    // Send errors immediately
    this.sendErrors([errorReport])
  }

  trackEvent(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    const analytics: UserAnalytics = {
      sessionId: this.sessionId,
      event,
      properties,
      timestamp: Date.now(),
    }

    this.analytics.push(analytics)
    this.limitArraySize(this.analytics, 500)
  }

  // Performance benchmarks
  startBenchmark(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, { type: 'benchmark' })
    }
  }

  // Bundle size analysis
  analyzeBundleSize(): Promise<any> {
    return new Promise((resolve) => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      const analysis = {
        totalSize: 0,
        javascript: 0,
        css: 0,
        images: 0,
        fonts: 0,
        other: 0,
        resources: resources.map(resource => ({
          url: resource.name,
          size: resource.transferSize || 0,
          type: this.getResourceType(resource.name),
          cached: resource.transferSize === 0,
        }))
      }

      analysis.resources.forEach(resource => {
        analysis.totalSize += resource.size
        switch (resource.type) {
          case 'javascript':
            analysis.javascript += resource.size
            break
          case 'stylesheet':
            analysis.css += resource.size
            break
          case 'image':
            analysis.images += resource.size
            break
          case 'font':
            analysis.fonts += resource.size
            break
          default:
            analysis.other += resource.size
        }
      })

      this.recordMetric('BundleAnalysis', analysis.totalSize, analysis)
      resolve(analysis)
    })
  }

  // Quality score calculation
  calculateQualityScore(): number {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp < 300000 // Last 5 minutes
    )

    let score = 100
    
    // Deduct for poor Core Web Vitals
    const lcp = recentMetrics.find(m => m.name === 'LCP')?.value || 0
    if (lcp > 2500) score -= 20
    else if (lcp > 4000) score -= 40

    const fid = recentMetrics.find(m => m.name === 'FID')?.value || 0
    if (fid > 100) score -= 10
    else if (fid > 300) score -= 30

    const cls = recentMetrics.find(m => m.name === 'CLS')?.value || 0
    if (cls > 0.1) score -= 15
    else if (cls > 0.25) score -= 30

    // Deduct for errors
    const recentErrors = this.errors.filter(
      e => Date.now() - e.timestamp < 300000
    )
    score -= Math.min(recentErrors.length * 5, 50)

    // Deduct for long tasks
    const longTasks = recentMetrics.filter(m => m.name === 'LongTask' && m.value > 50)
    score -= Math.min(longTasks.length * 2, 20)

    return Math.max(0, score)
  }

  // Data export and reporting
  exportMetrics(): {
    metrics: PerformanceMetric[]
    errors: ErrorReport[]
    analytics: UserAnalytics[]
    qualityScore: number
  } {
    return {
      metrics: [...this.metrics],
      errors: [...this.errors],
      analytics: [...this.analytics],
      qualityScore: this.calculateQualityScore(),
    }
  }

  // Configuration
  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  clearData() {
    this.metrics = []
    this.errors = []
    this.analytics = []
  }

  // Private helper methods
  private limitArraySize<T>(array: T[], maxSize: number) {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize)
    }
  }

  private async sendMetrics(metrics: PerformanceMetric[]) {
    // In production, this would send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Metrics:', metrics)
    }
  }

  private async sendErrors(errors: ErrorReport[]) {
    // In production, this would send to error tracking service
    if (process.env.NODE_ENV === 'development') {
      console.error('Errors:', errors)
    }
  }

  private flushMetrics() {
    // Send any remaining metrics before page unload
    if (this.metrics.length > 0) {
      this.sendMetrics(this.metrics)
    }
    if (this.errors.length > 0) {
      this.sendErrors(this.errors)
    }
  }
}

// Export singleton instance
export const qualityMetrics = new QualityMetricsManager()

// React hook for using quality metrics
export function useQualityMetrics() {
  return {
    recordMetric: qualityMetrics.recordMetric.bind(qualityMetrics),
    recordError: qualityMetrics.recordError.bind(qualityMetrics),
    trackEvent: qualityMetrics.trackEvent.bind(qualityMetrics),
    startBenchmark: qualityMetrics.startBenchmark.bind(qualityMetrics),
    getQualityScore: qualityMetrics.calculateQualityScore.bind(qualityMetrics),
    exportData: qualityMetrics.exportMetrics.bind(qualityMetrics),
  }
}

// TypeScript types export
export type { PerformanceMetric, ErrorReport, UserAnalytics }