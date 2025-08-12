'use client';

import { useState } from 'react';
import { GitHubDesktopLayout } from '@/components/layout/github-desktop-layout';
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
  Eye,
  Code
} from 'lucide-react';

export default function GitHubJsonPreviewPage() {
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
    <GitHubDesktopLayout>
      <div className="p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isValid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Valid JSON</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Invalid JSON</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'format' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('format')}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Format
              </Button>
              <Button
                variant={mode === 'minify' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('minify')}
                className="text-xs"
              >
                <Minimize2 className="w-3 h-3 mr-1" />
                Minify
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              className="text-xs"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
            >
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
                <Code className="w-5 h-5" />
                JSON Input
              </h3>
              <Button variant="outline" size="sm" className="text-xs">
                <RefreshCw className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Paste or type JSON here</span>
                  <span>{input.split('\n').length} lines</span>
                </div>
              </div>
              <div className="p-4">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your JSON here..."
                  rows={20}
                  className="w-full font-mono text-sm border-0 resize-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>

          {/* Output Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Formatted Output
              </h3>
              <Button variant="outline" size="sm" className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copy All
              </Button>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Formatted JSON output</span>
                  <span>{output.split('\n').length} lines</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="w-full font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-auto min-h-[400px] max-h-[500px]">
                  <code className="language-json">{output}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Save Section */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Formatted JSON
          </h4>
          <div className="flex gap-3">
            <Input
              placeholder="Enter a name for this JSON format..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1"
            />
            <Button 
              disabled={!saveName.trim() || !output}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Format
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Saved formats will appear in your collection for quick access
          </p>
        </div>

        {/* Recent Formats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Formats</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { name: 'User Profile Data', date: '2 hours ago', size: '1.2 KB' },
              { name: 'API Response Example', date: 'Yesterday', size: '3.4 KB' },
              { name: 'Config File', date: '3 days ago', size: '856 B' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Braces className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.date} • {item.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Load
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                    Delete
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