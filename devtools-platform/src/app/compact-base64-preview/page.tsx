'use client';

import { useState } from 'react';
import { CompactTabsLayout } from '@/components/layout/compact-tabs-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Save, 
  Binary,
  FileText,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  BookOpen,
  History,
  Upload,
  Download
} from 'lucide-react';

export default function CompactBase64PreviewPage() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, World! This is a sample text to encode to Base64.');
  const [output, setOutput] = useState('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgdG8gZW5jb2RlIHRvIEJhc2U2NC4=');
  const [saveName, setSaveName] = useState('');

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    // Swap input/output
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <CompactTabsLayout>
      <div className="flex h-full">
        {/* Left Panel - Input */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Left Panel Header */}
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mode === 'encode' ? (
                    <>
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Plain Text Input</span>
                    </>
                  ) : (
                    <>
                      <Binary className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">Base64 Input</span>
                    </>
                  )}
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                    <CheckCircle className="w-3 h-3" />
                    Valid
                  </div>
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

              <Button
                onClick={switchMode}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
              </Button>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0 p-0 bg-transparent"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            />
          </div>

          {/* Left Panel Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {mode === 'encode' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Binary className="w-4 h-4" />
                )}
                <span>{input.length} characters</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Examples
                </h4>
                <div className="flex gap-1">
                  {[
                    { name: 'Simple', text: 'Hello, World!' },
                    { name: 'JSON', text: '{"name": "John"}' },
                    { name: 'Email', text: 'user@example.com' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(example.text)}
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

        {/* Right Panel - Output */}
        <div className="flex-1 bg-gray-50 flex flex-col">
          {/* Right Panel Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
            <div className="flex items-center gap-2">
              {mode === 'encode' ? (
                <>
                  <Binary className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">Base64 Output</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">Decoded Text</span>
                </>
              )}
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
              <pre className="h-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto break-all">
                {output || 'Output will appear here...'}
              </pre>
            </div>
          </div>

          {/* Conversion Statistics */}
          <div className="border-b border-gray-200 bg-white p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{input.length}</div>
                <div className="text-xs text-gray-600">Input</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{output.length}</div>
                <div className="text-xs text-gray-600">Output</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {input.length > 0 ? Math.round((output.length / input.length) * 100) : 0}%
                </div>
                <div className="text-xs text-gray-600">Ratio</div>
              </div>
            </div>
          </div>

          {/* Right Panel Footer */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="space-y-3">
              {/* Save Section */}
              <div className="flex gap-2">
                <Input
                  placeholder="Name to save this conversion..."
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

              {/* Recent Conversions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent
                </h4>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {[
                    { name: 'API Token', type: 'encode', time: '5m ago', size: '64 chars' },
                    { name: 'Config Data', type: 'encode', time: '1h ago', size: '128 chars' }
                  ].map((conversion, index) => (
                    <div key={index} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50 rounded text-xs cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs ${
                          conversion.type === 'encode' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {conversion.type === 'encode' ? 'E' : 'D'}
                        </div>
                        <span className="text-gray-900">{conversion.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>{conversion.size}</span>
                        <span>•</span>
                        <span>{conversion.time}</span>
                      </div>
                    </div>
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