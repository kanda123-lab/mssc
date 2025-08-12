'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SQLEditor } from '@/components/database/sql-editor';
import { QueryResultsTable } from '@/components/database/query-results-table';
import { StorageManager } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { executeQuery } from '@/lib/database-utils';
import { SQLQuery, QueryResult, DatabaseConnection } from '@/types';
import { Save, Play, Database, History, Trash2, Zap, BookOpen } from 'lucide-react';

export default function SQLQueryBuilderPage() {
  const [query, setQuery] = useState('-- Welcome to SQL Query Builder\n-- Write your SQL queries with syntax highlighting and validation\n\nSELECT \n  id,\n  name,\n  email,\n  created_at\nFROM users \nWHERE created_at >= \'2024-01-01\'\nORDER BY created_at DESC\nLIMIT 10;');
  const [queryName, setQueryName] = useState('');
  const [selectedDialect, setSelectedDialect] = useState<string>('postgresql');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [savedQueries, setSavedQueries] = useState<SQLQuery[]>([]);

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedQueries(data.sqlQueries);
  }, []);

  const handleSaveQuery = () => {
    if (!query.trim() || !queryName.trim()) return;

    const newQuery: SQLQuery = {
      id: generateId(),
      name: queryName.trim(),
      query: query.trim(),
      dialect: selectedDialect as SQLQuery['dialect'],
      description: `SQL query saved on ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
    };

    StorageManager.updateArrayField('sqlQueries', (queries) => [
      ...queries,
      newQuery,
    ]);

    setSavedQueries([...savedQueries, newQuery]);
    setQueryName('');
  };

  const handleLoadQuery = (savedQuery: SQLQuery) => {
    setQuery(savedQuery.query);
    setSelectedDialect(savedQuery.dialect);
    setQueryName(savedQuery.name);
  };

  const handleDeleteQuery = (id: string) => {
    StorageManager.updateArrayField('sqlQueries', (queries) =>
      queries.filter(q => q.id !== id)
    );
    setSavedQueries(savedQueries.filter(q => q.id !== id));
  };

  const handleExecuteQuery = async (queryToExecute: string) => {
    setIsExecuting(true);
    setQueryResult(null);

    try {
      const mockConnection: DatabaseConnection = {
        id: 'demo',
        name: 'Demo Database',
        type: selectedDialect as DatabaseConnection['type'],
        connectionString: `demo://${selectedDialect}`,
        parameters: { host: 'localhost', database: 'demo' },
        timestamp: Date.now(),
      };

      const result = await executeQuery(queryToExecute, mockConnection);
      setQueryResult(result);
    } catch (error) {
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Query execution failed',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const sampleQueries = [
    {
      name: 'Select Users',
      query: 'SELECT id, name, email FROM users WHERE active = true ORDER BY name;',
      dialect: 'postgresql',
      description: 'Basic user selection query'
    },
    {
      name: 'Join with Orders',
      query: 'SELECT u.name, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nGROUP BY u.id, u.name\nHAVING COUNT(o.id) > 0;',
      dialect: 'mysql',
      description: 'Users with their order count'
    },
    {
      name: 'Date Range Query',
      query: 'SELECT \n  DATE(created_at) as date,\n  COUNT(*) as records\nFROM transactions\nWHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\'\nGROUP BY DATE(created_at)\nORDER BY date DESC;',
      dialect: 'postgresql',
      description: 'Last 30 days transactions'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <Database className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-4">SQL Query Builder</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Build, test, and save SQL queries with intelligent syntax highlighting and real-time validation
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-3 gap-8">
        {/* Main Editor Area */}
        <div className="space-y-6">
          {/* Query Editor Card */}
          <div className="card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center gap-3 mb-4 lg:mb-0">
                <Zap className="h-5 w-5 text-blue-500" />
                <h2>Query Editor</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  className="min-w-[140px]"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlite">SQLite</option>
                  <option value="mssql">SQL Server</option>
                  <option value="oracle">Oracle</option>
                  <option value="generic">Generic SQL</option>
                </select>
              </div>
            </div>

            <SQLEditor
              value={query}
              onChange={setQuery}
              dialect={selectedDialect}
              onExecute={handleExecuteQuery}
              placeholder="Enter your SQL query here..."
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Input
                placeholder="Enter a name to save this query..."
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSaveQuery} 
                disabled={!query.trim() || !queryName.trim()}
                className="btn-secondary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Query
              </Button>
            </div>
          </div>

          {/* Query Results */}
          {(queryResult || isExecuting) && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-5 w-5 text-green-500" />
                <h2>Query Results</h2>
                {isExecuting && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-gray-600">Executing...</span>
                  </div>
                )}
              </div>

              {queryResult && <QueryResultsTable result={queryResult} />}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Examples */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <h3>Quick Examples</h3>
            </div>
            
            <div className="space-y-3">
              {sampleQueries.map((sample, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setQuery(sample.query);
                    setSelectedDialect(sample.dialect);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                        {sample.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {sample.description}
                      </p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                        {sample.dialect.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Queries */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-purple-500" />
              <h3>Saved Queries</h3>
            </div>
            
            {savedQueries.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved queries yet</p>
                <p className="text-sm text-gray-400">Save your queries to access them later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQueries.map((savedQuery) => (
                  <div key={savedQuery.id} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {savedQuery.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            {savedQuery.dialect.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{new Date(savedQuery.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleLoadQuery(savedQuery)}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load Query
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDeleteQuery(savedQuery.id)}
                        className="btn-secondary text-xs px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-blue-900 mb-4">✨ Features</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                SQL syntax highlighting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Real-time query validation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Multiple database dialects
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Query execution simulation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Save and organize queries
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Export results as CSV/JSON
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}