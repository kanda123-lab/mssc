'use client';

import { useState } from 'react';
import { DevUtilsLayout } from '@/components/layout/devutils-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Settings, ArrowUpDown, RefreshCw } from 'lucide-react';

export default function DevUtilsBase64PreviewPage() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, World! This is a sample text to encode.');
  const [output, setOutput] = useState('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgdG8gZW5jb2RlLg==');

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    // Swap input/output
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <DevUtilsLayout>
      {/* Tool Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-gray-900">Base64 String Encode/Decode ↑</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={switchMode}>
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
          </Button>
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
              <span className="text-xs text-gray-500">
                {mode === 'encode' ? 'Plain Text' : 'Base64'}
              </span>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full font-mono text-sm resize-none border-0 p-0 focus:ring-0 bg-transparent"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            />
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex-1 flex flex-col">
          {/* Panel Header */}
          <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Output:</span>
              <span className="text-xs text-green-600">✓ Valid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {mode === 'encode' ? 'Base64' : 'Plain Text'}
              </span>
              <Button variant="ghost" size="sm" className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 p-4 bg-gray-50">
            <pre className="w-full h-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto break-all">
              {output}
            </pre>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Mode: {mode === 'encode' ? 'Encoding' : 'Decoding'}</span>
          <span>Input: {input.length} characters</span>
          <span>Output: {output.length} characters</span>
        </div>
        <div>
          DevUtils.com 1.15 (132D)
        </div>
      </div>
    </DevUtilsLayout>
  );
}