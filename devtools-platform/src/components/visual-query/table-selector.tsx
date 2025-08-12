'use client';

import { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QueryTable, SchemaTable } from '@/types';
import { generateId } from '@/lib/utils';
import { Database, Plus, Search, X, Key, Link, Hash } from 'lucide-react';

interface TableSelectorProps {
  availableTables: SchemaTable[];
  selectedTables: QueryTable[];
  onTablesChange: (tables: QueryTable[]) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

interface TableCardProps {
  table: QueryTable;
  onRemove: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

interface AvailableTableItemProps {
  table: SchemaTable;
  onAddTable: (table: SchemaTable) => void;
}

const DraggableTableCard = ({ table, onRemove, onPositionChange, isSelected, onSelect }: TableCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'table',
    item: { id: table.id, position: table.position },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [table.id, table.position]);

  const handleClick = () => {
    onSelect?.(table.id);
  };

  return (
    <div
      ref={drag}
      className={`absolute cursor-move bg-white dark:bg-gray-800 border rounded-lg shadow-lg min-w-48 ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-xl'
      }`}
      style={{
        left: table.position.x,
        top: table.position.y,
      }}
      onClick={handleClick}
    >
      {/* Table Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 border-b rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm">{table.name}</span>
            {table.alias && (
              <span className="text-xs text-muted-foreground">({table.alias})</span>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(table.id);
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Columns List */}
      <div className="p-2 max-h-64 overflow-y-auto">
        <div className="space-y-1">
          {table.columns.map((column, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {/* Column Icons */}
              <div className="flex items-center gap-1">
                {column.primaryKey && (
                  <Key className="h-3 w-3 text-yellow-500" title="Primary Key" />
                )}
                {column.foreignKey && (
                  <Link className="h-3 w-3 text-green-500" title="Foreign Key" />
                )}
                {column.index && (
                  <Hash className="h-3 w-3 text-blue-500" title="Index" />
                )}
              </div>
              
              {/* Column Name and Type */}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{column.name}</div>
                <div className="text-muted-foreground truncate">
                  {column.type}
                  {!column.nullable && ' NOT NULL'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AvailableTableItem = ({ table, onAddTable }: AvailableTableItemProps) => {
  return (
    <div className="border rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-medium text-sm">{table.name}</div>
            <div className="text-xs text-muted-foreground">
              {table.columns.length} columns
              {table.rowCount && ` • ${table.rowCount.toLocaleString()} rows`}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAddTable(table)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export function TableSelector({
  availableTables,
  selectedTables,
  onTablesChange,
  canvasWidth = 800,
  canvasHeight = 600
}: TableSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'table',
    drop: (item: { id: string; position: { x: number; y: number } }, monitor) => {
      const offset = monitor.getDropTargetMonitor()?.getClientOffset();
      const canvasRect = (monitor.getDropTarget() as HTMLElement)?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const newPosition = {
          x: Math.max(0, Math.min(offset.x - canvasRect.left - 100, canvasWidth - 200)),
          y: Math.max(0, Math.min(offset.y - canvasRect.top - 50, canvasHeight - 200))
        };
        
        onPositionChange(item.id, newPosition);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [canvasWidth, canvasHeight]);

  const filteredTables = availableTables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addTable = (schemaTable: SchemaTable) => {
    const existingTable = selectedTables.find(t => t.name === schemaTable.name);
    if (existingTable) return;

    // Find a good position for the new table
    const position = findAvailablePosition(selectedTables, canvasWidth, canvasHeight);

    const newTable: QueryTable = {
      id: generateId(),
      name: schemaTable.name,
      schema: schemaTable.schema,
      position,
      columns: schemaTable.columns,
    };

    onTablesChange([...selectedTables, newTable]);
    setSelectedTableId(newTable.id);
  };

  const removeTable = (tableId: string) => {
    onTablesChange(selectedTables.filter(t => t.id !== tableId));
    if (selectedTableId === tableId) {
      setSelectedTableId(null);
    }
  };

  const onPositionChange = (tableId: string, position: { x: number; y: number }) => {
    onTablesChange(
      selectedTables.map(table =>
        table.id === tableId ? { ...table, position } : table
      )
    );
  };

  return (
    <div className="h-full flex">
      {/* Available Tables Panel */}
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Available Tables</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredTables.map((table) => (
            <AvailableTableItem
              key={table.name}
              table={table}
              onAddTable={addTable}
            />
          ))}
        </div>
        
        <div className="p-4 border-t bg-muted/50">
          <div className="text-xs text-muted-foreground">
            <div>Drag tables to the canvas to add them to your query</div>
            <div className="mt-1">{selectedTables.length} tables selected</div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <div
          ref={drop}
          className={`w-full h-full relative bg-gray-100 dark:bg-gray-800 overflow-hidden ${
            isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          style={{ minHeight: canvasHeight }}
        >
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-gray-700"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Drop Zone Message */}
          {selectedTables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3" />
                <div className="text-lg font-medium">Build Your Query</div>
                <div className="text-sm">Drag tables from the sidebar to get started</div>
              </div>
            </div>
          )}

          {/* Table Cards */}
          {selectedTables.map((table) => (
            <DraggableTableCard
              key={table.id}
              table={table}
              onRemove={removeTable}
              onPositionChange={onPositionChange}
              isSelected={selectedTableId === table.id}
              onSelect={setSelectedTableId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function findAvailablePosition(
  existingTables: QueryTable[],
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const tableWidth = 200;
  const tableHeight = 200;
  const margin = 20;

  // Try to place tables in a grid pattern
  for (let y = margin; y < canvasHeight - tableHeight; y += tableHeight + margin) {
    for (let x = margin; x < canvasWidth - tableWidth; x += tableWidth + margin) {
      const position = { x, y };
      
      // Check if this position overlaps with any existing table
      const overlaps = existingTables.some(table => {
        const dx = Math.abs(table.position.x - x);
        const dy = Math.abs(table.position.y - y);
        return dx < tableWidth + margin && dy < tableHeight + margin;
      });
      
      if (!overlaps) {
        return position;
      }
    }
  }

  // If no grid position is available, use a random position
  return {
    x: Math.random() * (canvasWidth - tableWidth),
    y: Math.random() * (canvasHeight - tableHeight)
  };
}