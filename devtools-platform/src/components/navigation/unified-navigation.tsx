'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  Clock, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Settings,
  User,
  LogOut,
  Bell,
  Grid3X3,
  List,
  Filter,
  BookOpen,
  Keyboard,
  Palette,
  Zap,
  Database,
  Globe,
  Code,
  Layers,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { tools, toolCategories, searchTools } from '@/lib/tools';
import { useAppStore, useNavigation, useAuth, useUI } from '@/lib/store/app-store';
import { Tool } from '@/types';

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          {index === items.length - 1 ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              {item.icon}
              {item.label}
            </span>
          ) : (
            <Link
              href={item.path}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Enhanced Sidebar Navigation
interface SidebarNavigationProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

function SidebarNavigation({ className, collapsed = false, onToggle }: SidebarNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();
  const { 
    setSearchQuery, 
    addRecentTool, 
    toggleFavorite, 
    toggleCategory,
    setCurrentTool 
  } = useAppStore();

  const [searchQuery, setLocalSearchQuery] = useState(navigation.searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and search tools
  const filteredTools = useMemo(() => {
    let result = tools;
    
    if (searchQuery.trim()) {
      result = searchTools(searchQuery);
    }
    
    return result;
  }, [searchQuery]);

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    return filteredTools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  }, [filteredTools]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setLocalSearchQuery(query);
    setSearchQuery(query);
  }, [setSearchQuery]);

  // Handle tool click
  const handleToolClick = useCallback((tool: Tool) => {
    setCurrentTool(tool.id);
    addRecentTool(tool.id);
    router.push(tool.path);
  }, [setCurrentTool, addRecentTool, router]);

  // Get tool icon
  const getToolIcon = (tool: Tool) => {
    const iconMap = {
      'api-tester': <Globe className="h-4 w-4" />,
      'websocket-tester': <Zap className="h-4 w-4" />,
      'json-formatter': <Code className="h-4 w-4" />,
      'base64-encoder': <Package className="h-4 w-4" />,
      'mock-server': <Layers className="h-4 w-4" />,
      'sql-query-builder': <Database className="h-4 w-4" />,
      'mongodb-query-builder': <Database className="h-4 w-4" />,
      'database-connection-builder': <Database className="h-4 w-4" />,
      'npm-analyzer': <Package className="h-4 w-4" />,
      'env-manager': <Settings className="h-4 w-4" />,
    };
    
    return iconMap[tool.id as keyof typeof iconMap] || <Code className="h-4 w-4" />;
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const iconMap = {
      api: <Globe className="h-4 w-4" />,
      data: <Code className="h-4 w-4" />,
      database: <Database className="h-4 w-4" />,
      development: <Settings className="h-4 w-4" />,
    };
    
    return iconMap[categoryId as keyof typeof iconMap] || <Code className="h-4 w-4" />;
  };

  return (
    <div className={cn('flex flex-col h-full bg-background border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          {!collapsed && (
            <h2 className="font-semibold text-lg">Developer Tools</h2>
          )}
          <div className="flex items-center gap-1">
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            {!collapsed && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="h-8 w-8"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-8 w-8"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSearch('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Quick Access */}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2"
                onClick={() => {
                  // Show recent tools
                }}
              >
                <Clock className="h-3 w-3" />
                Recent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-start gap-2"
                onClick={() => {
                  // Show favorite tools
                }}
              >
                <Star className="h-3 w-3" />
                Favorites
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed ? (
          <div className="p-2 space-y-2">
            {Object.entries(toolsByCategory).map(([categoryId, categoryTools]) => {
              const category = toolCategories[categoryId];
              const isExpanded = navigation.toolCategories[categoryId];
              
              return (
                <div key={categoryId}>
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {getCategoryIcon(categoryId)}
                    <span className="flex-1 text-left">{category?.name || categoryId}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryTools.length}
                    </Badge>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )} />
                  </button>

                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {categoryTools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool)}
                          className={cn(
                            'w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            pathname === tool.path && 'bg-primary text-primary-foreground'
                          )}
                        >
                          {getToolIcon(tool)}
                          <span className="flex-1 text-left">{tool.name}</span>
                          {navigation.favoriteTools.includes(tool.id) && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tool.id);
                            }}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Collapsed view - show icons only
          <div className="p-2 space-y-2">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={pathname === tool.path ? "default" : "ghost"}
                size="icon"
                onClick={() => handleToolClick(tool)}
                className="w-full"
                title={tool.name}
              >
                {getToolIcon(tool)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Top Navigation Header
interface TopNavigationProps {
  onSidebarToggle: () => void;
  className?: string;
}

function TopNavigation({ onSidebarToggle, className }: TopNavigationProps) {
  const navigation = useNavigation();
  const auth = useAuth();
  const ui = useUI();
  const { 
    logout, 
    toggleModal, 
    addNotification,
    markNotificationRead,
    clearNotifications 
  } = useAppStore();

  const unreadCount = ui.notifications.filter(n => !n.read).length;

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="flex h-14 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 md:hidden"
          onClick={onSidebarToggle}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <Link className="mr-6 flex items-center space-x-2" href="/">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <span className="text-sm font-bold">DT</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            DevTools Platform
          </span>
        </Link>

        {/* Breadcrumbs */}
        <div className="hidden md:flex flex-1 items-center">
          <Breadcrumbs items={navigation.breadcrumbs} />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <span className="font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearNotifications}>
                    Clear all
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {ui.notifications.length > 0 ? (
                ui.notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                    className={cn("p-3", !notification.read && "bg-muted")}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick actions */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleModal('shortcuts')}
            title="Keyboard shortcuts (Cmd+/)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleModal('help')}
            title="Help"
          >
            <BookOpen className="h-4 w-4" />
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleModal('settings')}
            title="Settings"
          >
            <Palette className="h-4 w-4" />
          </Button>

          {/* User menu */}
          {auth.isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                    <AvatarFallback>
                      {auth.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{auth.user?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {auth.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleModal('settings')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleModal('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

// Main Unified Navigation Component
interface UnifiedNavigationProps {
  children: React.ReactNode;
}

export function UnifiedNavigation({ children }: UnifiedNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigation = useNavigation();
  const { toggleSidebar } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopNavigation 
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={cn(
          "hidden md:flex transition-all duration-300 ease-in-out",
          navigation.sidebarCollapsed ? "w-16" : "w-80"
        )}>
          <SidebarNavigation
            collapsed={navigation.sidebarCollapsed}
            onToggle={toggleSidebar}
            className="w-full"
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setSidebarOpen(false)} 
            />
            <div className="absolute left-0 top-0 h-full w-80 bg-background">
              <SidebarNavigation
                className="w-full"
                onToggle={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          !navigation.sidebarCollapsed ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export { Breadcrumbs, SidebarNavigation, TopNavigation };