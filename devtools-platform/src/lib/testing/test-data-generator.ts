'use client';

import { 
  APIRequest, 
  DatabaseConnection, 
  MongoQuery, 
  SQLQuery, 
  MockEndpoint,
  EnvEnvironment,
  NPMAnalysis
} from '@/types';

// Realistic test data generators
export class TestDataGenerator {
  
  // Generate realistic API requests for testing
  static generateAPIRequests(count: number = 10): APIRequest[] {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    const endpoints = [
      'https://jsonplaceholder.typicode.com/posts',
      'https://api.github.com/users/octocat',
      'https://httpbin.org/json',
      'https://reqres.in/api/users',
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://dog.ceo/api/breeds/image/random',
      'https://api.quotegarden.io/api/v3/quotes/random',
      'https://api.nasa.gov/planetary/apod',
      'https://api.openweathermap.org/data/2.5/weather',
      'https://api.coindesk.com/v1/bpi/currentprice.json'
    ];
    
    const sampleBodies = [
      '{"title": "Test Post", "body": "This is a test post", "userId": 1}',
      '{"name": "John Doe", "email": "john@example.com", "age": 30}',
      '{"product": "Test Product", "price": 29.99, "category": "electronics"}',
      '{"query": "test search", "filters": {"category": "all", "sort": "date"}}',
      '{"settings": {"theme": "dark", "notifications": true, "language": "en"}}'
    ];
    
    const commonHeaders = [
      'Content-Type: application/json',
      'Authorization: Bearer token123',
      'Accept: application/json',
      'User-Agent: DevTools/1.0',
      'X-API-Key: test-api-key-123'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `test-req-${i + 1}`,
      name: `Test Request ${i + 1}`,
      method: methods[Math.floor(Math.random() * methods.length)],
      url: endpoints[Math.floor(Math.random() * endpoints.length)],
      headers: this.parseHeaders(commonHeaders[Math.floor(Math.random() * commonHeaders.length)]),
      body: Math.random() > 0.5 ? sampleBodies[Math.floor(Math.random() * sampleBodies.length)] : '',
      timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // Last 30 days
    }));
  }

  // Generate realistic database connections
  static generateDatabaseConnections(count: number = 8): DatabaseConnection[] {
    const databases = [
      { type: 'postgresql', host: 'localhost', port: 5432, database: 'ecommerce_dev' },
      { type: 'mysql', host: '192.168.1.100', port: 3306, database: 'analytics' },
      { type: 'mongodb', host: 'cluster0.mongodb.net', port: 27017, database: 'user_data' },
      { type: 'redis', host: 'cache-server.company.com', port: 6379, database: 'session_store' },
      { type: 'sqlite', host: 'localhost', port: null, database: 'local_dev.db' },
      { type: 'mssql', host: 'sql-server.internal', port: 1433, database: 'inventory' },
      { type: 'oracle', host: 'oracle-prod.company.com', port: 1521, database: 'ORCL' },
      { type: 'cassandra', host: 'cassandra-cluster.aws.com', port: 9042, database: 'events' }
    ];

    return databases.slice(0, count).map((db, i) => ({
      id: `test-conn-${i + 1}`,
      name: `${db.type.charAt(0).toUpperCase() + db.type.slice(1)} - ${db.database}`,
      type: db.type as any,
      connectionString: this.generateConnectionString(db),
      parameters: {
        host: db.host,
        port: db.port,
        database: db.database,
        username: 'test_user',
        password: '***hidden***',
        sslMode: Math.random() > 0.5 ? 'require' : 'prefer'
      },
      timestamp: Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000, // Last 15 days
      valid: Math.random() > 0.2, // 80% valid connections
      testResult: {
        success: Math.random() > 0.2,
        message: Math.random() > 0.2 ? 'Connection successful' : 'Connection timeout',
        latencyMs: Math.floor(Math.random() * 500) + 50,
        timestamp: Date.now()
      }
    }));
  }

  // Generate realistic MongoDB queries
  static generateMongoQueries(count: number = 15): MongoQuery[] {
    const collections = ['users', 'products', 'orders', 'analytics', 'logs', 'sessions'];
    const operations = ['find', 'aggregate', 'insertOne', 'updateMany', 'deleteOne'] as const;
    
    const sampleAggregations = [
      [
        { '$match': { status: 'active', createdAt: { '$gte': '2024-01-01' } } },
        { '$group': { _id: '$category', total: { '$sum': '$amount' } } },
        { '$sort': { total: -1 } }
      ],
      [
        { '$match': { userId: { '$exists': true } } },
        { '$lookup': { from: 'profiles', localField: 'userId', foreignField: '_id', as: 'profile' } },
        { '$unwind': '$profile' },
        { '$project': { name: '$profile.name', email: 1, lastLogin: 1 } }
      ]
    ];

    const sampleFilters = [
      { status: 'active', age: { '$gte': 18 } },
      { category: 'electronics', price: { '$lt': 1000 } },
      { createdAt: { '$gte': new Date('2024-01-01') } },
      { tags: { '$in': ['featured', 'bestseller'] } }
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `mongo-query-${i + 1}`,
      name: `Query ${i + 1}: ${collections[i % collections.length]}`,
      collection: collections[i % collections.length],
      operation: operations[Math.floor(Math.random() * operations.length)],
      pipeline: Math.random() > 0.5 ? sampleAggregations[Math.floor(Math.random() * sampleAggregations.length)] : undefined,
      filter: Math.random() > 0.3 ? { 
        conditions: [
          {
            id: `cond-${i}`,
            field: 'status',
            operator: '$eq',
            value: 'active',
            dataType: 'string'
          }
        ],
        logic: 'AND'
      } : undefined,
      options: {
        limit: Math.floor(Math.random() * 100) + 10,
        skip: Math.floor(Math.random() * 50),
        sort: { createdAt: -1 }
      },
      timestamp: Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000,
      generated: {
        shell: `db.${collections[i % collections.length]}.find({status: "active"})`,
        nodejs: `collection.find({status: "active"}).toArray()`,
        python: `collection.find({"status": "active"})`,
        java: `collection.find(eq("status", "active"))`,
        csharp: `collection.Find(x => x.Status == "active")`,
        php: `$collection->find(["status" => "active"])`
      }
    }));
  }

  // Generate realistic SQL queries  
  static generateSQLQueries(count: number = 12): SQLQuery[] {
    const queries = [
      'SELECT * FROM users WHERE created_at >= CURRENT_DATE - INTERVAL 30 DAY',
      'SELECT p.name, c.name as category FROM products p JOIN categories c ON p.category_id = c.id',
      'UPDATE users SET last_login = NOW() WHERE id = 123',
      'INSERT INTO orders (user_id, total, status) VALUES (1, 99.99, "pending")',
      'SELECT COUNT(*) as total_orders, SUM(amount) as total_revenue FROM orders WHERE DATE(created_at) = CURRENT_DATE',
      'DELETE FROM sessions WHERE expires_at < NOW()',
      'SELECT u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id HAVING order_count > 5',
      'CREATE INDEX idx_user_email ON users(email)',
      'ALTER TABLE products ADD COLUMN discount_price DECIMAL(10,2)',
      'SELECT * FROM logs WHERE level = "ERROR" AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      'WITH monthly_sales AS (SELECT DATE_FORMAT(created_at, "%Y-%m") as month, SUM(total) as sales FROM orders GROUP BY month) SELECT * FROM monthly_sales ORDER BY month DESC',
      'SELECT p.*, AVG(r.rating) as avg_rating FROM products p LEFT JOIN reviews r ON p.id = r.product_id GROUP BY p.id'
    ];

    const dialects = ['mysql', 'postgresql', 'sqlite', 'mssql', 'oracle'] as const;

    return queries.slice(0, count).map((query, i) => ({
      id: `sql-query-${i + 1}`,
      name: `SQL Query ${i + 1}`,
      query,
      dialect: dialects[Math.floor(Math.random() * dialects.length)],
      description: `Generated test query for ${dialects[i % dialects.length]}`,
      timestamp: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000
    }));
  }

  // Generate realistic mock endpoints
  static generateMockEndpoints(count: number = 8): MockEndpoint[] {
    const endpoints = [
      { method: 'GET', path: '/api/users', response: { status: 200, body: JSON.stringify([{ id: 1, name: 'John Doe', email: 'john@example.com' }]) } },
      { method: 'POST', path: '/api/auth/login', response: { status: 200, body: JSON.stringify({ token: 'jwt-token-123', user: { id: 1 } }) } },
      { method: 'GET', path: '/api/products', response: { status: 200, body: JSON.stringify({ products: [], total: 0 }) } },
      { method: 'PUT', path: '/api/users/:id', response: { status: 200, body: JSON.stringify({ success: true }) } },
      { method: 'DELETE', path: '/api/products/:id', response: { status: 204, body: '' } },
      { method: 'GET', path: '/api/orders', response: { status: 200, body: JSON.stringify({ orders: [], pagination: {} }) } },
      { method: 'POST', path: '/api/webhooks/payment', response: { status: 200, body: JSON.stringify({ received: true }) } },
      { method: 'GET', path: '/api/health', response: { status: 200, body: JSON.stringify({ status: 'healthy', uptime: '5d 12h' }) } }
    ];

    return endpoints.slice(0, count).map((endpoint, i) => ({
      id: `mock-${i + 1}`,
      name: `${endpoint.method} ${endpoint.path}`,
      method: endpoint.method as any,
      path: endpoint.path,
      response: {
        status: endpoint.response.status,
        headers: { 'Content-Type': 'application/json' },
        body: endpoint.response.body
      },
      delay: Math.random() > 0.7 ? Math.floor(Math.random() * 1000) + 100 : undefined,
      enabled: Math.random() > 0.2 // 80% enabled
    }));
  }

  // Generate realistic environment configurations
  static generateEnvironments(count: number = 4): EnvEnvironment[] {
    const environments = ['development', 'staging', 'production', 'testing'] as const;
    
    const commonVariables = [
      { key: 'DATABASE_URL', value: 'postgresql://user:pass@localhost:5432/mydb', sensitive: true, category: 'database' },
      { key: 'API_KEY', value: 'sk-test-123456789', sensitive: true, category: 'api' },
      { key: 'NODE_ENV', value: 'development', sensitive: false, category: 'app' },
      { key: 'PORT', value: '3000', sensitive: false, category: 'app' },
      { key: 'REDIS_URL', value: 'redis://localhost:6379', sensitive: true, category: 'cache' },
      { key: 'JWT_SECRET', value: 'super-secret-key', sensitive: true, category: 'auth' }
    ];

    return environments.slice(0, count).map((env, i) => ({
      id: `env-${i + 1}`,
      name: env,
      displayName: env.charAt(0).toUpperCase() + env.slice(1),
      description: `${env.charAt(0).toUpperCase() + env.slice(1)} environment configuration`,
      category: env,
      variables: commonVariables.map((variable, j) => ({
        id: `var-${i}-${j}`,
        ...variable,
        value: variable.key === 'NODE_ENV' ? env : variable.value,
        dataType: 'string' as const,
        lastUpdated: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      })),
      settings: {
        allowInheritance: true,
        requireAllVariables: env === 'production',
        maskSensitive: true,
        validateOnSave: true
      },
      metadata: {
        created: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        version: '1.0.0',
        author: 'test-user',
        tags: ['generated', 'test']
      }
    }));
  }

  // Generate realistic NPM analyses
  static generateNPMAnalyses(count: number = 6): NPMAnalysis[] {
    const packages = [
      { name: 'react', version: '18.2.0', size: 42.3 * 1024, deps: ['js-tokens', 'loose-envify'] },
      { name: 'lodash', version: '4.17.21', size: 71.2 * 1024, deps: [] },
      { name: 'axios', version: '1.6.0', size: 15.8 * 1024, deps: ['follow-redirects', 'form-data'] },
      { name: 'moment', version: '2.29.4', size: 288.7 * 1024, deps: [] },
      { name: 'express', version: '4.18.2', size: 65.4 * 1024, deps: ['accepts', 'body-parser', 'cookie', 'debug'] },
      { name: 'typescript', version: '5.2.2', size: 4.1 * 1024 * 1024, deps: [] }
    ];

    return packages.slice(0, count).map((pkg, i) => ({
      id: `npm-${i + 1}`,
      name: `${pkg.name} Analysis`,
      packageName: pkg.name,
      version: pkg.version,
      analysis: {
        bundleSize: pkg.size,
        dependencies: pkg.deps,
        devDependencies: [],
        peerDependencies: [],
        vulnerabilities: Math.floor(Math.random() * 3), // 0-2 vulnerabilities
        lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
    }));
  }

  // Helper methods
  private static parseHeaders(headerString: string): Record<string, string> {
    const [key, value] = headerString.split(': ');
    return { [key]: value };
  }

  private static generateConnectionString(db: any): string {
    switch (db.type) {
      case 'postgresql':
        return `postgresql://user:password@${db.host}:${db.port}/${db.database}`;
      case 'mysql':
        return `mysql://user:password@${db.host}:${db.port}/${db.database}`;
      case 'mongodb':
        return `mongodb://user:password@${db.host}:${db.port}/${db.database}`;
      case 'sqlite':
        return `sqlite://${db.database}`;
      default:
        return `${db.type}://user:password@${db.host}:${db.port}/${db.database}`;
    }
  }

  // Generate complete test dataset
  static generateCompleteTestData() {
    return {
      apiRequests: this.generateAPIRequests(15),
      databaseConnections: this.generateDatabaseConnections(10),
      mongoQueries: this.generateMongoQueries(20),
      sqlQueries: this.generateSQLQueries(15),
      mockEndpoints: this.generateMockEndpoints(12),
      envEnvironments: this.generateEnvironments(4),
      npmAnalyses: this.generateNPMAnalyses(8),
      webSocketConnections: [],
      jsonFormats: [],
      base64Conversions: []
    };
  }
}

