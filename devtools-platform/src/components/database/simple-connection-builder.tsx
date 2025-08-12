'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StorageManager } from '@/lib/storage';
import { generateId, copyToClipboard } from '@/lib/utils';
import type { DatabaseConnection, DatabaseType } from '@/types';
import { Save, Copy, TestTube, Database, Trash2, Eye, EyeOff } from 'lucide-react';

const DATABASE_TYPES: { value: DatabaseType; label: string }[] = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'mssql', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle Database' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
  { value: 'cassandra', label: 'Cassandra' },
  { value: 'elasticsearch', label: 'Elasticsearch' },
];

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mysql: 3306,
  mariadb: 3306,
  mssql: 1433,
  oracle: 1521,
  sqlite: 0,
  mongodb: 27017,
  redis: 6379,
  cassandra: 9042,
  elasticsearch: 9200,
  h2: 0,
  hsqldb: 0,
  firebird: 3050,
  informix: 1526,
  db2: 50000,
};

export default function SimpleConnectionBuilder() {
  const [connectionName, setConnectionName] = useState('');
  const [selectedDbType, setSelectedDbType] = useState<DatabaseType>('postgresql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState<number>(5432);
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connectionString, setConnectionString] = useState('');
  const [maskedConnectionString, setMaskedConnectionString] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savedConnections, setSavedConnections] = useState<DatabaseConnection[]>([]);

  useEffect(() => {
    const data = StorageManager.getData();
    setSavedConnections(data.databaseConnections || []);
  }, []);

  useEffect(() => {
    setPort(DEFAULT_PORTS[selectedDbType] || 5432);
  }, [selectedDbType]);

  useEffect(() => {
    const connStr = buildSimpleConnectionString();
    setConnectionString(connStr);
    setMaskedConnectionString(maskPassword(connStr));
  }, [selectedDbType, host, port, database, username, password]);

  const buildSimpleConnectionString = (): string => {
    switch (selectedDbType) {
      case 'postgresql':
        return `postgresql://${username}:${password}@${host}:${port}/${database}`;
      case 'mysql':
      case 'mariadb':
        return `${selectedDbType}://${username}:${password}@${host}:${port}/${database}`;
      case 'mssql':
        return `Server=${host},${port};Database=${database};User Id=${username};Password=${password};`;
      case 'oracle':
        return `jdbc:oracle:thin:@${host}:${port}:${database}`;
      case 'sqlite':
        return database || 'database.db';
      case 'mongodb':
        return `mongodb://${username}:${password}@${host}:${port}/${database}`;
      case 'redis':
        return `redis://:${password}@${host}:${port}`;
      case 'cassandra':
        return `${host}:${port}`;
      case 'elasticsearch':
        return `http://${username}:${password}@${host}:${port}`;
      default:
        return `${selectedDbType}://${username}:${password}@${host}:${port}/${database}`;
    }
  };

  const maskPassword = (connStr: string): string => {
    return connStr
      .replace(/(password=|:)[^;&@\s]+/gi, '$1***')
      .replace(/\/\/([^:]+):([^@]+)@/g, '//$1:***@');
  };

  const handleSaveConnection = () => {
    if (!connectionName.trim() || !connectionString.trim()) return;

    const newConnection: DatabaseConnection = {
      id: generateId(),
      name: connectionName.trim(),
      type: selectedDbType,
      connectionString: connectionString.trim(),
      maskedConnectionString: maskedConnectionString,
      parameters: {
        host,
        port,
        database,
        username,
        password,
      },
      timestamp: Date.now(),
      valid: true,
    };

    StorageManager.updateArrayField('databaseConnections', (connections) => [
      ...connections,
      newConnection,
    ]);

    setSavedConnections([...savedConnections, newConnection]);
    setConnectionName('');
  };

  const handleLoadConnection = (connection: DatabaseConnection) => {
    setConnectionName(connection.name);
    setSelectedDbType(connection.type);
    const params = connection.parameters;
    setHost(params.host || 'localhost');
    setPort(params.port || DEFAULT_PORTS[connection.type] || 5432);
    setDatabase(params.database || '');
    setUsername(params.username || '');
    setPassword(params.password || '');
  };

  const handleDeleteConnection = (id: string) => {
    StorageManager.updateArrayField('databaseConnections', (connections) =>
      connections.filter(c => c.id !== id)
    );
    setSavedConnections(savedConnections.filter(c => c.id !== id));
  };

  const isFileDatabase = selectedDbType === 'sqlite' || selectedDbType === 'h2' || selectedDbType === 'hsqldb';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Connection String Builder</h1>
        <p className="text-muted-foreground">
          Build and manage database connection strings for all major databases
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Panel */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Database Configuration</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Database Type</label>
                <select
                  value={selectedDbType}
                  onChange={(e) => setSelectedDbType(e.target.value as DatabaseType)}
                  className="w-full px-3 py-2 rounded border bg-background"
                >
                  {DATABASE_TYPES.map(db => (
                    <option key={db.value} value={db.value}>{db.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Connection Name</label>
                <Input
                  placeholder="My Database Connection"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!isFileDatabase && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Host</label>
                    <Input
                      placeholder="localhost"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Port</label>
                    <Input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {isFileDatabase ? 'File Path' : 'Database'}
                </label>
                <Input
                  placeholder={isFileDatabase ? "/path/to/database.db" : "database_name"}
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                />
              </div>

              {!isFileDatabase && selectedDbType !== 'redis' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Username</label>
                  <Input
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}

              {!isFileDatabase && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Connection String Output */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Connection String</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(showPassword ? connectionString : maskedConnectionString)}
                  disabled={!connectionString}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!connectionString}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showPassword ? 'Hide' : 'Show'} Password
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Connection string will appear here..."
              value={showPassword ? connectionString : maskedConnectionString}
              rows={3}
              className="font-mono text-sm"
              readOnly
            />

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleSaveConnection} 
                disabled={!connectionName.trim() || !connectionString.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Connection
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Templates */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Quick Templates</h2>
            
            <div className="space-y-2">
              {[
                { name: 'Local PostgreSQL', type: 'postgresql' as DatabaseType, db: 'postgres', user: 'postgres' },
                { name: 'Local MySQL', type: 'mysql' as DatabaseType, db: 'mysql', user: 'root' },
                { name: 'Local MongoDB', type: 'mongodb' as DatabaseType, db: 'admin', user: 'admin' },
                { name: 'SQLite File', type: 'sqlite' as DatabaseType, db: 'database.db', user: '' },
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedDbType(template.type);
                    setHost('localhost');
                    setPort(DEFAULT_PORTS[template.type] || 5432);
                    setDatabase(template.db);
                    setUsername(template.user);
                    setPassword('');
                    setConnectionName(template.name);
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Saved Connections */}
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">Saved Connections</h2>
            
            {savedConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved connections</p>
            ) : (
              <div className="space-y-2">
                {savedConnections.map((connection) => (
                  <div key={connection.id} className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{connection.name}</span>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleLoadConnection(connection)}
                          className="h-6 w-6 p-0"
                        >
                          <Database className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteConnection(connection.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{connection.type.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium mb-2">Supported Databases</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• PostgreSQL, MySQL, MariaDB</li>
              <li>• SQL Server, Oracle, SQLite</li>
              <li>• MongoDB, Redis, Cassandra</li>
              <li>• Elasticsearch & more</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}