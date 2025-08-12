'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Globe, 
  Binary, 
  Database, 
  Wifi, 
  Braces,
  Server,
  FileText,
  Hash,
  Settings,
  Code,
  Zap,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Star,
  Folder,
  File,
  MoreHorizontal,
  Bell,
  User
} from 'lucide-react';

const toolsData = {
  favorites: [
    { id: 'json-formatter', name: 'JSON Formatter', icon: Braces, href: '/tools/json-formatter' },
    { id: 'api-tester', name: 'API Tester', icon: Globe, href: '/tools/api-tester' },
  ],
  workspace: [
    {
      name: 'API & Network Tools',
      icon: Globe,
      expanded: true,
      pages: [
        { id: 'api-tester', name: 'API Tester', icon: Globe, href: '/tools/api-tester', lastEdit: '2 hours ago' },
        { id: 'websocket-tester', name: 'WebSocket Tester', icon: Wifi, href: '/tools/websocket-tester', lastEdit: '1 day ago' },
        { id: 'mock-server', name: 'Mock Server', icon: Server, href: '/tools/mock-server', lastEdit: '3 days ago' },
      ]
    },
    {
      name: 'Data Processing',
      icon: Database,
      expanded: false,
      pages: [
        { id: 'json-formatter', name: 'JSON Formatter', icon: Braces, href: '/tools/json-formatter', lastEdit: '5 minutes ago' },
        { id: 'base64', name: 'Base64 Encoder', icon: Binary, href: '/tools/base64', lastEdit: '1 hour ago' },
        { id: 'uuid-generator', name: 'UUID Generator', icon: Hash, href: '/tools/uuid-generator', lastEdit: '2 days ago' },
      ]
    },
    {
      name: 'Database Tools',
      icon: Database,
      expanded: false,
      pages: [
        { id: 'sql-query-builder', name: 'SQL Query Builder', icon: Database, href: '/tools/sql-query-builder', lastEdit: '1 week ago' },
        { id: 'connection-string-builder', name: 'Connection Builder', icon: Server, href: '/tools/connection-string-builder', lastEdit: '2 weeks ago' },
      ]
    }
  ]
};

interface NotionStyleLayoutProps {
  children: React.ReactNode;
}

export function NotionStyleLayout({ children }: NotionStyleLayoutProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'API & Network Tools': true,
    'Data Processing': false,
    'Database Tools': false
  });

  const currentTool = toolsData.workspace
    .flatMap(section => section.pages)
    .find(tool => pathname === tool.href);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900">DevTools</span>
          </div>
          
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-4 h-4" />
            Search...
            <kbd className="ml-auto text-xs bg-gray-200 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* Favorites */}
          <div className="mb-6">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <Star className="w-3 h-3" />
              Favorites
            </div>
            <div className="space-y-1 mt-2">
              {toolsData.favorites.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname === tool.href;
                
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Workspace */}
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <Folder className="w-3 h-3" />
                Workspace
              </div>
              <button className="p-1 hover:bg-gray-200 rounded">
                <Plus className="w-3 h-3 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-1">
              {toolsData.workspace.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections[section.name];
                
                return (
                  <div key={section.name}>
                    <button
                      onClick={() => toggleSection(section.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <SectionIcon className="w-4 h-4" />
                      <span>{section.name}</span>
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-5 space-y-1 mt-1">
                        {section.pages.map((page) => {
                          const PageIcon = page.icon;
                          const isActive = pathname === page.href;
                          
                          return (
                            <Link
                              key={page.id}
                              href={page.href}
                              className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <PageIcon className="w-4 h-4" />
                              <span>{page.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700">Developer</span>
            <button className="ml-auto p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-gray-200 flex items-center px-6">
          {currentTool && (
            <div className="flex items-center gap-2">
              <currentTool.icon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{currentTool.name}</span>
              <span className="text-xs text-gray-500">• Last edited {currentTool.lastEdit}</span>
            </div>
          )}
          
          <div className="ml-auto flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}