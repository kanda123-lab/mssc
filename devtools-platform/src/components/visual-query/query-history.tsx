'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QueryHistoryEntry } from '@/types';
import { History, Search, CheckCircle, AlertCircle, Copy, Trash2, RotateCcw } from 'lucide-react';

interface QueryHistoryProps {
  history: QueryHistoryEntry[];
  onHistoryChange: (history: QueryHistoryEntry[]) => void;
  onLoadFromHistory: (sql: string) => void;
}

interface HistoryItemProps {
  entry: QueryHistoryEntry;
  onLoad: (sql: string) => void;
  onRemove: (timestamp: number) => void;
}

const HistoryItem = ({ entry, onLoad, onRemove }: HistoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = () => {
    if (entry.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    return entry.success 
      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
      : 'border-red-200 bg-red-50 dark:bg-red-900/20';
  };

  const truncateSQL = (sql: string, maxLength: number = 100) => {
    if (sql.length <= maxLength) return sql;
    return sql.substring(0, maxLength) + '...';
  };

  return (
    <div className={`border rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow ${getStatusColor()}`}>
      {/* Header */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <span className="text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {formatExecutionTime(entry.executionTime)}
              </span>
              {entry.rowCount > 0 && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {entry.rowCount.toLocaleString()} rows
                  </span>
                </>
              )}
            </div>
            
            <div className="font-mono text-sm text-muted-foreground">
              {truncateSQL(entry.sql)}
            </div>
            
            {entry.error && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                Error: {entry.error}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onLoad(entry.sql);
              }}
              className="h-7 w-7 p-0"
              title="Load Query"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(entry.sql);
              }}
              className="h-7 w-7 p-0"
              title="Copy SQL"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(entry.timestamp);
              }}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
              title="Remove from History"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t">
          <div className="pt-3">
            <h4 className="text-sm font-medium mb-2">Full Query</h4>
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
              {entry.sql}
            </pre>
            
            {entry.error && (
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1 text-red-600 dark:text-red-400">Error Details</h4>
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {entry.error}
                </div>
              </div>
            )}
            
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => onLoad(entry.sql)}>
                Load Query
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigator.clipboard.writeText(entry.sql)}
              >
                Copy SQL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function QueryHistory({ 
  history, 
  onHistoryChange, 
  onLoadFromHistory 
}: QueryHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.sql.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'success' && entry.success) || 
      (statusFilter === 'error' && !entry.success);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.timestamp - a.timestamp); // Most recent first

  const removeFromHistory = (timestamp: number) => {
    const updatedHistory = history.filter(entry => entry.timestamp !== timestamp);
    onHistoryChange(updatedHistory);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all query history? This action cannot be undone.')) {
      onHistoryChange([]);
    }
  };

  const clearErrorHistory = () => {
    const successfulQueries = history.filter(entry => entry.success);
    onHistoryChange(successfulQueries);
  };

  const getStats = () => {
    const total = history.length;
    const successful = history.filter(h => h.success).length;
    const failed = total - successful;
    const avgExecutionTime = total > 0 
      ? Math.round(history.reduce((sum, h) => sum + h.executionTime, 0) / total) 
      : 0;

    return { total, successful, failed, avgExecutionTime };
  };

  const stats = getStats();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Query History</h3>
          <div className="text-xs text-muted-foreground">
            {history.length} quer{history.length !== 1 ? 'ies' : 'y'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/20 rounded">
            <div className="text-lg font-semibold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-lg font-semibold text-green-600">{stats.successful}</div>
            <div className="text-xs text-muted-foreground">Success</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-lg font-semibold text-red-600">{stats.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-lg font-semibold text-blue-600">{stats.avgExecutionTime}ms</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search query history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'error')}
              className="flex-1 px-3 py-2 rounded border bg-background text-sm"
            >
              <option value="all">All Queries</option>
              <option value="success">Successful Only</option>
              <option value="error">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={clearErrorHistory}
            disabled={stats.failed === 0}
            className="flex-1 text-xs"
          >
            Clear Failed
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearHistory}
            disabled={stats.total === 0}
            className="flex-1 text-xs text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <div className="font-medium">
              {history.length === 0 
                ? 'No query history' 
                : 'No queries match your search'
              }
            </div>
            <div className="text-sm mt-1">
              {history.length === 0 
                ? 'Execute queries to see them appear here' 
                : 'Try adjusting your search or filter criteria'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((entry) => (
              <HistoryItem
                key={entry.timestamp}
                entry={entry}
                onLoad={onLoadFromHistory}
                onRemove={removeFromHistory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}