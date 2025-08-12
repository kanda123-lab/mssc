'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VisualQuery, InsertData, UpdateData, CreateTableData, CreateTableColumn } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface QueryTypeSelectorProps {
  queryType: VisualQuery['type'];
  onQueryTypeChange: (type: VisualQuery['type']) => void;
  insertData?: InsertData;
  onInsertDataChange?: (data: InsertData) => void;
  updateData?: UpdateData;
  onUpdateDataChange?: (data: UpdateData) => void;
  createTableData?: CreateTableData;
  onCreateTableDataChange?: (data: CreateTableData) => void;
  tables: Array<{ name: string; columns: Array<{ name: string; type: string }> }>;
}

const QUERY_TYPES = [
  { 
    value: 'SELECT', 
    label: 'SELECT', 
    description: 'Query data from tables',
    icon: '📊',
    color: 'blue'
  },
  { 
    value: 'INSERT', 
    label: 'INSERT', 
    description: 'Add new records to a table',
    icon: '➕',
    color: 'green'
  },
  { 
    value: 'UPDATE', 
    label: 'UPDATE', 
    description: 'Modify existing records',
    icon: '✏️',
    color: 'orange'
  },
  { 
    value: 'DELETE', 
    label: 'DELETE', 
    description: 'Remove records from a table',
    icon: '🗑️',
    color: 'red'
  },
  { 
    value: 'CREATE_TABLE', 
    label: 'CREATE TABLE', 
    description: 'Create a new table',
    icon: '🏗️',
    color: 'purple'
  },
  { 
    value: 'ALTER_TABLE', 
    label: 'ALTER TABLE', 
    description: 'Modify table structure',
    icon: '🔧',
    color: 'indigo'
  },
] as const;

const DATA_TYPES = [
  // Common types across databases
  'VARCHAR(255)', 'TEXT', 'CHAR(10)', 
  'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT',
  'DECIMAL(10,2)', 'NUMERIC(10,2)', 'FLOAT', 'DOUBLE',
  'BOOLEAN', 'BIT',
  'DATE', 'TIME', 'DATETIME', 'TIMESTAMP',
  'BLOB', 'CLOB',
  // PostgreSQL specific
  'SERIAL', 'BIGSERIAL', 'UUID', 'JSON', 'JSONB',
  // MySQL specific
  'AUTO_INCREMENT', 'ENUM', 'SET',
  // SQL Server specific
  'IDENTITY', 'UNIQUEIDENTIFIER', 'NVARCHAR(255)',
];

const InsertDataBuilder = ({ 
  insertData, 
  onInsertDataChange, 
  tables 
}: {
  insertData?: InsertData;
  onInsertDataChange?: (data: InsertData) => void;
  tables: Array<{ name: string; columns: Array<{ name: string; type: string }> }>;
}) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  
  const table = tables.find(t => t.name === selectedTable);
  const availableColumns = table?.columns || [];
  
  const currentData = insertData || {
    columns: [],
    values: [{}],
    onConflict: undefined
  };

  const updateInsertData = (updates: Partial<InsertData>) => {
    onInsertDataChange?.({ ...currentData, ...updates });
  };

  const addColumn = (columnName: string) => {
    const newColumns = [...currentData.columns, columnName];
    const newValues = currentData.values.map(row => ({ ...row, [columnName]: '' }));
    updateInsertData({ columns: newColumns, values: newValues });
  };

  const removeColumn = (columnName: string) => {
    const newColumns = currentData.columns.filter(col => col !== columnName);
    const newValues = currentData.values.map(row => {
      const { [columnName]: removed, ...rest } = row;
      return rest;
    });
    updateInsertData({ columns: newColumns, values: newValues });
  };

  const addRow = () => {
    const newRow = currentData.columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
    updateInsertData({ values: [...currentData.values, newRow] });
  };

  const removeRow = (index: number) => {
    const newValues = currentData.values.filter((_, i) => i !== index);
    updateInsertData({ values: newValues });
  };

  const updateValue = (rowIndex: number, column: string, value: string) => {
    const newValues = [...currentData.values];
    newValues[rowIndex] = { ...newValues[rowIndex], [column]: value };
    updateInsertData({ values: newValues });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Target Table</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-background"
        >
          {tables.map(table => (
            <option key={table.name} value={table.name}>
              {table.name}
            </option>
          ))}
        </select>
      </div>

      {/* Column Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Columns to Insert</label>
          <div className="text-xs text-muted-foreground">
            Selected: {currentData.columns.length} columns
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
          {availableColumns.map((column) => (
            <label key={column.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={currentData.columns.includes(column.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addColumn(column.name);
                  } else {
                    removeColumn(column.name);
                  }
                }}
              />
              <span className="truncate">{column.name}</span>
              <span className="text-xs text-muted-foreground">({column.type})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Values Input */}
      {currentData.columns.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Values</label>
            <Button size="sm" variant="outline" onClick={addRow}>
              <Plus className="h-3 w-3 mr-1" />
              Add Row
            </Button>
          </div>

          <div className="border rounded overflow-hidden">
            {/* Header */}
            <div className="bg-muted/50 p-2 border-b">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${currentData.columns.length}, 1fr) auto` }}>
                {currentData.columns.map(column => (
                  <div key={column} className="text-sm font-medium truncate">
                    {column}
                  </div>
                ))}
                <div className="w-8"></div>
              </div>
            </div>

            {/* Rows */}
            <div className="max-h-48 overflow-y-auto">
              {currentData.values.map((row, rowIndex) => (
                <div key={rowIndex} className="p-2 border-b last:border-b-0">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${currentData.columns.length}, 1fr) auto` }}>
                    {currentData.columns.map(column => (
                      <Input
                        key={column}
                        size="sm"
                        placeholder="Value"
                        value={row[column] || ''}
                        onChange={(e) => updateValue(rowIndex, column, e.target.value)}
                      />
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRow(rowIndex)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution */}
      <div>
        <label className="text-sm font-medium mb-2 block">On Conflict</label>
        <select
          value={currentData.onConflict || ''}
          onChange={(e) => updateInsertData({ onConflict: (e.target.value as 'IGNORE' | 'UPDATE' | 'REPLACE') || undefined })}
          className="w-full px-3 py-2 rounded border bg-background"
        >
          <option value="">Default behavior</option>
          <option value="IGNORE">Ignore conflicts</option>
          <option value="UPDATE">Update on conflict</option>
          <option value="REPLACE">Replace on conflict</option>
        </select>
      </div>
    </div>
  );
};

