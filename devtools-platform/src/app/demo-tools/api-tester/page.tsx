'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  History,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function DemoApiTesterPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/users/octocat');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer your-token');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(`{
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
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(245);
  const [statusCode, setStatusCode] = useState(200);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      // Demo simulation - in real app this would make actual HTTP request
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      
      setResponseTime(Date.now() - startTime);
      setStatusCode(200);
      setResponse(`{
  "demo": true,
  "message": "This is a demo response",
  "timestamp": "${new Date().toISOString()}",
  "method": "${method}",
  "url": "${url}",
  "status": "success"
}`);
    } catch (error) {
      setStatusCode(500);
      setResponse(`{
  "error": "Demo error simulation",
  "message": "This is a simulated error response"
}`);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo">
                <Home className="w-4 h-4 mr-2" />
                Back to Demo
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-semibold">API Tester</h1>
              <Badge variant="outline">Demo Mode</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={sendRequest} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
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
              Headers
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
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              {/* Quick Examples */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Examples
                </h4>
                <div className="space-y-1">
                  {[
                    { name: 'GitHub User', method: 'GET', url: 'https://api.github.com/users/octocat' },
                    { name: 'JSONPlaceholder Post', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' },
                    { name: 'HTTP Status', method: 'GET', url: 'https://httpstat.us/200' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setUrl(example.url);
                        setMethod(example.method);
                      }}
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
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  statusCode >= 200 && statusCode < 300 
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  {statusCode} {statusCode === 200 ? 'OK' : 'Error'}
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <Clock className="w-3 h-3" />
                  {responseTime}ms
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={copyResponse} className="text-xs h-7">
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
          <div className="border-t border-gray-200 bg-white">
            <div className="p-4 space-y-3">
              {/* Response Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Status: <strong className={statusCode >= 200 && statusCode < 300 ? 'text-green-600' : 'text-red-600'}>
                  {statusCode} {statusCode === 200 ? 'OK' : 'Error'}
                </strong></span>
                <span>Time: <strong>{responseTime}ms</strong></span>
                <span>Size: <strong>{(response.length / 1024).toFixed(2)} KB</strong></span>
              </div>

              {/* Demo Notice */}
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🚀 Demo mode - Responses are simulated. Sign in for real API testing and history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}