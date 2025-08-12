'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard, cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import VisualFilterBuilder from './visual-filter-builder';
import PipelineStageBuilder from './pipeline-stage-builder';
import CRUDOperations from './crud-operations';
import SchemaAssistant from './schema-assistant';
import CodeGenerator from './code-generator';
import DataVisualizer from './data-visualizer';
import {
  generateMongoQuery,
  generateMongoCode,
  validateMongoQuery,
  getMongoTemplates,
  MONGO_STAGE_TEMPLATES,
  inferSchemaFromDocument
} from '@/lib/mongodb-utils';
import type {
  MongoQuery,
  MongoOperation,
  MongoPipelineStage,
  MongoStageType,
  MongoFilter,
  MongoCondition,
  MongoOperator,
  MongoDataType,
  MongoTemplate,
  MongoSchema,
  MongoValidationResult
} from '@/types';
import {
  Database,
  Play,
  Save,
  Copy,
  Download,
  Plus,
  Trash2,
  Move,
  Eye,
  EyeOff,
  Code,
  FileText,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Search,
  Filter,
  BarChart3,
  Globe,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  ArrowRight,
  ArrowDown,
  GripVertical,
  RefreshCw
} from 'lucide-react';

const MONGO_OPERATIONS: { value: MongoOperation; label: string; category: string }[] = [
  { value: 'find', label: 'Find', category: 'Query' },
  { value: 'aggregate', label: 'Aggregate', category: 'Query' },
  { value: 'distinct', label: 'Distinct', category: 'Query' },
  { value: 'count', label: 'Count', category: 'Query' },
  { value: 'countDocuments', label: 'Count Documents', category: 'Query' },
  { value: 'insertOne', label: 'Insert One', category: 'Write' },
  { value: 'insertMany', label: 'Insert Many', category: 'Write' },
  { value: 'updateOne', label: 'Update One', category: 'Write' },
  { value: 'updateMany', label: 'Update Many', category: 'Write' },
  { value: 'replaceOne', label: 'Replace One', category: 'Write' },
  { value: 'deleteOne', label: 'Delete One', category: 'Write' },
  { value: 'deleteMany', label: 'Delete Many', category: 'Write' },
  { value: 'createIndex', label: 'Create Index', category: 'Index' },
  { value: 'dropIndex', label: 'Drop Index', category: 'Index' },
];

const MONGO_STAGES: { value: MongoStageType; label: string; category: string; description: string }[] = [
  { value: '$match', label: 'Match', category: 'Filter', description: 'Filter documents' },
  { value: '$group', label: 'Group', category: 'Transform', description: 'Group documents by criteria' },
  { value: '$sort', label: 'Sort', category: 'Order', description: 'Sort documents' },
  { value: '$project', label: 'Project', category: 'Transform', description: 'Reshape documents' },
  { value: '$limit', label: 'Limit', category: 'Order', description: 'Limit number of documents' },
  { value: '$skip', label: 'Skip', category: 'Order', description: 'Skip documents' },
  { value: '$unwind', label: 'Unwind', category: 'Transform', description: 'Deconstruct array fields' },
  { value: '$lookup', label: 'Lookup', category: 'Join', description: 'Join with another collection' },
  { value: '$addFields', label: 'Add Fields', category: 'Transform', description: 'Add new fields' },
  { value: '$replaceRoot', label: 'Replace Root', category: 'Transform', description: 'Replace document root' },
  { value: '$facet', label: 'Facet', category: 'Advanced', description: 'Process multiple pipelines' },
  { value: '$bucket', label: 'Bucket', category: 'Advanced', description: 'Categorize documents into buckets' },
  { value: '$sample', label: 'Sample', category: 'Order', description: 'Randomly select documents' },
  { value: '$geoNear', label: 'Geo Near', category: 'Geospatial', description: 'Geospatial proximity' },
];

