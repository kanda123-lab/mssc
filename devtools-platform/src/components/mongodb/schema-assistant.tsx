'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { inferSchemaFromDocument } from '@/lib/mongodb-utils';
import {
  FileText,
  Search,
  Lightbulb,
  TrendingUp,
  Database,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  BarChart3,
  Layers,
  TreePine,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
  Quote,
  Brackets
} from 'lucide-react';
import type { MongoSchema, MongoField, MongoIndex, MongoDataType } from '@/types';

interface SchemaAssistantProps {
  collection: string;
  sampleDocument?: Record<string, any>;
  onSchemaInferred?: (schema: MongoSchema) => void;
  onIndexRecommendation?: (indexes: MongoIndex[]) => void;
  className?: string;
}

const DATA_TYPE_ICONS: Record<MongoDataType, any> = {
  string: Quote,
  number: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  objectId: Type,
  array: Brackets,
  object: Brackets,
  null: Type,
  regex: Type,
  binary: Type,
  decimal128: Hash
};

const DATA_TYPE_COLORS: Record<MongoDataType, string> = {
  string: 'text-blue-600 bg-blue-50',
  number: 'text-green-600 bg-green-50',
  boolean: 'text-purple-600 bg-purple-50',
  date: 'text-orange-600 bg-orange-50',
  objectId: 'text-red-600 bg-red-50',
  array: 'text-indigo-600 bg-indigo-50',
  object: 'text-cyan-600 bg-cyan-50',
  null: 'text-gray-600 bg-gray-50',
  regex: 'text-pink-600 bg-pink-50',
  binary: 'text-yellow-600 bg-yellow-50',
  decimal128: 'text-teal-600 bg-teal-50'
};

interface PerformanceRecommendation {
  type: 'index' | 'query' | 'schema' | 'general';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  impact: string;
  field?: string;
}

