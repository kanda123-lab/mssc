'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Play,
  Table,
  BarChart3,
  PieChart,
  TrendingUp,
  Database,
  FileText,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  Hash,
  Clock,
  Calendar,
  Map,
  Layers,
  Grid,
  List,
  BookOpen
} from 'lucide-react';

interface DataVisualizerProps {
  data?: any[];
  isLoading?: boolean;
  error?: string;
  executionStats?: {
    executionTimeMs: number;
    totalDocsExamined: number;
    totalDocsReturned: number;
    totalKeysExamined: number;
    totalDocsExaminedPercent?: number;
    indexName?: string;
  };
  queryInfo?: {
    operation: string;
    collection: string;
    query: string;
  };
  onExecute?: () => void;
  className?: string;
}

interface ChartData {
  labels: string[];
  values: number[];
  type: 'bar' | 'pie' | 'line';
}

export default function DataVisualizer({
  data = [],
  isLoading = false,
  error,
  executionStats,
  queryInfo,
  onExecute,
  className
}: DataVisualizerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'json' | 'chart' | 'stats'>('table');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<ChartData | null>(null);

  // Process and filter data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = getNestedValue(a, sortField);
        const bVal = getNestedValue(b, sortField);
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Extract unique fields from data
  const fields = useMemo(() => {
    if (!data.length) return [];
    
    const fieldSet = new Set<string>();
    data.forEach(item => {
      extractFields(item).forEach(field => fieldSet.add(field));
    });
    
    return Array.from(fieldSet).sort();
  }, [data]);

  // Generate chart data
  const generateChartData = (field: string, chartType: 'bar' | 'pie' | 'line' = 'bar'): ChartData => {
    const fieldValues: { [key: string]: number } = {};
    
    data.forEach(item => {
      const value = getNestedValue(item, field);
      const key = value?.toString() || 'null';
      fieldValues[key] = (fieldValues[key] || 0) + 1;
    });

    const entries = Object.entries(fieldValues).sort(([,a], [,b]) => b - a);
    
    return {
      labels: entries.map(([key]) => key),
      values: entries.map(([, value]) => value),
      type: chartType
    };
  };

  const extractFields = (obj: any, prefix = ''): string[] => {
    const fields: string[] = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        fields.push(fullKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          fields.push(...extractFields(obj[key], fullKey));
        }
      }
    }
    
    return fields;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleToggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const renderTableView = () => {
    if (!data.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No data to display</p>
          <p className="text-sm">Execute a query to see results here</p>
          {onExecute && (
            <Button className="mt-4" onClick={onExecute}>
              <Play className="h-4 w-4 mr-2" />
              Execute Query
            </Button>
          )}
        </div>
      );
    }

    const displayFields = selectedFields.length > 0 ? selectedFields : fields.slice(0, 10);

    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {processedData.length} of {data.length} documents
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Field Selection */}
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">Fields:</span>
          {fields.slice(0, 20).map(field => (
            <Button
              key={field}
              variant={selectedFields.includes(field) || selectedFields.length === 0 ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFieldToggle(field)}
              className="text-xs h-6"
            >
              {field}
            </Button>
          ))}
          {fields.length > 20 && (
            <Badge variant="secondary" className="text-xs">
              +{fields.length - 20} more
            </Badge>
          )}
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium w-12">#</th>
                  {displayFields.map(field => (
                    <th key={field} className="text-left p-3 font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (sortField === field) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField(field);
                            setSortDirection('asc');
                          }
                        }}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        {field}
                        {sortField === field && (
                          <SortAsc 
                            className={cn(
                              "h-3 w-3 ml-1",
                              sortDirection === 'desc' && "rotate-180"
                            )} 
                          />
                        )}
                      </Button>
                    </th>
                  ))}
                  <th className="text-left p-3 font-medium w-12">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index;
                  const isExpanded = expandedRows[globalIndex];
                  
                  return (
                    <tr key={globalIndex} className="border-t hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">{globalIndex + 1}</td>
                      {displayFields.map(field => {
                        const value = getNestedValue(item, field);
                        return (
                          <td key={field} className="p-3 max-w-xs">
                            <div className="truncate text-sm" title={JSON.stringify(value)}>
                              {value === null || value === undefined ? (
                                <span className="text-muted-foreground italic">null</span>
                              ) : typeof value === 'object' ? (
                                <span className="font-mono text-xs">
                                  {JSON.stringify(value).slice(0, 50)}...
                                </span>
                              ) : (
                                String(value)
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRow(globalIndex)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expanded Row Details */}
        {Object.entries(expandedRows).some(([, expanded]) => expanded) && (
          <div className="space-y-2">
            {Object.entries(expandedRows).map(([indexStr, expanded]) => {
              if (!expanded) return null;
              const index = parseInt(indexStr);
              const item = data[index];
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm">Document {index + 1} Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-64">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {processedData.length > pageSize && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm px-3 py-1 bg-muted rounded">
                {currentPage} of {Math.ceil(processedData.length / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(processedData.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(processedData.length / pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderJSONView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Raw JSON Data</h3>
        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}>
          <Download className="h-4 w-4 mr-1" />
          Copy JSON
        </Button>
      </div>
      <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
        <pre className="text-xs font-mono">
          {JSON.stringify(processedData, null, 2)}
        </pre>
      </div>
    </div>
  );

  const renderChartView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.slice(0, 6).map(field => {
          const chartData = generateChartData(field);
          return (
            <Card key={field}>
              <CardHeader>
                <CardTitle className="text-sm">{field}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chartData.labels.slice(0, 5).map((label, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm truncate">{label}</span>
                      <Badge variant="secondary">{chartData.values[i]}</Badge>
                    </div>
                  ))}
                  {chartData.labels.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{chartData.labels.length - 5} more values
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStatsView = () => (
    <div className="space-y-6">
      {/* Execution Statistics */}
      {executionStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Execution Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-bold">{executionStats.executionTimeMs}ms</div>
                <div className="text-xs text-muted-foreground">Execution Time</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Database className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <div className="text-lg font-bold">{executionStats.totalDocsReturned}</div>
                <div className="text-xs text-muted-foreground">Docs Returned</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Search className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                <div className="text-lg font-bold">{executionStats.totalDocsExamined}</div>
                <div className="text-xs text-muted-foreground">Docs Examined</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Hash className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                <div className="text-lg font-bold">{executionStats.totalKeysExamined}</div>
                <div className="text-xs text-muted-foreground">Keys Examined</div>
              </div>
            </div>
            {executionStats.indexName && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Index Used: {executionStats.indexName}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{data.length}</div>
              <div className="text-xs text-muted-foreground">Total Documents</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Layers className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{fields.length}</div>
              <div className="text-xs text-muted-foreground">Unique Fields</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <Grid className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{Math.round(JSON.stringify(data).length / 1024)}KB</div>
              <div className="text-xs text-muted-foreground">Data Size</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <BarChart3 className="h-6 w-6 mx-auto mb-1" />
              <div className="text-lg font-bold">{data.length ? Math.round(JSON.stringify(data[0]).length) : 0}B</div>
              <div className="text-xs text-muted-foreground">Avg Doc Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Executing query...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Query Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Query Results
            {data.length > 0 && (
              <Badge variant="secondary">{data.length} documents</Badge>
            )}
          </CardTitle>
          {onExecute && (
            <Button onClick={onExecute} size="sm">
              <Play className="h-4 w-4 mr-1" />
              Re-execute
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="table" className="flex items-center gap-1">
              <Table className="h-3 w-3" />
              Table
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Stats
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="table">{renderTableView()}</TabsContent>
            <TabsContent value="json">{renderJSONView()}</TabsContent>
            <TabsContent value="chart">{renderChartView()}</TabsContent>
            <TabsContent value="stats">{renderStatsView()}</TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}