'use client';

import { useState } from 'react';
import { DevUtilsLayout } from '@/components/layout/devutils-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Settings, Send, Globe, Clock } from 'lucide-react';

export default function DevUtilsApiPreviewPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/users/octocat');
  const [headers] = useState('Content-Type: application/json\nAuthorization: Bearer token');
  const [body] = useState('');
  const [response] = useState(`{
  "login": "octocat",
  "id": 1,
  "node_id": "MDQ6VXNlcjE=",
  "avatar_url": "https://github.com/images/error/octocat_happy.gif",
  "gravatar_id": "",
  "url": "https://api.github.com/users/octocat",
  "html_url": "https://github.com/octocat",
  "followers_url": "https://api.github.com/users/octocat/followers",
  "following_url": "https://api.github.com/users/octocat/following{/other_user}",
  "type": "User",
  "site_admin": false
}`);

  return (
    <DevUtilsLayout>
      {/* Tool Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-gray-900">API Tester ↑</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Request Section */}
      <div className="border-b border-gray-200">
        {/* Method and URL */}
        <div className="p-4 bg-white">
          <div className="flex gap-3">
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white min-w-[100px]"
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
              Send
            </Button>
          </div>
        </div>

        {/* Headers and Body Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border-b-2 border-blue-600">
            Headers (2)
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
            Body
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
            Query Params
          </button>
        </div>

        {/* Headers Content */}
        <div className="p-4 bg-white">
          <Textarea
            value={headers}
            readOnly
            rows={3}
            className="w-full font-mono text-sm bg-gray-50 border-gray-300"
            placeholder="key: value (one per line)"
          />
        </div>
      </div>

      {/* Response Section */}
      <div className="flex-1 flex flex-col">
        {/* Response Header */}
        <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">Response:</span>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">200 OK</span>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>245ms</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-xs border border-gray-300 rounded px-2 py-1">
              <option>JSON</option>
              <option>Raw</option>
              <option>Headers</option>
            </select>
            <Button variant="ghost" size="sm" className="text-xs">
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>

        {/* Response Content */}
        <div className="flex-1 p-4 bg-white overflow-auto">
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
            <code className="language-json">{response}</code>
          </pre>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Status: 200 OK</span>
          <span>Size: 1.2 KB</span>
          <span>Time: 245ms</span>
        </div>
        <div>
          DevUtils.com 1.15 (132D)
        </div>
      </div>
    </DevUtilsLayout>
  );
}