import { format as formatSQL } from 'sql-formatter';
import type { DatabaseConnection, QueryResult, DatabaseType, DatabaseParameters, SecurityRecommendation, PerformanceRecommendation, ConnectionTestResult, SslMode } from '@/types';

// SQL Parsing and Validation
export function formatSQLQuery(query: string, dialect: string = 'sql'): string {
  try {
    const validDialects = ['mysql', 'postgresql', 'sqlite', 'mariadb', 'sql', 'tsql'];
    const formatterDialect = validDialects.includes(dialect) ? dialect as any : 'sql';
    
    return formatSQL(query, {
      language: formatterDialect,
      tabWidth: 2,
      keywordCase: 'upper',
      dataTypeCase: 'upper',
      functionCase: 'upper',
    });
  } catch (error) {
    console.warn('SQL formatting failed:', error);
    return query;
  }
}

export function validateSQLSyntax(query: string): { valid: boolean; error?: string } {
  try {
    // Basic SQL validation
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { valid: false, error: 'Query cannot be empty' };
    }

    // Check for basic SQL keywords
    const sqlKeywords = /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|SHOW|DESCRIBE|EXPLAIN)\b/i;
    if (!sqlKeywords.test(trimmedQuery)) {
      return { valid: false, error: 'Query must start with a valid SQL keyword' };
    }

    // Check for balanced parentheses
    const openParens = (trimmedQuery.match(/\(/g) || []).length;
    const closeParens = (trimmedQuery.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { valid: false, error: 'Unbalanced parentheses in query' };
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}

// Database Dialect Detection
export function detectSQLDialect(query: string): string {
  const dialectPatterns = {
    postgresql: /\b(RETURNING|ILIKE|REGEXP|SERIAL|BIGSERIAL|UUID|JSONB)\b/i,
    mysql: /\b(AUTO_INCREMENT|LIMIT \d+,\d+|MEDIUMTEXT|LONGTEXT|TINYINT|UNSIGNED)\b/i,
    sqlite: /\b(AUTOINCREMENT|INTEGER PRIMARY KEY|PRAGMA|ATTACH)\b/i,
    mssql: /\b(TOP \d+|NVARCHAR|UNIQUEIDENTIFIER|GETDATE\(\)|CHARINDEX)\b/i,
    oracle: /\b(DUAL|ROWNUM|SYSDATE|VARCHAR2|NUMBER\(\d+,\d+\)|CONNECT BY)\b/i,
  };

  for (const [dialect, pattern] of Object.entries(dialectPatterns)) {
    if (pattern.test(query)) {
      return dialect;
    }
  }

  return 'generic';
}

// Connection String Parsing and Building
export function parseConnectionString(connectionString: string, dbType: DatabaseType): DatabaseParameters {
  const params: DatabaseParameters = {};

  try {
    switch (dbType) {
      case 'postgresql':
      case 'mysql': {
        // Parse postgres/mysql style: postgresql://user:password@host:port/database?options
        const url = new URL(connectionString);
        params.host = url.hostname;
        params.port = parseInt(url.port) || (dbType === 'postgresql' ? 5432 : 3306);
        params.database = url.pathname.slice(1);
        params.username = url.username;
        params.password = url.password;
        
        url.searchParams.forEach((value, key) => {
          (params as any)[key] = value;
        });
        break;
      }
      
      case 'mssql': {
        // Parse MSSQL style: Server=host;Database=db;User Id=user;Password=pass;
        const pairs = connectionString.split(';');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
            switch (normalizedKey) {
              case 'server':
              case 'datasource':
                params.host = value.trim();
                break;
              case 'database':
              case 'initialcatalog':
                params.database = value.trim();
                break;
              case 'userid':
              case 'username':
                params.username = value.trim();
                break;
              case 'password':
                params.password = value.trim();
                break;
              default:
                (params as any)[key.trim()] = value.trim();
            }
          }
        });
        break;
      }
      
      case 'sqlite': {
        // SQLite is just a file path
        params.database = connectionString;
        break;
      }
      
      case 'mongodb': {
        // Parse MongoDB URI: mongodb://username:password@host:port/database
        const url = new URL(connectionString);
        params.host = url.hostname;
        params.port = parseInt(url.port) || 27017;
        params.database = url.pathname.slice(1);
        params.username = url.username;
        params.password = url.password;
        
        url.searchParams.forEach((value, key) => {
          (params as any)[key] = value;
        });
        break;
      }
    }
  } catch (error) {
    console.warn('Connection string parsing failed:', error);
  }

  return params;
}