export default function SchemaAssistant({
  collection,
  sampleDocument,
  onSchemaInferred,
  onIndexRecommendation,
  className
}: SchemaAssistantProps) {
  const [schema, setSchema] = useState<MongoSchema | null>(null);
  const [documentInput, setDocumentInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});
  const [indexRecommendations, setIndexRecommendations] = useState<MongoIndex[]>([]);
  const [schemaValidation, setSchemaValidation] = useState<any>(null);

  useEffect(() => {
    if (sampleDocument) {
      setDocumentInput(JSON.stringify(sampleDocument, null, 2));
      analyzeDocument();
    }
  }, [sampleDocument]);

  const analyzeDocument = async () => {
    if (!documentInput.trim()) return;
    
    setAnalyzing(true);
    try {
      const document = JSON.parse(documentInput);
      const inferredSchema = inferSchemaFromDocument(document, collection);
      setSchema(inferredSchema);
      
      // Generate recommendations
      const recs = generateRecommendations(inferredSchema);
      setRecommendations(recs);
      
      // Generate index recommendations
      const indexes = generateIndexRecommendations(inferredSchema);
      setIndexRecommendations(indexes);
      
      // Generate schema validation
      const validation = generateSchemaValidation(inferredSchema);
      setSchemaValidation(validation);
      
      onSchemaInferred?.(inferredSchema);
      onIndexRecommendation?.(indexes);
    } catch (error) {
      console.error('Failed to analyze document:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRecommendations = (schema: MongoSchema): PerformanceRecommendation[] => {
    const recommendations: PerformanceRecommendation[] = [];
    
    schema.fields.forEach(field => {
      // Check for potential index candidates
      if (field.name === 'email' || field.name === 'username' || field.name.includes('id')) {
        recommendations.push({
          type: 'index',
          severity: 'high',
          title: `Index ${field.name} field`,
          description: `The field '${field.name}' appears to be a unique identifier or lookup field`,
          suggestion: `Create a unique index on '${field.name}' for better query performance`,
          impact: 'Significantly improves query performance for lookups',
          field: field.name
        });
      }
      
      // Check for large text fields
      if (field.type === 'string' && field.sample && typeof field.sample === 'string' && field.sample.length > 200) {
        recommendations.push({
          type: 'index',
          severity: 'medium',
          title: `Text index for ${field.name}`,
          description: `Large text field detected in '${field.name}'`,
          suggestion: `Consider creating a text index for full-text search capabilities`,
          impact: 'Enables full-text search and improves search performance',
          field: field.name
        });
      }
      
      // Check for date fields
      if (field.type === 'date') {
        recommendations.push({
          type: 'index',
          severity: 'medium',
          title: `Index date field ${field.name}`,
          description: `Date field '${field.name}' is commonly used for range queries`,
          suggestion: `Create an index on '${field.name}' for time-based queries`,
          impact: 'Improves performance of date range and sorting queries',
          field: field.name
        });
      }
      
      // Check for array fields
      if (field.type === 'array') {
        recommendations.push({
          type: 'query',
          severity: 'low',
          title: `Array field optimization for ${field.name}`,
          description: `Array field '${field.name}' may benefit from specific query patterns`,
          suggestion: `Use $elemMatch for complex array queries and consider multikey index`,
          impact: 'Improves array query performance and accuracy',
          field: field.name
        });
      }
      
      // Check for deeply nested objects
      if (field.type === 'object' && field.nestedFields && field.nestedFields.length > 5) {
        recommendations.push({
          type: 'schema',
          severity: 'medium',
          title: `Complex nested object in ${field.name}`,
          description: `Deeply nested object with ${field.nestedFields.length} fields`,
          suggestion: `Consider flattening the structure or creating separate collections`,
          impact: 'Reduces document complexity and improves update performance'
        });
      }
    });
    
    // General recommendations
    if (schema.fields.length > 20) {
      recommendations.push({
        type: 'schema',
        severity: 'medium',
        title: 'Large document schema',
        description: `Document has ${schema.fields.length} fields`,
        suggestion: 'Consider splitting into multiple collections or using embedded documents',
        impact: 'Reduces memory usage and improves network performance'
      });
    }
    
    return recommendations;
  };

  const generateIndexRecommendations = (schema: MongoSchema): MongoIndex[] => {
    const indexes: MongoIndex[] = [];
    
    schema.fields.forEach(field => {
      if (field.name === '_id') return; // Skip _id as it's automatically indexed
      
      // Single field indexes for common patterns
      if (field.name.includes('id') || field.name === 'email' || field.name === 'username') {
        indexes.push({
          name: `idx_${field.name}`,
          keys: { [field.name]: 1 },
          options: { unique: field.name === 'email' || field.name === 'username' }
        });
      }
      
      // Text indexes for string fields
      if (field.type === 'string' && field.sample && typeof field.sample === 'string' && field.sample.length > 50) {
        indexes.push({
          name: `text_${field.name}`,
          keys: { [field.name]: 'text' },
          options: {}
        });
      }
      
      // Date indexes
      if (field.type === 'date') {
        indexes.push({
          name: `idx_${field.name}`,
          keys: { [field.name]: 1 },
          options: {}
        });
      }
    });
    
    // Compound indexes based on common patterns
    const statusField = schema.fields.find(f => f.name === 'status');
    const createdField = schema.fields.find(f => f.name.includes('created') || f.name.includes('date'));
    
    if (statusField && createdField) {
      indexes.push({
        name: `compound_status_date`,
        keys: { [statusField.name]: 1, [createdField.name]: -1 },
        options: {}
      });
    }
    
    return indexes;
  };

  const generateSchemaValidation = (schema: MongoSchema): any => {
    const validation: any = {
      $jsonSchema: {
        bsonType: 'object',
        required: schema.fields.filter(f => f.required).map(f => f.name),
        properties: {}
      }
    };
    
    schema.fields.forEach(field => {
      const prop: any = {};
      
      switch (field.type) {
        case 'string':
          prop.bsonType = 'string';
          if (field.name === 'email') {
            prop.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
          }
          break;
        case 'number':
          prop.bsonType = 'number';
          if (field.sample && typeof field.sample === 'number') {
            if (field.sample >= 0) prop.minimum = 0;
          }
          break;
        case 'boolean':
          prop.bsonType = 'bool';
          break;
        case 'date':
          prop.bsonType = 'date';
          break;
        case 'objectId':
          prop.bsonType = 'objectId';
          break;
        case 'array':
          prop.bsonType = 'array';
          break;
        case 'object':
          prop.bsonType = 'object';
          break;
      }
      
      validation.$jsonSchema.properties[field.name] = prop;
    });
    
    return validation;
  };

  const toggleFieldExpansion = (fieldPath: string) => {
    setExpandedFields({
      ...expandedFields,
      [fieldPath]: !expandedFields[fieldPath]
    });
  };

  const renderField = (field: MongoField, depth: number = 0) => {
    const Icon = DATA_TYPE_ICONS[field.type] || Type;
    const colors = DATA_TYPE_COLORS[field.type] || 'text-gray-600 bg-gray-50';
    const hasChildren = field.nestedFields && field.nestedFields.length > 0;
    const isExpanded = expandedFields[field.path];
    
    return (
      <div key={field.path} className="space-y-2">
        <div 
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border",
            depth > 0 && "ml-4 border-l-2 border-l-blue-200"
          )}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFieldExpansion(field.path)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
          )}
          
          <Icon className="h-4 w-4" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{field.name}</span>
              <Badge variant="secondary" className={cn("text-xs", colors)}>
                {field.type}
              </Badge>
              {field.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
              {field.unique && (
                <Badge variant="outline" className="text-xs">Unique</Badge>
              )}
              {field.indexed && (
                <Badge variant="default" className="text-xs">Indexed</Badge>
              )}
            </div>
            
            {field.sample !== undefined && (
              <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                Sample: {typeof field.sample === 'object' 
                  ? JSON.stringify(field.sample).slice(0, 100) + '...'
                  : String(field.sample).slice(0, 100)
                }
              </div>
            )}
          </div>
          
          {field.frequency && (
            <div className="text-xs text-muted-foreground">
              {Math.round(field.frequency * 100)}%
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {field.nestedFields!.map(nestedField => 
              renderField(nestedField, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRecommendation = (rec: PerformanceRecommendation, index: number) => {
    const icons = {
      index: Database,
      query: Search,
      schema: Layers,
      general: Lightbulb
    };
    
    const colors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-blue-200 bg-blue-50'
    };
    
    const Icon = icons[rec.type];
    
    return (
      <div key={index} className={cn("p-4 rounded-lg border", colors[rec.severity])}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{rec.title}</h4>
              <Badge 
                variant={rec.severity === 'high' ? 'destructive' : rec.severity === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {rec.severity}
              </Badge>
              <Badge variant="outline" className="text-xs">{rec.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
            <div className="space-y-1">
              <p className="text-sm font-medium">Suggestion:</p>
              <p className="text-sm">{rec.suggestion}</p>
              <p className="text-sm font-medium">Impact:</p>
              <p className="text-sm text-green-700">{rec.impact}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Document Analysis Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sample Document (JSON)
            </label>
            <Textarea
              value={documentInput}
              onChange={(e) => setDocumentInput(e.target.value)}
              placeholder="Paste a sample document to analyze schema..."
              className="font-mono text-sm min-h-[200px]"
            />
          </div>
          <Button onClick={analyzeDocument} disabled={analyzing || !documentInput.trim()}>
            {analyzing ? (
              <Zap className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Analyze Schema
          </Button>
        </CardContent>
      </Card>

      {/* Schema Overview */}
      {schema && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Schema Overview
              </div>
              <Badge variant="secondary">{schema.fields.length} fields</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Layers className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{schema.fields.length}</div>
                <div className="text-sm text-muted-foreground">Fields</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <TreePine className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  {schema.fields.filter(f => f.nestedFields?.length).length}
                </div>
                <div className="text-sm text-muted-foreground">Nested Objects</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">
                  {schema.stats?.avgDocumentSize ? `${Math.round(schema.stats.avgDocumentSize / 1024)}KB` : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Avg Size</div>
              </div>
            </div>
            
            <div className="space-y-2">
              {schema.fields.map(field => renderField(field))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Recommendations
              <Badge variant="secondary">{recommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => renderRecommendation(rec, index))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Index Recommendations */}
      {indexRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recommended Indexes
              <Badge variant="secondary">{indexRecommendations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {indexRecommendations.map((index, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium font-mono">{index.name}</span>
                    <div className="flex gap-2">
                      {index.options?.unique && (
                        <Badge variant="outline" className="text-xs">Unique</Badge>
                      )}
                      {Object.values(index.keys).includes('text' as any) && (
                        <Badge variant="outline" className="text-xs">Text</Badge>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {JSON.stringify(index.keys)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schema Validation */}
      {schemaValidation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Schema Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(schemaValidation, null, 2)}
              readOnly
              className="font-mono text-sm min-h-[200px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}