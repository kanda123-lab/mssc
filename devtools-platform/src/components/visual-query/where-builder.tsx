'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WhereCondition, QueryTable } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, Filter, Parentheses } from 'lucide-react';

interface WhereBuilderProps {
  tables: QueryTable[];
  conditions: WhereCondition[];
  onConditionsChange: (conditions: WhereCondition[]) => void;
  title?: string;
  emptyMessage?: string;
}

interface ConditionCardProps {
  condition: WhereCondition;
  tables: QueryTable[];
  onUpdate: (condition: WhereCondition) => void;
  onRemove: (conditionId: string) => void;
  showLogicalOperator?: boolean;
  isFirst?: boolean;
}

const OPERATORS = [
  { value: '=', label: '= (equals)' },
  { value: '<>', label: '<> (not equals)' },
  { value: '<', label: '< (less than)' },
  { value: '>', label: '> (greater than)' },
  { value: '<=', label: '<= (less than or equal)' },
  { value: '>=', label: '>= (greater than or equal)' },
  { value: 'LIKE', label: 'LIKE (pattern match)' },
  { value: 'IN', label: 'IN (in list)' },
  { value: 'NOT IN', label: 'NOT IN (not in list)' },
  { value: 'BETWEEN', label: 'BETWEEN (range)' },
  { value: 'IS NULL', label: 'IS NULL (is null)' },
  { value: 'IS NOT NULL', label: 'IS NOT NULL (is not null)' },
] as const;

const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
] as const;

