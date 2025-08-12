'use client';

import { StorageManager } from './storage';
import { generateId } from './utils';
import { 
  CrossToolData, 
  ExportedQuery, 
  APIResponse, 
  DatabaseConnection, 
  EnvEnvironment,
  APIRequest
} from '@/types';

export class IntegrationManager {
  // Share connection strings between tools
  static shareConnection(connection: DatabaseConnection, sourceToolId: string) {
    const data = StorageManager.getData();
    const updatedConnections = [
      ...data.crossToolData.sharedConnections.filter(c => c.id !== connection.id),
      { ...connection, sourceToolId }
    ];
    
    StorageManager.updateField('crossToolData', {
      ...data.crossToolData,
      sharedConnections: updatedConnections
    });
    
    return connection.id;
  }

  // Get all shared connections
  static getSharedConnections(): DatabaseConnection[] {
    const data = StorageManager.getData();
    return data.crossToolData.sharedConnections || [];
  }

  // Get connections for a specific database type
  static getConnectionsByType(databaseType: string): DatabaseConnection[] {
    return this.getSharedConnections().filter(
      conn => conn.type === databaseType
    );
  }

  // Export query from any tool for reuse
  static exportQuery(query: ExportedQuery) {
    const data = StorageManager.getData();
    const exportedQuery = {
      ...query,
      id: generateId(),
      timestamp: Date.now()
    };
    
    const updatedQueries = [
      ...data.crossToolData.exportedQueries.filter(q => q.id !== exportedQuery.id),
      exportedQuery
    ];
    
    StorageManager.updateField('crossToolData', {
      ...data.crossToolData,
      exportedQueries: updatedQueries
    });
    
    return exportedQuery.id;
  }

  // Import query into another tool
  static importQuery(queryId: string): ExportedQuery | null {
    const data = StorageManager.getData();
    return data.crossToolData.exportedQueries.find(q => q.id === queryId) || null;
  }

  // Get all exported queries by type
  static getExportedQueries(type?: 'sql' | 'mongodb' | 'api'): ExportedQuery[] {
    const data = StorageManager.getData();
    const queries = data.crossToolData.exportedQueries || [];
    return type ? queries.filter(q => q.type === type) : queries;
  }

  // Store API response for cross-tool use
  static storeAPIResponse(response: Omit<APIResponse, 'id' | 'timestamp'>) {
    const data = StorageManager.getData();
    const apiResponse: APIResponse = {
      ...response,
      id: generateId(),
      timestamp: Date.now()
    };
    
    const updatedResponses = [
      apiResponse,
      ...data.crossToolData.apiResponses.slice(0, 99) // Keep last 100
    ];
    
    StorageManager.updateField('crossToolData', {
      ...data.crossToolData,
      apiResponses: updatedResponses
    });
    
    return apiResponse.id;
  }

  // Get stored API responses
  static getStoredAPIResponses(): APIResponse[] {
    const data = StorageManager.getData();
    return data.crossToolData.apiResponses || [];
  }

  // Import API response into JSON formatter
  static importAPIResponseToJSONFormatter(responseId: string): string | null {
    const response = this.getStoredAPIResponses().find(r => r.id === responseId);
    return response ? response.response : null;
  }

  // Share environment variables between tools
  static shareEnvironmentVariables(envId: string, toolId: string): Record<string, string> {
    const data = StorageManager.getData();
    const environment = data.envEnvironments.find(env => env.id === envId);
    
    if (!environment) return {};
    
    const globalVariables = environment.variables.reduce((acc, variable) => {
      acc[variable.key] = variable.value;
      return acc;
    }, {} as Record<string, string>);
    
    StorageManager.updateField('crossToolData', {
      ...data.crossToolData,
      globalVariables: {
        ...data.crossToolData.globalVariables,
        [`${toolId}_${envId}`]: globalVariables
      }
    });
    
    return globalVariables;
  }

  // Get environment variables for a tool
  static getEnvironmentVariablesForTool(toolId: string, envId?: string): Record<string, string> {
    const data = StorageManager.getData();
    const key = envId ? `${toolId}_${envId}` : toolId;
    return data.crossToolData.globalVariables[key] || {};
  }

  // Use environment variables in connection strings
  static substituteEnvironmentVariables(connectionString: string, variables: Record<string, string>): string {
    let substituted = connectionString;
    
    Object.entries(variables).forEach(([key, value]) => {
      const patterns = [
        new RegExp(`\\$\\{${key}\\}`, 'g'),
        new RegExp(`\\$${key}`, 'g'),
        new RegExp(`%${key}%`, 'g')
      ];
      
      patterns.forEach(pattern => {
        substituted = substituted.replace(pattern, value);
      });
    });
    
    return substituted;
  }

  // Convert mock server endpoints to different formats
  static exportMockServerConfig(format: 'json' | 'yaml' | 'postman' | 'insomnia' | 'openapi') {
    const data = StorageManager.getData();
    const mockEndpoints = data.mockEndpoints;
    
    switch (format) {
      case 'json':
        return JSON.stringify(mockEndpoints, null, 2);
        
      case 'yaml':
        return this.convertToYAML(mockEndpoints);
        
      case 'postman':
        return this.convertToPostmanCollection(mockEndpoints);
        
      case 'insomnia':
        return this.convertToInsomniaCollection(mockEndpoints);
        
      case 'openapi':
        return this.convertToOpenAPISpec(mockEndpoints);
        
      default:
        return JSON.stringify(mockEndpoints, null, 2);
    }
  }

