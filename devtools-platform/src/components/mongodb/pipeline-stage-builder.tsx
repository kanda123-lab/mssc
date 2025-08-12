'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Play,
  ChevronDown,
  ChevronRight,
  Copy,
  Settings,
  BarChart3,
  Filter,
  SortAsc,
  Shuffle,
  Zap,
  Database,
  MapPin,
  Search,
  Group,
  ArrowRight
} from 'lucide-react';
import type { MongoPipelineStage, MongoStageType } from '@/types';

interface PipelineStageBuilderProps {
  pipeline: MongoPipelineStage[];
  onPipelineChange: (pipeline: MongoPipelineStage[]) => void;
  availableFields?: { name: string; type: string; sample?: any }[];
  onStagePreview?: (stageId: string) => void;
  previewResults?: Record<string, any[]>;
  className?: string;
}

const STAGE_CATEGORIES = {
  filter: {
    label: 'Filter',
    icon: Filter,
    stages: [
      { type: '$match', label: 'Match', description: 'Filter documents based on conditions' },
      { type: '$sample', label: 'Sample', description: 'Randomly select documents' }
    ]
  },
  transform: {
    label: 'Transform',
    icon: Zap,
    stages: [
      { type: '$project', label: 'Project', description: 'Select and reshape fields' },
      { type: '$addFields', label: 'Add Fields', description: 'Add computed fields' },
      { type: '$replaceRoot', label: 'Replace Root', description: 'Replace document root' },
      { type: '$replaceWith', label: 'Replace With', description: 'Replace entire document' },
      { type: '$unwind', label: 'Unwind', description: 'Flatten array fields' }
    ]
  },
  group: {
    label: 'Group',
    icon: Group,
    stages: [
      { type: '$group', label: 'Group', description: 'Group and aggregate documents' },
      { type: '$bucket', label: 'Bucket', description: 'Group into buckets' },
      { type: '$bucketAuto', label: 'Auto Bucket', description: 'Auto-group into buckets' },
      { type: '$facet', label: 'Facet', description: 'Multi-faceted aggregation' },
      { type: '$sortByCount', label: 'Sort By Count', description: 'Group and sort by count' }
    ]
  },
  order: {
    label: 'Order',
    icon: SortAsc,
    stages: [
      { type: '$sort', label: 'Sort', description: 'Sort documents' },
      { type: '$limit', label: 'Limit', description: 'Limit number of documents' },
      { type: '$skip', label: 'Skip', description: 'Skip documents' }
    ]
  },
  join: {
    label: 'Join',
    icon: Database,
    stages: [
      { type: '$lookup', label: 'Lookup', description: 'Join with another collection' },
      { type: '$unionWith', label: 'Union With', description: 'Union with another collection' }
    ]
  },
  geospatial: {
    label: 'Geospatial',
    icon: MapPin,
    stages: [
      { type: '$geoNear', label: 'Geo Near', description: 'Find documents near a point' }
    ]
  },
  output: {
    label: 'Output',
    icon: ArrowRight,
    stages: [
      { type: '$out', label: 'Out', description: 'Write results to collection' },
      { type: '$merge', label: 'Merge', description: 'Merge results into collection' }
    ]
  },
  utility: {
    label: 'Utility',
    icon: Settings,
    stages: [
      { type: '$indexStats', label: 'Index Stats', description: 'Index usage statistics' },
      { type: '$collStats', label: 'Collection Stats', description: 'Collection statistics' }
    ]
  }
};

const STAGE_ICONS: Record<MongoStageType, any> = {
  '$match': Filter,
  '$group': Group,
  '$sort': SortAsc,
  '$project': Zap,
  '$limit': BarChart3,
  '$skip': BarChart3,
  '$unwind': Shuffle,
  '$lookup': Database,
  '$addFields': Plus,
  '$replaceRoot': Zap,
  '$replaceWith': Zap,
  '$facet': BarChart3,
  '$bucket': BarChart3,
  '$bucketAuto': BarChart3,
  '$sample': Shuffle,
  '$sortByCount': SortAsc,
  '$geoNear': MapPin,
  '$indexStats': BarChart3,
  '$collStats': BarChart3,
  '$out': ArrowRight,
  '$merge': ArrowRight,
  '$unionWith': Database
};

