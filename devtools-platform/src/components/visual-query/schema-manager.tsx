'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatabaseSchema, SchemaTable, TableColumn } from '@/types';
import { Database, Table, Columns, Key, Link, Upload, Download, Plus, Trash2, Search, Eye, EyeOff } from 'lucide-react';

interface SchemaManagerProps {
  schemas: DatabaseSchema[];
  onSchemasChange: (schemas: DatabaseSchema[]) => void;
  selectedSchema?: string;
  onSchemaSelect: (schemaName: string) => void;
}

interface SchemaViewerProps {
  schema: DatabaseSchema;
  onSchemaChange: (schema: DatabaseSchema) => void;
}

interface TableEditorProps {
  table: SchemaTable;
  onTableChange: (table: SchemaTable) => void;
  onTableRemove: () => void;
}

const TableEditor = ({ table, onTableChange, onTableRemove }: TableEditorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  const addColumn = () => {
    const newColumn: TableColumn = {
      name: `column_${table.columns.length + 1}`,
      type: 'VARCHAR(255)',
      nullable: true,
      primaryKey: false,
      unique: false,
      index: false
    };
    onTableChange({
      ...table,
      columns: [...table.columns, newColumn]
    });
    setEditingColumn(newColumn.name);
  };

  const updateColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = [...table.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onTableChange({ ...table, columns: newColumns });
  };

  const removeColumn = (index: number) => {
    const newColumns = table.columns.filter((_, i) => i !== index);
    onTableChange({ ...table, columns: newColumns });
  };

  const updateTable = (updates: Partial<SchemaTable>) => {
    onTableChange({ ...table, ...updates });
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800">
      {/* Header */}
      <div 
        className="p-3 border-b bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-blue-600" />
            <span className="font-medium">{table.name}</span>
            <span className="text-xs text-muted-foreground">
              ({table.columns.length} columns)
            </span>
            {table.rowCount && (
              <span className="text-xs text-muted-foreground">
                • {table.rowCount.toLocaleString()} rows
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onTableRemove();
              }}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Table Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Table Name</label>
              <Input
                size="sm"
                value={table.name}
                onChange={(e) => updateTable({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Schema</label>
              <Input
                size="sm"
                placeholder="public, dbo, etc."
                value={table.schema || ''}
                onChange={(e) => updateTable({ schema: e.target.value || undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Row Count</label>
              <Input
                size="sm"
                type="number"
                placeholder="0"
                value={table.rowCount || ''}
                onChange={(e) => updateTable({ rowCount: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Estimated Size (KB)</label>
              <Input
                size="sm"
                type="number"
                placeholder="0"
                value={table.estimatedSize || ''}
                onChange={(e) => updateTable({ estimatedSize: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Comment</label>
            <Input
              size="sm"
              placeholder="Table description"
              value={table.comment || ''}
              onChange={(e) => updateTable({ comment: e.target.value || undefined })}
            />
          </div>

          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Columns</label>
              <Button size="sm" variant="outline" onClick={addColumn}>
                <Plus className="h-3 w-3 mr-1" />
                Add Column
              </Button>
            </div>

            <div className="border rounded overflow-hidden">
              {/* Column Headers */}
              <div className="bg-muted/50 p-2 border-b">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-1">Nullable</div>
                  <div className="col-span-1">PK</div>
                  <div className="col-span-1">FK</div>
                  <div className="col-span-1">Unique</div>
                  <div className="col-span-1">Index</div>
                  <div className="col-span-2">Default</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Column Rows */}
              {table.columns.map((column, index) => (
                <div key={index} className="p-2 border-b last:border-b-0 hover:bg-muted/20">
                  {editingColumn === column.name ? (
                    <div className="grid grid-cols-12 gap-2 text-sm">
                      <Input
                        size="sm"
                        className="col-span-2"
                        value={column.name}
                        onChange={(e) => {
                          updateColumn(index, { name: e.target.value });
                          setEditingColumn(e.target.value);
                        }}
                        onBlur={() => setEditingColumn(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingColumn(null)}
                        autoFocus
                      />
                      <select
                        className="col-span-2 px-2 py-1 rounded border bg-background text-sm"
                        value={column.type}
                        onChange={(e) => updateColumn(index, { type: e.target.value })}
                      >
                        <option value="VARCHAR(255)">VARCHAR(255)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="INT">INT</option>
                        <option value="BIGINT">BIGINT</option>
                        <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="DATE">DATE</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="JSON">JSON</option>
                        <option value="UUID">UUID</option>
                      </select>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={column.nullable}
                          onChange={(e) => updateColumn(index, { nullable: e.target.checked })}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={column.primaryKey}
                          onChange={(e) => updateColumn(index, { primaryKey: e.target.checked })}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={!!column.foreignKey}
                          onChange={(e) => updateColumn(index, { 
                            foreignKey: e.target.checked ? { table: '', column: '' } : undefined 
                          })}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={column.unique}
                          onChange={(e) => updateColumn(index, { unique: e.target.checked })}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={column.index}
                          onChange={(e) => updateColumn(index, { index: e.target.checked })}
                        />
                      </div>
                      <Input
                        size="sm"
                        className="col-span-2"
                        placeholder="Default value"
                        value={column.defaultValue || ''}
                        onChange={(e) => updateColumn(index, { defaultValue: e.target.value || undefined })}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeColumn(index)}
                        className="col-span-1 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="grid grid-cols-12 gap-2 text-sm cursor-pointer"
                      onClick={() => setEditingColumn(column.name)}
                    >
                      <div className="col-span-2 font-medium flex items-center gap-1">
                        {column.primaryKey && <Key className="h-3 w-3 text-yellow-500" />}
                        {column.foreignKey && <Link className="h-3 w-3 text-green-500" />}
                        {column.name}
                      </div>
                      <div className="col-span-2 text-muted-foreground">{column.type}</div>
                      <div className="col-span-1 text-center">{column.nullable ? '✓' : '✗'}</div>
                      <div className="col-span-1 text-center">{column.primaryKey ? '✓' : ''}</div>
                      <div className="col-span-1 text-center">{column.foreignKey ? '✓' : ''}</div>
                      <div className="col-span-1 text-center">{column.unique ? '✓' : ''}</div>
                      <div className="col-span-1 text-center">{column.index ? '✓' : ''}</div>
                      <div className="col-span-2 text-muted-foreground truncate">{column.defaultValue || ''}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColumn(index);
                        }}
                        className="col-span-1 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {table.columns.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Columns className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No columns defined</div>
                  <div className="text-xs">Click &quot;Add Column&quot; to get started</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SchemaViewer = ({ schema, onSchemaChange }: SchemaViewerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const addTable = () => {
    const newTable: SchemaTable = {
      name: `table_${schema.tables.length + 1}`,
      columns: []
    };
    onSchemaChange({
      ...schema,
      tables: [...schema.tables, newTable]
    });
  };

  const updateTable = (index: number, table: SchemaTable) => {
    const newTables = [...schema.tables];
    newTables[index] = table;
    onSchemaChange({ ...schema, tables: newTables });
  };

  const removeTable = (index: number) => {
    const newTables = schema.tables.filter((_, i) => i !== index);
    onSchemaChange({ ...schema, tables: newTables });
  };

  const updateSchemaName = (name: string) => {
    onSchemaChange({ ...schema, name });
  };

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Schema Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" />
          <Input
            value={schema.name}
            onChange={(e) => updateSchemaName(e.target.value)}
            className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent"
            placeholder="Schema name"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {schema.tables.length} table{schema.tables.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={addTable}>
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </div>

      {/* Tables */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <div className="font-medium">
            {searchTerm ? 'No tables match your search' : 'No tables in schema'}
          </div>
          <div className="text-sm">
            {searchTerm ? 'Try a different search term' : 'Click "Add Table" to create your first table'}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTables.map((table, index) => {
            const originalIndex = schema.tables.findIndex(t => t === table);
            return (
              <TableEditor
                key={originalIndex}
                table={table}
                onTableChange={(updatedTable) => updateTable(originalIndex, updatedTable)}
                onTableRemove={() => removeTable(originalIndex)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export function SchemaManager({
  schemas,
  onSchemasChange,
  selectedSchema,
  onSchemaSelect
}: SchemaManagerProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importDDL, setImportDDL] = useState('');

  const createNewSchema = () => {
    const newSchema: DatabaseSchema = {
      name: `schema_${schemas.length + 1}`,
      tables: []
    };
    onSchemasChange([...schemas, newSchema]);
    onSchemaSelect(newSchema.name);
  };

  const updateSchema = (updatedSchema: DatabaseSchema) => {
    const newSchemas = schemas.map(schema =>
      schema.name === selectedSchema ? updatedSchema : schema
    );
    onSchemasChange(newSchemas);
    
    // Update selected schema name if it changed
    if (updatedSchema.name !== selectedSchema) {
      onSchemaSelect(updatedSchema.name);
    }
  };

  const removeSchema = (schemaName: string) => {
    const newSchemas = schemas.filter(schema => schema.name !== schemaName);
    onSchemasChange(newSchemas);
    
    // Select first schema or none if no schemas left
    if (selectedSchema === schemaName) {
      onSchemaSelect(newSchemas[0]?.name || '');
    }
  };

  const exportSchema = (schema: DatabaseSchema) => {
    const ddl = generateDDL(schema);
    const blob = new Blob([ddl], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name}_schema.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSchemaFromDDL = () => {
    try {
      // This is a simplified DDL parser - in a real implementation,
      // you'd use a proper SQL parser library
      const parsedSchema = parseDDL(importDDL);
      onSchemasChange([...schemas, parsedSchema]);
      onSchemaSelect(parsedSchema.name);
      setImportDDL('');
      setIsImporting(false);
    } catch (error) {
      alert('Failed to parse DDL. Please check your SQL syntax.');
    }
  };

  const currentSchema = schemas.find(schema => schema.name === selectedSchema);

  return (
    <div className="h-full flex">
      {/* Schema List Sidebar */}
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Database Schemas</h3>
            <div className="text-xs text-muted-foreground">
              {schemas.length} schema{schemas.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={createNewSchema} className="flex-1">
              <Plus className="h-3 w-3 mr-1" />
              New
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsImporting(true)}
              className="flex-1"
            >
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {schemas.map((schema) => (
            <div
              key={schema.name}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSchema === schema.name
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => onSchemaSelect(schema.name)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{schema.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {schema.tables.length} table{schema.tables.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSchema(schema);
                    }}
                    className="h-6 w-6 p-0"
                    title="Export Schema"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSchema(schema.name);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    title="Delete Schema"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {isImporting ? (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Import Schema from DDL</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Paste your CREATE TABLE statements here:
                  </label>
                  <Textarea
                    value={importDDL}
                    onChange={(e) => setImportDDL(e.target.value)}
                    placeholder={`CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);`}
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={importSchemaFromDDL} disabled={!importDDL.trim()}>
                    Import Schema
                  </Button>
                  <Button variant="outline" onClick={() => setIsImporting(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : currentSchema ? (
          <div className="p-6">
            <SchemaViewer
              schema={currentSchema}
              onSchemaChange={updateSchema}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div className="font-medium">No Schema Selected</div>
              <div className="text-sm">Create or select a schema to get started</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility functions for DDL generation and parsing
function generateDDL(schema: DatabaseSchema): string {
  let ddl = `-- Schema: ${schema.name}\n\n`;
  
  schema.tables.forEach(table => {
    ddl += `CREATE TABLE ${table.name} (\n`;
    
    const columnDefinitions = table.columns.map(column => {
      let def = `  ${column.name} ${column.type}`;
      
      if (!column.nullable) def += ' NOT NULL';
      if (column.unique) def += ' UNIQUE';
      if (column.defaultValue) def += ` DEFAULT ${column.defaultValue}`;
      
      return def;
    });
    
    ddl += columnDefinitions.join(',\n');
    ddl += '\n);\n\n';
  });
  
  return ddl;
}

function parseDDL(ddl: string): DatabaseSchema {
  // This is a very simplified parser - in production, use a proper SQL parser
  const schemaName = `imported_${Date.now()}`;
  const tables: SchemaTable[] = [];
  
  // Extract CREATE TABLE statements using regex
  const createTableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
  let match;
  
  while ((match = createTableRegex.exec(ddl)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];
    
    const columns: TableColumn[] = [];
    const columnLines = columnsDef.split(',').map(line => line.trim());
    
    columnLines.forEach(line => {
      if (line) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const column: TableColumn = {
            name: parts[0],
            type: parts[1],
            nullable: !line.includes('NOT NULL'),
            primaryKey: line.includes('PRIMARY KEY'),
            unique: line.includes('UNIQUE'),
            index: false
          };
          
          // Extract default value
          const defaultMatch = line.match(/DEFAULT\s+([^,\s]+)/i);
          if (defaultMatch) {
            column.defaultValue = defaultMatch[1];
          }
          
          columns.push(column);
        }
      }
    });
    
    tables.push({
      name: tableName,
      columns
    });
  }
  
  return {
    name: schemaName,
    tables
  };
}