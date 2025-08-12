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
  Zap
} from 'lucide-react';

const tools = [
  { id: 'json-formatter', name: 'JSON Format/Validate', icon: Braces, href: '/tools/json-formatter' },
  { id: 'base64', name: 'Base64 String Encode/Decode', icon: Binary, href: '/tools/base64' },
  { id: 'api-tester', name: 'API Tester', icon: Globe, href: '/tools/api-tester' },
  { id: 'websocket-tester', name: 'WebSocket Tester', icon: Wifi, href: '/tools/websocket-tester' },
  { id: 'sql-query-builder', name: 'SQL Query Builder', icon: Database, href: '/tools/sql-query-builder' },
  { id: 'connection-string-builder', name: 'Database Connection Builder', icon: Server, href: '/tools/connection-string-builder' },
  { id: 'mock-server', name: 'Mock Server', icon: Code, href: '/tools/mock-server' },
  { id: 'html-preview', name: 'HTML Preview', icon: FileText, href: '/tools/html-preview' },
  { id: 'uuid-generator', name: 'UUID Generate/Decode', icon: Hash, href: '/tools/uuid-generator' },
];

interface DevUtilsLayoutProps {
  children: React.ReactNode;
}

export function DevUtilsLayout({ children }: DevUtilsLayoutProps) {
  const pathname = usePathname();
  const [selectedTool, setSelectedTool] = useState(pathname);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">DevUtils</span>
        </div>
        
        <div className="ml-auto flex items-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-900">Demo</a>
          <a href="#" className="hover:text-gray-900">FAQs</a>
          <a href="#" className="hover:text-gray-900">Changelog</a>
          <a href="#" className="hover:text-gray-900">Pricing</a>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Download
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Back to home link */}
          <div className="p-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-white bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <span className="text-sm">← Back to home page</span>
            </Link>
          </div>

          {/* Tools list */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                All Screenshots
              </div>
              <nav className="space-y-1">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = pathname === tool.href;
                  
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSelectedTool(tool.href)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tool.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}