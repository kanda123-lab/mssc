'use client';

import { useState } from 'react';
import { GitHubDesktopLayout } from '@/components/layout/github-desktop-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Copy, 
  Save, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Globe,
  Code,
  Eye,
  Settings,
  Play,
  History,
  Plus
} from 'lucide-react';

export default function GitHubApiPreviewPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/users/octocat');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer your-token');
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
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'params'>('headers');

  return (
    <GitHubDesktopLayout>
      <div className="p-6 space-y-6">
        {/* Request Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            HTTP Request
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Request Line */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <select 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white font-mono min-w-[100px]"
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
                  className="flex-1 font-mono text-sm"
                />
                <Button className="bg-green-600 hover:bg-green-700 px-6">
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>

            {/* Request Tabs */}
            <div className="flex bg-gray-50 border-b border-gray-200">
              {[
                { key: 'headers', label: 'Headers', count: 2 },
                { key: 'body', label: 'Body', count: null },
                { key: 'params', label: 'Query Params', count: 0 },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 bg-white'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'headers' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Request Headers</label>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  <Textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder="key: value (one per line)"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              )}
              
              {activeTab === 'body' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Request Body</label>
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
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}
              
              {activeTab === 'params' && (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No query parameters added yet</p>
                  <Button variant="outline" size="sm" className="mt-3 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Parameter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Response Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Response
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">200 OK</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">245ms</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {/* Response Header */}
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Status: <strong className="text-green-600">200 OK</strong></span>
                  <span>Size: <strong>1.2 KB</strong></span>
                  <span>Time: <strong>245ms</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option>Pretty</option>
                    <option>Raw</option>
                    <option>Preview</option>
                  </select>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            {/* Response Body */}
            <div className="p-4">
              <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-[400px]">
                <code className="language-json">{response}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Save Request */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Request
          </h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter a name for this request..."
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="flex-1"
            />
            <Button 
              disabled={!requestName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Request
            </Button>
          </div>
        </div>

        {/* Request History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Requests
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'Get GitHub User', method: 'GET', url: 'api.github.com/users/octocat', status: 200, time: '245ms' },
              { name: 'Create Repository', method: 'POST', url: 'api.github.com/user/repos', status: 201, time: '1.2s' },
              { name: 'Update Profile', method: 'PATCH', url: 'api.github.com/user', status: 200, time: '892ms' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                    item.method === 'POST' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {item.method}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500 font-mono">{item.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className={`font-medium ${
                    item.status === 200 || item.status === 201 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.status}
                  </span>
                  <span>{item.time}</span>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GitHubDesktopLayout>
  );
}