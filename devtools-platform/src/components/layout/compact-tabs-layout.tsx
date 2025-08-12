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
  Hash,
  Settings,
  Zap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Bell,
  User,
  Search
} from 'lucide-react';

const tools = [
  { id: 'json-formatter', name: 'JSON Formatter', shortName: 'JSON', icon: Braces, href: '/tools/json-formatter', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'base64', name: 'Base64 Encoder', shortName: 'Base64', icon: Binary, href: '/tools/base64', color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'api-tester', name: 'API Tester', shortName: 'API Tester', icon: Globe, href: '/tools/api-tester', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'websocket-tester', name: 'WebSocket Tester', shortName: 'WebSocket', icon: Wifi, href: '/tools/websocket-tester', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'sql-query-builder', name: 'SQL Query Builder', shortName: 'SQL Builder', icon: Database, href: '/tools/sql-query-builder', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'connection-string-builder', name: 'Connection String Builder', shortName: 'DB Connection', icon: Server, href: '/tools/connection-string-builder', color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'uuid-generator', name: 'UUID Generator', shortName: 'UUID', icon: Hash, href: '/tools/uuid-generator', color: 'text-pink-600 bg-pink-50 border-pink-200' },
];

interface CompactTabsLayoutProps {
  children: React.ReactNode;
  toolName?: string;
}

export function CompactTabsLayout({ children, toolName }: CompactTabsLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const currentTool = tools.find(tool => pathname.includes(tool.id)) || tools[0];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg md:hidden"
          >
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">DevTools</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Search className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
            {!sidebarCollapsed && (
              <span className="font-medium text-gray-900">Tools</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = pathname.includes(tool.id);
                
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? `${tool.color} font-medium`
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={sidebarCollapsed ? tool.name : ''}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{tool.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          {!sidebarCollapsed && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">Developer</span>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-white">
              <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
                <span className="font-medium text-gray-900">Tools</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="py-4">
                <nav className="space-y-1 px-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = pathname.includes(tool.id);
                    
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          isActive
                            ? `${tool.color} font-medium`
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tool.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Content Header with Tool Info */}
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-gray-50">
            <div className="flex items-center gap-3">
              <currentTool.icon className="w-5 h-5 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{currentTool.name}</h2>
                <p className="text-xs text-gray-500">Transform and process your data</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                <Minimize2 className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                <Maximize2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tool Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}