export function buildConnectionString(params: DatabaseParameters, dbType: DatabaseType): string {
  try {
    switch (dbType) {
      case 'postgresql':
        return buildPostgreSQLConnectionString(params);
      case 'mysql':
      case 'mariadb':
        return buildMySQLConnectionString(params, dbType);
      case 'mssql':
        return buildMSSQLConnectionString(params);
      case 'oracle':
        return buildOracleConnectionString(params);
      case 'sqlite':
        return buildSQLiteConnectionString(params);
      case 'mongodb':
        return buildMongoDBConnectionString(params);
      case 'redis':
        return buildRedisConnectionString(params);
      case 'cassandra':
        return buildCassandraConnectionString(params);
      case 'elasticsearch':
        return buildElasticsearchConnectionString(params);
      case 'h2':
      case 'hsqldb':
        return buildEmbeddedDBConnectionString(params, dbType);
      default:
        return buildGenericConnectionString(params, dbType);
    }
  } catch (error) {
    console.warn('Connection string building failed:', error);
    return '';
  }
}

// Connection Testing (mock implementation for client-side)
export async function testDatabaseConnection(connection: DatabaseConnection): Promise<{ success: boolean; message: string; latency?: number }> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const latency = Date.now() - startTime;
      
      // Mock validation based on connection string format
      try {
        const url = new URL(connection.connectionString.startsWith('http') ? connection.connectionString : `http://${connection.connectionString}`);
        resolve({
          success: true,
          message: `Connection test successful (simulated)`,
          latency,
        });
      } catch {
        resolve({
          success: false,
          message: 'Invalid connection string format',
          latency,
        });
      }
    }, Math.random() * 1000 + 500); // Random delay 500-1500ms
  });
}

// Query Execution (mock implementation)
export async function executeQuery(query: string, connection: DatabaseConnection): Promise<QueryResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const executionTime = Date.now() - startTime;
      
      // Mock result based on query type
      const queryType = query.trim().split(/\s+/)[0].toUpperCase();
      
      switch (queryType) {
        case 'SELECT':
          resolve({
            columns: ['id', 'name', 'email', 'created_at'],
            rows: [
              { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15T10:30:00Z' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16T14:22:00Z' },
              { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17T09:15:00Z' },
            ],
            rowCount: 3,
            executionTime,
          });
          break;
          
        case 'INSERT':
        case 'UPDATE':
        case 'DELETE':
          resolve({
            columns: [],
            rows: [],
            rowCount: Math.floor(Math.random() * 5) + 1,
            executionTime,
          });
          break;
          
        default:
          resolve({
            columns: ['result'],
            rows: [{ result: 'Query executed successfully' }],
            rowCount: 1,
            executionTime,
          });
      }
    }, Math.random() * 2000 + 500); // Random delay 500-2500ms
  });
}