const MONGO_OPERATORS: { value: MongoOperator; label: string; category: string }[] = [
  { value: '$eq', label: 'Equals', category: 'Comparison' },
  { value: '$ne', label: 'Not Equal', category: 'Comparison' },
  { value: '$gt', label: 'Greater Than', category: 'Comparison' },
  { value: '$gte', label: 'Greater Than Equal', category: 'Comparison' },
  { value: '$lt', label: 'Less Than', category: 'Comparison' },
  { value: '$lte', label: 'Less Than Equal', category: 'Comparison' },
  { value: '$in', label: 'In Array', category: 'Comparison' },
  { value: '$nin', label: 'Not In Array', category: 'Comparison' },
  { value: '$exists', label: 'Exists', category: 'Element' },
  { value: '$type', label: 'Type', category: 'Element' },
  { value: '$regex', label: 'Regex', category: 'Evaluation' },
  { value: '$text', label: 'Text Search', category: 'Evaluation' },
  { value: '$all', label: 'All Elements', category: 'Array' },
  { value: '$elemMatch', label: 'Element Match', category: 'Array' },
  { value: '$size', label: 'Array Size', category: 'Array' },
];

const DATA_TYPES: { value: MongoDataType; label: string; icon: string }[] = [
  { value: 'string', label: 'String', icon: 'Abc' },
  { value: 'number', label: 'Number', icon: '123' },
  { value: 'boolean', label: 'Boolean', icon: 'T/F' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'objectId', label: 'ObjectId', icon: '🔑' },
  { value: 'array', label: 'Array', icon: '[]' },
  { value: 'object', label: 'Object', icon: '{}' },
  { value: 'null', label: 'Null', icon: '∅' },
];

const CODE_LANGUAGES = [
  { id: 'shell', name: 'MongoDB Shell', icon: '🐚' },
  { id: 'nodejs', name: 'Node.js', icon: '🟢' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'csharp', name: 'C#', icon: '#' },
  { id: 'php', name: 'PHP', icon: '🐘' },
];

