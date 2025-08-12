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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

const tools = [
  { id: 'json-formatter', name: 'JSON', icon: Braces, href: '/tools/json-formatter', color: 'bg-orange-500' },
  { id: 'base64', name: 'Base64', icon: Binary, href: '/tools/base64', color: 'bg-green-500' },
  { id: 'api-tester', name: 'API', icon: Globe, href: '/tools/api-tester', color: 'bg-blue-500' },
  { id: 'websocket-tester', name: 'WebSocket', icon: Wifi, href: '/tools/websocket-tester', color: 'bg-purple-500' },
  { id: 'sql-query-builder', name: 'SQL', icon: Database, href: '/tools/sql-query-builder', color: 'bg-indigo-500' },
  { id: 'connection-string-builder', name: 'DB Connection', icon: Server, href: '/tools/connection-string-builder', color: 'bg-teal-500' },
  { id: 'uuid-generator', name: 'UUID', icon: Hash, href: '/tools/uuid-generator', color: 'bg-pink-500' },
];

interface SplitScreenLayoutProps {
  children: React.ReactNode;
  toolName?: string;
}

export function SplitScreenLayout({ children, toolName }: SplitScreenLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const currentTool = tools.find(tool => pathname.includes(tool.id)) || tools[0];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">DevTools</h1>
        </div>
        
        <div className="mx-6 flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = pathname.includes(tool.id);
            
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tool.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {children}
      </div>
    </div>
  );
}