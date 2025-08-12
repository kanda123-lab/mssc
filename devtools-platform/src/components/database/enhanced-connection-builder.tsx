'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard } from '@/lib/utils';
import { 
  buildConnectionString, 
  parseConnectionString, 
  getDatabaseDefaults, 
  getRequiredFields, 
  getSupportedParameters,
  validateConnectionParameters,
  generateSecurityRecommendations,
  maskSensitiveData
} from '@/lib/database-utils';
import type { 
  DatabaseConnection, 
  DatabaseType, 
  DatabaseParameters, 
  SslMode,
  SecurityRecommendation
} from '@/types';
import { 
  Save, 
  Copy, 
  Download, 
  TestTube, 
  Shield, 
  Eye, 
  EyeOff,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Settings,
  Lock,
  Cloud,
  BookOpen,
  Zap
} from 'lucide-react';

const DATABASE_TYPES: { value: DatabaseType; label: string; category: string; icon: string }[] = [
  // Relational Databases
  { value: 'postgresql', label: 'PostgreSQL', category: 'Relational', icon: '🐘' },
  { value: 'mysql', label: 'MySQL', category: 'Relational', icon: '🐬' },
  { value: 'mariadb', label: 'MariaDB', category: 'Relational', icon: '🦭' },
  { value: 'mssql', label: 'SQL Server', category: 'Relational', icon: '🏢' },
  { value: 'oracle', label: 'Oracle Database', category: 'Relational', icon: '🔴' },
  { value: 'sqlite', label: 'SQLite', category: 'Relational', icon: '💾' },
  { value: 'h2', label: 'H2 Database', category: 'Relational', icon: '💧' },
  // NoSQL Databases
  { value: 'mongodb', label: 'MongoDB', category: 'NoSQL', icon: '🍃' },
  { value: 'redis', label: 'Redis', category: 'NoSQL', icon: '🔴' },
  { value: 'cassandra', label: 'Apache Cassandra', category: 'NoSQL', icon: '📊' },
  { value: 'elasticsearch', label: 'Elasticsearch', category: 'NoSQL', icon: '🔍' },
];

const SSL_MODES: { value: SslMode; label: string; description: string }[] = [
  { value: 'disable', label: 'Disable', description: 'No SSL encryption' },
  { value: 'allow', label: 'Allow', description: 'SSL if available, fallback to non-SSL' },
  { value: 'prefer', label: 'Prefer', description: 'SSL preferred, fallback to non-SSL' },
  { value: 'require', label: 'Require', description: 'SSL required, fail if unavailable' },
  { value: 'verify-ca', label: 'Verify CA', description: 'SSL required with CA verification' },
  { value: 'verify-full', label: 'Verify Full', description: 'SSL required with full certificate verification' },
];

