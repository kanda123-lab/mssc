'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageManager } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { VisualQueryGenerator } from '@/lib/visual-query-generator';
import { DragDropProvider } from '@/components/visual-query/drag-drop-provider';
import { SplitLayout } from '@/components/visual-query/split-layout';
import { TableSelector } from '@/components/visual-query/table-selector';
import { JoinBuilder } from '@/components/visual-query/join-builder';
import { WhereBuilder } from '@/components/visual-query/where-builder';
import { ColumnSelector } from '@/components/visual-query/column-selector';
import { QueryTypeSelector } from '@/components/visual-query/query-type-selector';
import { SchemaManager } from '@/components/visual-query/schema-manager';
import { QueryTemplates } from '@/components/visual-query/query-templates';
import { QueryHistory } from '@/components/visual-query/query-history';
import { QueryResultsTable } from '@/components/database/query-results-table';
import { 
  VisualQuery, 
  DatabaseSchema, 
  QueryTemplate, 
  QueryHistoryEntry, 
  QueryResult, 
  SchemaTable,
  QueryTable,
  QueryJoin,
  SelectedColumn,
  WhereCondition,
  OrderByColumn,
  InsertData,
  UpdateData,
  CreateTableData
} from '@/types';
import { Save, Play, Zap } from 'lucide-react';

// Mock sample schema for demonstration
const SAMPLE_SCHEMA: DatabaseSchema = {
  name: 'sample_ecommerce',
  tables: [
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { name: 'active', type: 'BOOLEAN', nullable: false, primaryKey: false, defaultValue: true }
      ],
      rowCount: 15420,
      estimatedSize: 2048
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true },
        { name: 'user_id', type: 'INTEGER', nullable: false, primaryKey: false, foreignKey: { table: 'users', column: 'id' } },
        { name: 'amount', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false },
        { name: 'status', type: 'VARCHAR(50)', nullable: false, primaryKey: false },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
      ],
      rowCount: 42380,
      estimatedSize: 5120
    },
    {
      name: 'products',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
        { name: 'price', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false },
        { name: 'category_id', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'in_stock', type: 'BOOLEAN', nullable: false, primaryKey: false, defaultValue: true },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
      ],
      rowCount: 2845,
      estimatedSize: 1024
    },
    {
      name: 'order_items',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true },
        { name: 'order_id', type: 'INTEGER', nullable: false, primaryKey: false, foreignKey: { table: 'orders', column: 'id' } },
        { name: 'product_id', type: 'INTEGER', nullable: false, primaryKey: false, foreignKey: { table: 'products', column: 'id' } },
        { name: 'quantity', type: 'INTEGER', nullable: false, primaryKey: false },
        { name: 'price', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false }
      ],
      rowCount: 95240,
      estimatedSize: 3072
    },
    {
      name: 'categories',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false, primaryKey: true },
        { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { name: 'slug', type: 'VARCHAR(255)', nullable: false, primaryKey: false, unique: true },
        { name: 'description', type: 'TEXT', nullable: true, primaryKey: false }
      ],
      rowCount: 45,
      estimatedSize: 16
    }
  ]
};

