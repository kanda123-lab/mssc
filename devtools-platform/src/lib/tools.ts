import { Tool, ToolCategory } from '@/types';

export const tools: Tool[] = [
  // API Tools
  {
    id: 'api-tester',
    name: 'API Tester',
    description: 'Test REST APIs with custom requests and save them for later use',
    icon: 'Zap',
    path: '/tools/api-tester',
    category: 'api',
    tags: ['http', 'rest', 'testing', 'requests'],
    featured: true,
    difficulty: 'beginner'
  },
  {
    id: 'websocket-tester',
    name: 'WebSocket Tester',
    description: 'Connect to WebSocket servers and test real-time communication',
    icon: 'Wifi',
    path: '/tools/websocket-tester',
    category: 'api',
    tags: ['websocket', 'realtime', 'testing'],
    featured: false,
    difficulty: 'intermediate'
  },
  {
    id: 'mock-server',
    name: 'Mock Server',
    description: 'Create mock API endpoints for testing and development',
    icon: 'Server',
    path: '/tools/mock-server',
    category: 'api',
    tags: ['mock', 'server', 'endpoints', 'testing'],
    featured: true,
    difficulty: 'intermediate'
  },
  
  // Data Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    icon: 'FileText',
    path: '/tools/json-formatter',
    category: 'data',
    tags: ['json', 'format', 'validate', 'minify'],
    featured: true,
    difficulty: 'beginner'
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode text to/from Base64 format',
    icon: 'Code',
    path: '/tools/base64',
    category: 'data',
    tags: ['base64', 'encode', 'decode', 'text'],
    featured: false,
    difficulty: 'beginner'
  },
  
  // Database Tools
  {
    id: 'visual-query-builder',
    name: 'Visual SQL Query Builder',
    description: 'Advanced visual query builder with drag-drop tables, JOINs, subqueries, and real-time SQL generation',
    icon: 'Layers',
    path: '/tools/visual-query-builder',
    category: 'database',
    tags: ['sql', 'visual', 'query', 'builder', 'joins'],
    featured: true,
    difficulty: 'advanced'
  },
  {
    id: 'sql-query-builder',
    name: 'SQL Query Builder',
    description: 'Visual SQL query construction with syntax highlighting and validation',
    icon: 'Database',
    path: '/tools/sql-query-builder',
    category: 'database',
    tags: ['sql', 'query', 'syntax', 'validation'],
    featured: false,
    difficulty: 'intermediate'
  },
  {
    id: 'connection-string-builder',
    name: 'Connection String Builder',
    description: 'Build and validate database connection strings for various databases',
    icon: 'Link',
    path: '/tools/connection-string-builder',
    category: 'database',
    tags: ['connection', 'database', 'string', 'validation'],
    featured: true,
    difficulty: 'intermediate'
  },
  {
    id: 'mongodb-query-builder',
    name: 'MongoDB Query Builder',
    description: 'Visual aggregation pipeline builder for MongoDB queries',
    icon: 'Layers3',
    path: '/tools/mongodb-query-builder',
    category: 'database',
    tags: ['mongodb', 'aggregation', 'pipeline', 'nosql'],
    featured: true,
    difficulty: 'advanced'
  },
  
  // Development Tools
  {
    id: 'npm-package-analyzer',
    name: 'NPM Package Analyzer',
    description: 'Analyze bundle size, dependencies, and vulnerabilities of NPM packages',
    icon: 'Package',
    path: '/tools/npm-package-analyzer',
    category: 'development',
    tags: ['npm', 'package', 'dependencies', 'security'],
    featured: true,
    difficulty: 'intermediate'
  },
  {
    id: 'environment-variable-manager',
    name: 'Environment Variable Manager',
    description: 'Manage and generate .env files for different environments',
    icon: 'Settings',
    path: '/tools/environment-variable-manager',
    category: 'development',
    tags: ['env', 'environment', 'config', 'variables'],
    featured: true,
    difficulty: 'beginner'
  },
];

export const toolCategories: Record<string, ToolCategory> = {
  api: {
    id: 'api',
    name: 'API Tools',
    description: 'Tools for API development, testing, and mocking',
    icon: 'Zap',
    color: 'blue',
    order: 1
  },
  data: {
    id: 'data',
    name: 'Data Tools',
    description: 'JSON formatting, Base64 encoding, and data transformation',
    icon: 'FileText',
    color: 'green',
    order: 2
  },
  database: {
    id: 'database',
    name: 'Database Tools',
    description: 'SQL, NoSQL, and database management utilities',
    icon: 'Database',
    color: 'purple',
    order: 3
  },
  development: {
    id: 'development',
    name: 'Development Tools',
    description: 'Package analysis and configuration management',
    icon: 'Code2',
    color: 'orange',
    order: 4
  },
};

// Utility functions for tool management
export function getToolsByCategory(category: string): Tool[] {
  return tools.filter(tool => tool.category === category);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter(tool => tool.featured);
}

export function searchTools(query: string): Tool[] {
  const searchTerm = query.toLowerCase();
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm) ||
    tool.description.toLowerCase().includes(searchTerm) ||
    tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

export function getToolsByDifficulty(difficulty: string): Tool[] {
  return tools.filter(tool => tool.difficulty === difficulty);
}

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id);
}