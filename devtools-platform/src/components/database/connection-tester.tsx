'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatabaseConnection } from '@/types';
import { testDatabaseConnection } from '@/lib/database-utils';
import { Play, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface ConnectionTesterProps {
  connection: DatabaseConnection;
  onTestComplete?: (result: { success: boolean; message: string; latency?: number }) => void;
  className?: string;
}

export function ConnectionTester({ connection, onTestComplete, className = '' }: ConnectionTesterProps) {
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setLastResult(null);

    try {
      const result = await testDatabaseConnection(connection);
      setLastResult(result);
      onTestComplete?.(result);
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
      };
      setLastResult(errorResult);
      onTestComplete?.(errorResult);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (testing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (!lastResult) {
      return <Play className="h-4 w-4" />;
    }
    
    return lastResult.success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = () => {
    if (testing) return '';
    if (!lastResult) return '';
    return lastResult.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleTest}
          disabled={testing || !connection.connectionString}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          {getStatusIcon()}
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>

        {lastResult && (
          <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
            <span>{lastResult.message}</span>
            {lastResult.latency && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{lastResult.latency}ms</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg text-sm">
        <div>
          <span className="font-medium">Type:</span>
          <span className="ml-2 capitalize">{connection.type}</span>
        </div>
        <div>
          <span className="font-medium">Name:</span>
          <span className="ml-2">{connection.name}</span>
        </div>
        
        {connection.parameters.host && (
          <div>
            <span className="font-medium">Host:</span>
            <span className="ml-2 font-mono">{connection.parameters.host}</span>
          </div>
        )}
        
        {connection.parameters.port && (
          <div>
            <span className="font-medium">Port:</span>
            <span className="ml-2 font-mono">{connection.parameters.port}</span>
          </div>
        )}
        
        {connection.parameters.database && (
          <div>
            <span className="font-medium">Database:</span>
            <span className="ml-2 font-mono">{connection.parameters.database}</span>
          </div>
        )}
        
        {connection.parameters.username && (
          <div>
            <span className="font-medium">Username:</span>
            <span className="ml-2 font-mono">{connection.parameters.username}</span>
          </div>
        )}
      </div>

      {/* Connection String Preview */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Connection String:</span>
        <div className="p-3 bg-muted/10 rounded border font-mono text-xs break-all">
          {connection.connectionString || 'No connection string configured'}
        </div>
      </div>
    </div>
  );
}