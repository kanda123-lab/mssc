'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatabaseSchema } from '@/types';
import { 
  Table, 
  Key, 
  Link as LinkIcon, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Database,
  Columns
} from 'lucide-react';

interface DatabaseSchemaViewerProps {
  schema: DatabaseSchema;
  onTableSelect?: (tableName: string) => void;
  className?: string;
}

export function DatabaseSchemaViewer({ 
  schema, 
  onTableSelect, 
  className = '' 
}: DatabaseSchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const filteredTables = schema.tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some(col => 
      col.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleTableExpansion = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const handleTableClick = (tableName: string) => {
    onTableSelect?.(tableName);
  };

  const getColumnIcon = (column: { primaryKey?: boolean; foreignKey?: { table: string; column: string }; name: string; type: string }) => {
    if (column.primaryKey) {
      return <Key className="h-3 w-3 text-yellow-600" title="Primary Key" />;
    }
    if (column.foreignKey) {
      return <LinkIcon className="h-3 w-3 text-blue-600" title="Foreign Key" />;
    }
    return <Columns className="h-3 w-3 text-muted-foreground" />;
  };

  const getColumnTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('int') || lowerType.includes('number')) {
      return 'text-blue-600';
    }
    if (lowerType.includes('varchar') || lowerType.includes('text') || lowerType.includes('char')) {
      return 'text-green-600';
    }
    if (lowerType.includes('date') || lowerType.includes('time')) {
      return 'text-purple-600';
    }
    if (lowerType.includes('bool')) {
      return 'text-orange-600';
    }
    return 'text-muted-foreground';
  };

  if (!schema.tables.length) {
    return (
      <div className={`rounded-lg border bg-muted/5 p-8 text-center ${className}`}>
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Schema Available</h3>
        <p className="text-sm text-muted-foreground">
          Connect to a database to view its schema structure.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <h3 className="text-lg font-medium">Database Schema</h3>
          <span className="text-sm text-muted-foreground">
            ({schema.tables.length} tables)
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tables and columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tables */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          
          return (
            <div key={table.name} className="border rounded-lg">
              {/* Table Header */}
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20"
                onClick={() => toggleTableExpansion(table.name)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Table className="h-4 w-4" />
                  <span className="font-medium font-mono">{table.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({table.columns.length} columns)
                  </span>
                </div>
                
                {onTableSelect && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableClick(table.name);
                    }}
                  >
                    Use Table
                  </Button>
                )}
              </div>

              {/* Table Columns */}
              {isExpanded && (
                <div className="border-t bg-muted/5">
                  {table.columns.map((column, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between px-6 py-2 text-sm border-b last:border-b-0 hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getColumnIcon(column)}
                        <span className="font-mono font-medium">{column.name}</span>
                        <span className={`font-mono text-xs ${getColumnTypeColor(column.type)}`}>
                          {column.type}
                        </span>
                        {!column.nullable && (
                          <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded">
                            NOT NULL
                          </span>
                        )}
                        {column.primaryKey && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                            PRIMARY KEY
                          </span>
                        )}
                      </div>
                      
                      {column.foreignKey && (
                        <div className="text-xs text-muted-foreground">
                          → {column.foreignKey.table}.{column.foreignKey.column}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTables.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No tables or columns found matching &quot;{searchTerm}&quot;</p>
        </div>
      )}
    </div>
  );
}