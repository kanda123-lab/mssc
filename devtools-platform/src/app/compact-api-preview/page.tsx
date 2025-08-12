'use client';

import { useState } from 'react';
import { CompactTabsLayout } from '@/components/layout/compact-tabs-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Copy, 
  Save, 
  Globe, 
  Code,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  BookOpen,
  History
} from 'lucide-react';

export default function CompactApiPreviewPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/users/octocat');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer token');
  const [body, setBody] = useState('');
  const [response] = useState(`{
  "login": "octocat",
  "id": 1,
  "node_id": "MDQ6VXNlcjE=",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "url": "https://api.github.com/users/octocat",
  "html_url": "https://github.com/octocat",
  "type": "User",
  "site_admin": false
}`);
  
  const [requestName, setRequestName] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');

  return (
    <CompactTabsLayout>
      <div className="flex h-full">
        {/* Left Panel - Request Configuration */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Request Header */}
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">HTTP Request</span>
              </div>
              
              <div className="flex gap-2">
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white font-mono min-w-[80px]"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter API URL"
                  className="flex-1 font-mono text-sm h-9"
                />
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>

          {/* Request Tabs */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('headers')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'headers'
                  ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Headers (2)
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'body'
                  ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Body
            </button>
          </div>

          {/* Request Content */}
          <div className="flex-1 p-4">
            {activeTab === 'headers' && (
              <div className="h-full">
                <Textarea
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder="key: value (one per line)"
                  className="w-full h-full font-mono text-sm resize-none border-gray-300"
                />
              </div>
            )}
            
            {activeTab === 'body' && (
              <div className="h-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Request Body</span>
                  <select className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option>JSON</option>
                    <option>Form Data</option>
                    <option>Raw</option>
                  </select>
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  className="w-full h-full font-mono text-sm resize-none border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Left Panel Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="space-y-3">
              {/* Save Request */}
              <div className="flex gap-2">
                <Input
                  placeholder="Request name..."
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button 
                  disabled={!requestName.trim()}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>

              {/* Quick Examples */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Examples
                </h4>
                <div className="space-y-1">
                  {[
                    { name: 'GitHub User', method: 'GET', url: 'api.github.com/users/octocat' },
                    { name: 'JSON Post', method: 'POST', url: 'httpbin.org/post' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setUrl(`https://${example.url}`)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded flex items-center justify-between"
                    >
                      <span>{example.name}</span>
                      <span className={`px-1.5 py-0.5 text-xs rounded text-white ${
                        example.method === 'GET' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {example.method}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Response */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {/* Response Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-900">Response</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                  <CheckCircle className="w-3 h-3" />
                  200 OK
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <Clock className="w-3 h-3" />
                  245ms
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <select className="text-xs border border-gray-300 rounded px-2 py-1 h-7">
                <option>Pretty</option>
                <option>Raw</option>
                <option>Headers</option>
              </select>
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Response Content */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="h-full bg-white border border-gray-200 rounded-lg p-4">
              <pre className="h-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
                <code className="language-json">{response}</code>
              </pre>
            </div>
          </div>

          {/* Right Panel Footer */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="space-y-3">
              {/* Response Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Status: <strong className="text-green-600">200 OK</strong></span>
                <span>Size: <strong>1.2 KB</strong></span>
                <span>Time: <strong>245ms</strong></span>
              </div>

              {/* Recent Requests */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent
                </h4>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {[
                    { name: 'GitHub User API', method: 'GET', status: 200, time: '245ms' },
                    { name: 'Create Post', method: 'POST', status: 201, time: '1.2s' }
                  ].map((request, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          request.status >= 200 && request.status < 300 ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-gray-900">{request.name}</span>
                        <span className={`px-1.5 py-0.5 text-xs rounded text-white ${
                          request.method === 'GET' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {request.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{request.time}</span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Play className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CompactTabsLayout>
  );
}