export default function MongoDBQueryBuilder() {
  const [queryName, setQueryName] = useState('');
  const [collection, setCollection] = useState('collection');
  const [operation, setOperation] = useState<MongoOperation>('find');
  const [pipeline, setPipeline] = useState<MongoPipelineStage[]>([]);
  const [filter, setFilter] = useState<MongoFilter>({ conditions: [], logic: 'AND' });
  const [document, setDocument] = useState('{}');
  const [savedQueries, setSavedQueries] = useState<MongoQuery[]>([]);
  const [templates, setTemplates] = useState<MongoTemplate[]>([]);
  const [schemas, setSchemas] = useState<MongoSchema[]>([]);
  const [validation, setValidation] = useState<MongoValidationResult>({ valid: true, errors: [], warnings: [] });
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [generatedCode, setGeneratedCode] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedLanguage, setSelectedLanguage] = useState('shell');
  const [draggedStage, setDraggedStage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [stageResults, setStageResults] = useState<Record<string, any[]>>({});
  const [showStagePreview, setShowStagePreview] = useState<Record<string, boolean>>({});
  const [visualFilterBuilder, setVisualFilterBuilder] = useState(true);
  const [geoQuery, setGeoQuery] = useState<any>(null);
  const [textSearchQuery, setTextSearchQuery] = useState<any>(null);
  const [timeSeriesConfig, setTimeSeriesConfig] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState('shell');
  const [importData, setImportData] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedQueries(data.mongoQueries || []);
    setTemplates(getMongoTemplates());
  }, []);

  useEffect(() => {
    generateQuery();
    generateAllCode();
  }, [operation, collection, pipeline, filter, document]);

  const generateQuery = useCallback(() => {
    const query: MongoQuery = {
      id: generateId(),
      name: queryName,
      collection,
      operation,
      pipeline: pipeline.filter(stage => stage.enabled),
      filter: filter.conditions.length > 0 ? filter : undefined,
      document: document ? JSON.parse(document) : undefined,
      timestamp: Date.now()
    };

    const mongoQuery = generateMongoQuery(query);
    setGeneratedQuery(mongoQuery);

    const validationResult = validateMongoQuery(query);
    setValidation(validationResult);
  }, [queryName, collection, operation, pipeline, filter, document]);

  const generateAllCode = useCallback(() => {
    const query: MongoQuery = {
      id: generateId(),
      name: queryName,
      collection,
      operation,
      pipeline: pipeline.filter(stage => stage.enabled),
      filter: filter.conditions.length > 0 ? filter : undefined,
      document: document ? JSON.parse(document) : undefined,
      timestamp: Date.now()
    };

    const codes: Record<string, string> = {};
    CODE_LANGUAGES.forEach(lang => {
      codes[lang.id] = generateMongoCode(query, lang.id);
    });
    setGeneratedCode(codes);
  }, [queryName, collection, operation, pipeline, filter, document]);

  const handleSaveQuery = () => {
    if (!queryName.trim()) return;

    const query: MongoQuery = {
      id: generateId(),
      name: queryName.trim(),
      collection,
      operation,
      pipeline: pipeline.filter(stage => stage.enabled),
      filter: filter.conditions.length > 0 ? filter : undefined,
      document: document ? JSON.parse(document) : undefined,
      timestamp: Date.now(),
      generated: generatedCode
    };

    StorageManager.updateArrayField('mongoQueries', (queries) => [...queries, query]);
    setSavedQueries([...savedQueries, query]);
    setQueryName('');
  };

  const handleLoadQuery = (query: MongoQuery) => {
    setQueryName(query.name);
    setCollection(query.collection);
    setOperation(query.operation);
    setPipeline(query.pipeline || []);
    setFilter(query.filter || { conditions: [], logic: 'AND' });
    setDocument(JSON.stringify(query.document || {}, null, 2));
  };

  const handleDeleteQuery = (id: string) => {
    StorageManager.updateArrayField('mongoQueries', (queries) =>
      queries.filter(q => q.id !== id)
    );
    setSavedQueries(savedQueries.filter(q => q.id !== id));
  };

  const handleAddStage = (stageType: MongoStageType) => {
    const newStage: MongoPipelineStage = {
      id: generateId(),
      stage: stageType,
      config: { ...MONGO_STAGE_TEMPLATES[stageType] },
      enabled: true,
      order: pipeline.length
    };
    setPipeline([...pipeline, newStage]);
  };

  const handleUpdateStage = (id: string, updates: Partial<MongoPipelineStage>) => {
    setPipeline(pipeline.map(stage => 
      stage.id === id ? { ...stage, ...updates } : stage
    ));
  };

  const handleDeleteStage = (id: string) => {
    setPipeline(pipeline.filter(stage => stage.id !== id));
  };

  const handleReorderStages = (draggedId: string, targetId: string) => {
    const draggedIndex = pipeline.findIndex(s => s.id === draggedId);
    const targetIndex = pipeline.findIndex(s => s.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newPipeline = [...pipeline];
    const [draggedStage] = newPipeline.splice(draggedIndex, 1);
    newPipeline.splice(targetIndex, 0, draggedStage);
    
    // Update order
    newPipeline.forEach((stage, index) => {
      stage.order = index;
    });

    setPipeline(newPipeline);
  };

  const handleAddCondition = () => {
    const newCondition: MongoCondition = {
      id: generateId(),
      field: 'field',
      operator: '$eq',
      value: '',
      dataType: 'string'
    };
    setFilter({
      ...filter,
      conditions: [...filter.conditions, newCondition]
    });
  };

  const handleUpdateCondition = (id: string, updates: Partial<MongoCondition>) => {
    setFilter({
      ...filter,
      conditions: filter.conditions.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    });
  };

  const handleDeleteCondition = (id: string) => {
    setFilter({
      ...filter,
      conditions: filter.conditions.filter(condition => condition.id !== id)
    });
  };

  const handleLoadTemplate = (template: MongoTemplate) => {
    if (template.query.collection) setCollection(template.query.collection);
    if (template.query.operation) setOperation(template.query.operation);
    if (template.query.pipeline) setPipeline(template.query.pipeline);
    if (template.query.filter) setFilter(template.query.filter);
    if (template.query.document) setDocument(JSON.stringify(template.query.document, null, 2));
    setQueryName(template.name);
  };

  const handleInferSchema = () => {
    try {
      const doc = JSON.parse(document);
      const schema = inferSchemaFromDocument(doc, collection);
      setSchemas([...schemas, schema]);
    } catch (error) {
      console.error('Error parsing document for schema inference:', error);
    }
  };

  const renderStageConfig = (stage: MongoPipelineStage) => {
    const { stage: stageType, config } = stage;

    switch (stageType) {
      case '$match':
        return (
          <div className="space-y-4">
            <h4 className="font-medium">Filter Conditions</h4>
            {/* Filter builder would go here - simplified for space */}
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  const newConfig = JSON.parse(e.target.value);
                  handleUpdateStage(stage.id, { config: newConfig });
                } catch (error) {
                  // Handle JSON parsing error
                }
              }}
              className="font-mono text-sm"
              rows={4}
            />
          </div>
        );

      case '$group':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group By (_id)</label>
              <Input
                value={typeof config._id === 'string' ? config._id : JSON.stringify(config._id)}
                onChange={(e) => {
                  const value = e.target.value;
                  const newConfig = {
                    ...config,
                    _id: value.startsWith('$') ? value : `$${value}`
                  };
                  handleUpdateStage(stage.id, { config: newConfig });
                }}
                placeholder="field or expression"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Accumulator Operations</label>
              <Textarea
                value={JSON.stringify({ ...config, _id: undefined }, null, 2)}
                onChange={(e) => {
                  try {
                    const accumulators = JSON.parse(e.target.value);
                    handleUpdateStage(stage.id, { 
                      config: { _id: config._id, ...accumulators }
                    });
                  } catch (error) {
                    // Handle error
                  }
                }}
                className="font-mono text-sm"
                rows={3}
              />
            </div>
          </div>
        );

      case '$sort':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Sort Fields</label>
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  const newConfig = JSON.parse(e.target.value);
                  handleUpdateStage(stage.id, { config: newConfig });
                } catch (error) {
                  // Handle error
                }
              }}
              className="font-mono text-sm"
              rows={3}
              placeholder='{ "field": 1, "anotherField": -1 }'
            />
          </div>
        );

      case '$lookup':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">From Collection</label>
                <Input
                  value={config.from || ''}
                  onChange={(e) => handleUpdateStage(stage.id, {
                    config: { ...config, from: e.target.value }
                  })}
                  placeholder="collection_name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">As Field</label>
                <Input
                  value={config.as || ''}
                  onChange={(e) => handleUpdateStage(stage.id, {
                    config: { ...config, as: e.target.value }
                  })}
                  placeholder="joined_data"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Local Field</label>
                <Input
                  value={config.localField || ''}
                  onChange={(e) => handleUpdateStage(stage.id, {
                    config: { ...config, localField: e.target.value }
                  })}
                  placeholder="local_field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foreign Field</label>
                <Input
                  value={config.foreignField || ''}
                  onChange={(e) => handleUpdateStage(stage.id, {
                    config: { ...config, foreignField: e.target.value }
                  })}
                  placeholder="foreign_field"
                />
              </div>
            </div>
          </div>
        );

      case '$limit':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Limit</label>
            <Input
              type="number"
              value={config || 10}
              onChange={(e) => handleUpdateStage(stage.id, {
                config: parseInt(e.target.value) || 10
              })}
              min={1}
            />
          </div>
        );

      case '$skip':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">Skip</label>
            <Input
              type="number"
              value={config || 0}
              onChange={(e) => handleUpdateStage(stage.id, {
                config: parseInt(e.target.value) || 0
              })}
              min={0}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Configuration</label>
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  const newConfig = JSON.parse(e.target.value);
                  handleUpdateStage(stage.id, { config: newConfig });
                } catch (error) {
                  // Handle error
                }
              }}
              className="font-mono text-sm"
              rows={4}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MongoDB Query Builder</h1>
        <p className="text-muted-foreground">
          Visual query builder with aggregation pipeline support, code generation, and schema assistance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Query Builder Panel */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="crud">CRUD</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              {/* CRUD Operations */}
              {['insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'createIndex', 'dropIndex'].includes(operation) && (
                <CRUDOperations
                  query={{
                    id: generateId(),
                    name: queryName,
                    collection,
                    operation,
                    filter,
                    document: document ? JSON.parse(document) : undefined,
                    timestamp: Date.now()
                  }}
                  onQueryChange={(updatedQuery) => {
                    setQueryName(updatedQuery.name);
                    setCollection(updatedQuery.collection);
                    setOperation(updatedQuery.operation);
                    if (updatedQuery.filter) setFilter(updatedQuery.filter);
                    if (updatedQuery.document) setDocument(JSON.stringify(updatedQuery.document, null, 2));
                  }}
                  availableFields={schemas.length > 0 ? schemas[0].fields.map(f => ({ name: f.name, type: f.type, sample: f.sample })) : []}
                />
              )}
              
              {/* Visual Filter Builder for Find Operations */}
              {operation === 'find' && (
                <VisualFilterBuilder
                  filter={filter}
                  onFilterChange={setFilter}
                  availableFields={schemas.length > 0 ? schemas[0].fields.map(f => ({ name: f.name, type: f.type, sample: f.sample })) : []}
                />
              )}
              
              {/* Aggregation Pipeline for aggregate operations */}
              {operation === 'aggregate' && (
                <PipelineStageBuilder
                  pipeline={pipeline}
                  onPipelineChange={setPipeline}
                  availableFields={schemas.length > 0 ? schemas[0].fields.map(f => ({ name: f.name, type: f.type, sample: f.sample })) : []}
                  previewResults={stageResults}
                  onStagePreview={(stageId) => {
                    console.log('Preview stage:', stageId);
                  }}
                />
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Query Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Query Name</label>
                      <Input
                        placeholder="My Query"
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Collection</label>
                      <Input
                        placeholder="collection_name"
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Operation</label>
                      <select
                        value={operation}
                        onChange={(e) => setOperation(e.target.value as MongoOperation)}
                        className="w-full px-3 py-2 rounded border bg-background"
                      >
                        {Object.entries(
                          MONGO_OPERATIONS.reduce((acc, op) => {
                            if (!acc[op.category]) acc[op.category] = [];
                            acc[op.category].push(op);
                            return acc;
                          }, {} as Record<string, typeof MONGO_OPERATIONS>)
                        ).map(([category, ops]) => (
                          <optgroup key={category} label={category}>
                            {ops.map(op => (
                              <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Operation-specific configuration */}
                  {(operation === 'find' || operation === 'updateOne' || operation === 'updateMany' || operation === 'deleteOne' || operation === 'deleteMany') && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Filter Conditions</h3>
                        <Button onClick={handleAddCondition} size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {filter.conditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-center gap-2 p-3 border rounded-lg">
                            {index > 0 && (
                              <select
                                value={condition.logic || 'AND'}
                                onChange={(e) => handleUpdateCondition(condition.id, {
                                  logic: e.target.value as 'AND' | 'OR'
                                })}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select>
                            )}
                            
                            <Input
                              placeholder="field"
                              value={condition.field}
                              onChange={(e) => handleUpdateCondition(condition.id, {
                                field: e.target.value
                              })}
                              className="flex-1"
                            />
                            
                            <select
                              value={condition.operator}
                              onChange={(e) => handleUpdateCondition(condition.id, {
                                operator: e.target.value as MongoOperator
                              })}
                              className="px-2 py-1 border rounded"
                            >
                              {MONGO_OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                              ))}
                            </select>
                            
                            <Input
                              placeholder="value"
                              value={condition.value}
                              onChange={(e) => handleUpdateCondition(condition.id, {
                                value: e.target.value
                              })}
                              className="flex-1"
                            />
                            
                            <select
                              value={condition.dataType}
                              onChange={(e) => handleUpdateCondition(condition.id, {
                                dataType: e.target.value as MongoDataType
                              })}
                              className="px-2 py-1 border rounded"
                            >
                              {DATA_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCondition(condition.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(operation === 'insertOne' || operation === 'insertMany' || operation === 'replaceOne') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Document{operation === 'insertMany' ? 's' : ''} (JSON)
                      </label>
                      <Textarea
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        className="font-mono text-sm"
                        rows={8}
                        placeholder={operation === 'insertMany' 
                          ? '[{"field": "value"}, {"field": "value2"}]' 
                          : '{"field": "value"}'
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleInferSchema}
                        className="mt-2"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Infer Schema
                      </Button>
                    </div>
                  )}

                  {/* Validation Results */}
                  {(!validation.valid || validation.warnings.length > 0 || (validation.performance && validation.performance.length > 0)) && (
                    <div className="space-y-2">
                      {validation.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{error.message}</span>
                        </div>
                      ))}
                      {validation.warnings.map((warning, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                          <Info className="h-4 w-4" />
                          <span className="text-sm">{warning.message}</span>
                        </div>
                      ))}
                      {validation.performance?.map((hint, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm">{hint.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated Query Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Generated Query</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedQuery)}
                        disabled={!generatedQuery}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={generatedQuery}
                      readOnly
                      className="font-mono text-sm bg-muted"
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveQuery}
                      disabled={!queryName.trim() || !validation.valid}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Query
                    </Button>
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Execute Query
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pipeline" className="space-y-4">
              <PipelineStageBuilder
                pipeline={pipeline}
                onPipelineChange={setPipeline}
                availableFields={schemas.length > 0 ? schemas[0].fields.map(f => ({ name: f.name, type: f.type, sample: f.sample })) : []}
                previewResults={stageResults}
                onStagePreview={(stageId) => {
                  // Preview functionality would be implemented here
                  console.log('Preview stage:', stageId);
                }}
              />
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Aggregation Pipeline
                    </CardTitle>
                    <div className="flex gap-2">
                      {MONGO_STAGES.slice(0, 6).map(stage => (
                        <Button
                          key={stage.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddStage(stage.value)}
                          title={stage.description}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {stage.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {pipeline.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pipeline stages yet. Add stages to build your aggregation pipeline.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pipeline.map((stage, index) => (
                        <div key={stage.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Badge variant="secondary">{index + 1}</Badge>
                              <span className="font-semibold">{stage.stage}</span>
                              <Badge variant={stage.enabled ? 'default' : 'secondary'}>
                                {stage.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStage(stage.id, { enabled: !stage.enabled })}
                              >
                                {stage.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStage(stage.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {renderStageConfig(stage)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <CodeGenerator
                query={{
                  id: generateId(),
                  name: queryName,
                  collection,
                  operation,
                  pipeline: pipeline.filter(stage => stage.enabled),
                  filter: filter.conditions.length > 0 ? filter : undefined,
                  document: document ? JSON.parse(document) : undefined,
                  timestamp: Date.now()
                }}
              />
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Generated Code
                    </CardTitle>
                    <div className="flex gap-1">
                      {CODE_LANGUAGES.map(lang => (
                        <Button
                          key={lang.id}
                          variant={selectedLanguage === lang.id ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedLanguage(lang.id)}
                        >
                          <span className="mr-1">{lang.icon}</span>
                          {lang.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {CODE_LANGUAGES.find(l => l.id === selectedLanguage)?.name} Code
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCode[selectedLanguage] || '')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                    </div>
                    <Textarea
                      value={generatedCode[selectedLanguage] || ''}
                      readOnly
                      className="font-mono text-sm bg-muted"
                      rows={20}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <DataVisualizer
                data={executionResult?.documents || []}
                isLoading={false}
                error={executionResult?.error}
                executionStats={executionResult?.executionStats ? {
                  executionTimeMs: executionResult.executionStats.executionTimeMs,
                  totalDocsExamined: executionResult.executionStats.totalDocsExamined,
                  totalDocsReturned: executionResult.executionStats.totalDocsReturned,
                  totalKeysExamined: executionResult.executionStats.totalKeysExamined,
                  indexName: executionResult.executionStats.indexName
                } : undefined}
                queryInfo={{
                  operation,
                  collection,
                  query: generatedQuery
                }}
                onExecute={async () => {
                  // Mock execution for demo
                  const mockData = Array.from({ length: 20 }, (_, i) => ({
                    _id: `507f1f77bcf86cd799439${String(i).padStart(3, '0')}`,
                    name: `Document ${i + 1}`,
                    value: Math.floor(Math.random() * 1000),
                    category: ['A', 'B', 'C'][i % 3],
                    createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
                    active: Math.random() > 0.3,
                    metadata: {
                      tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1),
                      score: Math.random() * 100
                    }
                  }));
                  
                  setExecutionResult({
                    success: true,
                    documents: mockData,
                    executionStats: {
                      executionTimeMs: Math.floor(Math.random() * 500) + 50,
                      totalDocsExamined: mockData.length * 2,
                      totalDocsReturned: mockData.length,
                      totalKeysExamined: mockData.length,
                      indexUsed: Math.random() > 0.5,
                      indexName: Math.random() > 0.5 ? 'idx_sample' : undefined
                    }
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <SchemaAssistant
                collection={collection}
                sampleDocument={document ? JSON.parse(document) : undefined}
                onSchemaInferred={(schema) => {
                  setSchemas([...schemas.filter(s => s.collection !== collection), schema]);
                }}
                onIndexRecommendation={(indexes) => {
                  console.log('Index recommendations:', indexes);
                }}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Schema Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schemas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No schema information available</p>
                      <p className="text-sm">Insert a sample document to infer schema</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schemas.map((schema, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-2">{schema.collection}</h3>
                          <div className="space-y-2">
                            {schema.fields.map(field => (
                              <div key={field.path} className="flex items-center justify-between py-1">
                                <span className="font-mono text-sm">{field.path}</span>
                                <Badge variant="secondary">{field.type}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Query Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map(template => (
                      <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {template.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadTemplate(template)}
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pipeline Stages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Stages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(
                MONGO_STAGES.reduce((acc, stage) => {
                  if (!acc[stage.category]) acc[stage.category] = [];
                  acc[stage.category].push(stage);
                  return acc;
                }, {} as Record<string, typeof MONGO_STAGES>)
              ).map(([category, stages]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">{category}</h4>
                  <div className="space-y-1">
                    {stages.map(stage => (
                      <Button
                        key={stage.value}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleAddStage(stage.value)}
                        title={stage.description}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        {stage.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Saved Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Queries</CardTitle>
            </CardHeader>
            <CardContent>
              {savedQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved queries</p>
              ) : (
                <div className="space-y-2">
                  {savedQueries.map(query => (
                    <div key={query.id} className="p-3 rounded border bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{query.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadQuery(query)}
                            className="h-6 w-6 p-0"
                          >
                            <Database className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteQuery(query.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{query.operation.toUpperCase()}</span>
                        <Badge variant="outline" className="text-xs">
                          {query.collection}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Query Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Query Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operation:</span>
                <Badge>{operation.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collection:</span>
                <span>{collection}</span>
              </div>
              {pipeline.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pipeline Stages:</span>
                  <span>{pipeline.filter(s => s.enabled).length}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validation:</span>
                {validation.valid ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Valid
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Invalid
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}