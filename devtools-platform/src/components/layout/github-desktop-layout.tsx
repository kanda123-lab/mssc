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
  Bell,
  User,
  Menu,
  Plus,
  ChevronDown
} from 'lucide-react';

const toolCategories = [
  {
    name: 'API & Network',
    tools: [
      { id: 'api-tester', name: 'API Tester', icon: Globe, href: '/tools/api-tester', description: 'Test HTTP APIs and endpoints' },
      { id: 'websocket-tester', name: 'WebSocket Tester', icon: Wifi, href: '/tools/websocket-tester', description: 'Test real-time WebSocket connections' },
      { id: 'mock-server', name: 'Mock Server', icon: Server, href: '/tools/mock-server', description: 'Create mock API endpoints' },
    ]
  },
  {
    name: 'Data & Encoding',
    tools: [
      { id: 'json-formatter', name: 'JSON Formatter', icon: Braces, href: '/tools/json-formatter', description: 'Format and validate JSON data' },
      { id: 'base64', name: 'Base64 Encoder', icon: Binary, href: '/tools/base64', description: 'Encode and decode Base64 strings' },
      { id: 'uuid-generator', name: 'UUID Generator', icon: Hash, href: '/tools/uuid-generator', description: 'Generate and decode UUIDs' },
    ]
  },
  {
    name: 'Database',
    tools: [
      { id: 'sql-query-builder', name: 'SQL Query Builder', icon: Database, href: '/tools/sql-query-builder', description: 'Build and test SQL queries' },
      { id: 'connection-string-builder', name: 'Connection Builder', icon: Server, href: '/tools/connection-string-builder', description: 'Build database connection strings' },
    ]
  }
];

interface GitHubDesktopLayoutProps {
  children: React.ReactNode;
}

export function GitHubDesktopLayout({ children }: GitHubDesktopLayoutProps) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState('API & Network');

  const currentTool = toolCategories
    .flatMap(cat => cat.tools)
    .find(tool => pathname === tool.href);

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Title Bar */}
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">DevTools Platform</span>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Search className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <nav className="flex items-center gap-6">
          {toolCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                activeCategory === category.name
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-50">
            <Plus className="w-4 h-4" />
            New Tool
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Category Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{activeCategory}</h2>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Menu className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {toolCategories.find(cat => cat.name === activeCategory)?.tools.length} tools available
            </p>
          </div>

          {/* Tools List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {toolCategories
                .find(cat => cat.name === activeCategory)
                ?.tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = pathname === tool.href;
                  
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`block p-4 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-md ${
                          isActive ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isActive ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium ${
                            isActive ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {tool.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>v1.2.0</span>
              <button className="hover:text-gray-700">
                View on GitHub
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Tool Header */}
          {currentTool && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <currentTool.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {currentTool.name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {currentTool.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}