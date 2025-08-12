'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import VisualFilterBuilder from './visual-filter-builder';
import {
  Plus,
  Trash2,
  Edit,
  Database,
  FileText,
  Upload,
  Download,
  Play,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Zap,
  Settings,
  Copy,
  RefreshCw
} from 'lucide-react';
import type { MongoQuery, MongoFilter, MongoUpdate, MongoUpdateOperation, MongoIndex } from '@/types';

interface CRUDOperationsProps {
  query: MongoQuery;
  onQueryChange: (query: MongoQuery) => void;
  availableFields?: { name: string; type: string; sample?: any }[];
  onExecute?: (query: MongoQuery) => Promise<any>;
  className?: string;
}

const UPDATE_OPERATORS = [
  { value: '$set', label: 'Set', description: 'Set field value' },
  { value: '$unset', label: 'Unset', description: 'Remove field' },
  { value: '$inc', label: 'Increment', description: 'Increment numeric value' },
  { value: '$mul', label: 'Multiply', description: 'Multiply numeric value' },
  { value: '$min', label: 'Minimum', description: 'Set to minimum value' },
  { value: '$max', label: 'Maximum', description: 'Set to maximum value' },
  { value: '$currentDate', label: 'Current Date', description: 'Set to current date' },
  { value: '$rename', label: 'Rename', description: 'Rename field' },
  { value: '$push', label: 'Push', description: 'Add to array' },
  { value: '$pull', label: 'Pull', description: 'Remove from array' },
  { value: '$addToSet', label: 'Add to Set', description: 'Add unique to array' },
  { value: '$pop', label: 'Pop', description: 'Remove first/last array element' }
];

const INDEX_TYPES = [
  { value: 1, label: 'Ascending', description: 'Sort ascending' },
  { value: -1, label: 'Descending', description: 'Sort descending' },
  { value: 'text', label: 'Text', description: 'Full-text search' },
  { value: '2dsphere', label: '2D Sphere', description: 'Geospatial spherical' },
  { value: '2d', label: '2D', description: 'Geospatial planar' },
  { value: 'hashed', label: 'Hashed', description: 'Hashed index' }
];

