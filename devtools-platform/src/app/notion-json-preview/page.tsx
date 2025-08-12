'use client';

import { useState } from 'react';
import { NotionStyleLayout } from '@/components/layout/notion-style-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  GripVertical,
  MoreHorizontal,
  Code,
  Eye,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Upload,
  Save,
  FileText,
  Braces,
  Zap,
  Settings
} from 'lucide-react';

export default function NotionJsonPreviewPage() {
  const [blocks, setBlocks] = useState([
    {
      id: '1',
      type: 'heading',
      content: 'JSON Formatter & Validator',
      icon: '🔧'
    },
    {
      id: '2',
      type: 'text',
      content: 'Transform and validate your JSON data with ease. This tool provides real-time validation, formatting, and minification capabilities.'
    },
    {
      id: '3',
      type: 'divider'
    },
    {
      id: '4',
      type: 'json-input',
      content: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`,
      title: 'JSON Input'
    },
    {
      id: '5',
      type: 'json-output',
      content: `{
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
}`,
      title: 'Formatted Output',
      status: 'valid'
    },
    {
      id: '6',
      type: 'actions'
    },
    {
      id: '7',
      type: 'divider'
    },
    {
      id: '8',
      type: 'heading',
      content: 'Recent Formats',
      icon: '📁'
    },
    {
      id: '9',
      type: 'saved-items'
    }
  ]);

  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [mode, setMode] = useState<'format' | 'minify'>('format');

  const renderBlock = (block: any) => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{block.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">{block.content}</h1>
          </div>
        );
      
      case 'text':
        return (
          <p className="text-gray-600 leading-relaxed">{block.content}</p>
        );
      
      case 'divider':
        return <hr className="border-gray-200" />;
      
      case 'json-input':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">Paste or type your JSON</span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                    <Upload className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <Textarea
                  value={block.content}
                  onChange={() => {}}
                  rows={12}
                  className="w-full font-mono text-sm border-0 resize-none focus:ring-0 p-0 bg-transparent"
                  placeholder="Enter your JSON here..."
                />
              </div>
            </div>
          </div>
        );
      
      case 'json-output':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">{block.title}</h3>
                {block.status === 'valid' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Valid JSON
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === 'format' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('format')}
                  className="text-xs"
                >
                  Format
                </Button>
                <Button
                  variant={mode === 'minify' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => setMode('minify')}
                  className="text-xs"
                >
                  Minify
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">Formatted JSON output</span>
                <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-96">
                  <code className="language-json">{block.content}</code>
                </pre>
              </div>
            </div>
          </div>
        );
      
      case 'actions':
        return (
          <div className="flex flex-wrap gap-3 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4" />
              Save Format
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Result
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
          </div>
        );
      
      case 'saved-items':
        return (
          <div className="space-y-3">
            {[
              { name: 'User Profile Data', date: '2 hours ago', size: '1.2 KB', valid: true },
              { name: 'API Response Config', date: 'Yesterday', size: '3.4 KB', valid: true },
              { name: 'Settings JSON', date: '3 days ago', size: '856 B', valid: false }
            ].map((item, index) => (
              <div key={index} className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Braces className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.date} • {item.size}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="text-xs">
                    Open
                  </Button>
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <NotionStyleLayout>
      <div className="py-12 px-8">
        <div className="space-y-8">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="group relative"
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              {/* Block Controls */}
              {hoveredBlock === block.id && (
                <div className="absolute -left-8 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
              
              {/* Block Content */}
              <div className="block-content">
                {renderBlock(block)}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Block */}
        <div className="flex items-center gap-2 pt-4 text-gray-400 hover:text-gray-600 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add a block</span>
        </div>
      </div>
    </NotionStyleLayout>
  );
}