'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { QueryResult } from '@/types';
import { Copy, Download, Clock, Hash } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface QueryResultsTableProps {
  result: QueryResult;
  className?: string;
}

export function QueryResultsTable({ result, className = '' }: QueryResultsTableProps) {
  const csvData = useMemo(() => {
    if (!result.rows.length) return '';
    
    const headers = result.columns.join(',');
    const rows = result.rows.map(row => 
      result.columns.map(col => {
        const value = row[col];
        // Escape CSV values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value?.toString() || '';
      }).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  }, [result]);

  const jsonData = useMemo(() => {
    return JSON.stringify(result.rows, null, 2);
  }, [result]);

  const handleDownload = (data: string, filename: string, contentType: string) => {
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: string | number | boolean | null | undefined): string => {
    if (value === null) return 'NULL';
    if (value === undefined) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    return value.toString();
  };

  if (result.error) {
    return (
      <div className={`rounded-lg border border-destructive/20 bg-destructive/5 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-destructive mb-2">
          <Hash className="h-4 w-4" />
          <span className="font-medium">Query Error</span>
        </div>
        <pre className="text-sm text-destructive whitespace-pre-wrap">{result.error}</pre>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <span className="font-medium">
              {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{result.executionTime}ms</span>
          </div>
        </div>

        {result.rows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyToClipboard(jsonData)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy JSON
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyToClipboard(csvData)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy CSV
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleDownload(csvData, 'query-results.csv', 'text/csv')}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleDownload(jsonData, 'query-results.json', 'application/json')}
            >
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {/* Results Table */}
      {result.rows.length > 0 ? (
        <div className="rounded-lg border">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  {result.columns.map((column, index) => (
                    <th 
                      key={index} 
                      className="text-left p-3 font-medium text-sm border-b border-r last:border-r-0 min-w-[120px]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/20">
                    {result.columns.map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className="p-3 text-sm border-b border-r last:border-r-0 font-mono max-w-xs"
                      >
                        <div className="truncate" title={formatValue(row[column])}>
                          {formatValue(row[column])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : result.rowCount > 0 ? (
        // For INSERT/UPDATE/DELETE queries that don't return data
        <div className="rounded-lg border bg-muted/5 p-4 text-center">
          <div className="text-sm text-muted-foreground">
            Query executed successfully. {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'} affected.
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/5 p-4 text-center">
          <div className="text-sm text-muted-foreground">
            No results returned.
          </div>
        </div>
      )}
    </div>
  );
}