export default function CRUDOperations({
  query,
  onQueryChange,
  availableFields = [],
  onExecute,
  className
}: CRUDOperationsProps) {
  const [bulkMode, setBulkMode] = useState(false);
  const [validationResults, setValidationResults] = useState<any>({});
  const [previewData, setPreviewData] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleDocumentChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (bulkMode && !Array.isArray(parsed)) {
        throw new Error('Bulk mode requires an array of documents');
      }
      if (bulkMode) {
        onQueryChange({ ...query, documents: parsed });
      } else {
        onQueryChange({ ...query, document: parsed });
      }
      setValidationResults({ valid: true });
    } catch (error) {
      setValidationResults({ 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON' 
      });
    }
  };

  const handleUpdateOperationAdd = () => {
    const operations = query.update?.operations || [];
    const newOperation: MongoUpdateOperation = {
      operator: '$set',
      field: 'field',
      value: ''
    };
    
    const update: MongoUpdate = {
      type: 'update',
      operations: [...operations, newOperation]
    };
    
    onQueryChange({ ...query, update });
  };

  const handleUpdateOperationChange = (index: number, changes: Partial<MongoUpdateOperation>) => {
    const operations = [...(query.update?.operations || [])];
    operations[index] = { ...operations[index], ...changes };
    
    const update: MongoUpdate = {
      type: query.update?.type || 'update',
      operations
    };
    
    onQueryChange({ ...query, update });
  };

  const handleUpdateOperationDelete = (index: number) => {
    const operations = [...(query.update?.operations || [])];
    operations.splice(index, 1);
    
    const update: MongoUpdate = {
      type: query.update?.type || 'update',
      operations
    };
    
    onQueryChange({ ...query, update });
  };

  const handleIndexAdd = () => {
    const indexes = query.indexes || [];
    const newIndex: MongoIndex = {
      name: `idx_${Date.now()}`,
      keys: { field: 1 },
      options: {}
    };
    
    onQueryChange({ ...query, indexes: [...indexes, newIndex] });
  };

  const handleIndexChange = (index: number, changes: Partial<MongoIndex>) => {
    const indexes = [...(query.indexes || [])];
    indexes[index] = { ...indexes[index], ...changes };
    onQueryChange({ ...query, indexes });
  };

  const handleExecute = async () => {
    if (!onExecute) return;
    
    setExecuting(true);
    try {
      const result = await onExecute(query);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({ error: error instanceof Error ? error.message : 'Execution failed' });
    } finally {
      setExecuting(false);
    }
  };

  const generateSampleDocument = () => {
    const sample: any = {};
    availableFields.forEach(field => {
      switch (field.type) {
        case 'string':
          sample[field.name] = field.sample || 'sample text';
          break;
        case 'number':
          sample[field.name] = field.sample || 42;
          break;
        case 'boolean':
          sample[field.name] = field.sample !== undefined ? field.sample : true;
          break;
        case 'date':
          sample[field.name] = new Date().toISOString();
          break;
        case 'objectId':
          sample[field.name] = '507f1f77bcf86cd799439011';
          break;
        case 'array':
          sample[field.name] = field.sample || ['item1', 'item2'];
          break;
        case 'object':
          sample[field.name] = field.sample || { nested: 'value' };
          break;
        default:
          sample[field.name] = field.sample || null;
      }
    });
    
    const documentString = JSON.stringify(sample, null, 2);
    if (bulkMode) {
      onQueryChange({ ...query, documents: [sample] });
    } else {
      onQueryChange({ ...query, document: sample });
    }
  };

  const renderInsertOperation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Insert Documents</h3>
        <div className="flex gap-2">
          <Button
            variant={bulkMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setBulkMode(!bulkMode)}
          >
            Bulk Mode
          </Button>
          <Button variant="outline" size="sm" onClick={generateSampleDocument}>
            <Zap className="h-4 w-4 mr-1" />
            Generate Sample
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          {bulkMode ? 'Documents Array (JSON)' : 'Document (JSON)'}
        </label>
        <Textarea
          value={bulkMode 
            ? JSON.stringify(query.documents || [], null, 2)
            : JSON.stringify(query.document || {}, null, 2)
          }
          onChange={(e) => handleDocumentChange(e.target.value)}
          className="font-mono text-sm min-h-[300px]"
          placeholder={bulkMode 
            ? '[{"field": "value"}, {"field": "value2"}]'
            : '{"field": "value"}'
          }
        />
        {!validationResults.valid && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{validationResults.error}</span>
          </div>
        )}
        {validationResults.valid && (bulkMode ? query.documents?.length : query.document) && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              {bulkMode 
                ? `Ready to insert ${query.documents?.length || 0} documents`
                : 'Document is valid'
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderUpdateOperation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Update Operations</h3>
        <Button variant="outline" size="sm" onClick={handleUpdateOperationAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Operation
        </Button>
      </div>

      {/* Filter */}
      <div>
        <h4 className="font-medium mb-2">Update Filter</h4>
        <VisualFilterBuilder
          filter={query.filter || { conditions: [], logic: 'AND' }}
          onFilterChange={(filter) => onQueryChange({ ...query, filter })}
          availableFields={availableFields}
        />
      </div>

      {/* Update Operations */}
      <div>
        <h4 className="font-medium mb-2">Update Operations</h4>
        {(!query.update?.operations || query.update.operations.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No update operations yet</p>
            <Button variant="outline" className="mt-2" onClick={handleUpdateOperationAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Operation
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {query.update.operations.map((operation, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <select
                  value={operation.operator}
                  onChange={(e) => handleUpdateOperationChange(index, { 
                    operator: e.target.value as any 
                  })}
                  className="px-3 py-2 border rounded bg-background min-w-32"
                >
                  {UPDATE_OPERATORS.map(op => (
                    <option key={op.value} value={op.value} title={op.description}>
                      {op.label}
                    </option>
                  ))}
                </select>
                
                <Input
                  placeholder="field"
                  value={operation.field}
                  onChange={(e) => handleUpdateOperationChange(index, { 
                    field: e.target.value 
                  })}
                  className="flex-1"
                />
                
                <Input
                  placeholder="value"
                  value={typeof operation.value === 'string' ? operation.value : JSON.stringify(operation.value)}
                  onChange={(e) => {
                    let value: any = e.target.value;
                    try {
                      value = JSON.parse(e.target.value);
                    } catch {
                      // Keep as string if not valid JSON
                    }
                    handleUpdateOperationChange(index, { value });
                  }}
                  className="flex-1"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateOperationDelete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDeleteOperation = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Delete Documents</h3>
      
      <div>
        <h4 className="font-medium mb-2">Delete Filter</h4>
        <VisualFilterBuilder
          filter={query.filter || { conditions: [], logic: 'AND' }}
          onFilterChange={(filter) => onQueryChange({ ...query, filter })}
          availableFields={availableFields}
        />
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Warning</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          {query.operation === 'deleteMany' 
            ? 'This will delete ALL documents matching the filter. Use with caution.'
            : 'This will delete the FIRST document matching the filter.'
          }
        </p>
      </div>
    </div>
  );

  const renderIndexOperation = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Index Operations</h3>
        <Button variant="outline" size="sm" onClick={handleIndexAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Index
        </Button>
      </div>

      {(!query.indexes || query.indexes.length === 0) ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No indexes defined yet</p>
          <Button variant="outline" className="mt-2" onClick={handleIndexAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Index
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {query.indexes.map((index, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input
                    value={index.name}
                    onChange={(e) => handleIndexChange(idx, { name: e.target.value })}
                    className="font-medium"
                    placeholder="Index name"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const indexes = [...(query.indexes || [])];
                      indexes.splice(idx, 1);
                      onQueryChange({ ...query, indexes });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Index Keys</label>
                  <Textarea
                    value={JSON.stringify(index.keys, null, 2)}
                    onChange={(e) => {
                      try {
                        const keys = JSON.parse(e.target.value);
                        handleIndexChange(idx, { keys });
                      } catch (error) {
                        // Handle parsing error
                      }
                    }}
                    className="font-mono text-sm"
                    rows={3}
                    placeholder='{"field": 1, "anotherField": -1}'
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Options</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={index.options?.unique || false}
                        onChange={(e) => handleIndexChange(idx, {
                          options: { ...index.options, unique: e.target.checked }
                        })}
                      />
                      <span className="text-sm">Unique</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={index.options?.sparse || false}
                        onChange={(e) => handleIndexChange(idx, {
                          options: { ...index.options, sparse: e.target.checked }
                        })}
                      />
                      <span className="text-sm">Sparse</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={index.options?.background || false}
                        onChange={(e) => handleIndexChange(idx, {
                          options: { ...index.options, background: e.target.checked }
                        })}
                      />
                      <span className="text-sm">Background</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CRUD Operations
          </CardTitle>
          {onExecute && (
            <Button 
              onClick={handleExecute} 
              disabled={executing}
              className="gap-2"
            >
              {executing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Execute
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={query.operation} onValueChange={(value) => onQueryChange({ 
          ...query, 
          operation: value as any 
        })}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insertOne">Insert One</TabsTrigger>
            <TabsTrigger value="insertMany">Insert Many</TabsTrigger>
            <TabsTrigger value="updateOne">Update One</TabsTrigger>
            <TabsTrigger value="updateMany">Update Many</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-4 mt-2">
            <TabsTrigger value="deleteOne">Delete One</TabsTrigger>
            <TabsTrigger value="deleteMany">Delete Many</TabsTrigger>
            <TabsTrigger value="createIndex">Create Index</TabsTrigger>
            <TabsTrigger value="dropIndex">Drop Index</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {(['insertOne', 'insertMany'].includes(query.operation)) && (
              <TabsContent value={query.operation}>
                {renderInsertOperation()}
              </TabsContent>
            )}
            
            {(['updateOne', 'updateMany'].includes(query.operation)) && (
              <TabsContent value={query.operation}>
                {renderUpdateOperation()}
              </TabsContent>
            )}
            
            {(['deleteOne', 'deleteMany'].includes(query.operation)) && (
              <TabsContent value={query.operation}>
                {renderDeleteOperation()}
              </TabsContent>
            )}
            
            {(['createIndex', 'dropIndex'].includes(query.operation)) && (
              <TabsContent value={query.operation}>
                {renderIndexOperation()}
              </TabsContent>
            )}
          </div>
        </Tabs>

        {/* Execution Results */}
        {executionResult && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">Execution Result</h4>
            <div className={cn(
              "p-4 rounded-lg border",
              executionResult.error 
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            )}>
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}