// MongoDB Pipeline Utilities
export function validateMongoDBPipeline(pipeline: Array<Record<string, unknown>>): { valid: boolean; error?: string } {
  try {
    if (!Array.isArray(pipeline)) {
      return { valid: false, error: 'Pipeline must be an array' };
    }

    if (pipeline.length === 0) {
      return { valid: false, error: 'Pipeline cannot be empty' };
    }

    // Validate each stage
    for (let i = 0; i < pipeline.length; i++) {
      const stage = pipeline[i];
      if (typeof stage !== 'object' || stage === null) {
        return { valid: false, error: `Stage ${i + 1} must be an object` };
      }

      const stageKeys = Object.keys(stage);
      if (stageKeys.length !== 1) {
        return { valid: false, error: `Stage ${i + 1} must have exactly one operator` };
      }

      const operator = stageKeys[0];
      if (!operator.startsWith('$')) {
        return { valid: false, error: `Stage ${i + 1} operator "${operator}" must start with $` };
      }
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
}

export function formatMongoDBPipeline(pipeline: Array<Record<string, unknown>>): string {
  try {
    return JSON.stringify(pipeline, null, 2);
  } catch (error) {
    console.warn('MongoDB pipeline formatting failed:', error);
    return JSON.stringify(pipeline);
  }
}

// Comprehensive Connection String Builders
function buildPostgreSQLConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 5432, database = 'postgres', username, password, sslMode, ...options } = params;
  
  let url = 'postgresql://';
  if (username) {
    url += username;
    if (password) url += `:${password}`;
    url += '@';
  }
  url += `${host}:${port}/${database}`;
  
  const queryParams = [];
  if (sslMode) queryParams.push(`sslmode=${sslMode}`);
  if (params.applicationName) queryParams.push(`application_name=${params.applicationName}`);
  if (params.connectionTimeout) queryParams.push(`connect_timeout=${params.connectionTimeout}`);
  if (params.charset) queryParams.push(`client_encoding=${params.charset}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  return url;
}

function buildMySQLConnectionString(params: DatabaseParameters, dbType: DatabaseType): string {
  const { host = 'localhost', port = 3306, database = 'mysql', username, password, useEncryption, ...options } = params;
  
  let url = `${dbType}://`;
  if (username) {
    url += username;
    if (password) url += `:${password}`;
    url += '@';
  }
  url += `${host}:${port}/${database}`;
  
  const queryParams = [];
  if (useEncryption) queryParams.push('useSSL=true');
  if (params.charset) queryParams.push(`characterEncoding=${params.charset}`);
  if (params.autoReconnect) queryParams.push('autoReconnect=true');
  if (params.connectionTimeout) queryParams.push(`connectTimeout=${params.connectionTimeout}`);
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  return url;
}

function buildMSSQLConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port, database = 'master', username, password, instanceName, useEncryption, ...options } = params;
  
  let connStr = `Server=${host}`;
  if (port) connStr += `,${port}`;
  if (instanceName) connStr += `\\${instanceName}`;
  
  connStr += `;Database=${database}`;
  
  if (username) connStr += `;User Id=${username}`;
  if (password) connStr += `;Password=${password}`;
  if (useEncryption) connStr += ';Encrypt=true';
  if (params.connectionTimeout) connStr += `;Connection Timeout=${params.connectionTimeout}`;
  if (params.commandTimeout) connStr += `;Command Timeout=${params.commandTimeout}`;
  if (params.applicationName) connStr += `;Application Name=${params.applicationName}`;
  
  return connStr;
}

function buildOracleConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 1521, serviceName, database } = params;
  return `jdbc:oracle:thin:@${host}:${port}:${serviceName || database || 'XE'}`;
}

function buildSQLiteConnectionString(params: DatabaseParameters): string {
  return params.filePath || params.database || 'database.db';
}

function buildMongoDBConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 27017, database = 'admin', username, password, authSource, replicaSet, retryWrites } = params;
  
  let url = 'mongodb://';
  if (username) {
    url += username;
    if (password) url += `:${password}`;
    url += '@';
  }
  url += `${host}:${port}/${database}`;
  
  const queryParams = [];
  if (authSource) queryParams.push(`authSource=${authSource}`);
  if (replicaSet) queryParams.push(`replicaSet=${replicaSet}`);
  if (retryWrites) queryParams.push('retryWrites=true');
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }
  
  return url;
}

function buildRedisConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 6379, password, database } = params;
  
  let url = 'redis://';
  if (password) url += `:${password}@`;
  url += `${host}:${port}`;
  if (database) url += `/${database}`;
  
  return url;
}

function buildCassandraConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 9042, keyspace, datacenter } = params;
  let connStr = `${host}:${port}`;
  if (keyspace) connStr += `/${keyspace}`;
  return connStr;
}

function buildElasticsearchConnectionString(params: DatabaseParameters): string {
  const { host = 'localhost', port = 9200, username, password, useEncryption } = params;
  
  let url = useEncryption ? 'https://' : 'http://';
  if (username) {
    url += username;
    if (password) url += `:${password}`;
    url += '@';
  }
  url += `${host}:${port}`;
  
  return url;
}

function buildEmbeddedDBConnectionString(params: DatabaseParameters, dbType: DatabaseType): string {
  const { filePath, database } = params;
  const path = filePath || database || 'testdb';
  
  if (dbType === 'h2') {
    return `jdbc:h2:file:${path}`;
  } else if (dbType === 'hsqldb') {
    return `jdbc:hsqldb:file:${path}`;
  }
  
  return path;
}

function buildGenericConnectionString(params: DatabaseParameters, dbType: DatabaseType): string {
  const { host = 'localhost', port, database = 'default', username, password } = params;
  
  let url = `${dbType}://`;
  if (username) {
    url += username;
    if (password) url += `:${password}`;
    url += '@';
  }
  url += `${host}:${port || 5432}/${database}`;
  
  return url;
}

// Database Configuration Utilities
export function getDatabaseDefaults(dbType: DatabaseType): DatabaseParameters {
  const defaults: Record<DatabaseType, DatabaseParameters> = {
    postgresql: { host: 'localhost', port: 5432, database: 'postgres', sslMode: 'prefer' },
    mysql: { host: 'localhost', port: 3306, database: 'mysql', charset: 'utf8mb4' },
    mariadb: { host: 'localhost', port: 3306, database: 'mysql', charset: 'utf8mb4' },
    mssql: { host: 'localhost', port: 1433, database: 'master', useEncryption: true },
    oracle: { host: 'localhost', port: 1521, serviceName: 'XE' },
    sqlite: { filePath: 'database.db' },
    mongodb: { host: 'localhost', port: 27017, database: 'admin', authSource: 'admin' },
    redis: { host: 'localhost', port: 6379, database: '0' },
    cassandra: { host: 'localhost', port: 9042, keyspace: 'system' },
    elasticsearch: { host: 'localhost', port: 9200, useEncryption: false },
    h2: { filePath: 'testdb' },
    hsqldb: { filePath: 'testdb' },
    firebird: { host: 'localhost', port: 3050, database: 'database.fdb' },
    informix: { host: 'localhost', port: 1526, database: 'sysmaster' },
    db2: { host: 'localhost', port: 50000, database: 'sample' }
  };
  
  return defaults[dbType] || { host: 'localhost' };
}

export function getRequiredFields(dbType: DatabaseType): string[] {
  const requiredFields: Record<DatabaseType, string[]> = {
    postgresql: ['host', 'database', 'username'],
    mysql: ['host', 'database', 'username'],
    mariadb: ['host', 'database', 'username'],
    mssql: ['host', 'database'],
    oracle: ['host', 'serviceName'],
    sqlite: ['filePath'],
    mongodb: ['host', 'database'],
    redis: ['host'],
    cassandra: ['host'],
    elasticsearch: ['host'],
    h2: ['filePath'],
    hsqldb: ['filePath'],
    firebird: ['host', 'database'],
    informix: ['host', 'database'],
    db2: ['host', 'database']
  };
  
  return requiredFields[dbType] || ['host'];
}

