'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Download,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function DemoBase64Page() {
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

  const processText = () => {
    try {
      if (mode === 'encode') {
        const encoded = btoa(input);
        setOutput(encoded);
      } else {
        const decoded = atob(input);
        setOutput(decoded);
      }
    } catch (error) {
      setOutput('Error: Invalid input for ' + mode + ' operation');
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
              <Binary className="w-5 h-5 text-green-600" />
              <h1 className="text-xl font-semibold">Base64 Encoder/Decoder</h1>
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

              <Button
                onClick={processText}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
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
          <div className="border-t border-gray-200 p-4 bg-gray-50">
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
                  Quick Examples
                </h4>
                <div className="space-y-1">
                  {[
                    { name: 'Simple Text', text: 'Hello, World!' },
                    { name: 'JSON Data', text: '{"name": "John", "age": 30}' },
                    { name: 'Email', text: 'user@example.com' },
                    { name: 'URL', text: 'https://example.com/api?key=value' }
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(example.text)}
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
          <div className="border-b border-gray-200 bg-white p-4">
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
          <div className="border-t border-gray-200 bg-white">
            <div className="p-4 space-y-3">
              {/* Demo Notice */}
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🚀 Demo mode - Encoding/decoding works fully! Sign in to save conversions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}