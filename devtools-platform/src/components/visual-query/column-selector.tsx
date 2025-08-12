'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectedColumn, QueryTable, OrderByColumn } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, Columns, ArrowUp, ArrowDown } from 'lucide-react';

interface ColumnSelectorProps {
  tables: QueryTable[];
  selectedColumns: SelectedColumn[];
  onColumnsChange: (columns: SelectedColumn[]) => void;
  groupByColumns: string[];
  onGroupByChange: (columns: string[]) => void;
  orderByColumns: OrderByColumn[];
  onOrderByChange: (columns: OrderByColumn[]) => void;
}

interface ColumnCardProps {
  column: SelectedColumn;
  tables: QueryTable[];
  onUpdate: (column: SelectedColumn) => void;
  onRemove: (columnId: string) => void;
}

const AGGREGATE_FUNCTIONS = [
  { value: '', label: 'None' },
  { value: 'COUNT', label: 'COUNT' },
  { value: 'SUM', label: 'SUM' },
  { value: 'AVG', label: 'AVG' },
  { value: 'MIN', label: 'MIN' },
  { value: 'MAX', label: 'MAX' },
  { value: 'GROUP_CONCAT', label: 'GROUP_CONCAT / STRING_AGG' },
] as const;

const ColumnCard = ({ column, tables, onUpdate, onRemove }: ColumnCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const availableColumns = tables.flatMap(table => 
    table.columns.map(col => ({
      value: table.alias ? `${table.alias}.${col.name}` : `${table.name}.${col.name}`,
      label: `${table.alias || table.name}.${col.name} (${col.type})`,
      table: table.name,
      column: col.name,
      type: col.type
    }))
  );

  const updateField = (field: keyof SelectedColumn, value: string | boolean | undefined) => {
    onUpdate({ ...column, [field]: value });
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800">
      {/* Header */}
      <div 
        className="p-3 border-b bg-green-50 dark:bg-green-900/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-green-600" />
            <span className="font-medium text-sm">
              {column.aggregateFunction && `${column.aggregateFunction}(`}
              {column.column || 'Column'}
              {column.aggregateFunction && ')'}
              {column.alias && ` AS ${column.alias}`}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(column.id);
            }}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Expression Toggle */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={column.isExpression || false}
                onChange={(e) => updateField('isExpression', e.target.checked)}
              />
              <span className="text-sm">Custom expression</span>
            </label>
          </div>

          {column.isExpression ? (
            /* Custom Expression */
            <div>
              <label className="text-sm font-medium mb-2 block">Expression</label>
              <Input
                placeholder="e.g., CASE WHEN age > 18 THEN 'Adult' ELSE 'Minor' END"
                value={column.expression || ''}
                onChange={(e) => updateField('expression', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <>
              {/* Column Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Column</label>
                <select
                  value={column.column}
                  onChange={(e) => updateField('column', e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background"
                >
                  <option value="">Select column...</option>
                  <option value="*">* (All columns)</option>
                  {availableColumns.map(col => (
                    <option key={col.value} value={col.value}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aggregate Function */}
              {column.column !== '*' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Aggregate Function</label>
                  <select
                    value={column.aggregateFunction || ''}
                    onChange={(e) => updateField('aggregateFunction', e.target.value || undefined)}
                    className="w-full px-3 py-2 rounded border bg-background"
                  >
                    {AGGREGATE_FUNCTIONS.map(func => (
                      <option key={func.value} value={func.value}>
                        {func.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Alias */}
          <div>
            <label className="text-sm font-medium mb-2 block">Alias (optional)</label>
            <Input
              placeholder="Column alias"
              value={column.alias || ''}
              onChange={(e) => updateField('alias', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const GroupByBuilder = ({ tables, groupByColumns, onGroupByChange }: {
  tables: QueryTable[];
  groupByColumns: string[];
  onGroupByChange: (columns: string[]) => void;
}) => {
  const availableColumns = tables.flatMap(table => 
    table.columns.map(col => ({
      value: table.alias ? `${table.alias}.${col.name}` : `${table.name}.${col.name}`,
      label: `${table.alias || table.name}.${col.name}`,
    }))
  );

  const addGroupByColumn = () => {
    onGroupByChange([...groupByColumns, '']);
  };

  const updateGroupByColumn = (index: number, column: string) => {
    const newColumns = [...groupByColumns];
    newColumns[index] = column;
    onGroupByChange(newColumns);
  };

  const removeGroupByColumn = (index: number) => {
    onGroupByChange(groupByColumns.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">GROUP BY</h4>
        <Button size="sm" variant="outline" onClick={addGroupByColumn}>
          <Plus className="h-3 w-3 mr-1" />
          Add Column
        </Button>
      </div>

      {groupByColumns.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No GROUP BY columns. Add columns to group your results.
        </div>
      ) : (
        <div className="space-y-2">
          {groupByColumns.map((column, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={column}
                onChange={(e) => updateGroupByColumn(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded border bg-background text-sm"
              >
                <option value="">Select column...</option>
                {availableColumns.map(col => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeGroupByColumn(index)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrderByBuilder = ({ tables, orderByColumns, onOrderByChange }: {
  tables: QueryTable[];
  orderByColumns: OrderByColumn[];
  onOrderByChange: (columns: OrderByColumn[]) => void;
}) => {
  const availableColumns = tables.flatMap(table => 
    table.columns.map(col => ({
      value: table.alias ? `${table.alias}.${col.name}` : `${table.name}.${col.name}`,
      label: `${table.alias || table.name}.${col.name}`,
    }))
  );

  const addOrderByColumn = () => {
    onOrderByChange([...orderByColumns, { column: '', direction: 'ASC' }]);
  };

  const updateOrderByColumn = (index: number, updates: Partial<OrderByColumn>) => {
    const newColumns = [...orderByColumns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onOrderByChange(newColumns);
  };

  const removeOrderByColumn = (index: number) => {
    onOrderByChange(orderByColumns.filter((_, i) => i !== index));
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...orderByColumns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
      onOrderByChange(newColumns);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">ORDER BY</h4>
        <Button size="sm" variant="outline" onClick={addOrderByColumn}>
          <Plus className="h-3 w-3 mr-1" />
          Add Column
        </Button>
      </div>

      {orderByColumns.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No ORDER BY columns. Add columns to sort your results.
        </div>
      ) : (
        <div className="space-y-2">
          {orderByColumns.map((orderCol, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded">
              <select
                value={orderCol.column}
                onChange={(e) => updateOrderByColumn(index, { column: e.target.value })}
                className="flex-1 px-2 py-1 rounded border bg-background text-sm"
              >
                <option value="">Select column...</option>
                {availableColumns.map(col => (
                  <option key={col.value} value={col.value}>
                    {col.label}
                  </option>
                ))}
              </select>

              <div className="flex border rounded">
                <button
                  onClick={() => updateOrderByColumn(index, { direction: 'ASC' })}
                  className={`px-3 py-1 text-sm transition-colors ${
                    orderCol.direction === 'ASC' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => updateOrderByColumn(index, { direction: 'DESC' })}
                  className={`px-3 py-1 text-sm border-l transition-colors ${
                    orderCol.direction === 'DESC' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>

              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={orderCol.nullsFirst || false}
                  onChange={(e) => updateOrderByColumn(index, { nullsFirst: e.target.checked })}
                />
                NULLS FIRST
              </label>

              <div className="flex">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveColumn(index, 'up')}
                  disabled={index === 0}
                  className="h-6 w-6 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveColumn(index, 'down')}
                  disabled={index === orderByColumns.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeOrderByColumn(index)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function ColumnSelector({
  tables,
  selectedColumns,
  onColumnsChange,
  groupByColumns,
  onGroupByChange,
  orderByColumns,
  onOrderByChange
}: ColumnSelectorProps) {
  const addColumn = () => {
    const newColumn: SelectedColumn = {
      id: generateId(),
      column: '',
      table: undefined,
      alias: undefined,
    };
    
    onColumnsChange([...selectedColumns, newColumn]);
  };

  const updateColumn = (updatedColumn: SelectedColumn) => {
    onColumnsChange(selectedColumns.map(column => 
      column.id === updatedColumn.id ? updatedColumn : column
    ));
  };

  const removeColumn = (columnId: string) => {
    onColumnsChange(selectedColumns.filter(column => column.id !== columnId));
  };

  const addAllColumns = () => {
    const allColumnsColumn: SelectedColumn = {
      id: generateId(),
      column: '*',
    };
    
    onColumnsChange([allColumnsColumn]);
  };

  const canAddColumn = tables.length > 0 && tables.some(table => table.columns.length > 0);

  return (
    <div className="space-y-6">
      {/* SELECT Columns */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">SELECT Columns</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={addAllColumns}
              disabled={!canAddColumn}
            >
              Select All (*)
            </Button>
            <Button 
              size="sm" 
              onClick={addColumn}
              disabled={!canAddColumn}
              title={!canAddColumn ? "Add tables with columns first" : "Add new column"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
          </div>
        </div>

        {selectedColumns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Columns className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <div className="font-medium">No Columns Selected</div>
            <div className="text-sm">Add columns to select data from your tables</div>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedColumns.map((column) => (
              <ColumnCard
                key={column.id}
                column={column}
                tables={tables}
                onUpdate={updateColumn}
                onRemove={removeColumn}
              />
            ))}
          </div>
        )}
      </div>

      {/* GROUP BY */}
      <div className="border-t pt-6">
        <GroupByBuilder
          tables={tables}
          groupByColumns={groupByColumns}
          onGroupByChange={onGroupByChange}
        />
      </div>

      {/* ORDER BY */}
      <div className="border-t pt-6">
        <OrderByBuilder
          tables={tables}
          orderByColumns={orderByColumns}
          onOrderByChange={onOrderByChange}
        />
      </div>
    </div>
  );
}