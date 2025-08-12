'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  Calendar,
  Search,
  MapPin,
  Type,
  Hash,
  ToggleLeft,
  Brackets,
  Quote
} from 'lucide-react';
import type { MongoFilter, MongoCondition, MongoOperator, MongoDataType } from '@/types';

interface VisualFilterBuilderProps {
  filter: MongoFilter;
  onFilterChange: (filter: MongoFilter) => void;
  availableFields?: { name: string; type: MongoDataType; sample?: any }[];
  className?: string;
}

const OPERATORS_BY_CATEGORY = {
  comparison: [
    { value: '$eq', label: '=', description: 'Equals' },
    { value: '$ne', label: '≠', description: 'Not equal' },
    { value: '$gt', label: '>', description: 'Greater than' },
    { value: '$gte', label: '≥', description: 'Greater than or equal' },
    { value: '$lt', label: '<', description: 'Less than' },
    { value: '$lte', label: '≤', description: 'Less than or equal' },
    { value: '$in', label: 'IN', description: 'In array' },
    { value: '$nin', label: 'NOT IN', description: 'Not in array' }
  ],
  element: [
    { value: '$exists', label: 'EXISTS', description: 'Field exists' },
    { value: '$type', label: 'TYPE', description: 'Field type' }
  ],
  array: [
    { value: '$all', label: 'ALL', description: 'All elements match' },
    { value: '$elemMatch', label: 'ELEM MATCH', description: 'Element match' },
    { value: '$size', label: 'SIZE', description: 'Array size' }
  ],
  text: [
    { value: '$regex', label: 'REGEX', description: 'Regular expression' },
    { value: '$text', label: 'TEXT', description: 'Text search' }
  ],
  geospatial: [
    { value: '$geoWithin', label: 'GEO WITHIN', description: 'Within geometry' },
    { value: '$near', label: 'NEAR', description: 'Near point' },
    { value: '$geoIntersects', label: 'GEO INTERSECTS', description: 'Intersects' }
  ]
};

const DATA_TYPE_ICONS = {
  string: Quote,
  number: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  objectId: Type,
  array: Brackets,
  object: Brackets,
  null: Type
};