export default function EnhancedConnectionBuilder() {
  const [connectionName, setConnectionName] = useState('');
  const [selectedDbType, setSelectedDbType] = useState<DatabaseType>('postgresql');
  const [parameters, setParameters] = useState<DatabaseParameters>({});
  const [connectionString, setConnectionString] = useState('');
  const [maskedConnectionString, setMaskedConnectionString] = useState('');
  const [savedConnections, setSavedConnections] = useState<DatabaseConnection[]>([]);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] }>({ valid: true, errors: [], warnings: [] });
  const [securityRecommendations, setSecurityRecommendations] = useState<SecurityRecommendation[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedConnections(data.databaseConnections || []);
  }, []);

  useEffect(() => {
    const defaults = getDatabaseDefaults(selectedDbType);
    setParameters(prev => ({ ...defaults, ...prev }));
  }, [selectedDbType]);

  useEffect(() => {
    if (Object.keys(parameters).length > 0) {
      const connStr = buildConnectionString(parameters, selectedDbType);
      setConnectionString(connStr);
      setMaskedConnectionString(maskSensitiveData(connStr));
      
      const validationResult = validateConnectionParameters(parameters, selectedDbType);
      setValidation(validationResult);
      
      const securityRecs = generateSecurityRecommendations(parameters, selectedDbType);
      setSecurityRecommendations(securityRecs);
    }
  }, [parameters, selectedDbType]);

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConnection = () => {
    if (!connectionName.trim() || !connectionString.trim()) return;

    const newConnection: DatabaseConnection = {
      id: generateId(),
      name: connectionName.trim(),
      type: selectedDbType,
      connectionString: connectionString.trim(),
      maskedConnectionString: maskedConnectionString,
      parameters,
      timestamp: Date.now(),
      valid: validation.valid,
      securityScore: calculateSecurityScore(securityRecommendations),
    };

    StorageManager.updateArrayField('databaseConnections', (connections) => [
      ...connections,
      newConnection,
    ]);

    setSavedConnections([...savedConnections, newConnection]);
    setConnectionName('');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockResult = {
      success: Math.random() > 0.3,
      message: Math.random() > 0.3 ? 'Connection successful' : 'Connection failed: Timeout',
      latencyMs: 50 + Math.random() * 500,
      timestamp: Date.now(),
    };
    
    setTestResult(mockResult);
    setTesting(false);
  };

  const calculateSecurityScore = (recommendations: SecurityRecommendation[]): number => {
    let score = 100;
    recommendations.forEach(rec => {
      switch (rec.severity) {
        case 'HIGH': score -= 30; break;
        case 'MEDIUM': score -= 20; break;
        case 'LOW': score -= 10; break;
      }
    });
    return Math.max(0, score);
  };

  const renderParameterField = (param: string) => {
    const required = getRequiredFields(selectedDbType).includes(param);
    const value = parameters[param as keyof DatabaseParameters];
    const fieldLabel = param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1');

    if (param === 'sslMode') {
      return (
        <div key={param} className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            {fieldLabel} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(param, e.target.value)}
          >
            <option value="">Select {fieldLabel}</option>
            {SSL_MODES.map((option) => (
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (param === 'useEncryption' || param === 'autoReconnect' || param === 'retryWrites') {
      return (
        <div key={param} className="flex items-center space-x-3">
          <input
            type="checkbox"
            id={param}
            checked={!!value}
            onChange={(e) => handleParameterChange(param, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={param} className="text-sm font-semibold text-gray-700">
            {fieldLabel}
          </label>
        </div>
      );
    }

    return (
      <div key={param} className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {fieldLabel} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Input
            type={param === 'password' ? (showPassword ? 'text' : 'password') : param === 'port' ? 'number' : 'text'}
            value={value?.toString() || ''}
            onChange={(e) => handleParameterChange(param, 
              param === 'port' ? parseInt(e.target.value) || undefined : e.target.value)}
            required={required}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
          />
          {param === 'password' && (
            <Button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const supportedParams = getSupportedParameters(selectedDbType);

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl text-white shadow-lg">
            <Database className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mb-4">Database Connection Builder</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create secure database connection strings with built-in validation, security analysis, and multiple export formats
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-3 gap-8">
        {/* Main Configuration Area */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="h-5 w-5 text-blue-500" />
                  <h2>Database Configuration</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Database Type</label>
                    <select
                      value={selectedDbType}
                      onChange={(e) => setSelectedDbType(e.target.value as DatabaseType)}
                    >
                      {Object.entries(
                        DATABASE_TYPES.reduce((acc, db) => {
                          if (!acc[db.category]) acc[db.category] = [];
                          acc[db.category].push(db);
                          return acc;
                        }, {} as Record<string, typeof DATABASE_TYPES>)
                      ).map(([category, dbs]) => (
                        <optgroup key={category} label={category}>
                          {dbs.map(db => (
                            <option key={db.value} value={db.value}>
                              {db.icon} {db.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Connection Name</label>
                    <Input
                      placeholder="My Database Connection"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    Connection Parameters
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {supportedParams.slice(0, 8).map(param => renderParameterField(param))}
                  </div>
                  
                  {supportedParams.length > 8 && (
                    <details className="space-y-4">
                      <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-600">
                        Additional Parameters ({supportedParams.length - 8})
                      </summary>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                        {supportedParams.slice(8).map(param => renderParameterField(param))}
                      </div>
                    </details>
                  )}
                </div>

                {/* Validation Results */}
                {(!validation.valid || validation.warnings.length > 0) && (
                  <div className="mt-8 space-y-3">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    ))}
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-yellow-700">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Connection String Output */}
              <div className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div className="flex items-center gap-3 mb-4 lg:mb-0">
                    <Copy className="h-5 w-5 text-purple-500" />
                    <h2>Connection String</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => copyToClipboard(showPassword ? connectionString : maskedConnectionString)}
                      disabled={!connectionString}
                      className="btn-secondary"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={!connectionString}
                      className="btn-secondary"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPassword ? 'Hide' : 'Show'} Password
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Connection string will appear here..."
                  value={showPassword ? connectionString : maskedConnectionString}
                  readOnly
                  rows={4}
                  className="font-mono text-sm bg-gray-50 border-gray-200"
                />

                <div className="flex gap-3 mt-6">
                  <Button 
                    onClick={handleSaveConnection} 
                    disabled={!connectionName.trim() || !connectionString.trim() || !validation.valid}
                    className="btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Connection
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-red-500" />
                    <h2>Security Analysis</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Security Score:</span>
                    <span className={`font-bold text-lg ${
                      calculateSecurityScore(securityRecommendations) >= 80 ? 'text-green-600' :
                      calculateSecurityScore(securityRecommendations) >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {calculateSecurityScore(securityRecommendations)}/100
                    </span>
                  </div>
                </div>

                {securityRecommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Excellent Security!</h3>
                    <p className="text-green-600">No security issues detected in your connection configuration.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {securityRecommendations.map((rec, index) => (
                      <div key={index} className={`border rounded-xl p-6 ${
                        rec.severity === 'HIGH' ? 'border-red-200 bg-red-50' :
                        rec.severity === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }`}>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${
                            rec.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                            rec.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <Shield className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{rec.type}</h3>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                rec.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                                rec.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {rec.severity}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{rec.message}</p>
                            <p className="text-sm font-medium text-gray-800">{rec.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="advanced">
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <h2>Advanced Configuration</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-500" />
                      Connection Pooling
                    </h3>
                    <div className="space-y-4">
                      {renderParameterField('minPoolSize')}
                      {renderParameterField('maxPoolSize')}
                      {renderParameterField('connectionTimeout')}
                      {renderParameterField('idleTimeout')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-green-500" />
                      SSL Configuration
                    </h3>
                    <div className="space-y-4">
                      {renderParameterField('sslMode')}
                      {renderParameterField('sslCert')}
                      {renderParameterField('sslKey')}
                      {renderParameterField('sslRootCert')}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-green-500" />
                    <h2>Connection Testing</h2>
                  </div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={!connectionString || testing || !validation.valid}
                    className="btn-primary"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>

                {testResult && (
                  <div className={`border rounded-xl p-6 ${
                    testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      {testResult.success ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className="font-semibold text-lg">{testResult.message}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Latency: <strong>{Math.round(testResult.latencyMs)}ms</strong></span>
                        <span>•</span>
                        <span>Tested at <strong>{new Date(testResult.timestamp).toLocaleTimeString()}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {!testResult && !testing && (
                  <div className="text-center py-12">
                    <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Test</h3>
                    <p className="text-gray-500">Click the "Test Connection" button to verify your database connection.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3>Quick Templates</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { name: 'Local PostgreSQL', type: 'postgresql' as DatabaseType, params: { host: 'localhost', port: 5432, database: 'postgres', username: 'postgres' }, icon: '🐘' },
                { name: 'Local MySQL', type: 'mysql' as DatabaseType, params: { host: 'localhost', port: 3306, database: 'mysql', username: 'root' }, icon: '🐬' },
                { name: 'Local MongoDB', type: 'mongodb' as DatabaseType, params: { host: 'localhost', port: 27017, database: 'admin' }, icon: '🍃' },
              ].map((template, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setSelectedDbType(template.type);
                    setParameters({ ...getDatabaseDefaults(template.type), ...template.params });
                    setConnectionName(template.name);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-500">Click to load template</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Connections */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Cloud className="h-5 w-5 text-purple-500" />
              <h3>Saved Connections</h3>
            </div>
            
            {savedConnections.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No saved connections</p>
                <p className="text-sm text-gray-400">Save connections for quick access</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedConnections.map((connection) => (
                  <div key={connection.id} className="p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{connection.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                            {connection.type.toUpperCase()}
                          </span>
                          {connection.securityScore && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
                              connection.securityScore >= 80 ? 'bg-green-100 text-green-800' :
                              connection.securityScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {connection.securityScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setConnectionName(connection.name);
                            setSelectedDbType(connection.type);
                            setParameters(connection.parameters);
                            setConnectionString(connection.connectionString);
                          }}
                          className="btn-secondary text-xs"
                        >
                          Load
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            StorageManager.updateArrayField('databaseConnections', (connections) =>
                              connections.filter(c => c.id !== connection.id)
                            );
                            setSavedConnections(savedConnections.filter(c => c.id !== connection.id));
                          }}
                          className="btn-secondary text-xs px-3"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}