'use client';

import { useState } from 'react';
import { CompactTabsLayout } from '@/components/layout/compact-tabs-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  BookOpen
} from 'lucide-react';

export default function CompactJsonPreviewPage() {
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

  return (
    <CompactTabsLayout>
      <div className="flex h-full">
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

          {/* Left Panel Stats */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Braces className="w-4 h-4" />
              <span>{input.split('\n').length} lines • {input.length} characters</span>
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
                  variant={mode === 'format' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('format')}
                  className="text-xs h-7"
                >
                  Format
                </Button>
                <Button
                  variant={mode === 'minify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('minify')}
                  className="text-xs h-7"
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Minify
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
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
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="space-y-3">
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

              {/* Quick Examples */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Examples
                </h4>
                <div className="flex gap-1">
                  {[
                    { name: 'User', json: '{"name":"John","age":30}' },
                    { name: 'API', json: '{"status":"success","data":[]}' },
                    { name: 'Config', json: '{"theme":"dark","save":true}' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(example.json)}
                      className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded border"
                    >
                      {example.name}
                    </button>
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