export default function VisualQueryBuilderPage() {
  // Main query state
  const [currentQuery, setCurrentQuery] = useState<VisualQuery>({
    id: generateId(),
    name: 'Untitled Query',
    type: 'SELECT',
    dialect: 'postgresql',
    tables: [],
    joins: [],
    selectColumns: [],
    whereConditions: [],
    groupByColumns: [],
    havingConditions: [],
    orderByColumns: [],
    timestamp: Date.now()
  });

  // UI state
  const [queryName, setQueryName] = useState('Untitled Query');
  const [selectedDialect, setSelectedDialect] = useState<'mysql' | 'postgresql' | 'sqlite' | 'mssql' | 'oracle'>('postgresql');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [readableExplanation, setReadableExplanation] = useState('');

  // Persistent data state
  const [, setSavedQueries] = useState<VisualQuery[]>([]);
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([SAMPLE_SCHEMA]);
  const [selectedSchema, setSelectedSchema] = useState('sample_ecommerce');
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryEntry[]>([]);

  // Query generator
  const queryGenerator = useMemo(() => new VisualQueryGenerator(selectedDialect), [selectedDialect]);

  // Load data from storage on mount
  useEffect(() => {
    const data = StorageManager.getData();
    setSavedQueries(data.visualQueries || []);
    setTemplates(data.queryTemplates || []);
    setSchemas(data.databaseSchemas?.length ? data.databaseSchemas : [SAMPLE_SCHEMA]);
    
    // Initialize query history if it doesn't exist
    if (!data.queryTemplates) {
      const initialHistory: QueryHistoryEntry[] = [];
      setQueryHistory(initialHistory);
    }
  }, []);

  // Generate SQL whenever query changes
  useEffect(() => {
    try {
      if (currentQuery.tables.length === 0 && currentQuery.type === 'SELECT') {
        setGeneratedSQL('-- Add tables to start building your query');
        setReadableExplanation('Add tables from the schema panel to start building your query.');
        return;
      }

      const sql = queryGenerator.generateSQL(currentQuery);
      const explanation = queryGenerator.generateReadableExplanation(currentQuery);
      
      setGeneratedSQL(sql);
      setReadableExplanation(explanation);
    } catch (error) {
      setGeneratedSQL(`-- Error generating SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setReadableExplanation('There was an error generating the SQL. Please check your query configuration.');
    }
  }, [currentQuery, queryGenerator]);

  // Update query when dialect changes
  useEffect(() => {
    setCurrentQuery(prev => ({ ...prev, dialect: selectedDialect }));
  }, [selectedDialect]);

  // Update query name
  useEffect(() => {
    setCurrentQuery(prev => ({ ...prev, name: queryName }));
  }, [queryName]);

  // Update handlers
  const updateQuery = useCallback((updates: Partial<VisualQuery>) => {
    setCurrentQuery(prev => ({ ...prev, ...updates, timestamp: Date.now() }));
  }, []);

  const handleTablesChange = useCallback((tables: QueryTable[]) => {
    updateQuery({ tables });
  }, [updateQuery]);

  const handleJoinsChange = useCallback((joins: QueryJoin[]) => {
    updateQuery({ joins });
  }, [updateQuery]);

  const handleColumnsChange = useCallback((selectColumns: SelectedColumn[]) => {
    updateQuery({ selectColumns });
  }, [updateQuery]);

  const handleWhereConditionsChange = useCallback((whereConditions: WhereCondition[]) => {
    updateQuery({ whereConditions });
  }, [updateQuery]);

  const handleHavingConditionsChange = useCallback((havingConditions: WhereCondition[]) => {
    updateQuery({ havingConditions });
  }, [updateQuery]);

  const handleGroupByChange = useCallback((groupByColumns: string[]) => {
    updateQuery({ groupByColumns });
  }, [updateQuery]);

  const handleOrderByChange = useCallback((orderByColumns: OrderByColumn[]) => {
    updateQuery({ orderByColumns });
  }, [updateQuery]);

  const handleLimitOffsetChange = useCallback((limit?: number, offset?: number) => {
    updateQuery({ limit, offset });
  }, [updateQuery]);

  const handleInsertDataChange = useCallback((insertData: InsertData) => {
    updateQuery({ insertData });
  }, [updateQuery]);

  const handleUpdateDataChange = useCallback((updateData: UpdateData) => {
    updateQuery({ updateData });
  }, [updateQuery]);

  const handleCreateTableDataChange = useCallback((createTableData: CreateTableData) => {
    updateQuery({ createTableData });
  }, [updateQuery]);

  // Query execution
  const executeQuery = useCallback(async () => {
    if (!generatedSQL || generatedSQL.startsWith('--')) return;

    setIsExecuting(true);
    setQueryResult(null);

    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const mockResult: QueryResult = {
        columns: currentQuery.selectColumns.map(col => col.alias || col.column || 'column'),
        rows: Array.from({ length: Math.floor(Math.random() * 50) + 5 }, (_, i) => {
          const row: Record<string, string | number> = {};
          currentQuery.selectColumns.forEach(col => {
            const colName = col.alias || col.column || 'column';
            row[colName] = `Sample data ${i + 1}`;
          });
          return row;
        }),
        rowCount: Math.floor(Math.random() * 1000) + 100,
        executionTime: Math.floor(Math.random() * 2000) + 100
      };

      setQueryResult(mockResult);

      // Add to history
      const historyEntry: QueryHistoryEntry = {
        sql: generatedSQL,
        timestamp: Date.now(),
        executionTime: mockResult.executionTime,
        rowCount: mockResult.rowCount,
        success: true
      };

      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
    } catch (error) {
      const historyEntry: QueryHistoryEntry = {
        sql: generatedSQL,
        timestamp: Date.now(),
        executionTime: 0,
        rowCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setQueryHistory(prev => [historyEntry, ...prev.slice(0, 99)]);
      
      setQueryResult({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: 0,
        error: error instanceof Error ? error.message : 'Query execution failed'
      });
    } finally {
      setIsExecuting(false);
    }
  }, [generatedSQL, currentQuery.selectColumns]);

  // Save query
  const saveQuery = useCallback(() => {
    if (!queryName.trim()) return;

    const queryToSave: VisualQuery = {
      ...currentQuery,
      name: queryName.trim(),
      timestamp: Date.now()
    };

    StorageManager.updateArrayField('visualQueries', (queries) => [
      ...queries.filter(q => q.id !== queryToSave.id),
      queryToSave
    ]);

    setSavedQueries(prev => [
      ...prev.filter(q => q.id !== queryToSave.id),
      queryToSave
    ]);
  }, [currentQuery, queryName]);

  // Load query
  const loadQuery = useCallback((query: VisualQuery) => {
    setCurrentQuery(query);
    setQueryName(query.name);
    setSelectedDialect(query.dialect);
  }, []);

  // Load template
  const loadTemplate = useCallback((query: VisualQuery) => {
    const newQuery = {
      ...query,
      id: generateId(),
      name: `${query.name} (Copy)`,
      timestamp: Date.now()
    };
    loadQuery(newQuery);
  }, [loadQuery]);

  // Load from history
  const loadFromHistory = useCallback((sql: string) => {
    // This is a simplified approach - in a full implementation,
    // you might want to parse the SQL back into a visual query
    navigator.clipboard.writeText(sql);
    alert('SQL copied to clipboard. You can paste it in the SQL editor or manually recreate the visual query.');
  }, []);

  // New query
  const createNewQuery = useCallback(() => {
    if (confirm('Create a new query? Unsaved changes will be lost.')) {
      const newQuery: VisualQuery = {
        id: generateId(),
        name: 'Untitled Query',
        type: 'SELECT',
        dialect: selectedDialect,
        tables: [],
        joins: [],
        selectColumns: [],
        whereConditions: [],
        groupByColumns: [],
        havingConditions: [],
        orderByColumns: [],
        timestamp: Date.now()
      };
      setCurrentQuery(newQuery);
      setQueryName('Untitled Query');
      setQueryResult(null);
    }
  }, [selectedDialect]);

  // Get available tables from selected schema
  const availableTables: SchemaTable[] = useMemo(() => {
    const schema = schemas.find(s => s.name === selectedSchema);
    return schema?.tables || [];
  }, [schemas, selectedSchema]);

  // Settings panel
  const settingsPanel = (
    <div className="p-4 space-y-4">
      <div>
        <h4 className="font-medium mb-3">Query Settings</h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Database Dialect</label>
            <select
              value={selectedDialect}
              onChange={(e) => setSelectedDialect(e.target.value as typeof selectedDialect)}
              className="w-full px-3 py-2 rounded border bg-background"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="mssql">SQL Server</option>
              <option value="oracle">Oracle</option>
            </select>
          </div>

          {currentQuery.type === 'SELECT' && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">LIMIT</label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={currentQuery.limit || ''}
                  onChange={(e) => handleLimitOffsetChange(
                    e.target.value ? parseInt(e.target.value) : undefined,
                    currentQuery.offset
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">OFFSET</label>
                <Input
                  type="number"
                  placeholder="No offset"
                  value={currentQuery.offset || ''}
                  onChange={(e) => handleLimitOffsetChange(
                    currentQuery.limit,
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Query Explanation</h4>
        <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded">
          {readableExplanation}
        </div>
      </div>
    </div>
  );

  // Main query builder content
  const queryBuilderContent = (
    <div className="h-full">
      <Tabs defaultValue="tables" className="h-full flex flex-col">
        <div className="border-b bg-muted/20 px-4 py-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Input
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                className="font-semibold text-lg border-none shadow-none p-0 h-auto bg-transparent"
                placeholder="Query name"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={createNewQuery}>
                New Query
              </Button>
              <Button size="sm" variant="outline" onClick={saveQuery} disabled={!queryName.trim()}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={executeQuery} disabled={isExecuting || !generatedSQL || generatedSQL.startsWith('--')}>
                {isExecuting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-1" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Execute
              </Button>
            </div>
          </div>

          <TabsList className="w-full justify-start bg-background">
            <TabsTrigger value="type">Query Type</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            {currentQuery.type === 'SELECT' && (
              <>
                <TabsTrigger value="columns">Columns</TabsTrigger>
                <TabsTrigger value="joins">Joins</TabsTrigger>
                <TabsTrigger value="where">WHERE</TabsTrigger>
                <TabsTrigger value="having">HAVING</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="type" className="h-full m-0 p-4 overflow-y-auto">
            <QueryTypeSelector
              queryType={currentQuery.type}
              onQueryTypeChange={(type) => updateQuery({ type })}
              insertData={currentQuery.insertData}
              onInsertDataChange={handleInsertDataChange}
              updateData={currentQuery.updateData}
              onUpdateDataChange={handleUpdateDataChange}
              createTableData={currentQuery.createTableData}
              onCreateTableDataChange={handleCreateTableDataChange}
              tables={currentQuery.tables}
            />
          </TabsContent>

          <TabsContent value="tables" className="h-full m-0 overflow-hidden">
            <TableSelector
              availableTables={availableTables}
              selectedTables={currentQuery.tables}
              onTablesChange={handleTablesChange}
            />
          </TabsContent>

          {currentQuery.type === 'SELECT' && (
            <>
              <TabsContent value="columns" className="h-full m-0 p-4 overflow-y-auto">
                <ColumnSelector
                  tables={currentQuery.tables}
                  selectedColumns={currentQuery.selectColumns}
                  onColumnsChange={handleColumnsChange}
                  groupByColumns={currentQuery.groupByColumns}
                  onGroupByChange={handleGroupByChange}
                  orderByColumns={currentQuery.orderByColumns}
                  onOrderByChange={handleOrderByChange}
                />
              </TabsContent>

              <TabsContent value="joins" className="h-full m-0 p-4 overflow-y-auto">
                <JoinBuilder
                  tables={currentQuery.tables}
                  joins={currentQuery.joins}
                  onJoinsChange={handleJoinsChange}
                />
              </TabsContent>

              <TabsContent value="where" className="h-full m-0 p-4 overflow-y-auto">
                <WhereBuilder
                  tables={currentQuery.tables}
                  conditions={currentQuery.whereConditions}
                  onConditionsChange={handleWhereConditionsChange}
                />
              </TabsContent>

              <TabsContent value="having" className="h-full m-0 p-4 overflow-y-auto">
                <WhereBuilder
                  tables={currentQuery.tables}
                  conditions={currentQuery.havingConditions}
                  onConditionsChange={handleHavingConditionsChange}
                  title="HAVING Conditions"
                  emptyMessage="No HAVING conditions defined. Add conditions to filter grouped results."
                />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );

  return (
    <div className="h-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visual SQL Query Builder</h1>
        <p className="text-muted-foreground">
          Build complex SQL queries visually with drag-and-drop table relationships, join builders, and real-time SQL generation
        </p>
      </div>

      <DragDropProvider>
        <div className="flex-1 border rounded-lg overflow-hidden bg-background" style={{ height: 'calc(100vh - 200px)' }}>
          <SplitLayout
            leftPanel={
              <SchemaManager
                schemas={schemas}
                onSchemasChange={(newSchemas) => {
                  setSchemas(newSchemas);
                  StorageManager.updateArrayField('databaseSchemas', () => newSchemas);
                }}
                selectedSchema={selectedSchema}
                onSchemaSelect={setSelectedSchema}
              />
            }
            centerPanel={queryBuilderContent}
            rightPanel={settingsPanel}
            sqlCode={generatedSQL}
            resultsPanel={
              <div className="h-full">
                {queryResult ? (
                  <QueryResultsTable result={queryResult} />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <div className="font-medium">No Results</div>
                      <div className="text-sm">Execute a query to see results here</div>
                    </div>
                  </div>
                )}
              </div>
            }
            settingsPanel={settingsPanel}
            historyPanel={
              <QueryHistory
                history={queryHistory}
                onHistoryChange={setQueryHistory}
                onLoadFromHistory={loadFromHistory}
              />
            }
            templatesPanel={
              <QueryTemplates
                templates={templates}
                onTemplatesChange={(newTemplates) => {
                  setTemplates(newTemplates);
                  StorageManager.updateArrayField('queryTemplates', () => newTemplates);
                }}
                onLoadTemplate={loadTemplate}
                currentQuery={currentQuery}
              />
            }
          />
        </div>
      </DragDropProvider>
    </div>
  );
}