export default function VisualFilterBuilder({ 
  filter, 
  onFilterChange, 
  availableFields = [], 
  className 
}: VisualFilterBuilderProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [groupLevel, setGroupLevel] = useState(0);
  const [showAdvancedOperators, setShowAdvancedOperators] = useState(false);

  const handleAddCondition = (insertIndex?: number) => {
    const newCondition: MongoCondition = {
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: availableFields[0]?.name || 'field',
      operator: '$eq',
      value: '',
      dataType: availableFields[0]?.type || 'string'
    };

    const conditions = [...filter.conditions];
    if (insertIndex !== undefined) {
      conditions.splice(insertIndex, 0, newCondition);
    } else {
      conditions.push(newCondition);
    }

    onFilterChange({ ...filter, conditions });
  };

  const handleUpdateCondition = (id: string, updates: Partial<MongoCondition>) => {
    const conditions = filter.conditions.map(condition =>
      condition.id === id ? { ...condition, ...updates } : condition
    );
    onFilterChange({ ...filter, conditions });
  };

  const handleDeleteCondition = (id: string) => {
    const conditions = filter.conditions.filter(condition => condition.id !== id);
    onFilterChange({ ...filter, conditions });
  };

  const handleAddGroup = () => {
    const newConditions = [
      ...filter.conditions,
      {
        id: `group-start-${Date.now()}`,
        field: 'field',
        operator: '$eq' as MongoOperator,
        value: '',
        dataType: 'string' as MongoDataType,
        groupStart: true
      },
      {
        id: `condition-${Date.now()}`,
        field: 'field',
        operator: '$eq' as MongoOperator,
        value: '',
        dataType: 'string' as MongoDataType
      },
      {
        id: `group-end-${Date.now()}`,
        field: 'field',
        operator: '$eq' as MongoOperator,
        value: '',
        dataType: 'string' as MongoDataType,
        groupEnd: true
      }
    ];
    onFilterChange({ ...filter, conditions: newConditions });
  };

  const renderConditionInput = (condition: MongoCondition) => {
    const field = availableFields.find(f => f.name === condition.field);
    const dataType = field?.type || condition.dataType;

    switch (dataType) {
      case 'boolean':
        return (
          <select
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value === 'true' })}
            className="w-full px-3 py-2 border rounded bg-background"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, { value: parseFloat(e.target.value) })}
            placeholder="0"
          />
        );
      
      case 'date':
        return (
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={condition.value}
              onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUpdateCondition(condition.id, { value: new Date().toISOString().slice(0, 16) })}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        );
      
      case 'array':
        return (
          <Input
            value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
            onChange={(e) => {
              const arrayValue = e.target.value.split(',').map(v => v.trim()).filter(v => v);
              handleUpdateCondition(condition.id, { value: arrayValue });
            }}
            placeholder="item1, item2, item3"
          />
        );
      
      default:
        return (
          <Input
            value={condition.value}
            onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
            placeholder="value"
            className={cn(
              "flex-1",
              condition.operator === '$regex' && "font-mono text-sm"
            )}
          />
        );
    }
  };

  const renderOperatorSelector = (condition: MongoCondition) => {
    const allOperators = Object.entries(OPERATORS_BY_CATEGORY).flatMap(([category, ops]) =>
      ops.map(op => ({ ...op, category }))
    );

    return (
      <select
        value={condition.operator}
        onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value as MongoOperator })}
        className="px-3 py-2 border rounded bg-background min-w-24"
      >
        {Object.entries(OPERATORS_BY_CATEGORY).map(([category, operators]) => (
          <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
            {operators.map(op => (
              <option key={op.value} value={op.value} title={op.description}>
                {op.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  };

  const renderFieldSelector = (condition: MongoCondition) => {
    return (
      <div className="flex items-center gap-2">
        <select
          value={condition.field}
          onChange={(e) => {
            const selectedField = availableFields.find(f => f.name === e.target.value);
            handleUpdateCondition(condition.id, { 
              field: e.target.value,
              dataType: selectedField?.type || 'string'
            });
          }}
          className="px-3 py-2 border rounded bg-background min-w-32"
        >
          {availableFields.length > 0 ? (
            availableFields.map(field => {
              const Icon = DATA_TYPE_ICONS[field.type] || Type;
              return (
                <option key={field.name} value={field.name}>
                  {field.name}
                </option>
              );
            })
          ) : (
            <option value="field">field</option>
          )}
        </select>
        {availableFields.find(f => f.name === condition.field) && (
          <Badge variant="secondary" className="text-xs">
            {availableFields.find(f => f.name === condition.field)?.type}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Visual Filter Builder
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdvancedOperators(!showAdvancedOperators)}>
              Advanced
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddGroup()}>
              <Plus className="h-4 w-4 mr-1" />
              Group
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAddCondition()}>
              <Plus className="h-4 w-4 mr-1" />
              Condition
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filter.conditions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No filter conditions yet</p>
            <Button variant="outline" className="mt-2" onClick={() => handleAddCondition()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Condition
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filter.conditions.map((condition, index) => (
              <div
                key={condition.id}
                className={cn(
                  "flex items-center gap-3 p-4 border rounded-lg bg-card",
                  condition.groupStart && "border-l-4 border-blue-500 bg-blue-50/50",
                  condition.groupEnd && "border-l-4 border-blue-500"
                )}
              >
                {/* Logic Operator */}
                {index > 0 && !condition.groupStart && (
                  <select
                    value={condition.logic || filter.logic}
                    onChange={(e) => handleUpdateCondition(condition.id, {
                      logic: e.target.value as 'AND' | 'OR'
                    })}
                    className="px-2 py-1 border rounded text-sm bg-background"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}

                {/* Group Indicators */}
                {condition.groupStart && (
                  <div className="text-blue-600 font-medium">(</div>
                )}

                {/* Field Selector */}
                {renderFieldSelector(condition)}

                {/* Operator Selector */}
                {renderOperatorSelector(condition)}

                {/* Value Input */}
                <div className="flex-1">
                  {renderConditionInput(condition)}
                </div>

                {/* NOT Toggle */}
                <Button
                  variant={condition.not ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleUpdateCondition(condition.id, { not: !condition.not })}
                  title="NOT operator"
                >
                  NOT
                </Button>

                {/* Group End */}
                {condition.groupEnd && (
                  <div className="text-blue-600 font-medium">)</div>
                )}

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddCondition(index + 1)}
                    title="Insert condition below"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCondition(condition.id)}
                    title="Delete condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Global Logic */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                <span>Global Logic:</span>
                <select
                  value={filter.logic}
                  onChange={(e) => onFilterChange({ ...filter, logic: e.target.value as 'AND' | 'OR' })}
                  className="bg-transparent border-none text-sm font-medium"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Quick Filters */}
        {availableFields.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">Quick Filters</h4>
            <div className="flex flex-wrap gap-2">
              {availableFields.slice(0, 5).map(field => {
                const Icon = DATA_TYPE_ICONS[field.type] || Type;
                return (
                  <Button
                    key={field.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newCondition: MongoCondition = {
                        id: `quick-${Date.now()}-${field.name}`,
                        field: field.name,
                        operator: field.type === 'string' ? '$regex' : '$eq',
                        value: field.type === 'boolean' ? true : field.type === 'number' ? 0 : '',
                        dataType: field.type
                      };
                      onFilterChange({
                        ...filter,
                        conditions: [...filter.conditions, newCondition]
                      });
                    }}
                    className="text-xs"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {field.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}