'use client';

import { useState } from 'react';
import { NotionStyleLayout } from '@/components/layout/notion-style-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  GripVertical,
  MoreHorizontal,
  Send,
  Globe,
  Code,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  Save,
  Clock,
  Settings,
  Play,
  FileText
} from 'lucide-react';

export default function NotionApiPreviewPage() {
  const [blocks] = useState([
    {
      id: '1',
      type: 'heading',
      content: 'API Tester & Documentation',
      icon: '🌐'
    },
    {
      id: '2',
      type: 'text',
      content: 'Test HTTP APIs, document endpoints, and save request collections. This workspace helps you organize and test your API integrations efficiently.'
    },
    {
      id: '3',
      type: 'callout',
      content: 'Testing GitHub Users API - Returns user profile information',
      type_detail: 'info'
    },
    {
      id: '4',
      type: 'api-request',
      method: 'GET',
      url: 'https://api.github.com/users/octocat',
      headers: 'Content-Type: application/json\nUser-Agent: DevTools-API-Tester',
      body: ''
    },
    {
      id: '5',
      type: 'api-response',
      status: 200,
      statusText: 'OK',
      time: 245,
      response: `{
  "login": "octocat",
  "id": 1,
  "node_id": "MDQ6VXNlcjE=",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "url": "https://api.github.com/users/octocat",
  "html_url": "https://github.com/octocat",
  "type": "User",
  "site_admin": false
}`
    },
    {
      id: '6',
      type: 'divider'
    },
    {
      id: '7',
      type: 'heading',
      content: 'Request Collection',
      icon: '📚'
    },
    {
      id: '8',
      type: 'request-list'
    }
  ]);

  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{block.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">{block.content}</h1>
          </div>
        );
      
      case 'text':
        return (
          <p className="text-gray-600 leading-relaxed">{block.content}</p>
        );

      case 'callout':
        return (
          <div className={`p-4 rounded-xl border-l-4 ${
            block.type_detail === 'info' 
              ? 'bg-blue-50 border-blue-500' 
              : 'bg-yellow-50 border-yellow-500'
          }`}>
            <div className="flex items-start gap-3">
              <div className="text-xl">💡</div>
              <p className="text-gray-700 font-medium">{block.content}</p>
            </div>
          </div>
        );
      
      case 'divider':
        return <hr className="border-gray-200" />;
      
      case 'api-request':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">HTTP Request</h3>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Request Line */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-3">
                  <select 
                    value={block.method}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white font-mono min-w-[100px]"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <Input
                    value={block.url}
                    className="flex-1 font-mono text-sm"
                    placeholder="Enter API URL"
                  />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>

              {/* Request Details */}
              <div className="divide-y divide-gray-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Headers</h4>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <Textarea
                    value={block.headers}
                    rows={3}
                    className="font-mono text-sm"
                    placeholder="key: value (one per line)"
                  />
                </div>

                {block.method !== 'GET' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Request Body</h4>
                      <select className="text-xs border border-gray-300 rounded px-2 py-1">
                        <option>JSON</option>
                        <option>Form Data</option>
                        <option>Raw</option>
                      </select>
                    </div>
                    <Textarea
                      value={block.body}
                      rows={4}
                      className="font-mono text-sm"
                      placeholder='{"key": "value"}'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'api-response':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Response</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  block.status >= 200 && block.status < 300
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {block.status} {block.statusText}
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{block.time}ms</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Status: <strong className="text-green-600">{block.status} {block.statusText}</strong></span>
                  <span>Size: <strong>1.2 KB</strong></span>
                  <span>Time: <strong>{block.time}ms</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option>Pretty</option>
                    <option>Raw</option>
                    <option>Headers</option>
                  </select>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                  <code className="language-json">{block.response}</code>
                </pre>
              </div>
            </div>
          </div>
        );

      case 'request-list':
        return (
          <div className="space-y-3">
            {[
              { 
                name: 'Get GitHub User',
                method: 'GET',
                url: 'api.github.com/users/octocat',
                status: 200,
                description: 'Fetch user profile from GitHub API',
                lastRun: '5 minutes ago'
              },
              {
                name: 'Create Repository', 
                method: 'POST',
                url: 'api.github.com/user/repos',
                status: 201,
                description: 'Create a new repository for authenticated user',
                lastRun: '2 hours ago'
              },
              {
                name: 'Update User Profile',
                method: 'PATCH', 
                url: 'api.github.com/user',
                status: 200,
                description: 'Update the authenticated user profile',
                lastRun: '1 day ago'
              }
            ].map((request, index) => (
              <div key={index} className="group flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    request.method === 'GET' ? 'bg-blue-500' :
                    request.method === 'POST' ? 'bg-green-500' :
                    request.method === 'PATCH' ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {request.method}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{request.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${
                      request.status >= 200 && request.status < 300 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-mono">{request.url}</span>
                    <span>•</span>
                    <span>Last run {request.lastRun}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <NotionStyleLayout>
      <div className="py-12 px-8">
        <div className="space-y-8">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="group relative"
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              {/* Block Controls */}
              {hoveredBlock === block.id && (
                <div className="absolute -left-8 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
              
              {/* Block Content */}
              <div className="block-content">
                {renderBlock(block)}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Block */}
        <div className="flex items-center gap-2 pt-4 text-gray-400 hover:text-gray-600 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add a block</span>
        </div>
      </div>
    </NotionStyleLayout>
  );
}