const UpdateDataBuilder = ({ 
  updateData, 
  onUpdateDataChange, 
  tables 
}: {
  updateData?: UpdateData;
  onUpdateDataChange?: (data: UpdateData) => void;
  tables: Array<{ name: string; columns: Array<{ name: string; type: string }> }>;
}) => {
  const [selectedTable, setSelectedTable] = useState(tables[0]?.name || '');
  
  const table = tables.find(t => t.name === selectedTable);
  const availableColumns = table?.columns || [];
  
  const currentData = updateData || {
    setClause: []
  };

  const updateUpdateData = (updates: Partial<UpdateData>) => {
    onUpdateDataChange?.({ ...currentData, ...updates });
  };

  const addSetClause = () => {
    const newSetClause = [...currentData.setClause, { column: '', value: '', isExpression: false }];
    updateUpdateData({ setClause: newSetClause });
  };

  const removeSetClause = (index: number) => {
    const newSetClause = currentData.setClause.filter((_, i) => i !== index);
    updateUpdateData({ setClause: newSetClause });
  };

  const updateSetClause = (index: number, field: string, value: string | boolean) => {
    const newSetClause = [...currentData.setClause];
    newSetClause[index] = { ...newSetClause[index], [field]: value };
    updateUpdateData({ setClause: newSetClause });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Target Table</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="w-full px-3 py-2 rounded border bg-background"
        >
          {tables.map(table => (
            <option key={table.name} value={table.name}>
              {table.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">SET Clauses</label>
          <Button size="sm" variant="outline" onClick={addSetClause}>
            <Plus className="h-3 w-3 mr-1" />
            Add SET
          </Button>
        </div>

        {currentData.setClause.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No SET clauses defined. Add clauses to specify which columns to update.
          </div>
        ) : (
          <div className="space-y-2">
            {currentData.setClause.map((setItem, index) => (
              <div key={index} className="border rounded p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={setItem.column}
                    onChange={(e) => updateSetClause(index, 'column', e.target.value)}
                    className="flex-1 px-3 py-2 rounded border bg-background"
                  >
                    <option value="">Select column...</option>
                    {availableColumns.map((column) => (
                      <option key={column.name} value={column.name}>
                        {column.name} ({column.type})
                      </option>
                    ))}
                  </select>
                  <span>=</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSetClause(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={setItem.isExpression}
                      onChange={(e) => updateSetClause(index, 'isExpression', e.target.checked)}
                    />
                    Use expression
                  </label>

                  {setItem.isExpression ? (
                    <Textarea
                      placeholder="e.g., column_name + 1, UPPER(column_name), etc."
                      value={setItem.value}
                      onChange={(e) => updateSetClause(index, 'value', e.target.value)}
                      rows={3}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <Input
                      placeholder="New value"
                      value={setItem.value}
                      onChange={(e) => updateSetClause(index, 'value', e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateTableBuilder = ({ 
  createTableData, 
  onCreateTableDataChange 
}: {
  createTableData?: CreateTableData;
  onCreateTableDataChange?: (data: CreateTableData) => void;
}) => {
  const currentData = createTableData || {
    tableName: '',
    columns: [],
    primaryKey: [],
    foreignKeys: [],
    indexes: [],
    constraints: [],
    ifNotExists: false
  };

  const updateCreateTableData = (updates: Partial<CreateTableData>) => {
    onCreateTableDataChange?.({ ...currentData, ...updates });
  };

  const addColumn = () => {
    const newColumn: CreateTableColumn = {
      name: '',
      type: 'VARCHAR(255)',
      nullable: true,
      defaultValue: undefined,
      autoIncrement: false,
      unique: false,
      comment: ''
    };
    updateCreateTableData({ columns: [...currentData.columns, newColumn] });
  };

  const removeColumn = (index: number) => {
    const newColumns = currentData.columns.filter((_, i) => i !== index);
    updateCreateTableData({ columns: newColumns });
  };

  const updateColumn = (index: number, field: keyof CreateTableColumn, value: string | boolean | undefined) => {
    const newColumns = [...currentData.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    updateCreateTableData({ columns: newColumns });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Table Name</label>
          <Input
            placeholder="table_name"
            value={currentData.tableName}
            onChange={(e) => updateCreateTableData({ tableName: e.target.value })}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={currentData.ifNotExists}
              onChange={(e) => updateCreateTableData({ ifNotExists: e.target.checked })}
            />
            <span className="text-sm">IF NOT EXISTS</span>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Columns</label>
          <Button size="sm" variant="outline" onClick={addColumn}>
            <Plus className="h-3 w-3 mr-1" />
            Add Column
          </Button>
        </div>

        {currentData.columns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No columns defined. Add columns to create your table structure.
          </div>
        ) : (
          <div className="space-y-3">
            {currentData.columns.map((column, index) => (
              <div key={index} className="border rounded p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Column {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeColumn(index)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Column Name</label>
                    <Input
                      size="sm"
                      placeholder="column_name"
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Data Type</label>
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      className="w-full px-2 py-1 rounded border bg-background text-sm"
                    >
                      {DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Default Value</label>
                    <Input
                      size="sm"
                      placeholder="NULL, 0, 'default', etc."
                      value={column.defaultValue || ''}
                      onChange={(e) => updateColumn(index, 'defaultValue', e.target.value || undefined)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Comment</label>
                    <Input
                      size="sm"
                      placeholder="Column description"
                      value={column.comment || ''}
                      onChange={(e) => updateColumn(index, 'comment', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={!column.nullable}
                      onChange={(e) => updateColumn(index, 'nullable', !e.target.checked)}
                    />
                    NOT NULL
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={column.autoIncrement}
                      onChange={(e) => updateColumn(index, 'autoIncrement', e.target.checked)}
                    />
                    AUTO INCREMENT
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={column.unique}
                      onChange={(e) => updateColumn(index, 'unique', e.target.checked)}
                    />
                    UNIQUE
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function QueryTypeSelector({
  queryType,
  onQueryTypeChange,
  insertData,
  onInsertDataChange,
  updateData,
  onUpdateDataChange,
  createTableData,
  onCreateTableDataChange,
  tables
}: QueryTypeSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Query Type Selection */}
      <div>
        <h3 className="font-semibold mb-4">Query Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUERY_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => onQueryTypeChange(type.value)}
              className={`p-4 rounded-lg border text-left transition-all ${
                queryType === type.value
                  ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 ring-2 ring-${type.color}-500`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-muted-foreground">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Query Type Specific Builders */}
      {queryType === 'INSERT' && (
        <div>
          <h4 className="font-medium mb-4">Insert Configuration</h4>
          <InsertDataBuilder
            insertData={insertData}
            onInsertDataChange={onInsertDataChange}
            tables={tables}
          />
        </div>
      )}

      {queryType === 'UPDATE' && (
        <div>
          <h4 className="font-medium mb-4">Update Configuration</h4>
          <UpdateDataBuilder
            updateData={updateData}
            onUpdateDataChange={onUpdateDataChange}
            tables={tables}
          />
        </div>
      )}

      {queryType === 'CREATE_TABLE' && (
        <div>
          <h4 className="font-medium mb-4">Table Definition</h4>
          <CreateTableBuilder
            createTableData={createTableData}
            onCreateTableDataChange={onCreateTableDataChange}
          />
        </div>
      )}

      {queryType === 'DELETE' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <span className="text-xl">⚠️</span>
            <div>
              <div className="font-medium">DELETE Query Selected</div>
              <div className="text-sm">
                Use the WHERE conditions to specify which records to delete. 
                Without WHERE conditions, ALL records will be deleted!
              </div>
            </div>
          </div>
        </div>
      )}

      {queryType === 'ALTER_TABLE' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <span className="text-xl">🚧</span>
            <div>
              <div className="font-medium">ALTER TABLE Coming Soon</div>
              <div className="text-sm">
                Advanced table modification features are in development.
                For now, you can write ALTER TABLE statements manually in the SQL editor.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}