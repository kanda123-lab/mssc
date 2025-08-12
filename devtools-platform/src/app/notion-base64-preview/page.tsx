'use client';

import { useState } from 'react';
import { NotionStyleLayout } from '@/components/layout/notion-style-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus,
  GripVertical,
  MoreHorizontal,
  Binary,
  FileText,
  ArrowUpDown,
  Copy,
  Save,
  CheckCircle,
  Info,
  Book,
  Code
} from 'lucide-react';

export default function NotionBase64PreviewPage() {
  const [blocks] = useState([
    {
      id: '1',
      type: 'heading',
      content: 'Base64 Encoder & Decoder',
      icon: '🔐'
    },
    {
      id: '2',
      type: 'text',
      content: 'Convert text to Base64 encoding or decode Base64 strings back to readable text. Base64 is commonly used for encoding binary data in text format for transmission over text-based protocols.'
    },
    {
      id: '3',
      type: 'toggle-mode'
    },
    {
      id: '4',
      type: 'input-block',
      mode: 'encode',
      content: 'Hello, World! This is a sample text to encode to Base64.'
    },
    {
      id: '5',
      type: 'output-block', 
      mode: 'encode',
      content: 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgdG8gZW5jb2RlIHRvIEJhc2U2NC4='
    },
    {
      id: '6',
      type: 'stats-block'
    },
    {
      id: '7',
      type: 'divider'
    },
    {
      id: '8',
      type: 'heading',
      content: 'About Base64 Encoding',
      icon: '📖'
    },
    {
      id: '9',
      type: 'info-callout'
    },
    {
      id: '10',
      type: 'examples-block'
    }
  ]);

  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

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

      case 'toggle-mode':
        return (
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Mode:</span>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setMode('encode')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'encode'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Binary className="w-4 h-4 mr-2 inline" />
                  Encode
                </button>
                <button
                  onClick={() => setMode('decode')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === 'decode'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2 inline" />
                  Decode
                </button>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Switch
              </Button>
            </div>
          </div>
        );
      
      case 'divider':
        return <hr className="border-gray-200" />;
      
      case 'input-block':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {mode === 'encode' ? (
                <>
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Plain Text Input</h3>
                </>
              ) : (
                <>
                  <Binary className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Base64 Input</h3>
                </>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}
                </span>
                <span className="text-xs text-gray-500">{block.content.length} characters</span>
              </div>
              <div className="p-4">
                <Textarea
                  value={block.content}
                  rows={6}
                  className="w-full font-mono text-sm border-0 resize-none focus:ring-0 p-0 bg-transparent"
                  placeholder={mode === 'encode' ? 'Enter your text here...' : 'Enter Base64 string here...'}
                />
              </div>
            </div>
          </div>
        );
      
      case 'output-block':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === 'encode' ? (
                  <>
                    <Binary className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Base64 Output</h3>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Decoded Text</h3>
                  </>
                )}
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Valid
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {mode === 'encode' ? 'Encoded Base64 result' : 'Decoded plain text'}
                </span>
                <span className="text-xs text-gray-500">{block.content.length} characters</span>
              </div>
              <div className="p-4">
                <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto max-h-48 break-all">
                  {block.content}
                </pre>
              </div>
            </div>
          </div>
        );

      case 'stats-block':
        const inputLength = 60; // Example length
        const outputLength = 84; // Example length
        const ratio = Math.round((outputLength / inputLength) * 100);
        
        return (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{inputLength}</div>
              <div className="text-sm text-gray-600">Input Characters</div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{outputLength}</div>
              <div className="text-sm text-gray-600">Output Characters</div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{ratio}%</div>
              <div className="text-sm text-gray-600">Size Ratio</div>
            </div>
          </div>
        );

      case 'info-callout':
        return (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">How Base64 Works</h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Base64 encoding converts binary data into ASCII text by using a 64-character alphabet (A-Z, a-z, 0-9, +, /). 
                  Every 3 bytes of input become 4 characters of output, which is why the encoded size is approximately 133% of the original.
                </p>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-xs text-blue-700">
                    <Book className="w-3 h-3" />
                    Learn more about Base64
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'examples-block':
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Quick Examples
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  name: 'Simple Greeting',
                  text: 'Hello, World!',
                  encoded: 'SGVsbG8sIFdvcmxkIQ==',
                  description: 'Basic text encoding'
                },
                {
                  name: 'JSON Data',
                  text: '{"name": "John"}',
                  encoded: 'eyJuYW1lIjogIkpvaG4ifQ==',
                  description: 'JSON object encoding'
                },
                {
                  name: 'Email Address',
                  text: 'user@example.com',
                  encoded: 'dXNlckBleGFtcGxlLmNvbQ==',
                  description: 'Email format encoding'
                },
                {
                  name: 'Special Characters',
                  text: 'Hello 🌍 World!',
                  encoded: 'SGVsbG8g8J+MjSBXb3JsZCE=',
                  description: 'Unicode with emoji'
                }
              ].map((example, index) => (
                <div key={index} className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">{example.name}</h5>
                      <Button variant="ghost" size="sm" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        Use Example
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{example.description}</p>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Original:</div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">{example.text}</code>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Base64:</div>
                        <code className="text-xs bg-blue-100 px-2 py-1 rounded font-mono break-all">{example.encoded}</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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