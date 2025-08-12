'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QueryJoin, QueryTable, JoinCondition } from '@/types';
import { generateId } from '@/lib/utils';
import { Plus, Trash2, Link2, ChevronDown } from 'lucide-react';

interface JoinBuilderProps {
  tables: QueryTable[];
  joins: QueryJoin[];
  onJoinsChange: (joins: QueryJoin[]) => void;
}

interface JoinCardProps {
  join: QueryJoin;
  tables: QueryTable[];
  onUpdate: (join: QueryJoin) => void;
  onRemove: (joinId: string) => void;
}

const JOIN_TYPES = [
  { value: 'INNER', label: 'INNER JOIN', description: 'Only rows that have matching values in both tables' },
  { value: 'LEFT', label: 'LEFT JOIN', description: 'All rows from left table, matching rows from right table' },
  { value: 'RIGHT', label: 'RIGHT JOIN', description: 'All rows from right table, matching rows from left table' },
  { value: 'FULL', label: 'FULL OUTER JOIN', description: 'All rows when there is a match in either table' },
  { value: 'CROSS', label: 'CROSS JOIN', description: 'Cartesian product of both tables' },
] as const;

const OPERATORS = ['=', '<>', '<', '>', '<=', '>='] as const;

const JoinCard = ({ join, tables, onUpdate, onRemove }: JoinCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const leftTable = tables.find(t => t.id === join.leftTable);
  const rightTable = tables.find(t => t.id === join.rightTable);

  const updateJoinType = (type: QueryJoin['type']) => {
    onUpdate({ ...join, type });
  };

  const updateTables = (leftTableId: string, rightTableId: string) => {
    onUpdate({ ...join, leftTable: leftTableId, rightTable: rightTableId });
  };

  const addCondition = () => {
    const newCondition: JoinCondition = {
      leftColumn: '',
      operator: '=',
      rightColumn: '',
    };
    onUpdate({ ...join, conditions: [...join.conditions, newCondition] });
  };

  const updateCondition = (index: number, condition: JoinCondition) => {
    const newConditions = [...join.conditions];
    newConditions[index] = condition;
    onUpdate({ ...join, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = join.conditions.filter((_, i) => i !== index);
    onUpdate({ ...join, conditions: newConditions });
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
            <Link2 className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">
              {leftTable?.name || 'Table'} {join.type} {rightTable?.name || 'Table'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(join.id);
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
          {/* Join Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Join Type</label>
            <div className="grid grid-cols-1 gap-2">
              {JOIN_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => updateJoinType(type.value)}
                  className={`text-left p-3 rounded border transition-colors ${
                    join.type === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Left Table</label>
              <select
                value={join.leftTable}
                onChange={(e) => updateTables(e.target.value, join.rightTable)}
                className="w-full px-3 py-2 rounded border bg-background"
              >
                <option value="">Select table...</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.alias ? `${table.name} (${table.alias})` : table.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Right Table</label>
              <select
                value={join.rightTable}
                onChange={(e) => updateTables(join.leftTable, e.target.value)}
                className="w-full px-3 py-2 rounded border bg-background"
              >
                <option value="">Select table...</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.alias ? `${table.name} (${table.alias})` : table.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Join Conditions */}
          {join.type !== 'CROSS' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Join Conditions</label>
                <Button size="sm" onClick={addCondition} variant="outline">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-2">
                {join.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    {/* Left Column */}
                    <select
                      value={condition.leftColumn}
                      onChange={(e) => updateCondition(index, { ...condition, leftColumn: e.target.value })}
                      className="flex-1 px-2 py-1 rounded border bg-background text-sm"
                    >
                      <option value="">Select column...</option>
                      {leftTable?.columns.map(col => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>

                    {/* Operator */}
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { ...condition, operator: e.target.value as JoinCondition['operator'] })}
                      className="w-16 px-2 py-1 rounded border bg-background text-sm"
                    >
                      {OPERATORS.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>

                    {/* Right Column */}
                    <select
                      value={condition.rightColumn}
                      onChange={(e) => updateCondition(index, { ...condition, rightColumn: e.target.value })}
                      className="flex-1 px-2 py-1 rounded border bg-background text-sm"
                    >
                      <option value="">Select column...</option>
                      {rightTable?.columns.map(col => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCondition(index)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {join.conditions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No join conditions defined. Click &quot;Add Condition&quot; to get started.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function JoinBuilder({ tables, joins, onJoinsChange }: JoinBuilderProps) {
  const addJoin = () => {
    const newJoin: QueryJoin = {
      id: generateId(),
      type: 'INNER',
      leftTable: '',
      rightTable: '',
      conditions: [],
    };
    
    onJoinsChange([...joins, newJoin]);
  };

  const updateJoin = (updatedJoin: QueryJoin) => {
    onJoinsChange(joins.map(join => 
      join.id === updatedJoin.id ? updatedJoin : join
    ));
  };

  const removeJoin = (joinId: string) => {
    onJoinsChange(joins.filter(join => join.id !== joinId));
  };

  const canAddJoin = tables.length >= 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Table Joins</h3>
        <Button 
          size="sm" 
          onClick={addJoin}
          disabled={!canAddJoin}
          title={!canAddJoin ? "Add at least 2 tables to create joins" : "Add new join"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Join
        </Button>
      </div>

      {joins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <div className="font-medium">No Joins Defined</div>
          <div className="text-sm">
            {!canAddJoin 
              ? 'Add at least 2 tables to create joins between them' 
              : 'Click "Add Join" to connect tables together'
            }
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {joins.map((join) => (
            <JoinCard
              key={join.id}
              join={join}
              tables={tables}
              onUpdate={updateJoin}
              onRemove={removeJoin}
            />
          ))}
        </div>
      )}

      {/* Join Visualization */}
      {joins.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <h4 className="font-medium mb-2">Join Relationship</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {joins.map((join, index) => {
              const leftTable = tables.find(t => t.id === join.leftTable);
              const rightTable = tables.find(t => t.id === join.rightTable);
              
              return (
                <div key={join.id}>
                  {index === 0 ? (
                    <span>{leftTable?.name || 'Unknown Table'}</span>
                  ) : null}
                  <div className="ml-4">
                    ↳ {join.type} {rightTable?.name || 'Unknown Table'}
                    {join.conditions.length > 0 && (
                      <span className="ml-2 text-xs">
                        ({join.conditions.length} condition{join.conditions.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}