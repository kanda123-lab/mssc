'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QueryTemplate, VisualQuery } from '@/types';
import { generateId } from '@/lib/utils';
import { BookOpen, Search, Plus, Star, Copy, Trash2 } from 'lucide-react';

interface QueryTemplatesProps {
  templates: QueryTemplate[];
  onTemplatesChange: (templates: QueryTemplate[]) => void;
  onLoadTemplate: (query: VisualQuery) => void;
  currentQuery?: VisualQuery;
  onSaveAsTemplate?: (template: QueryTemplate) => void;
}

interface TemplateCardProps {
  template: QueryTemplate;
  onLoad: (query: VisualQuery) => void;
  onRemove: (id: string) => void;
}

const TEMPLATE_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'basic', label: 'Basic Queries' },
  { value: 'joins', label: 'JOIN Operations' },
  { value: 'aggregates', label: 'Aggregations' },
  { value: 'subqueries', label: 'Subqueries' },
  { value: 'window_functions', label: 'Window Functions' },
  { value: 'cte', label: 'Common Table Expressions' },
];

const TemplateCard = ({ template, onLoad, onRemove }: TemplateCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      joins: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      aggregates: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      subqueries: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      window_functions: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      cte: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <h3 className="font-medium text-sm truncate">{template.name}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label || template.category}
              </span>
              
              {template.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onLoad(template.query);
              }}
              className="h-8 w-8 p-0"
              title="Load Template"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(template.id);
              }}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete Template"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t">
          <div className="pt-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Query Details</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Type: {template.query.type}</div>
                <div>Tables: {template.query.tables.length}</div>
                <div>Joins: {template.query.joins?.length || 0}</div>
                <div>Conditions: {template.query.whereConditions?.length || 0}</div>
                {template.query.selectColumns && (
                  <div>Columns: {template.query.selectColumns.length}</div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => onLoad(template.query)}
                className="flex-1"
              >
                Load Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function QueryTemplates({
  templates,
  onTemplatesChange,
  onLoadTemplate,
  currentQuery,
  onSaveAsTemplate
}: QueryTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('basic');
  const [newTemplateTags, setNewTemplateTags] = useState('');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const saveCurrentAsTemplate = () => {
    if (!currentQuery || !newTemplateName.trim()) return;

    const newTemplate: QueryTemplate = {
      id: generateId(),
      name: newTemplateName.trim(),
      category: newTemplateCategory as QueryTemplate['category'],
      description: newTemplateDescription.trim(),
      query: { ...currentQuery },
      tags: newTemplateTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };

    const updatedTemplates = [...templates, newTemplate];
    onTemplatesChange(updatedTemplates);
    onSaveAsTemplate?.(newTemplate);

    // Reset form
    setNewTemplateName('');
    setNewTemplateDescription('');
    setNewTemplateCategory('basic');
    setNewTemplateTags('');
    setShowSaveDialog(false);
  };

  const removeTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    onTemplatesChange(updatedTemplates);
  };

  const loadDefaultTemplates = () => {
    const defaultTemplates: QueryTemplate[] = [
      {
        id: 'default-1',
        name: 'Basic SELECT with WHERE',
        category: 'basic',
        description: 'Simple SELECT query with WHERE condition and ORDER BY',
        query: {
          id: 'template-1',
          name: 'Basic SELECT',
          type: 'SELECT',
          dialect: 'postgresql',
          tables: [
            {
              id: 'users-table',
              name: 'users',
              position: { x: 100, y: 100 },
              columns: [
                { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
                { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
                { name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
                { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
              ]
            }
          ],
          joins: [],
          selectColumns: [
            { id: 'col-1', column: 'id' },
            { id: 'col-2', column: 'name' },
            { id: 'col-3', column: 'email' }
          ],
          whereConditions: [
            {
              id: 'where-1',
              column: 'created_at',
              operator: '>=',
              value: '2024-01-01'
            }
          ],
          groupByColumns: [],
          havingConditions: [],
          orderByColumns: [
            { column: 'created_at', direction: 'DESC' }
          ],
          limit: 10,
          timestamp: Date.now()
        },
        tags: ['select', 'where', 'order']
      },
      {
        id: 'default-2',
        name: 'INNER JOIN with Aggregation',
        category: 'joins',
        description: 'JOIN two tables with COUNT aggregation and GROUP BY',
        query: {
          id: 'template-2',
          name: 'User Order Count',
          type: 'SELECT',
          dialect: 'postgresql',
          tables: [
            {
              id: 'users-table',
              name: 'users',
              position: { x: 50, y: 50 },
              columns: [
                { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
                { name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false }
              ]
            },
            {
              id: 'orders-table',
              name: 'orders',
              position: { x: 300, y: 50 },
              columns: [
                { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
                { name: 'user_id', type: 'INTEGER', nullable: false, primaryKey: false },
                { name: 'amount', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false }
              ]
            }
          ],
          joins: [
            {
              id: 'join-1',
              type: 'INNER',
              leftTable: 'users-table',
              rightTable: 'orders-table',
              conditions: [
                { leftColumn: 'id', operator: '=', rightColumn: 'user_id' }
              ]
            }
          ],
          selectColumns: [
            { id: 'col-1', column: 'users.name' },
            { id: 'col-2', column: 'orders.id', aggregateFunction: 'COUNT', alias: 'order_count' }
          ],
          whereConditions: [],
          groupByColumns: ['users.name'],
          havingConditions: [],
          orderByColumns: [
            { column: 'order_count', direction: 'DESC' }
          ],
          timestamp: Date.now()
        },
        tags: ['join', 'count', 'group']
      }
    ];

    // Only add templates that don't already exist
    const existingNames = new Set(templates.map(t => t.name));
    const newTemplates = defaultTemplates.filter(t => !existingNames.has(t.name));
    
    if (newTemplates.length > 0) {
      onTemplatesChange([...templates, ...newTemplates]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Query Templates</h3>
          <div className="text-xs text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-background text-sm"
          >
            {TEMPLATE_CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentQuery}
            className="flex-1"
          >
            <Star className="h-3 w-3 mr-1" />
            Save Current
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadDefaultTemplates}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Defaults
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <div className="font-medium">
              {searchTerm || selectedCategory 
                ? 'No templates match your criteria' 
                : 'No templates available'
              }
            </div>
            <div className="text-sm mt-1">
              {searchTerm || selectedCategory 
                ? 'Try adjusting your search or filter' 
                : 'Save your current query as a template to get started'
              }
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onLoad={onLoadTemplate}
                onRemove={removeTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="font-semibold mb-4">Save as Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Template Name</label>
                <Input
                  placeholder="My Custom Query"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  placeholder="Describe what this template does..."
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border bg-background"
                >
                  {TEMPLATE_CATEGORIES.slice(1).map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
                <Input
                  placeholder="select, join, aggregation"
                  value={newTemplateTags}
                  onChange={(e) => setNewTemplateTags(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={saveCurrentAsTemplate} disabled={!newTemplateName.trim()}>
                Save Template
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}