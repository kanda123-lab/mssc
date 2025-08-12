import { faker } from '@faker-js/faker'

// API Request Mock Data
export const generateMockApiRequest = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  url: faker.internet.url(),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${faker.string.alphanumeric(32)}`,
    ...faker.helpers.maybe(() => ({
      'User-Agent': faker.internet.userAgent(),
    })),
  },
  body: faker.helpers.maybe(() => JSON.stringify({
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    data: faker.lorem.paragraphs(2),
  })),
  timestamp: faker.date.recent().getTime(),
  responseTime: faker.number.int({ min: 50, max: 2000 }),
  status: faker.helpers.arrayElement([200, 201, 400, 401, 403, 404, 500]),
  ...overrides,
})

// WebSocket Connection Mock Data
export const generateMockWebSocketConnection = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(2),
  url: `ws://${faker.internet.domainName()}:${faker.internet.port()}/ws`,
  protocols: faker.helpers.arrayElements(['ws', 'wss', 'chat', 'graphql-ws']),
  isConnected: faker.datatype.boolean(),
  messages: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement(['sent', 'received']),
    content: JSON.stringify({
      event: faker.helpers.arrayElement(['message', 'notification', 'update']),
      data: faker.lorem.sentence(),
      timestamp: faker.date.recent().toISOString(),
    }),
    timestamp: faker.date.recent().getTime(),
  })),
  lastConnected: faker.date.recent().getTime(),
  ...overrides,
})

// Mock Server Endpoint Data
export const generateMockEndpoint = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  path: `/${faker.lorem.word()}/${faker.lorem.word()}`,
  method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
  description: faker.lorem.sentence(),
  response: {
    status: faker.helpers.weightedArrayElement([
      { weight: 0.8, value: 200 },
      { weight: 0.1, value: 400 },
      { weight: 0.05, value: 404 },
      { weight: 0.05, value: 500 },
    ]),
    headers: {
      'Content-Type': 'application/json',
      'X-Response-Time': `${faker.number.int({ min: 10, max: 500 })}ms`,
    },
    body: JSON.stringify({
      id: faker.number.int(),
      message: faker.lorem.sentence(),
      data: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        id: faker.number.int(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        category: faker.commerce.department(),
      })),
    }),
    delay: faker.number.int({ min: 0, max: 2000 }),
  },
  enabled: faker.datatype.boolean(),
  hitCount: faker.number.int({ min: 0, max: 1000 }),
  createdAt: faker.date.past().getTime(),
  ...overrides,
})

// JSON Formatter Mock Data
export const generateMockJSON = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(2),
  content: JSON.stringify({
    user: {
      id: faker.number.int(),
      profile: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        preferences: {
          theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
          language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
          notifications: faker.datatype.boolean(),
        },
      },
      metadata: {
        createdAt: faker.date.past().toISOString(),
        lastLogin: faker.date.recent().toISOString(),
        loginCount: faker.number.int({ min: 1, max: 1000 }),
      },
    },
    settings: {
      features: faker.helpers.arrayElements([
        'feature-a', 'feature-b', 'feature-c', 'feature-d'
      ]),
      config: Object.fromEntries(
        Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => [
          faker.lorem.word(),
          faker.helpers.arrayElement([
            faker.datatype.boolean(),
            faker.number.int(),
            faker.lorem.word(),
          ])
        ])
      ),
    },
    data: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      tags: faker.helpers.arrayElements([
        'urgent', 'important', 'review', 'draft', 'published'
      ]),
      metrics: {
        views: faker.number.int({ min: 0, max: 10000 }),
        likes: faker.number.int({ min: 0, max: 1000 }),
        shares: faker.number.int({ min: 0, max: 500 }),
      },
    })),
  }, null, 2),
  timestamp: faker.date.recent().getTime(),
  isValid: true,
  size: faker.number.int({ min: 100, max: 10000 }),
  ...overrides,
})

// Base64 Conversion Mock Data
export const generateMockBase64Conversion = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  originalText: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
  encodedText: faker.string.alphanumeric(faker.number.int({ min: 50, max: 500 })),
  operation: faker.helpers.arrayElement(['encode', 'decode']),
  timestamp: faker.date.recent().getTime(),
  size: faker.number.int({ min: 10, max: 1000 }),
  ...overrides,
})

// Database Connection Mock Data
export const generateMockDatabaseConnection = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Database',
  type: faker.helpers.arrayElement(['mysql', 'postgresql', 'mongodb', 'sqlite']),
  host: faker.internet.ip(),
  port: faker.internet.port(),
  database: faker.lorem.word(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  ssl: faker.datatype.boolean(),
  connectionString: '',
  isConnected: faker.datatype.boolean(),
  lastTested: faker.date.recent().getTime(),
  testResult: {
    success: faker.datatype.boolean(),
    message: faker.helpers.arrayElement([
      'Connection successful',
      'Authentication failed',
      'Host unreachable',
      'Database not found',
      'SSL certificate invalid',
    ]),
    responseTime: faker.number.int({ min: 10, max: 5000 }),
  },
  createdAt: faker.date.past().getTime(),
  ...overrides,
})

