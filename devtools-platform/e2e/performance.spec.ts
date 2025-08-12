import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should meet Core Web Vitals standards on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0
        let fid = 0
        let cls = 0
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })
        
        // First Input Delay (approximated)
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            fid = (entry as any).processingStart - entry.startTime
          }
        }).observe({ entryTypes: ['first-input'] })
        
        setTimeout(() => {
          resolve({ lcp, fid, cls })
        }, 3000)
      })
    })
    
    const { lcp, cls } = metrics as any
    
    // Core Web Vitals thresholds
    expect(lcp).toBeLessThan(2500) // LCP should be under 2.5s
    expect(cls).toBeLessThan(0.1)  // CLS should be under 0.1
  })

  test('should load page within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have efficient resource loading', async ({ page }) => {
    const resources: any[] = []
    
    page.on('response', (response) => {
      resources.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        type: response.headers()['content-type'],
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for efficient resource loading
    const jsResources = resources.filter(r => r.type?.includes('javascript'))
    const cssResources = resources.filter(r => r.type?.includes('css'))
    const imageResources = resources.filter(r => r.type?.includes('image'))
    
    // Should not have too many separate JS files (indicating good bundling)
    expect(jsResources.length).toBeLessThan(20)
    
    // Should not have too many separate CSS files
    expect(cssResources.length).toBeLessThan(10)
    
    // All resources should return successful status codes
    resources.forEach(resource => {
      expect(resource.status).toBeLessThan(400)
    })
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/tools/json-formatter')
    
    // Create a large JSON dataset
    const largeData = {
      data: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: 'Lorem ipsum '.repeat(10),
        metadata: {
          created: new Date().toISOString(),
          tags: [`tag${i}`, `category${i % 10}`],
        }
      }))
    }
    
    const startTime = Date.now()
    
    // Input large JSON data
    const textarea = page.getByRole('textbox').first()
    await textarea.fill(JSON.stringify(largeData))
    
    // Format the data
    const formatButton = page.getByRole('button', { name: /format/i }).first()
    if (await formatButton.isVisible()) {
      await formatButton.click()
    }
    
    const processingTime = Date.now() - startTime
    
    // Should process large data within reasonable time
    expect(processingTime).toBeLessThan(5000)
  })

  test('should maintain performance under load', async ({ page, context }) => {
    // Open multiple tabs to simulate load
    const pages = [page]
    
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage()
      pages.push(newPage)
    }
    
    // Load different tools in each tab
    const tools = ['/', '/tools/json-formatter', '/tools/api-tester', '/tools/base64']
    
    const loadPromises = pages.map((p, index) => 
      p.goto(tools[index] || '/')
    )
    
    const startTime = Date.now()
    await Promise.all(loadPromises)
    
    await Promise.all(pages.map(p => p.waitForLoadState('networkidle')))
    
    const totalLoadTime = Date.now() - startTime
    
    // Should handle multiple concurrent loads efficiently
    expect(totalLoadTime).toBeLessThan(10000)
    
    // Clean up
    for (let i = 1; i < pages.length; i++) {
      await pages[i].close()
    }
  })

  test('should have optimized images', async ({ page }) => {
    const imageRequests: any[] = []
    
    page.on('response', (response) => {
      if (response.headers()['content-type']?.includes('image')) {
        imageRequests.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
          type: response.headers()['content-type'],
        })
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that images are optimized
    imageRequests.forEach(image => {
      // Images should be under reasonable size limits
      if (image.type.includes('png') || image.type.includes('jpg')) {
        expect(image.size).toBeLessThan(500000) // 500KB max for regular images
      }
      
      if (image.type.includes('svg')) {
        expect(image.size).toBeLessThan(50000) // 50KB max for SVGs
      }
    })
  })

  test('should have efficient JavaScript execution', async ({ page }) => {
    await page.goto('/')
    
    // Measure JavaScript performance
    const jsPerformance = await page.evaluate(() => {
      const start = performance.now()
      
      // Simulate some JavaScript work
      let sum = 0
      for (let i = 0; i < 100000; i++) {
        sum += Math.random()
      }
      
      const end = performance.now()
      return end - start
    })
    
    // JavaScript execution should be efficient
    expect(jsPerformance).toBeLessThan(100) // Under 100ms for basic operations
  })

  test('should have proper caching headers', async ({ page }) => {
    const responses: any[] = []
    
    page.on('response', (response) => {
      responses.push({
        url: response.url(),
        cacheControl: response.headers()['cache-control'],
        etag: response.headers()['etag'],
        lastModified: response.headers()['last-modified'],
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for appropriate caching headers
    const staticResources = responses.filter(r => 
      r.url.includes('.js') || 
      r.url.includes('.css') || 
      r.url.includes('.png') || 
      r.url.includes('.svg')
    )
    
    staticResources.forEach(resource => {
      // Static resources should have caching headers
      expect(
        resource.cacheControl || 
        resource.etag || 
        resource.lastModified
      ).toBeTruthy()
    })
  })

  test('should be responsive at different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime
      
      // Should load quickly at all viewport sizes
      expect(loadTime).toBeLessThan(3000)
      
      // Content should be visible
      await expect(page.getByRole('heading', { name: /devtools platform/i })).toBeVisible()
    }
  })

  test('should handle network conditions gracefully', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      await route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - startTime
    
    // Should still load within reasonable time on slow network
    expect(loadTime).toBeLessThan(8000)
    
    // Critical content should still be visible
    await expect(page.getByRole('heading', { name: /devtools platform/i })).toBeVisible()
  })
})