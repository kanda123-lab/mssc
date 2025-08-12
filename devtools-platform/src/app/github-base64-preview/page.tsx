'use client';

import { useState } from 'react';
import { GitHubDesktopLayout } from '@/components/layout/github-desktop-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  Save, 
  ArrowUpDown,
  Binary,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Download,
  History
} from 'lucide-react';

export default function GitHubBase64PreviewPage() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('Hello, World! This is a sample text to encode.');
  const [output, setOutput] = useState('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgdG8gZW5jb2RlLg==');
  const [saveName, setSaveName] = useState('');

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    // Swap input/output
    const temp = input;
    setInput(output);
    setOutput(temp);
  };

  return (
    <GitHubDesktopLayout>
      <div className="p-6 space-y-6">
        {/* Mode Toggle & Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {mode === 'encode' ? 'Ready to Encode' : 'Ready to Decode'}
              </span>
            </div>
            
            <Button
              onClick={switchMode}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Upload File
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Main Content Cards */}
        <div className="grid grid-cols-2 gap-6">
          {/* Input Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {mode === 'encode' ? (
                  <>
                    <FileText className="w-5 h-5" />
                    Plain Text Input
                  </>
                ) : (
                  <>
                    <Binary className="w-5 h-5" />
                    Base64 Input
                  </>
                )}
              </h3>
              <Button variant="outline" size="sm" className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}
                  </span>
                  <span>{input.length} characters</span>
                </div>
              </div>
              <div className="p-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === 'encode' ? 'Enter your text here...' : 'Enter Base64 string here...'}
                  rows={16}
                  className="w-full font-mono text-sm border-0 resize-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {mode === 'encode' ? (
                  <>
                    <Binary className="w-5 h-5" />
                    Base64 Output
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Decoded Text
                  </>
                )}
              </h3>
              <Button variant="outline" size="sm" className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copy All
              </Button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {mode === 'encode' ? 'Base64 encoded result' : 'Decoded plain text'}
                  </span>
                  <span>{output.length} characters</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                <pre className="w-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto min-h-[350px] max-h-[400px] break-all">
                  {output || 'Output will appear here...'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{input.length}</div>
            <div className="text-sm text-gray-600">Input Characters</div>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">{output.length}</div>
            <div className="text-sm text-gray-600">Output Characters</div>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900">
              {input.length > 0 ? Math.round((output.length / input.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Size Ratio</div>
          </div>
        </div>

        {/* Save Section */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Conversion
          </h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter a name for this conversion..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1"
            />
            <Button 
              disabled={!saveName.trim() || !output}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Conversion
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Save both original and encoded versions for future reference
          </p>
        </div>

        {/* Quick Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Examples</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Simple Text', text: 'Hello, World!', description: 'Basic greeting text' },
              { name: 'JSON Data', text: '{"name": "John", "age": 30}', description: 'JSON object example' },
              { name: 'Email Address', text: 'user@example.com', description: 'Email format' },
              { name: 'URL String', text: 'https://example.com/api?key=value', description: 'URL with parameters' },
            ].map((example, index) => (
              <div 
                key={index} 
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setInput(example.text)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{example.name}</p>
                    <p className="text-sm text-gray-500">{example.description}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1 truncate">{example.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Conversions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'API Token', type: 'encode', date: '5 minutes ago', size: '64 chars' },
              { name: 'Config Data', type: 'encode', date: '1 hour ago', size: '128 chars' },
              { name: 'User Credentials', type: 'decode', date: '2 hours ago', size: '32 chars' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.type === 'encode' ? 'bg-green-50' : 'bg-blue-50'
                  }`}>
                    {item.type === 'encode' ? (
                      <Binary className="w-4 h-4 text-green-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.date} • {item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'encode' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.type}
                  </span>
                  <Button variant="outline" size="sm" className="text-xs">
                    Load
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GitHubDesktopLayout>
  );
}