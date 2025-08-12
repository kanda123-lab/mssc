'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Minimize2,
  Save,
  RefreshCw,
  Braces,
  Eye,
  Settings,
  History,
  BookOpen,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function DemoJsonFormatterPage() {
  const [input, setInput] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`);
  
  const [output, setOutput] = useState(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": [
    "reading",
    "coding",
    "hiking"
  ]
}`);

  const [mode, setMode] = useState<'format' | 'minify'>('format');
  const [saveName, setSaveName] = useState('');
  const [isValid, setIsValid] = useState(true);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setIsValid(true);
      setMode('format');
    } catch (error) {
      setIsValid(false);
      setOutput('Invalid JSON: ' + (error as Error).message);
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setIsValid(true);
      setMode('minify');
    } catch (error) {
      setIsValid(false);
      setOutput('Invalid JSON: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
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
              <Braces className="w-5 h-5 text-orange-600" />
              <h1 className="text-xl font-semibold">JSON Formatter</h1>
              <Badge variant="outline">Demo Mode</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Input */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Left Panel Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">JSON Input</span>
              {isValid ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Invalid
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                <Upload className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0 p-0 bg-transparent"
              placeholder="Paste your JSON here..."
            />
          </div>

          {/* Left Panel Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Braces className="w-4 h-4" />
                <span>{input.split('\n').length} lines • {input.length} characters</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Quick Examples
                </h4>
                <div className="space-y-1">
                  {[
                    { name: 'User Profile', json: '{"name":"John","age":30,"active":true}' },
                    { name: 'API Response', json: '{"status":"success","data":[],"message":"OK"}' },
                    { name: 'Config File', json: '{"theme":"dark","auto_save":true,"plugins":["eslint"]}' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(example.json)}
                      className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {/* Right Panel Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-900">Formatted Output</span>
              <div className="flex items-center gap-1">
                <Button
                  onClick={formatJson}
                  size="sm"
                  className="text-xs h-7"
                >
                  Format
                </Button>
                <Button
                  onClick={minifyJson}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Minify
                </Button>
              </div>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="h-full bg-white border border-gray-200 rounded-lg p-4">
              <pre className="h-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
                <code className="language-json">{output}</code>
              </pre>
            </div>
          </div>

          {/* Right Panel Footer */}
          <div className="border-t border-gray-200 bg-white">
            <div className="p-4 space-y-3">
              {/* Save Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Name to save this format..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button 
                  disabled={!saveName.trim() || !output}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>

              {/* Demo Notice */}
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🚀 This is demo mode. Sign in for saving, history, and advanced features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}