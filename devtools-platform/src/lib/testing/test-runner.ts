'use client';

import { PerformanceMonitor } from '@/lib/performance';
import { StorageManager } from '@/lib/storage';
import { TestDataGenerator, TEST_SCENARIOS } from './test-data-generator';

interface TestResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  timestamp: number;
}

interface TestSuite {
  name: string;
  description: string;
  tests: Test[];
  beforeAll?: () => Promise<void>;
  afterAll?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

interface Test {
  id: string;
  name: string;
  description: string;
  category: 'functional' | 'performance' | 'accessibility' | 'compatibility';
  test: () => Promise<void>;
  timeout?: number;
  skip?: boolean;
}

export class TestRunner {
  private results: TestResult[] = [];
  private suites: TestSuite[] = [];
  
  constructor() {
    this.initializeTestSuites();
  }

  private initializeTestSuites() {
    // Functional Tests
    this.suites.push({
      name: 'Storage Operations',
      description: 'Test localStorage operations and data persistence',
      tests: [
        {
          id: 'storage-save-retrieve',
          name: 'Save and Retrieve Data',
          description: 'Test saving data to localStorage and retrieving it',
          category: 'functional',
          test: async () => {
            const testData = { test: 'value', timestamp: Date.now() };
            StorageManager.updateField('testField' as any, testData);
            const retrieved = StorageManager.getData();
            
            if (!(retrieved as any).testField) {
              throw new Error('Data was not saved to localStorage');
            }
            
            if ((retrieved as any).testField.test !== testData.test) {
              throw new Error('Retrieved data does not match saved data');
            }
          }
        },
        {
          id: 'storage-large-dataset',
          name: 'Large Dataset Storage',
          description: 'Test storing and retrieving large datasets',
          category: 'performance',
          test: async () => {
            PerformanceMonitor.startMeasure('large-dataset-save');
            
            const largeDataset = TestDataGenerator.generateCompleteTestData();
            StorageManager.setData(largeDataset);
            
            const saveTime = PerformanceMonitor.endMeasure('large-dataset-save');
            
            PerformanceMonitor.startMeasure('large-dataset-retrieve');
            const retrieved = StorageManager.getData();
            const retrieveTime = PerformanceMonitor.endMeasure('large-dataset-retrieve');
            
            if (saveTime > 1000) {
              console.warn(`Large dataset save took ${saveTime}ms`);
            }
            
            if (retrieveTime > 500) {
              console.warn(`Large dataset retrieve took ${retrieveTime}ms`);
            }
            
            if (!retrieved.apiRequests || retrieved.apiRequests.length === 0) {
              throw new Error('Large dataset was not properly stored');
            }
          }
        }
      ]
    });

    // Performance Tests
    this.suites.push({
      name: 'Performance Benchmarks',
      description: 'Test performance characteristics of various operations',
      tests: [
        {
          id: 'search-performance',
          name: 'Search Performance',
          description: 'Test search performance with large datasets',
          category: 'performance',
          test: async () => {
            const tools = Array.from({ length: 1000 }, (_, i) => ({
              id: `tool-${i}`,
              name: `Test Tool ${i}`,
              description: `Description for tool ${i}`,
              category: 'api',
              tags: ['test', 'performance']
            }));

            PerformanceMonitor.startMeasure('search-1000-items');
            
            const searchTerm = 'test';
            const results = tools.filter(tool => 
              tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tool.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            const searchTime = PerformanceMonitor.endMeasure('search-1000-items');
            
            if (searchTime > 100) {
              throw new Error(`Search took too long: ${searchTime}ms`);
            }
            
            if (results.length === 0) {
              throw new Error('Search returned no results');
            }
          }
        },
        {
          id: 'virtual-scroll-performance',
          name: 'Virtual Scrolling Performance',
          description: 'Test virtual scrolling with large lists',
          category: 'performance',
          test: async () => {
            const largeList = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
            const itemHeight = 50;
            const containerHeight = 400;
            
            PerformanceMonitor.startMeasure('virtual-scroll-calculation');
            
            // Simulate virtual scroll calculations
            const visibleItems = Math.ceil(containerHeight / itemHeight);
            const startIndex = 0;
            const endIndex = Math.min(startIndex + visibleItems + 10, largeList.length - 1);
            const visibleData = largeList.slice(startIndex, endIndex + 1);
            
            const calculationTime = PerformanceMonitor.endMeasure('virtual-scroll-calculation');
            
            if (calculationTime > 50) {
              throw new Error(`Virtual scroll calculation took too long: ${calculationTime}ms`);
            }
            
            if (visibleData.length > visibleItems + 10) {
              throw new Error('Virtual scroll rendered too many items');
            }
          }
        },
        {
          id: 'debounce-performance',
          name: 'Debounced Operations',
          description: 'Test debounced function performance',
          category: 'performance',
          test: async () => {
            let callCount = 0;
            const debouncedFunction = this.debounce(() => {
              callCount++;
            }, 100);

            // Call function multiple times rapidly
            for (let i = 0; i < 10; i++) {
              debouncedFunction();
            }

            // Wait for debounce delay
            await new Promise(resolve => setTimeout(resolve, 150));

            if (callCount !== 1) {
              throw new Error(`Debounced function called ${callCount} times instead of 1`);
            }
          }
        }
      ]
    });

    // Accessibility Tests
    this.suites.push({
      name: 'Accessibility Compliance',
      description: 'Test accessibility features and WCAG compliance',
      tests: [
        {
          id: 'keyboard-navigation',
          name: 'Keyboard Navigation',
          description: 'Test keyboard navigation support',
          category: 'accessibility',
          test: async () => {
            // Check if interactive elements have proper tabindex
            const buttons = document.querySelectorAll('button, input, select, textarea, a[href]');
            let accessibleCount = 0;
            
            buttons.forEach(element => {
              const tabIndex = element.getAttribute('tabindex');
              const isVisible = (element as HTMLElement).offsetParent !== null;
              
              if (isVisible && (tabIndex === null || parseInt(tabIndex) >= 0)) {
                accessibleCount++;
              }
            });
            
            if (accessibleCount === 0) {
              throw new Error('No keyboard accessible elements found');
            }
          }
        },
        {
          id: 'aria-labels',
          name: 'ARIA Labels',
          description: 'Test presence of ARIA labels for screen readers',
          category: 'accessibility',
          test: async () => {
            const interactiveElements = document.querySelectorAll('button, input, select');
            let labeledCount = 0;
            
            interactiveElements.forEach(element => {
              const ariaLabel = element.getAttribute('aria-label');
              const ariaLabelledBy = element.getAttribute('aria-labelledby');
              const label = element.closest('label') || document.querySelector(`label[for="${element.id}"]`);
              
              if (ariaLabel || ariaLabelledBy || label) {
                labeledCount++;
              }
            });
            
            const labeledPercentage = (labeledCount / interactiveElements.length) * 100;
            
            if (labeledPercentage < 80) {
              console.warn(`Only ${labeledPercentage.toFixed(1)}% of elements have proper labels`);
            }
          }
        },
        {
          id: 'color-contrast',
          name: 'Color Contrast',
          description: 'Test color contrast ratios for readability',
          category: 'accessibility',
          test: async () => {
            // This is a simplified test - in a real scenario, you'd use a proper contrast checking library
            const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a');
            let checkedElements = 0;
            
            textElements.forEach(element => {
              const styles = window.getComputedStyle(element);
              const color = styles.color;
              const backgroundColor = styles.backgroundColor;
              
              // Basic check - ensure colors are not the same
              if (color !== backgroundColor && color !== 'rgba(0, 0, 0, 0)') {
                checkedElements++;
              }
            });
            
            if (checkedElements === 0) {
              throw new Error('No text elements with proper color styling found');
            }
          }
        }
      ]
    });

    // Cross-browser Compatibility Tests
    this.suites.push({
      name: 'Browser Compatibility',
      description: 'Test compatibility across different browsers and features',
      tests: [
        {
          id: 'localstorage-support',
          name: 'LocalStorage Support',
          description: 'Test localStorage availability and functionality',
          category: 'compatibility',
          test: async () => {
            if (typeof Storage === 'undefined') {
              throw new Error('localStorage is not supported');
            }
            
            try {
              localStorage.setItem('test', 'value');
              const retrieved = localStorage.getItem('test');
              localStorage.removeItem('test');
              
              if (retrieved !== 'value') {
                throw new Error('localStorage is not functioning correctly');
              }
            } catch (error) {
              throw new Error(`localStorage error: ${error}`);
            }
          }
        },
        {
          id: 'fetch-api-support',
          name: 'Fetch API Support',
          description: 'Test Fetch API availability',
          category: 'compatibility',
          test: async () => {
            if (typeof fetch === 'undefined') {
              throw new Error('Fetch API is not supported');
            }
            
            // Test with a simple request
            try {
              const response = await fetch('data:text/plain,test', { method: 'GET' });
              const text = await response.text();
              
              if (text !== 'test') {
                throw new Error('Fetch API is not functioning correctly');
              }
            } catch (error) {
              throw new Error(`Fetch API error: ${error}`);
            }
          }
        },
        {
          id: 'es6-features',
          name: 'ES6 Features Support',
          description: 'Test ES6+ features availability',
          category: 'compatibility',
          test: async () => {
            // Test arrow functions
            const arrowFunc = () => 'test';
            if (arrowFunc() !== 'test') {
              throw new Error('Arrow functions not supported');
            }
            
            // Test template literals
            const template = `Hello ${'world'}`;
            if (template !== 'Hello world') {
              throw new Error('Template literals not supported');
            }
            
            // Test destructuring
            const { test } = { test: 'value' };
            if (test !== 'value') {
              throw new Error('Destructuring not supported');
            }
            
            // Test async/await
            const asyncTest = async () => 'async';
            const result = await asyncTest();
            if (result !== 'async') {
              throw new Error('Async/await not supported');
            }
          }
        }
      ]
    });

    // Mobile Responsiveness Tests
    this.suites.push({
      name: 'Mobile Responsiveness',
      description: 'Test responsive design and mobile compatibility',
      tests: [
        {
          id: 'viewport-meta',
          name: 'Viewport Meta Tag',
          description: 'Test presence of proper viewport meta tag',
          category: 'compatibility',
          test: async () => {
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
              throw new Error('Viewport meta tag not found');
            }
            
            const content = viewportMeta.getAttribute('content');
            if (!content || !content.includes('width=device-width')) {
              throw new Error('Viewport meta tag does not include width=device-width');
            }
          }
        },
        {
          id: 'responsive-breakpoints',
          name: 'Responsive Breakpoints',
          description: 'Test responsive design at different screen sizes',
          category: 'compatibility',
          test: async () => {
            const breakpoints = [320, 768, 1024, 1200]; // Mobile, tablet, desktop sizes
            let responsiveElements = 0;
            
            // Check if elements have responsive classes
            const elementsWithClasses = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
            responsiveElements = elementsWithClasses.length;
            
            if (responsiveElements === 0) {
              console.warn('No responsive utility classes found');
            }
          }
        },
        {
          id: 'touch-friendly',
          name: 'Touch-Friendly Interactions',
          description: 'Test touch-friendly button and link sizes',
          category: 'accessibility',
          test: async () => {
            const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');
            let touchFriendlyCount = 0;
            
            interactiveElements.forEach(element => {
              const styles = window.getComputedStyle(element);
              const height = parseInt(styles.height);
              const minTouchSize = 44; // 44px minimum touch target size
              
              if (height >= minTouchSize || styles.padding !== '0px') {
                touchFriendlyCount++;
              }
            });
            
            const percentage = (touchFriendlyCount / interactiveElements.length) * 100;
            
            if (percentage < 70) {
              console.warn(`Only ${percentage.toFixed(1)}% of interactive elements are touch-friendly`);
            }
          }
        }
      ]
    });
  }

