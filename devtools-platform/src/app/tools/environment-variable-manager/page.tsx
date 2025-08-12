'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Copy, 
  Download, 
  Plus, 
  Trash2, 
  Eye,
  EyeOff
} from 'lucide-react';

export default function EnvironmentVariableManagerPage() {
  const [variables, setVariables] = useState<Record<string, string>>({
    NODE_ENV: 'development',
    PORT: '3000',
    DATABASE_URL: '',
    API_KEY: '',
  });
  const [showSecrets, setShowSecrets] = useState(false);
  const [envContent, setEnvContent] = useState('');

  useEffect(() => {
    // Generate .env content
    const content = Object.entries(variables)
      .filter(([_, value]) => value.trim() !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    setEnvContent(content);
  }, [variables]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const addVariable = () => {
    const key = `NEW_VAR_${Date.now()}`;
    setVariables(prev => ({ ...prev, [key]: '' }));
  };

  const removeVariable = (key: string) => {
    setVariables(prev => {
      const newVars = { ...prev };
      delete newVars[key];
      return newVars;
    });
  };

  const downloadEnvFile = () => {
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envContent);
  };

  const isSecretVariable = (key: string): boolean => {
    const secretKeys = ['password', 'secret', 'key', 'token', 'auth', 'private'];
    return secretKeys.some(secretKey => key.toLowerCase().includes(secretKey));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Environment Variable Manager</h1>
        <p className="text-muted-foreground">
          Manage and generate .env files for different environments
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {/* Environment Variables */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Environment Variables</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showSecrets ? 'Hide' : 'Show'} Secrets
                </Button>
                <Button size="sm" onClick={addVariable}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variable
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="VARIABLE_NAME"
                      value={key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newVars = { ...variables };
                        delete newVars[key];
                        newVars[newKey] = value;
                        setVariables(newVars);
                      }}
                      className="font-mono"
                    />
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <div className="flex-1">
                    <Input
                      placeholder="value"
                      type={isSecretVariable(key) && !showSecrets ? 'password' : 'text'}
                      value={value}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeVariable(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Generated .env File */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Generated .env File</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={!envContent}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadEnvFile}
                  disabled={!envContent}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <Textarea
              value={envContent}
              readOnly
              placeholder="Environment variables will appear here..."
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          {/* Features */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium mb-2">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Environment variable editor</li>
              <li>✅ Secret value protection</li>
              <li>✅ Real-time .env generation</li>
              <li>✅ Copy to clipboard</li>
              <li>✅ File download</li>
              <li>✅ Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}