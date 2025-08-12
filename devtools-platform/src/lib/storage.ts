'use client';

import { StorageData } from '@/types';

const STORAGE_KEY = 'devtools-platform-data';

const defaultData: StorageData = {
  apiRequests: [],
  webSocketConnections: [],
  mockEndpoints: [],
  jsonFormats: [],
  base64Conversions: [],
  // New database and analysis tools
  sqlQueries: [],
  databaseConnections: [],
  mongoQueries: [],
  mongoTemplates: [],
  mongoSchemas: [],
  npmAnalyses: [],
  environmentConfigs: [],
  // Visual Query Builder
  visualQueries: [],
  queryTemplates: [],
  databaseSchemas: [],
  connectionTemplates: [],
  // Comprehensive Environment Variable Manager
  envEnvironments: [],
  envTemplates: [],
  envBackups: [],
  cloudProviderConfigs: [],
  integrationSettings: {
    docker: {
      generateDockerfile: false,
      generateDockerCompose: false,
      useMultiStage: false
    },
    kubernetes: {
      generateConfigMap: false,
      generateSecret: false
    },
    cicd: {
      platform: 'github-actions',
      generateConfig: false,
      environmentStrategy: 'branches'
    }
  },
  // Platform features
  favoriteTools: [],
  recentTools: [],
  userPreferences: {
    theme: 'system',
    sidebarCollapsed: false,
    notifications: true,
    autoSave: true,
    keyboardShortcuts: true
  },
  crossToolData: {
    sharedConnections: [],
    exportedQueries: [],
    apiResponses: [],
    globalVariables: {}
  },
  platformErrors: []
};

export class StorageManager {
  static getData(): StorageData {
    if (typeof window === 'undefined') return defaultData;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultData;
    }
  }

  static setData(data: Partial<StorageData>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const currentData = this.getData();
      const newData = { ...currentData, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static updateArrayField<K extends keyof StorageData>(
    field: K,
    updater: (current: StorageData[K]) => StorageData[K]
  ): void {
    const currentData = this.getData();
    const updatedField = updater(currentData[field]);
    this.setData({ [field]: updatedField } as Partial<StorageData>);
  }

  static updateField<K extends keyof StorageData>(field: K, value: StorageData[K]): void {
    this.setData({ [field]: value } as Partial<StorageData>);
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  static exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}