  // Helper: Convert to YAML
  private static convertToYAML(data: any): string {
    // Simple YAML converter for basic structures
    const yamlLines: string[] = [];
    
    const processValue = (value: any, indent: number = 0): string => {
      const indentStr = '  '.repeat(indent);
      
      if (typeof value === 'string') {
        return `"${value}"`;
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      } else if (Array.isArray(value)) {
        return value.map(item => `\n${indentStr}- ${processValue(item, 0)}`).join('');
      } else if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
          .map(([k, v]) => `\n${indentStr}${k}: ${processValue(v, indent + 1)}`)
          .join('');
      }
      return String(value);
    };
    
    if (Array.isArray(data)) {
      return data.map(item => `- ${processValue(item, 1)}`).join('\n');
    } else {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${processValue(value, 1)}`)
        .join('\n');
    }
  }

  // Helper: Convert to Postman collection
  private static convertToPostmanCollection(mockEndpoints: any[]): string {
    const collection = {
      info: {
        name: 'Mock Server Collection',
        description: 'Generated from DevTools Platform Mock Server',
        version: '1.0.0'
      },
      item: mockEndpoints.map(endpoint => ({
        name: endpoint.name,
        request: {
          method: endpoint.method,
          header: Object.entries(endpoint.response.headers).map(([key, value]) => ({
            key,
            value,
            type: 'text'
          })),
          url: {
            raw: `http://localhost:3001${endpoint.path}`,
            protocol: 'http',
            host: ['localhost'],
            port: '3001',
            path: endpoint.path.split('/').filter(Boolean)
          }
        },
        response: [{
          name: `${endpoint.name} Response`,
          status: endpoint.response.status,
          code: endpoint.response.status,
          header: Object.entries(endpoint.response.headers).map(([key, value]) => ({
            key,
            value
          })),
          body: endpoint.response.body
        }]
      }))
    };
    
    return JSON.stringify(collection, null, 2);
  }

  // Helper: Convert to Insomnia collection
  private static convertToInsomniaCollection(mockEndpoints: any[]): string {
    const collection = {
      _type: 'export',
      __export_format: 4,
      __export_date: new Date().toISOString(),
      __export_source: 'devtools-platform',
      resources: mockEndpoints.flatMap((endpoint, index) => [
        {
          _id: `req_${index}`,
          _type: 'request',
          parentId: 'wrk_main',
          modified: Date.now(),
          created: Date.now(),
          url: `http://localhost:3001${endpoint.path}`,
          name: endpoint.name,
          description: '',
          method: endpoint.method,
          body: {
            mimeType: 'application/json',
            text: ''
          },
          parameters: [],
          headers: Object.entries(endpoint.response.headers).map(([key, value]) => ({
            name: key,
            value: String(value)
          })),
          authentication: {},
          metaSortKey: -Date.now() + index,
          isPrivate: false,
          settingStoreCookies: true,
          settingSendCookies: true,
          settingDisableRenderRequestBody: false,
          settingEncodeUrl: true,
          settingRebuildPath: true,
          settingFollowRedirects: 'global'
        }
      ])
    };
    
    return JSON.stringify(collection, null, 2);
  }

  // Helper: Convert to OpenAPI specification
  private static convertToOpenAPISpec(mockEndpoints: any[]): string {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Mock Server API',
        description: 'Generated from DevTools Platform Mock Server',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Mock Server'
        }
      ],
      paths: mockEndpoints.reduce((paths, endpoint) => {
        const method = endpoint.method.toLowerCase();
        const path = endpoint.path;
        
        if (!paths[path]) {
          paths[path] = {};
        }
        
        paths[path][method] = {
          summary: endpoint.name,
          description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
          responses: {
            [endpoint.response.status]: {
              description: 'Response',
              headers: Object.entries(endpoint.response.headers).reduce((acc, [key, value]) => {
                acc[key] = {
                  schema: {
                    type: 'string',
                    example: value
                  }
                };
                return acc;
              }, {} as any),
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    example: endpoint.response.body
                  }
                }
              }
            }
          }
        };
        
        return paths;
      }, {} as any)
    };
    
    return JSON.stringify(spec, null, 2);
  }

  // Cross-tool data synchronization
  static syncToolData(sourceToolId: string, targetToolId: string, dataType: string, data: any) {
    const syncId = generateId();
    const syncData = {
      id: syncId,
      sourceToolId,
      targetToolId,
      dataType,
      data,
      timestamp: Date.now()
    };
    
    // Store in a sync queue for potential conflict resolution
    const storageData = StorageManager.getData();
    const syncQueue = storageData.crossToolData.syncQueue || [];
    syncQueue.push(syncData);
    
    StorageManager.updateField('crossToolData', {
      ...storageData.crossToolData,
      syncQueue: syncQueue.slice(-50) // Keep last 50 sync operations
    });
    
    return syncId;
  }

  // Get sync history
  static getSyncHistory(toolId?: string): any[] {
    const data = StorageManager.getData();
    const syncQueue = data.crossToolData.syncQueue || [];
    
    return toolId 
      ? syncQueue.filter(sync => sync.sourceToolId === toolId || sync.targetToolId === toolId)
      : syncQueue;
  }

  // Clear integration data
  static clearIntegrationData() {
    StorageManager.updateField('crossToolData', {
      sharedConnections: [],
      exportedQueries: [],
      apiResponses: [],
      globalVariables: {},
      syncQueue: []
    });
  }

  // Get integration statistics
  static getIntegrationStats() {
    const data = StorageManager.getData();
    const crossToolData = data.crossToolData;
    
    return {
      sharedConnections: crossToolData.sharedConnections?.length || 0,
      exportedQueries: crossToolData.exportedQueries?.length || 0,
      storedAPIResponses: crossToolData.apiResponses?.length || 0,
      globalVariableSets: Object.keys(crossToolData.globalVariables || {}).length,
      syncOperations: crossToolData.syncQueue?.length || 0
    };
  }
}