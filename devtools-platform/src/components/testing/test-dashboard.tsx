'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  FileText,
  Monitor,
  Smartphone,
  Eye,
  Zap,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestRunner } from '@/lib/testing/test-runner';
import { TestDataGenerator } from '@/lib/testing/test-data-generator';
import { PerformanceMonitor } from '@/lib/performance';
import { StorageManager } from '@/lib/storage';

interface TestResult {
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  error?: string;
  details?: any;
  timestamp: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  totalDuration: number;
  averageDuration: number;
}

export function TestDashboard() {
  const [testRunner] = useState(() => new TestRunner());
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<TestSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const categories = ['all', 'functional', 'performance', 'accessibility', 'compatibility'];

  // Generate test data for tools
  const generateTestData = async () => {
    try {
      const testData = TestDataGenerator.generateCompleteTestData();
      StorageManager.setData(testData);
      
      console.log('Test data generated successfully:', {
        apiRequests: testData.apiRequests.length,
        databaseConnections: testData.databaseConnections.length,
        mongoQueries: testData.mongoQueries.length,
        sqlQueries: testData.sqlQueries.length,
        mockEndpoints: testData.mockEndpoints.length,
        envEnvironments: testData.envEnvironments.length,
        npmAnalyses: testData.npmAnalyses.length
      });
    } catch (error) {
      console.error('Error generating test data:', error);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);
    setProgress(0);
    
    try {
      // First generate test data
      await generateTestData();
      
      // Run the tests
      const testResults = await testRunner.runAllTests();
      setResults(testResults);
      
      const testSummary = testRunner.getTestSummary();
      setSummary(testSummary);
      
      setProgress(100);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  // Run performance benchmarks
  const runBenchmarks = async () => {
    try {
      const benchmarks = await TestRunner.runPerformanceBenchmarks();
      console.log('Performance benchmarks:', benchmarks);
    } catch (error) {
      console.error('Error running benchmarks:', error);
    }
  };

  // Filter results by category
  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(result => result.testId.includes(selectedCategory));

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'skipped':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  // Export test results
  const exportResults = () => {
    const data = {
      summary,
      results,
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive testing suite for Developer Tools Platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateTestData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Test Data
          </Button>
          <Button
            onClick={runBenchmarks}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Run Benchmarks
          </Button>
          {results.length > 0 && (
            <Button
              onClick={exportResults}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Results
            </Button>
          )}
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Running Tests
            </CardTitle>
            {currentTest && (
              <CardDescription>Currently running: {currentTest}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress.toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Test Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {summary.averageDuration.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <p className="text-xs text-muted-foreground">
                {summary.passRate.toFixed(1)}% pass rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <p className="text-xs text-muted-foreground">
                {((summary.failed / summary.total) * 100).toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(summary.totalDuration / 1000).toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                Total execution time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      {results.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Tests' : category}
            </Button>
          ))}
        </div>
      )}

      {/* Test Results */}
      {filteredResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Showing {filteredResults.length} of {results.length} tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredResults.map(result => (
                <div
                  key={result.testId}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    getStatusColor(result.status)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {result.testId}
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {result.duration}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Functional Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Core functionality, storage operations, and data integrity tests
            </p>
            <div className="mt-2">
              <Badge variant="outline">Storage</Badge>
              <Badge variant="outline" className="ml-1">API</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Search performance, virtual scrolling, and memory usage tests
            </p>
            <div className="mt-2">
              <Badge variant="outline">Speed</Badge>
              <Badge variant="outline" className="ml-1">Memory</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Accessibility Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              WCAG compliance, keyboard navigation, and screen reader support
            </p>
            <div className="mt-2">
              <Badge variant="outline">ARIA</Badge>
              <Badge variant="outline" className="ml-1">Keyboard</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Compatibility Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cross-browser support, mobile responsiveness, and feature detection
            </p>
            <div className="mt-2">
              <Badge variant="outline">Cross-browser</Badge>
              <Badge variant="outline" className="ml-1">Mobile</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common testing operations and utilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => {
                // Clear all test data
                localStorage.removeItem('devtools-platform-data');
                console.log('Test data cleared');
              }}
            >
              <AlertTriangle className="h-5 w-5" />
              <div>
                <div className="font-medium">Clear Data</div>
                <div className="text-xs text-muted-foreground">Reset all storage</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => {
                const memory = PerformanceMonitor.checkMemoryUsage();
                console.log('Memory usage:', memory);
              }}
            >
              <BarChart3 className="h-5 w-5" />
              <div>
                <div className="font-medium">Memory Check</div>
                <div className="text-xs text-muted-foreground">Check memory usage</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 h-20"
              onClick={() => {
                console.log('User Agent:', navigator.userAgent);
                console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
                console.log('Platform:', navigator.platform);
              }}
            >
              <Monitor className="h-5 w-5" />
              <div>
                <div className="font-medium">Environment</div>
                <div className="text-xs text-muted-foreground">Show browser info</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {results.length === 0 && !isRunning && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tests Run Yet</h3>
              <p className="text-muted-foreground mb-4">
                Click "Run All Tests" to start comprehensive testing of the platform
              </p>
              <Button onClick={runAllTests} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Testing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}