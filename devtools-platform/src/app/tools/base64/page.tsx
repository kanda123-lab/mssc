'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard, encodeBase64, decodeBase64 } from '@/lib/utils';
import { Save, Copy, ArrowUpDown, ArrowDownUp, Trash2, Binary, FileText, History, BookOpen, AlertCircle } from 'lucide-react';

export default function Base64Page() {
  const [input, setInput] = useState('Hello, World!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [savedConversions, setSavedConversions] = useState<Array<{
    id: string;
    name: string;
    original: string;
    encoded: string;
    timestamp: number;
  }>>([]);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedConversions(data.base64Conversions || []);
  }, []);

  useEffect(() => {
    const handleConversionEffect = () => {
      try {
        setError('');
        if (mode === 'encode') {
          const encoded = encodeBase64(input);
          setOutput(encoded);
        } else {
          const decoded = decodeBase64(input);
          setOutput(decoded);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Conversion failed');
        setOutput('');
      }
    };

    if (input.trim()) {
      handleConversionEffect();
    }
  }, [input, mode]);

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
  };

  const handleSave = () => {
    if (!input.trim() || !output || !saveName.trim()) return;

    const newConversion = {
      id: generateId(),
      name: saveName.trim(),
      original: mode === 'encode' ? input : output,
      encoded: mode === 'encode' ? output : input,
      timestamp: Date.now(),
    };

    StorageManager.updateArrayField('base64Conversions', (conversions) => [
      ...conversions,
      newConversion,
    ]);

    setSavedConversions([...savedConversions, newConversion]);
    setSaveName('');
  };

  const handleLoad = (conversion: typeof savedConversions[0], loadMode: 'original' | 'encoded') => {
    if (loadMode === 'original') {
      setInput(conversion.original);
      setMode('encode');
    } else {
      setInput(conversion.encoded);
      setMode('decode');
    }
  };

  const handleDelete = (id: string) => {
    StorageManager.updateArrayField('base64Conversions', (conversions) =>
      conversions.filter(c => c.id !== id)
    );
    setSavedConversions(savedConversions.filter(c => c.id !== id));
  };

  const exampleTexts = [
    {
      name: 'Simple Greeting',
      text: 'Hello, World!',
      description: 'Basic text encoding example'
    },
    {
      name: 'JSON Data',
      text: '{"name": "John", "age": 30}',
      description: 'JSON object encoding'
    },
    {
      name: 'Lorem Ipsum',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      description: 'Longer text encoding'
    },
    {
      name: 'Special Characters',
      text: 'Héllo Wørld! 🌍',
      description: 'Unicode characters with emoji'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl text-white shadow-lg">
            <Binary className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-4">Base64 Encoder/Decoder</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert text to Base64 encoding or decode Base64 back to text. Perfect for data transmission and storage.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-3 gap-8">
        {/* Main Conversion Area */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {mode === 'encode' ? (
                  <FileText className="h-5 w-5 text-teal-500" />
                ) : (
                  <Binary className="h-5 w-5 text-cyan-500" />
                )}
                <h2>{mode === 'encode' ? 'Text Input' : 'Base64 Input'}</h2>
              </div>
              <Button
                onClick={switchMode}
                disabled={!output}
                className="btn-secondary"
              >
                {mode === 'encode' ? (
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                )}
                Switch to {mode === 'encode' ? 'Decode' : 'Encode'}
              </Button>
            </div>
            
            <Textarea
              placeholder={mode === 'encode' ? 'Enter text to encode to Base64...' : 'Enter Base64 string to decode...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-none"
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          {output && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {mode === 'encode' ? (
                    <Binary className="h-5 w-5 text-cyan-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-teal-500" />
                  )}
                  <h2>{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</h2>
                </div>
                <Button
                  onClick={() => copyToClipboard(output)}
                  className="btn-secondary"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-auto">
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap break-all">
                  {output}
                </pre>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <Input
                  placeholder="Enter name to save conversion..."
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Conversion
                </Button>
              </div>
            </div>
          )}
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
              {exampleTexts.map((example, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setInput(example.text);
                    setMode('encode');
                  }}
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-teal-700 mb-1">
                      {example.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {example.description}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate">
                      {example.text.length > 50 ? example.text.substring(0, 50) + '...' : example.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Conversions */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-purple-500" />
              <h3>Saved Conversions</h3>
            </div>
            
            {savedConversions.length === 0 ? (
              <div className="text-center py-8">
                <Binary className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved conversions yet</p>
                <p className="text-sm text-gray-400">Save your Base64 conversions for quick access</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedConversions.map((conversion) => (
                  <div key={conversion.id} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {conversion.name}
                        </h4>
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(conversion.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 font-mono space-y-1">
                          <div className="truncate">
                            <span className="text-gray-500">Text:</span> {conversion.original.substring(0, 30)}...
                          </div>
                          <div className="truncate">
                            <span className="text-gray-500">Base64:</span> {conversion.encoded.substring(0, 30)}...
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleLoad(conversion, 'original')}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load Text
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleLoad(conversion, 'encoded')}
                        className="btn-secondary text-xs flex-1"
                      >
                        Load Base64
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDelete(conversion.id)}
                        className="btn-secondary text-xs px-3"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="card bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <h3 className="text-teal-900 mb-4">📋 Features</h3>
            <ul className="space-y-2 text-sm text-teal-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                Bidirectional encoding/decoding
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                UTF-8 character support
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                One-click mode switching
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                Save favorite conversions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                Quick example templates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                Error validation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}