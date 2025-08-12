'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { buildConnectionString, getDatabaseDefaults, validateConnectionParameters } from '@/lib/database-utils';
import type { DatabaseType, DatabaseParameters } from '@/types';
import { Database, Check, AlertCircle } from 'lucide-react';

export default function ConnectionBuilderDemo() {
  const [results, setResults] = useState<any[]>([]);

  const runDemo = () => {
    const demoResults: any[] = [];
    
    // Test different database types
    const testCases: { type: DatabaseType; params: DatabaseParameters; name: string }[] = [
      {
        type: 'postgresql',
        params: { host: 'localhost', port: 5432, database: 'myapp', username: 'postgres', password: 'secure123' },
        name: 'PostgreSQL with SSL'
      },
      {
        type: 'mysql',
        params: { host: 'db.company.com', port: 3306, database: 'production', username: 'app_user', password: 'StrongPass!23', useEncryption: true },
        name: 'Production MySQL'
      },
      {
        type: 'mongodb',
        params: { host: 'cluster.mongodb.net', port: 27017, database: 'app_data', username: 'admin', password: 'MongoPass456', authSource: 'admin', retryWrites: true },
        name: 'MongoDB Atlas'
      },
      {
        type: 'redis',
        params: { host: 'redis.cache.com', port: 6379, password: 'RedisSecret789', database: '0' },
        name: 'Redis Cache'
      },
      {
        type: 'elasticsearch',
        params: { host: 'search.elastic.co', port: 9200, username: 'elastic', password: 'ElasticPass', useEncryption: true },
        name: 'Elasticsearch Cluster'
      },
      {
        type: 'sqlite',
        params: { filePath: '/data/application.db' },
        name: 'SQLite Database'
      }
    ];

    testCases.forEach(testCase => {
      try {
        // Generate connection string
        const connectionString = buildConnectionString(testCase.params, testCase.type);
        
        // Get defaults and merge
        const defaults = getDatabaseDefaults(testCase.type);
        const mergedParams = { ...defaults, ...testCase.params };
        
        // Validate parameters
        const validation = validateConnectionParameters(mergedParams, testCase.type);
        
        // Calculate security score
        let securityScore = 100;
        if (testCase.params.password && testCase.params.password.length < 12) securityScore -= 20;
        if (!testCase.params.useEncryption && testCase.type !== 'sqlite') securityScore -= 30;
        if (testCase.params.host === 'localhost') securityScore -= 10;
        
        demoResults.push({
          name: testCase.name,
          type: testCase.type,
          connectionString,
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          securityScore: Math.max(0, securityScore),
          parameters: testCase.params
        });
        
      } catch (error) {
        demoResults.push({
          name: testCase.name,
          type: testCase.type,
          error: error instanceof Error ? error.message : 'Unknown error',
          valid: false
        });
      }
    });

    setResults(demoResults);
  };

  const getSecurityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Connection String Builder Demo</h2>
        <Button onClick={runDemo}>
          <Database className="h-4 w-4 mr-2" />
          Run Demo
        </Button>
      </div>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((result, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{result.name}</h3>
                    <p className="text-sm text-muted-foreground uppercase">{result.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.valid ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Valid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Invalid</span>
                      </div>
                    )}
                    {result.securityScore && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSecurityColor(result.securityScore)}`}>
                        Security: {result.securityScore}/100
                      </span>
                    )}
                  </div>
                </div>

                {result.connectionString && (
                  <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                    {result.connectionString.replace(/(password=|:)[^;&@\s]+/gi, '$1***')}
                  </div>
                )}

                {result.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm">
                    Error: {result.error}
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="space-y-1">
                    {result.errors.map((error: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-1">
                    {result.warnings.map((warning: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-yellow-600 text-sm">
                        <AlertCircle className="h-3 w-3" />
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Demo Complete!</h3>
            <p className="text-green-700 text-sm">
              Successfully tested {results.filter(r => r.valid).length} out of {results.length} connection configurations.
              The Database Connection String Builder supports all major database types with comprehensive validation,
              security analysis, and multiple export formats.
            </p>
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Ready to Demo</h3>
          <p className="text-muted-foreground">Click "Run Demo" to test the comprehensive database connection string builder</p>
        </div>
      )}
    </div>
  );
}