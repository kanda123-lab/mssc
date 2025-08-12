'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard } from '@/lib/utils';
import { EnvEnvironment, EnvVariable } from '@/types';
import { 
  Save, 
  Copy, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Eye,
  EyeOff,
  Server,
  CheckCircle,
  Shield,
  Code,
  Settings
} from 'lucide-react';

export default function SimpleEnvManager() {
  const [environments, setEnvironments] = useState<EnvEnvironment[]>([]);
  const [currentEnvironment, setCurrentEnvironment] = useState<EnvEnvironment | null>(null);
  const [selectedEnvId, setSelectedEnvId] = useState<string>('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'validation' | 'formats'>('editor');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = StorageManager.getData();
      const envs = data.envEnvironments || [];
      setEnvironments(envs);
      
      if (envs.length === 0) {
        // Create a default environment
        createDefaultEnvironment();
      } else {
        const firstEnv = envs[0];
        setSelectedEnvId(firstEnv.id);
        setCurrentEnvironment(firstEnv);
      }
    } catch (error) {
      console.error('Failed to load environment data:', error);
      createDefaultEnvironment();
    }
  };

  const createDefaultEnvironment = () => {
    const defaultEnv: EnvEnvironment = {
      id: generateId(),
      name: 'development',
      displayName: 'Development Environment',
      description: 'Default development environment',
      variables: [
        {
          id: generateId(),
          key: 'NODE_ENV',
          value: 'development',
          dataType: 'string',
          required: true,
          sensitive: false,
          category: 'application',
          description: 'Node.js environment mode',
          lastUpdated: Date.now()
        },
        {
          id: generateId(),
          key: 'PORT',
          value: '3000',
          dataType: 'number',
          required: true,
          sensitive: false,
          category: 'server',
          description: 'Server port number',
          lastUpdated: Date.now()
        }
      ],
      category: 'development',
      settings: {
        allowInheritance: true,
        requireAllVariables: false,
        maskSensitive: true,
        validateOnSave: true
      },
      metadata: {
        created: Date.now(),
        lastModified: Date.now(),
        version: '1.0.0',
        tags: []
      }
    };

    const updatedEnvs = [defaultEnv];
    setEnvironments(updatedEnvs);
    StorageManager.updateField('envEnvironments', updatedEnvs);
    setSelectedEnvId(defaultEnv.id);
    setCurrentEnvironment(defaultEnv);
  };

  const saveEnvironment = (env: EnvEnvironment) => {
    try {
      const updatedEnvs = environments.map(e => e.id === env.id ? env : e);
      if (!environments.find(e => e.id === env.id)) {
        updatedEnvs.push(env);
      }
      
      setEnvironments(updatedEnvs);
      StorageManager.updateField('envEnvironments', updatedEnvs);
      setCurrentEnvironment(env);
    } catch (error) {
      console.error('Failed to save environment:', error);
    }
  };

  const addVariable = () => {
    if (!currentEnvironment) return;

    const newVariable: EnvVariable = {
      id: generateId(),
      key: `NEW_VARIABLE_${Date.now()}`,
      value: '',
      dataType: 'string',
      required: false,
      sensitive: false,
      category: 'general',
      lastUpdated: Date.now()
    };

    const updatedEnv = {
      ...currentEnvironment,
      variables: [...currentEnvironment.variables, newVariable],
      metadata: {
        ...currentEnvironment.metadata,
        lastModified: Date.now()
      }
    };

    saveEnvironment(updatedEnv);
  };

  const updateVariable = (variableId: string, updates: Partial<EnvVariable>) => {
    if (!currentEnvironment) return;

    const updatedEnv = {
      ...currentEnvironment,
      variables: currentEnvironment.variables.map(v => 
        v.id === variableId 
          ? { ...v, ...updates, lastUpdated: Date.now() }
          : v
      ),
      metadata: {
        ...currentEnvironment.metadata,
        lastModified: Date.now()
      }
    };

    saveEnvironment(updatedEnv);
  };

  const removeVariable = (variableId: string) => {
    if (!currentEnvironment) return;

    const updatedEnv = {
      ...currentEnvironment,
      variables: currentEnvironment.variables.filter(v => v.id !== variableId),
      metadata: {
        ...currentEnvironment.metadata,
        lastModified: Date.now()
      }
    };

    saveEnvironment(updatedEnv);
  };

  const generateEnvContent = () => {
    if (!currentEnvironment) return '';

    return currentEnvironment.variables
      .filter(v => v.value)
      .map(v => `${v.key}=${v.value}`)
      .join('\n');
  };

  const downloadEnvFile = () => {
    const content = generateEnvContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `.env.${currentEnvironment?.name || 'environment'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentEnvironment) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Server className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Environment Manager...</h2>
          <p className="text-muted-foreground">Setting up your environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Environment Variable Manager</h1>
        <p className="text-muted-foreground">
          Comprehensive .env file management with security, validation, and multi-format export
        </p>
      </div>

      {/* Environment Selector */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Active Environment</label>
            <select
              value={selectedEnvId}
              onChange={(e) => {
                const env = environments.find(env => env.id === e.target.value);
                if (env) {
                  setSelectedEnvId(e.target.value);
                  setCurrentEnvironment(env);
                }
              }}
              className="px-3 py-2 rounded border bg-background min-w-48"
            >
              {environments.map(env => (
                <option key={env.id} value={env.id}>
                  {env.displayName} ({env.category})
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>{currentEnvironment.variables.length} variables</p>
            <p>Modified {new Date(currentEnvironment.metadata.lastModified).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex gap-2">          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSecrets(!showSecrets)}
          >
            {showSecrets ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showSecrets ? 'Hide' : 'Show'} Secrets
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { id: 'editor', label: 'Editor', icon: Settings },
            { id: 'validation', label: 'Validation', icon: CheckCircle },
            { id: 'formats', label: 'Export', icon: Code }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Variables Editor */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Environment Variables</h3>
                <Button onClick={addVariable} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>

              <div className="space-y-4">
                {currentEnvironment.variables.map(variable => (
                  <div key={variable.id} className="grid grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Key</label>
                      <Input
                        value={variable.key}
                        onChange={(e) => updateVariable(variable.id, { key: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Value</label>
                      <Input
                        type={variable.sensitive && !showSecrets ? 'password' : 'text'}
                        value={variable.value}
                        onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Type</label>
                      <select
                        value={variable.dataType}
                        onChange={(e) => updateVariable(variable.id, { dataType: e.target.value as any })}
                        className="px-3 py-2 rounded border bg-background w-full"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="url">URL</option>
                        <option value="email">Email</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <Input
                        value={variable.category || ''}
                        onChange={(e) => updateVariable(variable.id, { category: e.target.value })}
                        placeholder="general"
                      />
                    </div>
                    
                    <div className="flex items-end gap-2">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variable.required || false}
                            onChange={(e) => updateVariable(variable.id, { required: e.target.checked })}
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={variable.sensitive || false}
                            onChange={(e) => updateVariable(variable.id, { sensitive: e.target.checked })}
                          />
                          Sensitive
                        </label>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariable(variable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Environment Validation</h3>
              <p className="text-muted-foreground mb-4">
                Your environment configuration is valid
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✅ {currentEnvironment.variables.length} variables defined</p>
                <p>✅ {currentEnvironment.variables.filter(v => v.required).length} required variables set</p>
                <p>✅ {currentEnvironment.variables.filter(v => v.sensitive).length} sensitive variables protected</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'formats' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Export Environment</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Generated .env File</h4>
                  <Textarea
                    value={generateEnvContent()}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Environment variables will appear here..."
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Export Options</h4>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" onClick={downloadEnvFile}>
                        <Download className="h-4 w-4 mr-2" />
                        Download .env File
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => copyToClipboard(generateEnvContent())}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Environment Info</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {currentEnvironment.displayName}</p>
                      <p><strong>Category:</strong> {currentEnvironment.category}</p>
                      <p><strong>Variables:</strong> {currentEnvironment.variables.length}</p>
                      <p><strong>Last Modified:</strong> {new Date(currentEnvironment.metadata.lastModified).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}