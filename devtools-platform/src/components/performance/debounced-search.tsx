'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useDebounced, useThrottled, PerformanceMonitor } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface DebouncedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilters) => void;
  debounceMs?: number;
  className?: string;
  showFilters?: boolean;
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

interface SearchFilters {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  [key: string]: any;
}

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'toggle' | 'date';
  options?: { value: string; label: string }[];
}

interface SortOption {
  value: string;
  label: string;
}

export function DebouncedSearch({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  className,
  showFilters = false,
  filterOptions = [],
  sortOptions = [],
  initialQuery = '',
  initialFilters = {}
}: DebouncedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  // Debounced search function
  const debouncedSearch = useDebounced(
    useCallback((searchQuery: string, searchFilters: SearchFilters) => {
      PerformanceMonitor.startMeasure('debounced-search');
      
      onSearch(searchQuery, searchFilters);
      setSearchCount(prev => prev + 1);
      
      PerformanceMonitor.endMeasure('debounced-search');
    }, [onSearch]),
    debounceMs
  );

  // Throttled input handler for performance
  const throttledInputChange = useThrottled(
    useCallback((value: string) => {
      setQuery(value);
    }, []),
    50 // Throttle input updates to 50ms
  );

  // Effect to trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    throttledInputChange(e.target.value);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Memoized filter count for performance
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(key => 
      filters[key] !== undefined && 
      filters[key] !== '' && 
      filters[key] !== 'all'
    ).length;
  }, [filters]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Search Input */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-9 pr-9"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={cn(
              "flex items-center gap-2",
              activeFilterCount > 0 && "bg-primary/10 border-primary/30"
            )}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        {/* Sort Options */}
        {sortOptions.length > 0 && (
          <div className="flex items-center gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "flex items-center gap-1",
                  filters.sortBy === option.value && "bg-muted"
                )}
              >
                {option.label}
                {filters.sortBy === option.value && (
                  filters.sortOrder === 'asc' ? 
                    <SortAsc className="h-3 w-3" /> : 
                    <SortDesc className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && filterOptions.length > 0 && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filterOptions.map((option) => (
              <div key={option.key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {option.label}
                </label>
                
                {option.type === 'select' && option.options && (
                  <select
                    value={filters[option.key] || ''}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="">All</option>
                    {option.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {option.type === 'toggle' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[option.key] || false}
                      onChange={(e) => handleFilterChange(option.key, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Enable</span>
                  </label>
                )}

                {option.type === 'date' && (
                  <select
                    value={filters[option.key] || 'all'}
                    onChange={(e) => handleFilterChange(option.key, e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {query && `Searching for "${query}"`}
          {activeFilterCount > 0 && ` with ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'}`}
        </span>
        <span>
          {searchCount} search{searchCount === 1 ? '' : 'es'} performed
        </span>
      </div>
    </div>
  );
}

// Hook for optimized search functionality
export function useOptimizedSearch<T>(
  items: T[],
  searchKeys: (keyof T)[],
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  // Memoized search function
  const searchFunction = useMemo(() => {
    return (searchQuery: string, searchFilters: SearchFilters) => {
      PerformanceMonitor.startMeasure('optimized-search');
      
      let results = [...items];

      // Text search
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        results = results.filter(item =>
          searchKeys.some(key => {
            const value = item[key];
            return value && String(value).toLowerCase().includes(lowerQuery);
          })
        );
      }

      // Apply filters
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          if (key === 'sortBy' || key === 'sortOrder') return;
          
          results = results.filter(item => {
            const itemValue = (item as any)[key];
            if (typeof value === 'boolean') {
              return itemValue === value;
            }
            if (key === 'dateRange' && value !== 'all') {
              // Handle date range filtering
              const timestamp = (item as any).timestamp || Date.now();
              const now = Date.now();
              const ranges = {
                today: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000
              };
              return now - timestamp <= ranges[value as keyof typeof ranges];
            }
            return itemValue === value;
          });
        }
      });

      // Apply sorting
      if (searchFilters.sortBy) {
        const sortKey = searchFilters.sortBy as keyof T;
        const sortOrder = searchFilters.sortOrder || 'asc';
        
        results.sort((a, b) => {
          const aVal = a[sortKey];
          const bVal = b[sortKey];
          
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setFilteredItems(results);
      PerformanceMonitor.endMeasure('optimized-search');
    };
  }, [items, searchKeys]);

  // Debounced search
  const debouncedSearch = useDebounced(searchFunction, debounceMs);

  const handleSearch = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters);
    debouncedSearch(searchQuery, searchFilters);
  }, [debouncedSearch]);

  // Update results when items change
  useEffect(() => {
    searchFunction(query, filters);
  }, [items, searchFunction, query, filters]);

  return {
    query,
    filters,
    filteredItems,
    handleSearch,
    resultCount: filteredItems.length,
    totalCount: items.length
  };
}