// Test scenarios for specific use cases
export const TEST_SCENARIOS = {
  // API Testing scenarios
  apiTesting: {
    restAPI: {
      description: 'Test REST API endpoints with various HTTP methods',
      requests: TestDataGenerator.generateAPIRequests(5),
      expectedResults: ['200 OK', '201 Created', '400 Bad Request', '401 Unauthorized', '500 Server Error']
    },
    authFlow: {
      description: 'Test authentication flow with login, token refresh, and protected routes',
      requests: [
        { method: 'POST', url: '/api/auth/login', body: '{"email":"test@example.com","password":"password"}' },
        { method: 'GET', url: '/api/user/profile', headers: { 'Authorization': 'Bearer token123' } },
        { method: 'POST', url: '/api/auth/refresh', headers: { 'Authorization': 'Bearer refresh_token' } }
      ]
    }
  },

  // Database Testing scenarios  
  databaseTesting: {
    connectionValidation: {
      description: 'Test database connections across different database types',
      connections: TestDataGenerator.generateDatabaseConnections(5),
      tests: ['connection', 'authentication', 'permissions', 'latency']
    },
    queryOptimization: {
      description: 'Test SQL query performance and optimization',
      queries: TestDataGenerator.generateSQLQueries(8),
      metrics: ['execution_time', 'rows_examined', 'index_usage', 'memory_usage']
    }
  },

  // Performance Testing scenarios
  performanceTesting: {
    largeDatasetsVirtualization: {
      description: 'Test virtual scrolling with large datasets',
      dataSize: 10000,
      expectedBehavior: 'Smooth scrolling with minimal memory usage'
    },
    debouncedOperations: {
      description: 'Test debounced search and input operations',
      inputDelay: 300,
      expectedBehavior: 'Reduced API calls and improved UX'
    }
  }
};