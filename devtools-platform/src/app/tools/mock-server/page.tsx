'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard } from '@/lib/utils';
import { MockEndpoint } from '@/types';
import { Plus, Copy, Trash2, Settings } from 'lucide-react';

export default function MockServerPage() {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [serverPort, setServerPort] = useState(3001);
  const [editingEndpoint, setEditingEndpoint] = useState<MockEndpoint | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const data = StorageManager.getData();
    setEndpoints(data.mockEndpoints);
  }, []);

  const saveEndpoints = (newEndpoints: MockEndpoint[]) => {
    StorageManager.setData({ mockEndpoints: newEndpoints });
    setEndpoints(newEndpoints);
  };

  const createNewEndpoint = () => {
    const newEndpoint: MockEndpoint = {
      id: generateId(),
      name: 'New Endpoint',
      method: 'GET',
      path: '/api/example',
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello World' }, null, 2),
      },
      delay: 0,
      enabled: true,
    };
    setEditingEndpoint(newEndpoint);
    setShowEditor(true);
  };

  const saveEndpoint = (endpoint: MockEndpoint) => {
    const existingIndex = endpoints.findIndex(e => e.id === endpoint.id);
    let newEndpoints: MockEndpoint[];
    
    if (existingIndex >= 0) {
      newEndpoints = [...endpoints];
      newEndpoints[existingIndex] = endpoint;
    } else {
      newEndpoints = [...endpoints, endpoint];
    }
    
    saveEndpoints(newEndpoints);
    setShowEditor(false);
    setEditingEndpoint(null);
  };

  const deleteEndpoint = (id: string) => {
    const newEndpoints = endpoints.filter(e => e.id !== id);
    saveEndpoints(newEndpoints);
  };

  const toggleEndpoint = (id: string) => {
    const newEndpoints = endpoints.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    );
    saveEndpoints(newEndpoints);
  };

  const editEndpoint = (endpoint: MockEndpoint) => {
    setEditingEndpoint({ ...endpoint });
    setShowEditor(true);
  };

  const generateServerCode = () => {
    const serverCode = `
// Mock Server Configuration
// Copy this code and run it with Node.js

const express = require('express');
const cors = require('cors');
const app = express();
const port = ${serverPort};

app.use(cors());
app.use(express.json());

${endpoints.filter(e => e.enabled).map(endpoint => `
// ${endpoint.name}
app.${endpoint.method.toLowerCase()}('${endpoint.path}', (req, res) => {
  ${endpoint.delay ? `setTimeout(() => {` : ''}
  ${Object.entries(endpoint.response.headers).map(([key, value]) => 
    `res.set('${key}', '${value}');`
  ).join('\n  ')}
  res.status(${endpoint.response.status}).send(${JSON.stringify(endpoint.response.body)});
  ${endpoint.delay ? `}, ${endpoint.delay});` : ''}
});`).join('\n')}

app.listen(port, () => {
  console.log(\`Mock server running at http://localhost:\${port}\`);
});

// Install dependencies: npm install express cors
    `.trim();
    
    return serverCode;
  };

  const EndpointEditor = () => {
    const [localEndpoint, setLocalEndpoint] = useState<MockEndpoint | null>(null);

    // Update local endpoint when editing endpoint changes
    useEffect(() => {
      setLocalEndpoint(editingEndpoint);
    }, [editingEndpoint]);

    if (!editingEndpoint || !showEditor || !localEndpoint) return null;

    const updateHeaders = (headersText: string) => {
      try {
        const headers: Record<string, string> = {};
        headersText.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            headers[key.trim()] = valueParts.join(':').trim();
          }
        });
        setLocalEndpoint({
          ...localEndpoint,
          response: { ...localEndpoint.response, headers }
        });
      } catch {
        // Handle invalid headers gracefully
      }
    };

    const headersText = Object.entries(localEndpoint.response.headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Endpoint</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                value={localEndpoint.name}
                onChange={(e) => setLocalEndpoint({ ...localEndpoint, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Method</label>
                <select
                  className="w-full rounded-md border px-3 py-2 bg-background"
                  value={localEndpoint.method}
                  onChange={(e) => setLocalEndpoint({ ...localEndpoint, method: e.target.value as MockEndpoint['method'] })}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Path</label>
                <Input
                  value={localEndpoint.path}
                  onChange={(e) => setLocalEndpoint({ ...localEndpoint, path: e.target.value })}
                  placeholder="/api/endpoint"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status Code</label>
                <Input
                  type="number"
                  value={localEndpoint.response.status}
                  onChange={(e) => setLocalEndpoint({
                    ...localEndpoint,
                    response: { ...localEndpoint.response, status: parseInt(e.target.value) || 200 }
                  })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Delay (ms)</label>
                <Input
                  type="number"
                  value={localEndpoint.delay || 0}
                  onChange={(e) => setLocalEndpoint({ ...localEndpoint, delay: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Headers</label>
              <Textarea
                value={headersText}
                onChange={(e) => updateHeaders(e.target.value)}
                placeholder="Content-Type: application/json&#10;Access-Control-Allow-Origin: *"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Response Body</label>
              <Textarea
                value={localEndpoint.response.body}
                onChange={(e) => setLocalEndpoint({
                  ...localEndpoint,
                  response: { ...localEndpoint.response, body: e.target.value }
                })}
                placeholder="Response content..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                Cancel
              </Button>
              <Button onClick={() => saveEndpoint(localEndpoint)}>
                Save Endpoint
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mock Server</h1>
        <p className="text-muted-foreground">
          Create mock API endpoints for testing and development
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Endpoints</h2>
              <Button onClick={createNewEndpoint}>
                <Plus className="h-4 w-4 mr-2" />
                Add Endpoint
              </Button>
            </div>

            {endpoints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No endpoints created yet</p>
                <Button onClick={createNewEndpoint} variant="outline">
                  Create your first endpoint
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={endpoint.enabled}
                          onChange={() => toggleEndpoint(endpoint.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-mono rounded ${
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            }`}>
                              {endpoint.method}
                            </span>
                            <span className="font-mono text-sm">{endpoint.path}</span>
                            <span className="text-sm text-muted-foreground">→ {endpoint.response.status}</span>
                          </div>
                          <p className="text-sm font-medium">{endpoint.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => editEndpoint(endpoint)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteEndpoint(endpoint.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Server Code</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Copy this Node.js/Express code to run your mock server locally
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm font-medium">Port:</label>
              <Input
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(parseInt(e.target.value) || 3001)}
                className="w-24"
              />
              <Button size="sm" onClick={() => copyToClipboard(generateServerCode())}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>

            <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-64 font-mono">
              {generateServerCode()}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const jsonEndpoint: MockEndpoint = {
                    id: generateId(),
                    name: 'Sample JSON API',
                    method: 'GET',
                    path: '/api/users',
                    response: {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify([
                        { id: 1, name: 'John Doe', email: 'john@example.com' },
                        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                      ], null, 2),
                    },
                    delay: 0,
                    enabled: true,
                  };
                  saveEndpoints([...endpoints, jsonEndpoint]);
                }}
              >
                Add Sample JSON Endpoint
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const errorEndpoint: MockEndpoint = {
                    id: generateId(),
                    name: 'Error Response',
                    method: 'POST',
                    path: '/api/error',
                    response: {
                      status: 500,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ error: 'Internal Server Error', message: 'Something went wrong' }, null, 2),
                    },
                    delay: 1000,
                    enabled: true,
                  };
                  saveEndpoints([...endpoints, errorEndpoint]);
                }}
              >
                Add Error Endpoint
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const delayEndpoint: MockEndpoint = {
                    id: generateId(),
                    name: 'Slow Response',
                    method: 'GET',
                    path: '/api/slow',
                    response: {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: 'This response was delayed', timestamp: new Date().toISOString() }, null, 2),
                    },
                    delay: 3000,
                    enabled: true,
                  };
                  saveEndpoints([...endpoints, delayEndpoint]);
                }}
              >
                Add Slow Endpoint
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium mb-2">Setup Instructions</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the server code</li>
              <li>Create a new directory</li>
              <li>Run <code className="bg-muted px-1 rounded">npm init -y</code></li>
              <li>Install: <code className="bg-muted px-1 rounded">npm install express cors</code></li>
              <li>Save code as <code className="bg-muted px-1 rounded">server.js</code></li>
              <li>Run: <code className="bg-muted px-1 rounded">node server.js</code></li>
            </ol>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium mb-2">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple HTTP methods</li>
              <li>• Custom headers & status codes</li>
              <li>• Response delays</li>
              <li>• Enable/disable endpoints</li>
              <li>• Export to Node.js/Express</li>
            </ul>
          </div>
        </div>
      </div>

      <EndpointEditor />
    </div>
  );
}