export default function PipelineStageBuilder({
  pipeline,
  onPipelineChange,
  availableFields = [],
  onStagePreview,
  previewResults = {},
  className
}: PipelineStageBuilderProps) {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stageTemplates, setStageTemplates] = useState<Record<string, any>>({});

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(pipeline);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order
    const reorderedPipeline = items.map((stage, index) => ({
      ...stage,
      order: index
    }));

    onPipelineChange(reorderedPipeline);
  };

  const handleAddStage = (stageType: MongoStageType, insertIndex?: number) => {
    const defaultConfigs: Record<MongoStageType, any> = {
      '$match': {},
      '$group': { _id: null },
      '$sort': { field: 1 },
      '$project': { field: 1 },
      '$limit': 10,
      '$skip': 0,
      '$unwind': { path: '$field', preserveNullAndEmptyArrays: false },
      '$lookup': {
        from: 'collection',
        localField: 'field',
        foreignField: 'field',
        as: 'result'
      },
      '$addFields': { newField: 'value' },
      '$replaceRoot': { newRoot: '$field' },
      '$replaceWith': '$field',
      '$facet': {},
      '$bucket': {
        groupBy: '$field',
        boundaries: [0, 10, 20],
        default: 'Other'
      },
      '$bucketAuto': {
        groupBy: '$field',
        buckets: 5
      },
      '$sample': { size: 10 },
      '$sortByCount': '$field',
      '$geoNear': {
        near: { type: 'Point', coordinates: [0, 0] },
        distanceField: 'distance'
      },
      '$indexStats': {},
      '$collStats': { latencyStats: { histograms: true } },
      '$out': 'collection',
      '$merge': { into: 'collection' },
      '$unionWith': { coll: 'collection' }
    };

    const newStage: MongoPipelineStage = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stage: stageType,
      config: defaultConfigs[stageType] || {},
      enabled: true,
      order: insertIndex !== undefined ? insertIndex : pipeline.length
    };

    const newPipeline = [...pipeline];
    if (insertIndex !== undefined) {
      newPipeline.splice(insertIndex, 0, newStage);
      // Reorder subsequent stages
      for (let i = insertIndex + 1; i < newPipeline.length; i++) {
        newPipeline[i].order = i;
      }
    } else {
      newPipeline.push(newStage);
    }

    onPipelineChange(newPipeline);
    setExpandedStages({ ...expandedStages, [newStage.id]: true });
  };

  const handleUpdateStage = (id: string, updates: Partial<MongoPipelineStage>) => {
    const updatedPipeline = pipeline.map(stage =>
      stage.id === id ? { ...stage, ...updates } : stage
    );
    onPipelineChange(updatedPipeline);
  };

  const handleDeleteStage = (id: string) => {
    const updatedPipeline = pipeline
      .filter(stage => stage.id !== id)
      .map((stage, index) => ({ ...stage, order: index }));
    onPipelineChange(updatedPipeline);
  };

  const handleToggleStage = (id: string) => {
    setExpandedStages({
      ...expandedStages,
      [id]: !expandedStages[id]
    });
  };

  const handleDuplicateStage = (stage: MongoPipelineStage) => {
    const duplicatedStage: MongoPipelineStage = {
      ...stage,
      id: `stage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: stage.order + 1
    };

    const newPipeline = [...pipeline];
    newPipeline.splice(stage.order + 1, 0, duplicatedStage);
    
    // Reorder subsequent stages
    for (let i = stage.order + 2; i < newPipeline.length; i++) {
      newPipeline[i].order = i;
    }

    onPipelineChange(newPipeline);
  };

  const renderStageConfig = (stage: MongoPipelineStage) => {
    const { stage: stageType, config } = stage;

    switch (stageType) {
      case '$match':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Filter Conditions</label>
            <Textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  const newConfig = JSON.parse(e.target.value);
                  handleUpdateStage(stage.id, { config: newConfig });
                } catch (error) {
                  // Handle parsing error
                }
              }}
              className="font-mono text-sm"
              rows={4}
              placeholder='{ "status": "active" }'
            />
          </div>
        );

      case '$group':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Group By (_id)</label>
              <Input
                value={typeof config._id === 'string' ? config._id : JSON.stringify(config._id)}
                onChange={(e) => {
                  const value = e.target.value;
                  const newConfig = {
                    ...config,
                    _id: value === 'null' ? null : value.startsWith('$') ? value : value ? `$${value}` : null
                  };
                  handleUpdateStage(stage.id, { config: newConfig });
                }}
                placeholder="field name or null"
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
                rows={4}
                placeholder='{ "count": { "$sum": 1 }, "avg": { "$avg": "$price" } }'
              />
            </div>
          </div>
        );

      case '$lookup':
        return (
          <div className="grid grid-cols-2 gap-3">
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
        );

      case '$sort':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Sort Fields</label>
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

      case '$limit':
      case '$skip':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">
              {stageType === '$limit' ? 'Limit' : 'Skip'}
            </label>
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

      case '$project':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Field Projection</label>
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
              placeholder='{ "field1": 1, "field2": 0, "newField": "$oldField" }'
            />
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Stage Configuration</label>
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
    <div className={cn("space-y-4", className)}>
      {/* Stage Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {Object.entries(STAGE_CATEGORIES).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
          
          {selectedCategory && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STAGE_CATEGORIES[selectedCategory].stages.map((stage) => {
                const Icon = STAGE_ICONS[stage.type as MongoStageType] || Settings;
                return (
                  <Button
                    key={stage.type}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddStage(stage.type as MongoStageType)}
                    className="justify-start text-left"
                    title={stage.description}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    <div>
                      <div className="text-xs font-medium">{stage.label}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aggregation Pipeline
            <Badge variant="secondary">{pipeline.filter(s => s.enabled).length} stages</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pipeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pipeline stages yet</p>
              <p className="text-sm mb-4">Add stages from the palette above</p>
              <Button variant="outline" onClick={() => setSelectedCategory('filter')}>
                <Plus className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pipeline">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "space-y-3",
                      snapshot.isDraggingOver && "bg-muted/50 rounded-lg p-2"
                    )}
                  >
                    {pipeline
                      .sort((a, b) => a.order - b.order)
                      .map((stage, index) => {
                        const Icon = STAGE_ICONS[stage.stage] || Settings;
                        const isExpanded = expandedStages[stage.id];
                        const hasPreview = previewResults[stage.id]?.length > 0;
                        
                        return (
                          <Draggable key={stage.id} draggableId={stage.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "border rounded-lg bg-card",
                                  snapshot.isDragging && "shadow-lg",
                                  !stage.enabled && "opacity-60"
                                )}
                              >
                                <div className="flex items-center gap-3 p-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-move text-muted-foreground hover:text-foreground"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  
                                  <Badge variant="secondary" className="font-mono">
                                    {index + 1}
                                  </Badge>
                                  
                                  <Icon className="h-4 w-4" />
                                  
                                  <div className="flex-1">
                                    <div className="font-semibold">{stage.stage}</div>
                                    {Object.keys(stage.config).length > 0 && (
                                      <div className="text-sm text-muted-foreground font-mono">
                                        {JSON.stringify(stage.config).slice(0, 50)}
                                        {JSON.stringify(stage.config).length > 50 ? '...' : ''}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {hasPreview && (
                                      <Badge variant="outline" className="text-xs">
                                        {previewResults[stage.id]?.length} docs
                                      </Badge>
                                    )}
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleStage(stage.id)}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateStage(stage.id, { enabled: !stage.enabled })}
                                      title={stage.enabled ? 'Disable stage' : 'Enable stage'}
                                    >
                                      {stage.enabled ? (
                                        <Eye className="h-4 w-4" />
                                      ) : (
                                        <EyeOff className="h-4 w-4" />
                                      )}
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDuplicateStage(stage)}
                                      title="Duplicate stage"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>

                                    {onStagePreview && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onStagePreview(stage.id)}
                                        title="Preview stage results"
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteStage(stage.id)}
                                      title="Delete stage"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="border-t p-4 bg-muted/30">
                                    {renderStageConfig(stage)}
                                    
                                    {hasPreview && (
                                      <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium mb-2">Stage Preview</h4>
                                        <div className="bg-background rounded p-3 max-h-48 overflow-y-auto">
                                          <pre className="text-xs font-mono">
                                            {JSON.stringify(previewResults[stage.id]?.slice(0, 3), null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}