export function getSupportedParameters(dbType: DatabaseType): string[] {
  const baseParams = ['host', 'port', 'database', 'username', 'password'];
  const sslParams = ['sslMode', 'sslCert', 'sslKey', 'sslRootCert', 'verifyServerCertificate'];
  const poolParams = ['minPoolSize', 'maxPoolSize', 'connectionTimeout', 'idleTimeout'];
  const advancedParams = ['charset', 'timezone', 'applicationName'];
  
  switch (dbType) {
    case 'postgresql':
      return [...baseParams, ...sslParams, ...poolParams, ...advancedParams, 'schema'];
    case 'mysql':
    case 'mariadb':
      return [...baseParams, 'useEncryption', ...poolParams, ...advancedParams, 'autoReconnect'];
    case 'mssql':
      return [...baseParams, 'instanceName', 'useEncryption', ...poolParams, 'commandTimeout', 'workstation'];
    case 'oracle':
      return [...baseParams, 'serviceName', ...poolParams];
    case 'sqlite':
      return ['filePath'];
    case 'mongodb':
      return [...baseParams, 'authSource', 'replicaSet', 'retryWrites', 'authMechanism'];
    case 'redis':
      return ['host', 'port', 'password', 'database'];
    case 'cassandra':
      return ['host', 'port', 'keyspace', 'datacenter', 'username', 'password'];
    case 'elasticsearch':
      return ['host', 'port', 'username', 'password', 'useEncryption'];
    default:
      return baseParams;
  }
}

// Validation and Security
export function validateConnectionParameters(params: DatabaseParameters, dbType: DatabaseType): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const required = getRequiredFields(dbType);
  for (const field of required) {
    if (!params[field as keyof DatabaseParameters]) {
      errors.push(`${field} is required for ${dbType}`);
    }
  }
  
  // Port validation
  if (params.port && (params.port < 1 || params.port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }
  
  // SSL warnings
  if (dbType !== 'sqlite' && dbType !== 'h2' && dbType !== 'hsqldb') {
    if (params.sslMode === 'disable' || !params.useEncryption) {
      warnings.push('Consider enabling SSL/encryption for production environments');
    }
  }
  
  // Password warnings
  if (params.password && params.password.length < 8) {
    warnings.push('Password should be at least 8 characters long');
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

export function generateSecurityRecommendations(params: DatabaseParameters, dbType: DatabaseType): SecurityRecommendation[] {
  const recommendations: SecurityRecommendation[] = [];
  
  // SSL/Encryption check
  if (dbType !== 'sqlite' && dbType !== 'h2' && dbType !== 'hsqldb') {
    if (params.sslMode === 'disable' || !params.useEncryption) {
      recommendations.push({
        type: 'SSL',
        severity: 'HIGH',
        message: 'SSL/TLS encryption is disabled',
        solution: 'Enable SSL encryption to protect data in transit',
        documentation: 'https://security-docs.example.com/ssl'
      });
    }
  }
  
  // Password security
  if (params.password) {
    if (params.password.length < 12) {
      recommendations.push({
        type: 'PASSWORD',
        severity: 'MEDIUM',
        message: 'Password is shorter than recommended length',
        solution: 'Use passwords with at least 12 characters including mixed case, numbers, and symbols'
      });
    }
    
    if (/^(password|123|admin|root|test)$/i.test(params.password)) {
      recommendations.push({
        type: 'PASSWORD',
        severity: 'HIGH',
        message: 'Common or weak password detected',
        solution: 'Use a strong, unique password that is not easily guessable'
      });
    }
  }
  
  // Network security
  if (params.host === 'localhost' || params.host === '127.0.0.1') {
    recommendations.push({
      type: 'NETWORK',
      severity: 'LOW',
      message: 'Using localhost connection',
      solution: 'Acceptable for development, ensure proper network security for production'
    });
  }
  
  return recommendations;
}

export function maskSensitiveData(connectionString: string): string {
  return connectionString
    .replace(/(password=|:)[^;&@\s]+/gi, '$1***')
    .replace(/\/\/([^:]+):([^@]+)@/g, '//$1:***@');
}