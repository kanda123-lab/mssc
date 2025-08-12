'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { StorageManager } from '@/lib/storage';
import { tools, toolCategories, searchTools, getToolsByCategory, getFeaturedTools } from '@/lib/tools';
import { Tool, ToolCategory, ToolUsage } from '@/types';
import { usePerformanceOptimization, useComponentPerformance, useDataOptimization } from '@/hooks/usePerformanceOptimization';
import { useDebounced } from '@/lib/performance';
import { 
  Search,
  Star,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  Database,
  FileText,
  Code2,
  Heart,
  Filter,
  SortAsc,
  MoreHorizontal,
  X,
  Settings,
  HelpCircle,
  Bookmark,
  Wifi,
  Server,
  Code,
  Layers,
  Link as LinkIcon,
  Layers3,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EnhancedSidebarProps {
  className?: string;
}

export default function EnhancedSidebar({ className }: EnhancedSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['api']));
  const [favoriteTools, setFavoriteTools] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<ToolUsage[]>([]);
  const [activeView, setActiveView] = useState<'all' | 'favorites' | 'recent' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Performance optimizations
  const { storage, measureOperation, preloadRelatedTools } = usePerformanceOptimization({
    toolId: 'enhanced-sidebar',
    enableMetrics: true,
    enableMemoryCleanup: true,
    enableStorageOptimization: true
  });

  const { renderCount } = useComponentPerformance('EnhancedSidebar');

  const { processedData, virtualScrollConfig } = useDataOptimization(tools, {
    virtualScrolling: tools.length > 50,
    searchable: true,
    pageSize: 20
  });

  // Debounced search function
  const debouncedSearch = useDebounced(
    useCallback((query: string) => {
      setSearchQuery(query);
    }, []),
    300
  );
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'difficulty' | 'usage'>('name');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Track tool usage
    const toolId = getCurrentToolId(pathname);
    if (toolId) {
      trackToolUsage(toolId);
    }
  }, [pathname]);

  const loadUserData = () => {
    try {
      const data = StorageManager.getData();
      setFavoriteTools(data.favoriteTools || []);
      setRecentTools(data.recentTools || []);
      
      // Initialize expanded categories from user preferences
      const preferences = data.userPreferences;
      if (preferences?.favoriteCategory) {
        setExpandedCategories(new Set([preferences.favoriteCategory]));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getCurrentToolId = (pathname: string): string | null => {
    const match = pathname.match(/\/tools\/([^\/]+)/);
    return match ? match[1] : null;
  };

  const trackToolUsage = useCallback((toolId: string) => {
    measureOperation('track-tool-usage', () => {
      const usage: ToolUsage = {
        toolId,
        timestamp: Date.now()
      };

      const updatedRecent = [usage, ...recentTools.filter(r => r.toolId !== toolId)].slice(0, 10);
      setRecentTools(updatedRecent);
      storage.updateField('recentTools', updatedRecent);
    });
  }, [recentTools, storage, measureOperation]);

  const toggleFavorite = useCallback((toolId: string) => {
    measureOperation('toggle-favorite', () => {
      const updatedFavorites = favoriteTools.includes(toolId)
        ? favoriteTools.filter(id => id !== toolId)
        : [...favoriteTools, toolId];
      
      setFavoriteTools(updatedFavorites);
      storage.updateField('favoriteTools', updatedFavorites);
    });
  }, [favoriteTools, storage, measureOperation]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter and sort tools based on current view and search
  const filteredTools = useMemo(() => {
    let toolsToShow: Tool[] = [];

    switch (activeView) {
      case 'favorites':
        toolsToShow = tools.filter(tool => favoriteTools.includes(tool.id));
        break;
      case 'recent':
        const recentIds = recentTools.map(r => r.toolId);
        toolsToShow = tools.filter(tool => recentIds.includes(tool.id))
          .sort((a, b) => {
            const aIndex = recentIds.indexOf(a.id);
            const bIndex = recentIds.indexOf(b.id);
            return aIndex - bIndex;
          });
        break;
      case 'category':
        toolsToShow = selectedCategory ? getToolsByCategory(selectedCategory) : tools;
        break;
      default:
        toolsToShow = tools;
    }

    // Apply search filter
    if (searchQuery) {
      toolsToShow = searchTools(searchQuery).filter(tool => 
        toolsToShow.some(t => t.id === tool.id)
      );
    }

    // Apply sorting
    toolsToShow.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'usage':
          const aUsage = recentTools.find(r => r.toolId === a.id);
          const bUsage = recentTools.find(r => r.toolId === b.id);
          return (bUsage?.timestamp || 0) - (aUsage?.timestamp || 0);
        default:
          return 0;
      }
    });

    return toolsToShow;
  }, [activeView, selectedCategory, searchQuery, sortBy, favoriteTools, recentTools]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-yellow-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = toolCategories[categoryId];
    switch (category?.color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const isActiveTool = (toolPath: string) => pathname === toolPath;

  return (
    <div className={cn('flex flex-col h-full bg-background border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Developer Tools</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-muted rounded-lg space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full text-xs px-2 py-1 rounded border bg-background"
              >
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="difficulty">Difficulty</option>
                <option value="usage">Recent Usage</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex border-b">
        {[
          { id: 'all', label: 'All', icon: MoreHorizontal },
          { id: 'favorites', label: 'Favorites', icon: Heart },
          { id: 'recent', label: 'Recent', icon: Clock }
        ].map(view => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border-b-2 transition-colors',
                activeView === view.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3 w-3" />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'category' || (!searchQuery && activeView === 'all') ? (
          // Categorized view
          <div className="p-2 space-y-2">
            {Object.entries(toolCategories)
              .sort(([,a], [,b]) => a.order - b.order)
              .map(([categoryId, category]) => {
                const categoryTools = getToolsByCategory(categoryId);
                const hasMatchingTools = searchQuery ? 
                  categoryTools.some(tool => searchTools(searchQuery).includes(tool)) : 
                  categoryTools.length > 0;

                if (!hasMatchingTools) return null;

                return (
                  <div key={categoryId}>
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        getCategoryColor(categoryId)
                      )}
                    >
                      {expandedCategories.has(categoryId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="flex items-center gap-2 flex-1">
                        {getCategoryIcon(category.icon)}
                        <span>{category.name}</span>
                        <span className="text-xs opacity-60">
                          ({categoryTools.length})
                        </span>
                      </div>
                    </button>

                    {expandedCategories.has(categoryId) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {categoryTools
                          .filter(tool => !searchQuery || searchTools(searchQuery).includes(tool))
                          .map(tool => (
                            <ToolItem
                              key={tool.id}
                              tool={tool}
                              isActive={isActiveTool(tool.path)}
                              isFavorite={favoriteTools.includes(tool.id)}
                              onToggleFavorite={toggleFavorite}
                              getDifficultyColor={getDifficultyColor}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          // Flat list view
          <div className="p-2 space-y-1">
            {filteredTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No tools found' : 'No tools in this view'}
                </p>
              </div>
            ) : (
              filteredTools.map(tool => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  isActive={isActiveTool(tool.path)}
                  isFavorite={favoriteTools.includes(tool.id)}
                  onToggleFavorite={toggleFavorite}
                  getDifficultyColor={getDifficultyColor}
                  showCategory={activeView !== 'category'}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" size="sm" className="justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Tools: {tools.length}</span>
            <span>Favorites: {favoriteTools.length}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Categories: {Object.keys(toolCategories).length}</span>
            <span>Recent: {recentTools.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for rendering individual tools
interface ToolItemProps {
  tool: Tool;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (toolId: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  showCategory?: boolean;
}

function ToolItem({ 
  tool, 
  isActive, 
  isFavorite, 
  onToggleFavorite, 
  getDifficultyColor,
  showCategory = false 
}: ToolItemProps) {
  return (
    <div className="group relative">
      <Link
        href={tool.path}
        className={cn(
          'flex items-center gap-3 p-2 rounded-lg text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-primary text-primary-foreground shadow-sm'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getToolIcon(tool.icon)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{tool.name}</span>
              {tool.featured && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {showCategory && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {toolCategories[tool.category]?.name}
                </span>
              )}
              <span className={cn('text-xs', getDifficultyColor(tool.difficulty))}>
                {tool.difficulty}
              </span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(tool.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
        >
          {isFavorite ? (
            <Heart className="h-3 w-3 text-red-500 fill-current" />
          ) : (
            <Heart className="h-3 w-3" />
          )}
        </Button>
      </Link>
    </div>
  );
}

// Helper functions for rendering icons
function getCategoryIcon(iconName: string) {
  const icons = {
    'Zap': <Zap className="h-4 w-4" />,
    'Database': <Database className="h-4 w-4" />,
    'FileText': <FileText className="h-4 w-4" />,
    'Code2': <Code2 className="h-4 w-4" />
  };
  return icons[iconName as keyof typeof icons] || <div className="h-4 w-4" />;
}

function getToolIcon(iconName: string) {
  const icons = {
    'Zap': <Zap className="h-4 w-4" />,
    'Wifi': <Wifi className="h-4 w-4" />,
    'Server': <Server className="h-4 w-4" />,
    'FileText': <FileText className="h-4 w-4" />,
    'Code': <Code className="h-4 w-4" />,
    'Layers': <Layers className="h-4 w-4" />,
    'Database': <Database className="h-4 w-4" />,
    'Link': <LinkIcon className="h-4 w-4" />,
    'Layers3': <Layers3 className="h-4 w-4" />,
    'Package': <Package className="h-4 w-4" />,
    'Settings': <Settings className="h-4 w-4" />,
    'Code2': <Code2 className="h-4 w-4" />
  };
  return icons[iconName as keyof typeof icons] || <div className="h-4 w-4 bg-muted rounded" />;
}