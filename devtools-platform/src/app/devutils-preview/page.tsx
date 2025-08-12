'use client';

import { useState } from 'react';
import { DevUtilsLayout } from '@/components/layout/devutils-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Settings, Download, Upload, Eye } from 'lucide-react';

export default function DevUtilsPreviewPage() {
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

  return (
    <DevUtilsLayout>
      {/* Tool Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-gray-900">JSON Format/Validate ↑</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Input */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          {/* Panel Header */}
          <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Input:</span>
              <select className="text-xs border border-gray-300 rounded px-2 py-1">
                <option>Clipboard</option>
                <option>Sample</option>
                <option>Clear</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none border-0 p-0 focus:ring-0 bg-transparent"
              placeholder="Paste your JSON here..."
            />
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 flex flex-col">
          {/* Panel Header */}
          <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Preview:</span>
              <select className="text-xs border border-gray-300 rounded px-2 py-1">
                <option>Format</option>
                <option>Minify</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Open in Browser
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 p-4 bg-white">
            <pre className="w-full h-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
              <code className="language-json">{output}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>✓ Valid JSON</span>
          <span>Lines: 15</span>
          <span>Characters: 234</span>
        </div>
        <div>
          DevUtils.com 1.15 (132D)
        </div>
      </div>
    </DevUtilsLayout>
  );
}