  // Run all test suites
  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    for (const suite of this.suites) {
      console.log(`Running test suite: ${suite.name}`);
      
      try {
        if (suite.beforeAll) {
          await suite.beforeAll();
        }
        
        for (const test of suite.tests) {
          if (test.skip) {
            this.results.push({
              testId: test.id,
              name: test.name,
              status: 'skipped',
              duration: 0,
              timestamp: Date.now()
            });
            continue;
          }
          
          await this.runSingleTest(test, suite);
        }
        
        if (suite.afterAll) {
          await suite.afterAll();
        }
      } catch (error) {
        console.error(`Test suite ${suite.name} failed:`, error);
      }
    }
    
    return this.results;
  }

  // Run a single test
  private async runSingleTest(test: Test, suite: TestSuite): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      // Run test with timeout
      const timeout = test.timeout || 5000;
      await Promise.race([
        test.test(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        )
      ]);
      
      if (suite.afterEach) {
        await suite.afterEach();
      }
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        testId: test.id,
        name: test.name,
        status: 'passed',
        duration,
        timestamp: Date.now()
      });
      
      console.log(`✓ ${test.name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        testId: test.id,
        name: test.name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
      
      console.error(`✗ ${test.name} (${duration}ms):`, error);
    }
  }

  // Get test results summary
  getTestSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration,
      averageDuration: total > 0 ? totalDuration / total : 0
    };
  }

  // Utility function for debouncing
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Performance benchmarking
  static async runPerformanceBenchmarks() {
    const benchmarks = [
      {
        name: 'JSON Parse Performance',
        test: () => {
          const largeJson = JSON.stringify(TestDataGenerator.generateCompleteTestData());
          PerformanceMonitor.startMeasure('json-parse');
          JSON.parse(largeJson);
          return PerformanceMonitor.endMeasure('json-parse');
        }
      },
      {
        name: 'Array Filter Performance',
        test: () => {
          const largeArray = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
          PerformanceMonitor.startMeasure('array-filter');
          largeArray.filter(item => item.id % 2 === 0);
          return PerformanceMonitor.endMeasure('array-filter');
        }
      },
      {
        name: 'DOM Query Performance',
        test: () => {
          PerformanceMonitor.startMeasure('dom-query');
          document.querySelectorAll('*');
          return PerformanceMonitor.endMeasure('dom-query');
        }
      }
    ];

    const results = [];
    
    for (const benchmark of benchmarks) {
      const duration = benchmark.test();
      results.push({
        name: benchmark.name,
        duration,
        performance: duration < 100 ? 'excellent' : duration < 500 ? 'good' : 'poor'
      });
    }
    
    return results;
  }
}