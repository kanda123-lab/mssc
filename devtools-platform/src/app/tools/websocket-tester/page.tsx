'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard, formatTimestamp } from '@/lib/utils';
import { WebSocketConnection, WebSocketMessage } from '@/types';
import { 
  Play, 
  Square, 
  Send, 
  Copy, 
  Trash2, 
  Save, 
  Wifi, 
  MessageSquare,
  Clock,
  WifiOff,
  AlertTriangle,
  RefreshCw,
  History,
  BookOpen,
  Server
} from 'lucide-react';

export default function WebSocketTesterPage() {
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [protocols, setProtocols] = useState('');
  const [message, setMessage] = useState('Hello WebSocket!');
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [savedConnections, setSavedConnections] = useState<WebSocketConnection[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedConnections(data.webSocketConnections || []);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connect = () => {
    if (connection) {
      connection.close();
    }

    setStatus('connecting');
    setMessages([]);

    try {
      const protocolArray = protocols.split(',').map(p => p.trim()).filter(p => p);
      const ws = new WebSocket(url, protocolArray.length > 0 ? protocolArray : undefined);

      ws.onopen = () => {
        setStatus('connected');
        addMessage('System: Connected to WebSocket server', 'received');
      };

      ws.onmessage = (event) => {
        addMessage(`Server: ${event.data}`, 'received');
      };

      ws.onclose = (event) => {
        setStatus('disconnected');
        addMessage(`System: Connection closed (${event.code}: ${event.reason || 'No reason'})`, 'received');
      };

      ws.onerror = () => {
        setStatus('error');
        addMessage('System: Connection error occurred', 'received');
      };

      setConnection(ws);
    } catch (error) {
      setStatus('error');
      addMessage(`System: Failed to connect - ${error instanceof Error ? error.message : 'Unknown error'}`, 'received');
    }
  };

  const disconnect = () => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
  };

  const sendMessage = () => {
    if (connection && connection.readyState === WebSocket.OPEN && message.trim()) {
      try {
        connection.send(message);
        addMessage(`You: ${message}`, 'sent');
        setMessage('');
      } catch (error) {
        addMessage(`System: Failed to send message - ${error instanceof Error ? error.message : 'Unknown error'}`, 'received');
      }
    }
  };

  const addMessage = (content: string, type: 'sent' | 'received') => {
    const newMessage: WebSocketMessage = {
      id: generateId(),
      type,
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const saveConnection = () => {
    if (!connectionName.trim()) return;

    const newConnection: WebSocketConnection = {
      id: generateId(),
      name: connectionName.trim(),
      url,
      protocols: protocols.split(',').map(p => p.trim()).filter(p => p),
      messages: [],
      status: 'disconnected',
      timestamp: Date.now(),
    };

    StorageManager.updateArrayField('webSocketConnections', (connections) => [
      ...connections,
      newConnection,
    ]);

    setSavedConnections([...savedConnections, newConnection]);
    setConnectionName('');
  };

  const loadConnection = (savedConnection: WebSocketConnection) => {
    setUrl(savedConnection.url);
    setProtocols(savedConnection.protocols.join(', '));
    setConnectionName(savedConnection.name);
  };

  const deleteConnection = (id: string) => {
    StorageManager.updateArrayField('webSocketConnections', (connections) =>
      connections.filter(c => c.id !== id)
    );
    setSavedConnections(savedConnections.filter(c => c.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusDetails = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <Wifi className="h-3 w-3 mr-1 inline" />,
          label: 'Connected'
        };
      case 'connecting':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <RefreshCw className="h-3 w-3 mr-1 inline animate-spin" />,
          label: 'Connecting'
        };
      case 'error':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertTriangle className="h-3 w-3 mr-1 inline" />,
          label: 'Error'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <WifiOff className="h-3 w-3 mr-1 inline" />,
          label: 'Disconnected'
        };
    }
  };

  const statusDetails = getStatusDetails();

  const testServers = [
    {
      name: 'WebSocket Echo Server',
      url: 'wss://echo.websocket.org',
      description: 'Simple echo server for testing'
    },
    {
      name: 'Postman Echo Server',
      url: 'wss://ws.postman-echo.com/raw',
      description: 'Postman\'s WebSocket testing server'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <Wifi className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-4">WebSocket Tester</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Test WebSocket connections, send real-time messages, and monitor communication streams with comprehensive debugging tools.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-3 gap-8">
        {/* Main Connection Area */}
        <div className="space-y-6">
          {/* Connection Configuration */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-indigo-500" />
                <h2>Connection Configuration</h2>
              </div>
              <div className={`status-pill ${statusDetails.color}`}>
                {statusDetails.icon}
                {statusDetails.label}
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">WebSocket URL</label>
                <Input
                  placeholder="wss://echo.websocket.org"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={status === 'connected' || status === 'connecting'}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Protocols <span className="text-gray-500">(optional, comma-separated)</span>
                </label>
                <Input
                  placeholder="protocol1, protocol2"
                  value={protocols}
                  onChange={(e) => setProtocols(e.target.value)}
                  disabled={status === 'connected' || status === 'connecting'}
                  className="font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={connect}
                  disabled={!url || status === 'connecting' || status === 'connected'}
                  className="btn-primary"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button
                  onClick={disconnect}
                  disabled={status !== 'connected'}
                  className="btn-secondary"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Input
                  placeholder="Connection name to save..."
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={saveConnection} 
                  disabled={!connectionName.trim()}
                  className="btn-secondary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Message Interface */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h2>Messages</h2>
                <div className="text-sm text-gray-500">
                  ({messages.length} messages)
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  size="sm" 
                  onClick={clearMessages}
                  className="btn-secondary"
                  disabled={messages.length === 0}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(messages.map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.content}`).join('\n'))}
                  disabled={messages.length === 0}
                  className="btn-secondary"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto font-mono text-sm space-y-2 mb-6">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No messages yet</p>
                  <p className="text-sm text-gray-400">Connect to start receiving messages</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-2 p-2 rounded-lg ${
                    msg.type === 'sent' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : msg.content.startsWith('System:') 
                        ? 'bg-gray-100 border-l-4 border-gray-400' 
                        : 'bg-green-50 border-l-4 border-green-500'
                  }`}>
                    <Clock className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`text-sm break-words ${
                        msg.type === 'sent' 
                          ? 'text-blue-700' 
                          : msg.content.startsWith('System:') 
                            ? 'text-gray-600' 
                            : 'text-green-700'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-3">
              <Textarea
                placeholder="Enter message to send..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={3}
                className="flex-1 resize-none"
                disabled={status !== 'connected'}
              />
              <Button
                onClick={sendMessage}
                disabled={status !== 'connected' || !message.trim()}
                className="btn-primary"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            
            {status === 'connected' && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <strong>Tip:</strong> Press Enter to send messages quickly
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Test Servers */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3>Test Servers</h3>
            </div>
            
            <div className="space-y-3">
              {testServers.map((server, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => setUrl(server.url)}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 mb-1">
                      {server.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {server.description}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {server.url}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Connections */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-purple-500" />
              <h3>Saved Connections</h3>
            </div>
            
            {savedConnections.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved connections yet</p>
                <p className="text-sm text-gray-400">Save your WebSocket connections for quick access</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedConnections.map((conn) => (
                  <div key={conn.id} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {conn.name}
                        </h4>
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(conn.timestamp).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {conn.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => loadConnection(conn)}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => deleteConnection(conn.id)}
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
          <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="text-indigo-900 mb-4">⚡ Features</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Real-time message streaming
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Connection status monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Protocol support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Message history with timestamps
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Save and manage connections
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Copy message logs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}