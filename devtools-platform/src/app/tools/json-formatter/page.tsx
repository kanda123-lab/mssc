'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard, validateJSON, formatJSON, minifyJSON } from '@/lib/utils';
import { Save, Copy, Download, Upload, FileText, Minimize2, CheckCircle, XCircle, Braces, History, BookOpen, Sparkles } from 'lucide-react';

export default function JSONFormatterPage() {
  const [input, setInput] = useState('{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com",\n  "address": {\n    "street": "123 Main St",\n    "city": "New York",\n    "country": "USA"\n  },\n  "hobbies": ["reading", "coding", "hiking"]\n}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [savedFormats, setSavedFormats] = useState<Array<{
    id: string;
    name: string;
    content: string;
    timestamp: number;
  }>>([]);
  const [saveName, setSaveName] = useState('');
  const [mode, setMode] = useState<'format' | 'minify'>('format');

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedFormats(data.jsonFormats || []);
  }, []);

  useEffect(() => {
    if (input.trim()) {
      formatAndValidate(input);
    }
  }, [input, mode]);

  const formatAndValidate = (jsonString: string) => {
    const validation = validateJSON(jsonString);
    if (validation.valid) {
      setOutput(mode === 'format' ? formatJSON(jsonString) : minifyJSON(jsonString));
      setError('');
      setIsValid(true);
    } else {
      setError(validation.error || 'Invalid JSON');
      setOutput('');
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    setMode('format');
    formatAndValidate(input);
  };

  const handleMinify = () => {
    setMode('minify');
    formatAndValidate(input);
  };

  const handleSave = () => {
    if (!saveName.trim() || !output) return;

    const newFormat = {
      id: generateId(),
      name: saveName.trim(),
      content: output,
      timestamp: Date.now(),
    };

    StorageManager.updateArrayField('jsonFormats', (formats) => [
      ...formats,
      newFormat,
    ]);

    setSavedFormats([...savedFormats, newFormat]);
    setSaveName('');
  };

  const loadSavedFormat = (format: any) => {
    setInput(format.content);
    setOutput(format.content);
    setSaveName(format.name);
  };

  const deleteSavedFormat = (id: string) => {
    StorageManager.updateArrayField('jsonFormats', (formats) =>
      formats.filter(f => f.id !== id)
    );
    setSavedFormats(savedFormats.filter(f => f.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadJSON = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const examples = [
    {
      name: 'User Profile',
      content: '{"id":1,"name":"John Doe","email":"john@example.com","active":true,"preferences":{"theme":"dark","notifications":true}}',
      description: 'Simple user profile object'
    },
    {
      name: 'API Response',
      content: '{"data":[{"id":1,"title":"Post 1","author":"Alice"},{"id":2,"title":"Post 2","author":"Bob"}],"meta":{"total":2,"page":1,"perPage":10}}',
      description: 'Typical API response with data and metadata'
    },
    {
      name: 'Complex Nested',
      content: '{"company":{"name":"Tech Corp","employees":[{"name":"John","role":"Developer","skills":["JavaScript","Python"],"contact":{"email":"john@tech.com","phone":"+1234567890"}}],"locations":["New York","London","Tokyo"]}}',
      description: 'Complex nested object structure'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl text-white shadow-lg">
            <Braces className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
        </div>
        <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl">JSON Formatter</h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Format, validate, and beautify JSON data. Support for minification, validation, and easy copying.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Editor Area */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Input Section */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                <h2 className="text-base sm:text-lg">JSON Input</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {isValid ? (
                  <div className="status-success text-xs sm:text-sm">
                    <CheckCircle className="h-3 w-3 mr-1 inline" />
                    <span className="hidden sm:inline">Valid JSON</span>
                    <span className="sm:hidden">Valid</span>
                  </div>
                ) : (
                  <div className="status-error text-xs sm:text-sm">
                    <XCircle className="h-3 w-3 mr-1 inline" />
                    <span className="hidden sm:inline">Invalid JSON</span>
                    <span className="sm:hidden">Invalid</span>
                  </div>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="btn-secondary text-xs sm:text-sm"
                  size="sm"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Upload File</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Paste your JSON here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="font-mono text-xs sm:text-sm resize-none min-h-[250px] sm:min-h-[350px] lg:min-h-[400px]"
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <XCircle className="h-4 w-4 inline mr-2" />
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <h2 className="text-base sm:text-lg">Formatted Output</h2>
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <Button
                  onClick={handleFormat}
                  disabled={!input.trim()}
                  className={`btn-secondary text-xs sm:text-sm px-2 sm:px-3 ${mode === 'format' ? 'bg-blue-100 border-blue-300' : ''}`}
                  size="sm"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Format
                </Button>
                <Button
                  onClick={handleMinify}
                  disabled={!input.trim()}
                  className={`btn-secondary text-xs sm:text-sm px-2 sm:px-3 ${mode === 'minify' ? 'bg-blue-100 border-blue-300' : ''}`}
                  size="sm"
                >
                  <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Minify
                </Button>
                <Button
                  onClick={() => copyToClipboard(output)}
                  disabled={!output}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button
                  onClick={downloadJSON}
                  disabled={!output}
                  className="btn-secondary text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] max-h-[500px] overflow-auto">
              <pre className="text-xs sm:text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {output || 'Formatted JSON will appear here...'}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <Input
                placeholder="Enter name to save..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="flex-1 text-sm"
                size="sm"
              />
              <Button
                onClick={handleSave}
                disabled={!output || !saveName.trim()}
                className="btn-primary text-sm"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Save Formatted</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Examples */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3>Quick Examples</h3>
            </div>
            
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => setInput(example.content)}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-700 mb-1">
                      {example.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {example.description}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {example.content.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Formats */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-purple-500" />
              <h3>Saved Formats</h3>
            </div>
            
            {savedFormats.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved formats yet</p>
                <p className="text-sm text-gray-400">Save your formatted JSON for quick access</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFormats.map((format) => (
                  <div key={format.id} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {format.name}
                        </h4>
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(format.timestamp).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-gray-400 font-mono truncate">
                          {format.content.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => loadSavedFormat(format)}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load Format
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => deleteSavedFormat(format.id)}
                        className="btn-secondary text-xs px-3"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <h3 className="text-orange-900 mb-4">🚀 Features</h3>
            <ul className="space-y-2 text-sm text-orange-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Real-time JSON validation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Beautiful formatting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                One-click minification
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                File upload/download
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Save favorite formats
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Error highlighting
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}