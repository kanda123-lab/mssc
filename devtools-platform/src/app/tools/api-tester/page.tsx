'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard } from '@/lib/utils';
import { APIRequest } from '@/types';
import { Save, Send, Copy, Trash2, Globe, Clock, Zap, BookOpen, History } from 'lucide-react';

export default function APITesterPage() {
  const [request, setRequest] = useState<Partial<APIRequest>>({
    method: 'GET',
    url: 'https://api.github.com/users/octocat',
    headers: {},
    body: '',
  });

  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<APIRequest[]>([]);
  const [headersText, setHeadersText] = useState('');
  const [requestName, setRequestName] = useState('');

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedRequests(data.apiRequests || []);
  }, []);

  const parseHeaders = (headersString: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    headersString.split('\n').forEach(line => {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        headers[key.trim()] = value.join(':').trim();
      }
    });
    return headers;
  };

  const stringifyHeaders = (headers: Record<string, string>): string => {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const sendRequest = async () => {
    if (!request.url) return;

    setIsLoading(true);
    setResponse(null);
    const startTime = Date.now();

    try {
      const headers = parseHeaders(headersText);
      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
      };

      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
        fetchOptions.body = request.body;
      }

      const res = await fetch(request.url, fetchOptions);
      const responseBody = await res.text();
      const responseHeaders: Record<string, string> = {};
      
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: Date.now() - startTime,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error',
        time: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequest = () => {
    if (!request.url || !requestName.trim()) return;

    const newRequest: APIRequest = {
      id: generateId(),
      name: requestName.trim(),
      method: request.method as APIRequest['method'],
      url: request.url,
      headers: parseHeaders(headersText),
      body: request.body || '',
      timestamp: Date.now(),
    };

    StorageManager.updateArrayField('apiRequests', (requests) => [
      ...requests,
      newRequest,
    ]);

    setSavedRequests([...savedRequests, newRequest]);
    setRequestName('');
  };

  const loadRequest = (savedRequest: APIRequest) => {
    setRequest(savedRequest);
    setHeadersText(stringifyHeaders(savedRequest.headers));
    setRequestName(savedRequest.name);
  };

  const deleteRequest = (id: string) => {
    StorageManager.updateArrayField('apiRequests', (requests) =>
      requests.filter(r => r.id !== id)
    );
    setSavedRequests(savedRequests.filter(r => r.id !== id));
  };

  const quickExamples = [
    {
      name: 'GitHub User API',
      method: 'GET' as const,
      url: 'https://api.github.com/users/octocat',
      description: 'Get GitHub user information'
    },
    {
      name: 'JSONPlaceholder Posts',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Sample JSON API endpoint'
    },
    {
      name: 'HTTP Bin POST',
      method: 'POST' as const,
      url: 'https://httpbin.org/post',
      description: 'Test POST requests with echo'
    }
  ];

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50 border-green-200';
    if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (status >= 500) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg">
            <Globe className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-4">API Tester</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Test HTTP APIs with ease. Send requests, analyze responses, and save your favorite endpoints for quick access.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-3 gap-8">
        {/* Main Request Area */}
        <div className="space-y-6">
          {/* Request Builder */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Send className="h-5 w-5 text-purple-500" />
              <h2>HTTP Request</h2>
            </div>
            
            <div className="space-y-6">
              {/* Method and URL */}
              <div className="flex gap-3">
                <select
                  className="min-w-[120px]"
                  value={request.method}
                  onChange={(e) => setRequest({ ...request, method: e.target.value as APIRequest['method'] })}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
                <Input
                  placeholder="Enter API URL (e.g., https://api.example.com/data)"
                  value={request.url || ''}
                  onChange={(e) => setRequest({ ...request, url: e.target.value })}
                  className="flex-1"
                />
                <Button
                  onClick={sendRequest}
                  disabled={isLoading || !request.url}
                  className="btn-primary min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>

              {/* Headers */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Headers (one per line, format: key: value)
                </label>
                <Textarea
                  placeholder="Content-Type: application/json&#10;Authorization: Bearer your-token"
                  value={headersText}
                  onChange={(e) => setHeadersText(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              {/* Request Body */}
              {request.method !== 'GET' && request.method !== 'HEAD' && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Request Body
                  </label>
                  <Textarea
                    placeholder='{"key": "value"}'
                    value={request.body || ''}
                    onChange={(e) => setRequest({ ...request, body: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {/* Save Request */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Input
                  placeholder="Enter request name to save..."
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={saveRequest}
                  disabled={!request.url || !requestName.trim()}
                  className="btn-secondary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Request
                </Button>
              </div>
            </div>
          </div>

          {/* Response Section */}
          {response && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <h2>Response</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded-lg border font-semibold ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {response.time}ms
                  </div>
                </div>
              </div>

              {/* Response Headers */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Response Headers</h3>
                  <Button
                    onClick={() => copyToClipboard(stringifyHeaders(response.headers))}
                    className="btn-secondary text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <pre className="text-sm font-mono text-gray-700">
                    {stringifyHeaders(response.headers)}
                  </pre>
                </div>
              </div>

              {/* Response Body */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Response Body</h3>
                  <Button
                    onClick={() => copyToClipboard(response.body)}
                    className="btn-secondary text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                    {response.body}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Examples */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3>Quick Examples</h3>
            </div>
            
            <div className="space-y-3">
              {quickExamples.map((example, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setRequest({
                      method: example.method,
                      url: example.url,
                      headers: {},
                      body: '',
                    });
                    setHeadersText('');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 mb-1">
                        {example.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {example.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                          {example.method}
                        </span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
                          {example.url}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Requests */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-green-500" />
              <h3>Saved Requests</h3>
            </div>
            
            {savedRequests.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved requests yet</p>
                <p className="text-sm text-gray-400">Save your API requests for quick access</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRequests.map((savedRequest) => (
                  <div key={savedRequest.id} className="p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {savedRequest.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                            {savedRequest.method}
                          </span>
                          <span>•</span>
                          <span>{new Date(savedRequest.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {savedRequest.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => loadRequest(savedRequest)}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load Request
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => deleteRequest(savedRequest.id)}
                        className="btn-secondary text-xs px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <h3 className="text-purple-900 mb-4">⚡ Features</h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                All HTTP methods supported
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Custom headers and body
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Response time measurement
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Save and organize requests
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Copy response data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Status code indicators
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}