const ConditionCard = ({ condition, tables, onUpdate, onRemove, showLogicalOperator, isFirst }: ConditionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const selectedTable = condition.column.includes('.') 
    ? tables.find(t => t.name === condition.column.split('.')[0] || t.alias === condition.column.split('.')[0])
    : null;
  
  const availableColumns = tables.flatMap(table => 
    table.columns.map(col => ({
      value: table.alias ? `${table.alias}.${col.name}` : `${table.name}.${col.name}`,
      label: `${table.alias || table.name}.${col.name} (${col.type})`,
      table: table.name,
      column: col.name,
      type: col.type
    }))
  );

  const updateField = (field: keyof WhereCondition, value: string | number | boolean | string[] | null | undefined) => {
    onUpdate({ ...condition, [field]: value });
  };

  const needsValue = () => {
    return !['IS NULL', 'IS NOT NULL'].includes(condition.operator);
  };

  const needsSecondValue = () => {
    return condition.operator === 'BETWEEN';
  };

  const renderValueInput = () => {
    if (!needsValue()) return null;

    if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
      return (
        <Textarea
          placeholder="Value1, Value2, Value3 or 'String1', 'String2'"
          value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value || ''}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim());
            updateField('value', values);
          }}
          rows={3}
          className="text-sm"
        />
      );
    }

    return (
      <div className="space-y-2">
        <Input
          placeholder={getValuePlaceholder()}
          value={condition.value || ''}
          onChange={(e) => updateField('value', e.target.value)}
          className="text-sm"
        />
        {needsSecondValue() && (
          <Input
            placeholder="End value"
            value={condition.value2 || ''}
            onChange={(e) => updateField('value2', e.target.value)}
            className="text-sm"
          />
        )}
      </div>
    );
  };

  const getValuePlaceholder = () => {
    switch (condition.operator) {
      case 'LIKE':
        return "e.g., '%text%', 'start%', '%end'";
      case 'BETWEEN':
        return "Start value";
      default:
        return "Enter value...";
    }
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800">
      {/* Header */}
      <div 
        className="p-3 border-b bg-purple-50 dark:bg-purple-900/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-sm">
              {condition.column || 'Column'} {condition.operator} {condition.value || '...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(condition.id);
              }}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Logical Operator (for non-first conditions) */}
          {showLogicalOperator && !isFirst && (
            <div>
              <label className="text-sm font-medium mb-2 block">Logical Operator</label>
              <div className="flex gap-2">
                {LOGICAL_OPERATORS.map(op => (
                  <button
                    key={op.value}
                    onClick={() => updateField('logicalOperator', op.value)}
                    className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                      condition.logicalOperator === op.value
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouping Controls */}
          <div>
            <label className="text-sm font-medium mb-2 block">Grouping</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateField('groupStart', !condition.groupStart)}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  condition.groupStart
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Parentheses className="h-4 w-4 mr-1 inline" />
                Start Group
              </button>
              <button
                onClick={() => updateField('groupEnd', !condition.groupEnd)}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  condition.groupEnd
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Parentheses className="h-4 w-4 mr-1 inline" />
                End Group
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Column</label>
            <select
              value={condition.column}
              onChange={(e) => updateField('column', e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
            >
              <option value="">Select column...</option>
              {availableColumns.map(col => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Operator</label>
            <select
              value={condition.operator}
              onChange={(e) => updateField('operator', e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background"
            >
              {OPERATORS.map(op => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          {needsValue() && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Value{needsSecondValue() ? 's' : ''}
              </label>
              {renderValueInput()}
            </div>
          )}

          {/* Subquery Option */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={condition.isSubquery || false}
                onChange={(e) => updateField('isSubquery', e.target.checked)}
              />
              <span className="text-sm">Use subquery for value</span>
            </label>
            {condition.isSubquery && (
              <div className="mt-2 p-3 border rounded bg-muted/50">
                <div className="text-sm text-muted-foreground">
                  Subquery builder would go here. For now, you can use the main query builder to create subqueries.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export function WhereBuilder({ 
  tables, 
  conditions, 
  onConditionsChange, 
  title = "WHERE Conditions",
  emptyMessage = "No conditions defined. Add conditions to filter your results."
}: WhereBuilderProps) {
  const addCondition = () => {
    const newCondition: WhereCondition = {
      id: generateId(),
      column: '',
      operator: '=',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined,
    };
    
    onConditionsChange([...conditions, newCondition]);
  };

  const updateCondition = (updatedCondition: WhereCondition) => {
    onConditionsChange(conditions.map(condition => 
      condition.id === updatedCondition.id ? updatedCondition : condition
    ));
  };

  const removeCondition = (conditionId: string) => {
    onConditionsChange(conditions.filter(condition => condition.id !== conditionId));
  };

  const canAddCondition = tables.length > 0 && tables.some(table => table.columns.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button 
          size="sm" 
          onClick={addCondition}
          disabled={!canAddCondition}
          title={!canAddCondition ? "Add tables with columns to create conditions" : "Add new condition"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <div className="font-medium">No Conditions</div>
          <div className="text-sm">{emptyMessage}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <ConditionCard
              key={condition.id}
              condition={condition}
              tables={tables}
              onUpdate={updateCondition}
              onRemove={removeCondition}
              showLogicalOperator={true}
              isFirst={index === 0}
            />
          ))}
        </div>
      )}

      {/* Condition Preview */}
      {conditions.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <h4 className="font-medium mb-2">Condition Preview</h4>
          <div className="text-sm font-mono text-muted-foreground">
            {conditions.map((condition, index) => {
              const parts = [];
              
              if (condition.groupStart) parts.push('(');
              
              if (index > 0 && condition.logicalOperator) {
                parts.push(condition.logicalOperator);
              }
              
              parts.push(condition.column || 'column');
              parts.push(condition.operator);
              
              if (!['IS NULL', 'IS NOT NULL'].includes(condition.operator)) {
                if (condition.operator === 'BETWEEN') {
                  parts.push(`${condition.value || 'value1'} AND ${condition.value2 || 'value2'}`);
                } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
                  const values = Array.isArray(condition.value) ? condition.value : [condition.value];
                  parts.push(`(${values.join(', ')})`);
                } else {
                  parts.push(condition.value || 'value');
                }
              }
              
              if (condition.groupEnd) parts.push(')');
              
              return parts.join(' ');
            }).join(' ')}
          </div>
        </div>
      )}
    </div>
  );
}