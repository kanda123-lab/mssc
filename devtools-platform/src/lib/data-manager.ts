'use client';

import { StorageManager } from './storage';
import { generateId } from './utils';
import { StorageData } from '@/types';

export interface BackupMetadata {
  id: string;
  name: string;
  description?: string;
  timestamp: number;
  version: string;
  size: number;
  tools: string[];
  automatic: boolean;
}

export interface DataExportOptions {
  format: 'json' | 'csv' | 'xml' | 'yaml';
  tools?: string[];
  includeMetadata: boolean;
  compress: boolean;
  includePersonalData: boolean;
}

export interface DataMigration {
  id: string;
  fromVersion: string;
  toVersion: string;
  timestamp: number;
  changes: string[];
  success: boolean;
}

export class DataManager {
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MAX_BACKUPS = 10;
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB

  // Backup Management
  static createBackup(name: string, description?: string, tools?: string[]): string {
    try {
      const data = StorageManager.getData();
      const backupId = generateId();
      
      // Filter data by tools if specified
      const backupData = tools ? this.filterDataByTools(data, tools) : data;
      
      const backup = {
        id: backupId,
        name,
        description,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION,
        size: JSON.stringify(backupData).length,
        tools: tools || this.getAllToolIds(),
        automatic: false,
        data: backupData
      };
      
      // Store backup metadata separately to avoid circular references
      const backups = this.getBackupMetadata();
      const updatedBackups = [
        {
          id: backup.id,
          name: backup.name,
          description: backup.description,
          timestamp: backup.timestamp,
          version: backup.version,
          size: backup.size,
          tools: backup.tools,
          automatic: backup.automatic
        },
        ...backups.slice(0, this.MAX_BACKUPS - 1)
      ];
      
      // Store backup data in a separate key
      localStorage.setItem(`backup_${backupId}`, JSON.stringify(backup.data));
      localStorage.setItem('devtools_backups', JSON.stringify(updatedBackups));
      
      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  static getBackupMetadata(): BackupMetadata[] {
    try {
      const stored = localStorage.getItem('devtools_backups');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load backup metadata:', error);
      return [];
    }
  }

  static restoreBackup(backupId: string): boolean {
    try {
      const backupData = localStorage.getItem(`backup_${backupId}`);
      if (!backupData) {
        throw new Error('Backup not found');
      }
      
      const data: StorageData = JSON.parse(backupData);
      
      // Migrate data if necessary
      const migratedData = this.migrateData(data);
      
      // Restore data
      StorageManager.setData(migratedData);
      
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  static deleteBackup(backupId: string): boolean {
    try {
      // Remove backup data
      localStorage.removeItem(`backup_${backupId}`);
      
      // Update metadata
      const backups = this.getBackupMetadata();
      const updatedBackups = backups.filter(b => b.id !== backupId);
      localStorage.setItem('devtools_backups', JSON.stringify(updatedBackups));
      
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  // Data Export/Import
  static exportData(options: DataExportOptions): string {
    try {
      const data = StorageManager.getData();
      const exportData = options.tools ? this.filterDataByTools(data, options.tools) : data;
      
      if (!options.includePersonalData) {
        this.sanitizePersonalData(exportData);
      }
      
      let content = '';
      
      switch (options.format) {
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          break;
        case 'csv':
          content = this.convertToCSV(exportData);
          break;
        case 'xml':
          content = this.convertToXML(exportData);
          break;
        case 'yaml':
          content = this.convertToYAML(exportData);
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
      }
      
      if (options.includeMetadata) {
        const metadata = {
          exportTimestamp: Date.now(),
          version: this.CURRENT_VERSION,
          tools: options.tools || this.getAllToolIds(),
          format: options.format
        };
        
        if (options.format === 'json') {
          const dataWithMetadata = {
            metadata,
            data: exportData
          };
          content = JSON.stringify(dataWithMetadata, null, 2);
        }
      }
      
      return content;
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  static importData(content: string, format: 'json' | 'csv' | 'xml' | 'yaml' = 'json'): boolean {
    try {
      let importedData: any;
      
      switch (format) {
        case 'json':
          importedData = JSON.parse(content);
          break;
        case 'csv':
          importedData = this.parseCSV(content);
          break;
        case 'xml':
          importedData = this.parseXML(content);
          break;
        case 'yaml':
          importedData = this.parseYAML(content);
          break;
        default:
          importedData = JSON.parse(content);
      }
      
      // Handle metadata wrapper
      if (importedData.metadata && importedData.data) {
        importedData = importedData.data;
      }
      
      // Migrate data if necessary
      const migratedData = this.migrateData(importedData);
      
      // Merge with existing data
      const currentData = StorageManager.getData();
      const mergedData = this.mergeData(currentData, migratedData);
      
      StorageManager.setData(mergedData);
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Storage Quota Management
  static getStorageUsage(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      
      // Calculate localStorage usage
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      return {
        used,
        total: this.MAX_STORAGE_SIZE,
        percentage: Math.round((used / this.MAX_STORAGE_SIZE) * 100)
      };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return { used: 0, total: this.MAX_STORAGE_SIZE, percentage: 0 };
    }
  }

  static cleanupOldData(): void {
    try {
      const usage = this.getStorageUsage();
      
      if (usage.percentage > 80) {
        // Remove old API responses
        const data = StorageManager.getData();
        if (data.crossToolData.apiResponses.length > 50) {
          data.crossToolData.apiResponses = data.crossToolData.apiResponses.slice(0, 50);
        }
        
        // Remove old recent tools
        if (data.recentTools.length > 20) {
          data.recentTools = data.recentTools.slice(0, 20);
        }
        
        // Remove old backups
        const backups = this.getBackupMetadata();
        if (backups.length > 5) {
          const oldBackups = backups.slice(5);
          oldBackups.forEach(backup => {
            localStorage.removeItem(`backup_${backup.id}`);
          });
          localStorage.setItem('devtools_backups', JSON.stringify(backups.slice(0, 5)));
        }
        
        StorageManager.setData(data);
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  static clearDataByTool(toolId: string): boolean {
    try {
      const data = StorageManager.getData();
      
      // Clear tool-specific data
      switch (toolId) {
        case 'api-tester':
          data.apiRequests = [];
          break;
        case 'websocket-tester':
          data.webSocketConnections = [];
          break;
        case 'mock-server':
          data.mockEndpoints = [];
          break;
        case 'json-formatter':
          data.jsonFormats = [];
          break;
        case 'base64':
          data.base64Conversions = [];
          break;
        case 'sql-query-builder':
          data.sqlQueries = [];
          break;
        case 'connection-string-builder':
          data.databaseConnections = [];
          break;
        case 'mongodb-query-builder':
          data.mongoQueries = [];
          break;
        case 'npm-package-analyzer':
          data.npmAnalyses = [];
          break;
        case 'environment-variable-manager':
          data.envEnvironments = [];
          break;
        default:
          return false;
      }
      
      StorageManager.setData(data);
      return true;
    } catch (error) {
      console.error('Failed to clear tool data:', error);
      return false;
    }
  }

  static clearDataByCategory(category: 'api' | 'data' | 'database' | 'development'): boolean {
    try {
      const data = StorageManager.getData();
      
      switch (category) {
        case 'api':
          data.apiRequests = [];
          data.webSocketConnections = [];
          data.mockEndpoints = [];
          break;
        case 'data':
          data.jsonFormats = [];
          data.base64Conversions = [];
          break;
        case 'database':
          data.sqlQueries = [];
          data.databaseConnections = [];
          data.mongoQueries = [];
          data.visualQueries = [];
          break;
        case 'development':
          data.npmAnalyses = [];
          data.envEnvironments = [];
          break;
        default:
          return false;
      }
      
      StorageManager.setData(data);
      return true;
    } catch (error) {
      console.error('Failed to clear category data:', error);
      return false;
    }
  }

  // Data Migration
  private static migrateData(data: any): StorageData {
    const migrations: DataMigration[] = [];
    let currentData = data;
    
    // Add version if missing
    if (!currentData.version) {
      currentData.version = '0.9.0';
    }
    
    // Apply migrations based on version
    if (currentData.version < '1.0.0') {
      currentData = this.migrateToV1(currentData);
      migrations.push({
        id: generateId(),
        fromVersion: currentData.version,
        toVersion: '1.0.0',
        timestamp: Date.now(),
        changes: ['Added new platform features', 'Updated data structure'],
        success: true
      });
    }
    
    // Store migration history
    currentData.migrations = migrations;
    currentData.version = this.CURRENT_VERSION;
    
    return currentData;
  }

  private static migrateToV1(data: any): StorageData {
    // Add new fields for v1.0.0
    if (!data.favoriteTools) data.favoriteTools = [];
    if (!data.recentTools) data.recentTools = [];
    if (!data.userPreferences) {
      data.userPreferences = {
        theme: 'system',
        sidebarCollapsed: false,
        notifications: true,
        autoSave: true,
        keyboardShortcuts: true
      };
    }
    if (!data.crossToolData) {
      data.crossToolData = {
        sharedConnections: [],
        exportedQueries: [],
        apiResponses: [],
        globalVariables: {}
      };
    }
    
    return data;
  }

  // Helper Methods
  private static filterDataByTools(data: StorageData, tools: string[]): Partial<StorageData> {
    const filtered: any = { version: data.version };
    
    tools.forEach(toolId => {
      switch (toolId) {
        case 'api-tester':
          filtered.apiRequests = data.apiRequests;
          break;
        case 'websocket-tester':
          filtered.webSocketConnections = data.webSocketConnections;
          break;
        case 'mock-server':
          filtered.mockEndpoints = data.mockEndpoints;
          break;
        case 'json-formatter':
          filtered.jsonFormats = data.jsonFormats;
          break;
        case 'base64':
          filtered.base64Conversions = data.base64Conversions;
          break;
        // Add more tools as needed
      }
    });
    
    return filtered;
  }

  private static getAllToolIds(): string[] {
    return [
      'api-tester',
      'websocket-tester',
      'mock-server',
      'json-formatter',
      'base64',
      'sql-query-builder',
      'connection-string-builder',
      'mongodb-query-builder',
      'npm-package-analyzer',
      'environment-variable-manager'
    ];
  }

  private static sanitizePersonalData(data: any): void {
    // Remove potentially sensitive information
    if (data.databaseConnections) {
      data.databaseConnections.forEach((conn: any) => {
        if (conn.parameters.password) conn.parameters.password = '[REDACTED]';
        if (conn.parameters.username) conn.parameters.username = '[REDACTED]';
      });
    }
    
    if (data.envEnvironments) {
      data.envEnvironments.forEach((env: any) => {
        env.variables.forEach((variable: any) => {
          if (variable.sensitive) {
            variable.value = '[REDACTED]';
          }
        });
      });
    }
  }

  private static mergeData(current: StorageData, imported: Partial<StorageData>): StorageData {
    const merged = { ...current };
    
    // Merge arrays without duplicates
    Object.entries(imported).forEach(([key, value]) => {
      if (Array.isArray(value) && Array.isArray(merged[key as keyof StorageData])) {
        const existingIds = new Set((merged[key as keyof StorageData] as any[]).map(item => item.id));
        const newItems = value.filter((item: any) => !existingIds.has(item.id));
        (merged[key as keyof StorageData] as any[]).push(...newItems);
      } else if (typeof value === 'object' && value !== null) {
        merged[key as keyof StorageData] = { ...merged[key as keyof StorageData], ...value } as any;
      } else {
        merged[key as keyof StorageData] = value as any;
      }
    });
    
    return merged;
  }

  // Format conversion helpers (simplified implementations)
  private static convertToCSV(data: any): string {
    // Simple CSV conversion for flat data
    return 'CSV conversion not implemented yet';
  }

  private static convertToXML(data: any): string {
    // Simple XML conversion
    return 'XML conversion not implemented yet';
  }

  private static convertToYAML(data: any): string {
    // Simple YAML conversion
    return 'YAML conversion not implemented yet';
  }

  private static parseCSV(content: string): any {
    // Simple CSV parser
    throw new Error('CSV parsing not implemented yet');
  }

  private static parseXML(content: string): any {
    // Simple XML parser
    throw new Error('XML parsing not implemented yet');
  }

  private static parseYAML(content: string): any {
    // Simple YAML parser
    throw new Error('YAML parsing not implemented yet');
  }
}