// MongoDB Query Mock Data
export const generateMockMongoQuery = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  collection: faker.helpers.arrayElement([
    'users', 'products', 'orders', 'analytics', 'logs'
  ]),
  operation: faker.helpers.arrayElement([
    'find', 'findOne', 'insertOne', 'insertMany', 
    'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate'
  ]),
  query: JSON.stringify({
    [faker.lorem.word()]: faker.helpers.arrayElement([
      faker.lorem.word(),
      faker.number.int(),
      { $gt: faker.number.int() },
      { $regex: faker.lorem.word() },
    ]),
  }),
  projection: faker.helpers.maybe(() => JSON.stringify(
    Object.fromEntries(
      faker.helpers.arrayElements(['name', 'email', 'createdAt', 'status'])
        .map(field => [field, 1])
    )
  )),
  sort: faker.helpers.maybe(() => JSON.stringify({
    [faker.helpers.arrayElement(['createdAt', 'updatedAt', 'name'])]: 
      faker.helpers.arrayElement([1, -1])
  })),
  limit: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 })),
  results: Array.from({ length: faker.number.int({ min: 0, max: 20 }) }, () => ({
    _id: faker.database.mongodbObjectId(),
    ...Object.fromEntries(
      Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, () => [
        faker.lorem.word(),
        faker.helpers.arrayElement([
          faker.lorem.sentence(),
          faker.number.int(),
          faker.datatype.boolean(),
          faker.date.recent().toISOString(),
        ])
      ])
    )
  })),
  executionTime: faker.number.int({ min: 1, max: 1000 }),
  timestamp: faker.date.recent().getTime(),
  ...overrides,
})

// NPM Package Analysis Mock Data
export const generateMockNpmPackage = (overrides?: Partial<any>) => ({
  name: faker.lorem.word(),
  version: `${faker.number.int({ min: 0, max: 10 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 50 })}`,
  description: faker.lorem.sentence(),
  homepage: faker.internet.url(),
  repository: {
    type: 'git',
    url: `git+https://github.com/${faker.internet.userName()}/${faker.lorem.word()}.git`,
  },
  author: {
    name: faker.person.fullName(),
    email: faker.internet.email(),
  },
  license: faker.helpers.arrayElement(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause']),
  keywords: faker.helpers.arrayElements([
    'react', 'javascript', 'typescript', 'node', 'cli', 'api', 'ui', 'testing'
  ]),
  dependencies: Object.fromEntries(
    Array.from({ length: faker.number.int({ min: 3, max: 15 }) }, () => [
      faker.lorem.word(),
      `^${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 50 })}`,
    ])
  ),
  devDependencies: Object.fromEntries(
    Array.from({ length: faker.number.int({ min: 2, max: 10 }) }, () => [
      faker.lorem.word(),
      `^${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 50 })}`,
    ])
  ),
  scripts: Object.fromEntries(
    faker.helpers.arrayElements(['build', 'test', 'start', 'lint', 'dev'])
      .map(script => [script, faker.lorem.words(2)])
  ),
  publishedAt: faker.date.past().toISOString(),
  downloads: {
    weekly: faker.number.int({ min: 100, max: 100000 }),
    monthly: faker.number.int({ min: 1000, max: 1000000 }),
    yearly: faker.number.int({ min: 10000, max: 10000000 }),
  },
  ...overrides,
})

// Environment Variable Mock Data
export const generateMockEnvironment = (overrides?: Partial<any>) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Development', 'Staging', 'Production', 'Testing']),
  description: faker.lorem.sentence(),
  variables: Array.from({ length: faker.number.int({ min: 5, max: 20 }) }, () => ({
    id: faker.string.uuid(),
    key: faker.lorem.word().toUpperCase() + '_' + faker.lorem.word().toUpperCase(),
    value: faker.helpers.arrayElement([
      faker.internet.url(),
      faker.string.alphanumeric(32),
      faker.internet.email(),
      faker.number.int().toString(),
      faker.datatype.boolean().toString(),
    ]),
    description: faker.lorem.sentence(),
    isSecret: faker.datatype.boolean(),
    category: faker.helpers.arrayElement([
      'database', 'api', 'auth', 'cache', 'mail', 'storage'
    ]),
  })),
  lastModified: faker.date.recent().getTime(),
  createdAt: faker.date.past().getTime(),
  isActive: faker.datatype.boolean(),
  ...overrides,
})

// Test helper functions
export const generateMockApiResponse = <T>(data: T, overrides?: Partial<any>) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {
    'Content-Type': 'application/json',
    'X-Response-Time': `${faker.number.int({ min: 10, max: 500 })}ms`,
  },
  success: true,
  timestamp: Date.now(),
  ...overrides,
})

export const generateMockError = (overrides?: Partial<any>) => ({
  message: faker.lorem.sentence(),
  code: faker.helpers.arrayElement(['NETWORK_ERROR', 'VALIDATION_ERROR', 'SERVER_ERROR']),
  status: faker.helpers.arrayElement([400, 401, 403, 404, 500, 502, 503]),
  timestamp: Date.now(),
  details: faker.lorem.paragraph(),
  ...overrides,
})