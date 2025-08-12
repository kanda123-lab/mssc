'use client';

import React from 'react';
import { useAppStore } from '@/lib/store/app-store';

// Cloud Sync Configuration
interface CloudSyncConfig {
  apiUrl: string;
  apiKey: string;
  userId: string;
  syncInterval: number; // in milliseconds
  conflictResolution: 'local' | 'remote' | 'merge';
}

// Sync Status
interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  syncInProgress: boolean;
  conflictsCount: number;
  errorCount: number;
  queuedOperations: number;
}

// Data Change Event
interface DataChangeEvent {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  synced: boolean;
  userId?: string;
}

// Conflict Resolution
interface Conflict {
  id: string;
  collection: string;
  localData: any;
  remoteData: any;
  timestamp: number;
  resolved: boolean;
}

class CloudSyncManager {
  private config: CloudSyncConfig | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private changeQueue: DataChangeEvent[] = [];
  private conflicts: Conflict[] = [];
  private status: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : false,
    lastSync: 0,
    syncInProgress: false,
    conflictsCount: 0,
    errorCount: 0,
    queuedOperations: 0,
  };

  constructor() {
    this.setupEventListeners();
  }

  // Initialize cloud sync
  initialize(config: CloudSyncConfig) {
    this.config = config;
    this.startPeriodicSync();
    this.syncNow();
  }

  // Setup event listeners
  private setupEventListeners() {
    if (typeof window === 'undefined') return;
    
    // Online/offline detection
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.syncNow();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
    });

    // Storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'devtools-app-store' && e.newValue) {
        this.handleStorageChange();
      }
    });

    // Before unload - sync any pending changes
    window.addEventListener('beforeunload', () => {
      if (this.changeQueue.length > 0) {
        this.syncNow();
      }
    });
  }

  // Start periodic sync
  private startPeriodicSync() {
    if (!this.config) return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.status.isOnline && !this.status.syncInProgress) {
        this.syncNow();
      }
    }, this.config.syncInterval);
  }

  // Queue a data change for sync
  queueChange(type: 'create' | 'update' | 'delete', collection: string, data: any) {
    const change: DataChangeEvent = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      collection,
      data,
      timestamp: Date.now(),
      synced: false,
      userId: this.config?.userId,
    };

    this.changeQueue.push(change);
    this.status.queuedOperations = this.changeQueue.length;

    // Trigger immediate sync if online
    if (this.status.isOnline && !this.status.syncInProgress) {
      setTimeout(() => this.syncNow(), 100);
    }
  }

  // Sync now
  async syncNow(): Promise<boolean> {
    if (!this.config || !this.status.isOnline || this.status.syncInProgress) {
      return false;
    }

    this.status.syncInProgress = true;

    try {
      // Pull remote changes first
      await this.pullRemoteChanges();

      // Push local changes
      await this.pushLocalChanges();

      this.status.lastSync = Date.now();
      this.status.errorCount = 0;
      
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      this.status.errorCount++;
      return false;
    } finally {
      this.status.syncInProgress = false;
    }
  }

  // Pull remote changes
  private async pullRemoteChanges() {
    if (!this.config) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/sync/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          userId: this.config.userId,
          lastSync: this.status.lastSync,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const { changes } = await response.json();
      
      if (changes && changes.length > 0) {
        await this.applyRemoteChanges(changes);
      }
    } catch (error) {
      console.error('Failed to pull remote changes:', error);
      throw error;
    }
  }

  // Push local changes
  private async pushLocalChanges() {
    if (!this.config || this.changeQueue.length === 0) return;

    const unsyncedChanges = this.changeQueue.filter(c => !c.synced);
    
    if (unsyncedChanges.length === 0) return;

    try {
      const response = await fetch(`${this.config.apiUrl}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          userId: this.config.userId,
          changes: unsyncedChanges,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const { processedIds, conflicts } = await response.json();

      // Mark processed changes as synced
      processedIds.forEach((id: string) => {
        const change = this.changeQueue.find(c => c.id === id);
        if (change) {
          change.synced = true;
        }
      });

      // Handle conflicts
      if (conflicts && conflicts.length > 0) {
        this.handleConflicts(conflicts);
      }

      // Clean up synced changes
      this.changeQueue = this.changeQueue.filter(c => !c.synced);
      this.status.queuedOperations = this.changeQueue.length;

    } catch (error) {
      console.error('Failed to push local changes:', error);
      throw error;
    }
  }

  // Apply remote changes
  private async applyRemoteChanges(changes: DataChangeEvent[]) {
    const store = useAppStore.getState();

    for (const change of changes) {
      try {
        switch (change.type) {
          case 'create':
          case 'update':
            await this.applyDataUpdate(change.collection, change.data);
            break;
          case 'delete':
            await this.applyDataDelete(change.collection, change.data.id);
            break;
        }
      } catch (error) {
        console.error('Failed to apply remote change:', change, error);
      }
    }
  }

  // Apply data update
  private async applyDataUpdate(collection: string, data: any) {
    const store = useAppStore.getState();

    // Check for conflicts with local data
    const hasLocalChanges = this.changeQueue.some(
      c => c.collection === collection && 
           (c.data.id === data.id || JSON.stringify(c.data) === JSON.stringify(data))
    );

    if (hasLocalChanges && this.config?.conflictResolution !== 'remote') {
      // Handle conflict
      this.addConflict(collection, data);
      return;
    }

    // Apply the change based on collection type
    switch (collection) {
      case 'preferences':
        store.updatePreferences(data);
        break;
      case 'workspaces':
        if (data.id) {
          store.updateWorkspace(data.id, data);
        } else {
          store.createWorkspace(data);
        }
        break;
      case 'crossToolData':
        // Merge cross-tool data carefully
        Object.assign(store.crossToolData, data);
        break;
      default:
        console.warn('Unknown collection:', collection);
    }
  }

  // Apply data delete
  private async applyDataDelete(collection: string, id: string) {
    const store = useAppStore.getState();

    switch (collection) {
      case 'workspaces':
        store.deleteWorkspace(id);
        break;
      default:
        console.warn('Delete not implemented for collection:', collection);
    }
  }

  // Handle conflicts
  private handleConflicts(conflicts: any[]) {
    conflicts.forEach(conflict => {
      this.addConflict(conflict.collection, conflict.remoteData, conflict.localData);
    });
  }

  // Add conflict
  private addConflict(collection: string, remoteData: any, localData?: any) {
    const conflict: Conflict = {
      id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      collection,
      localData,
      remoteData,
      timestamp: Date.now(),
      resolved: false,
    };

    this.conflicts.push(conflict);
    this.status.conflictsCount = this.conflicts.length;
  }

  // Resolve conflict
  resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge') {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    switch (resolution) {
      case 'local':
        // Keep local data, queue as change to sync
        this.queueChange('update', conflict.collection, conflict.localData);
        break;
      case 'remote':
        // Apply remote data
        this.applyDataUpdate(conflict.collection, conflict.remoteData);
        break;
      case 'merge':
        // Merge data (simple shallow merge for now)
        const mergedData = { ...conflict.remoteData, ...conflict.localData };
        this.applyDataUpdate(conflict.collection, mergedData);
        this.queueChange('update', conflict.collection, mergedData);
        break;
    }

    conflict.resolved = true;
    this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
    this.status.conflictsCount = this.conflicts.length;
  }

  // Handle storage change from other tabs
  private handleStorageChange() {
    // Re-read from storage and queue changes
    console.log('Storage changed from another tab');
  }

  // Export data for backup
  async exportForBackup(): Promise<string> {
    const store = useAppStore.getState();
    
    const backupData = {
      version: '1.0.0',
      timestamp: Date.now(),
      userId: this.config?.userId,
      data: {
        preferences: store.preferences,
        workspaces: store.workspaces,
        crossToolData: store.crossToolData,
        navigation: {
          favoriteTools: store.navigation.favoriteTools,
          recentTools: store.navigation.recentTools,
        },
      },
      changeQueue: this.changeQueue,
      conflicts: this.conflicts,
    };

    return JSON.stringify(backupData, null, 2);
  }

  // Import data from backup
  async importFromBackup(backupData: string): Promise<boolean> {
    try {
      const data = JSON.parse(backupData);
      
      if (data.version !== '1.0.0') {
        throw new Error('Unsupported backup version');
      }

      const store = useAppStore.getState();
      
      // Import data
      if (data.data.preferences) {
        store.updatePreferences(data.data.preferences);
      }
      
      if (data.data.workspaces) {
        // Clear existing workspaces and import new ones
        data.data.workspaces.list.forEach((workspace: any) => {
          if (workspace.id !== 'default') {
            store.createWorkspace(workspace);
          }
        });
        if (data.data.workspaces.current) {
          store.setCurrentWorkspace(data.data.workspaces.current);
        }
      }

      // Import change queue and conflicts
      if (data.changeQueue) {
        this.changeQueue = data.changeQueue;
        this.status.queuedOperations = this.changeQueue.length;
      }

      if (data.conflicts) {
        this.conflicts = data.conflicts;
        this.status.conflictsCount = this.conflicts.length;
      }

      return true;
    } catch (error) {
      console.error('Failed to import backup:', error);
      return false;
    }
  }

  // Get sync status
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Get conflicts
  getConflicts(): Conflict[] {
    return [...this.conflicts];
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Export singleton instance
export const cloudSyncManager = new CloudSyncManager();

// React hook for cloud sync
export function useCloudSync() {
  const [status, setStatus] = React.useState(cloudSyncManager.getStatus());
  const [conflicts, setConflicts] = React.useState(cloudSyncManager.getConflicts());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(cloudSyncManager.getStatus());
      setConflicts(cloudSyncManager.getConflicts());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    conflicts,
    syncNow: () => cloudSyncManager.syncNow(),
    resolveConflict: (id: string, resolution: 'local' | 'remote' | 'merge') =>
      cloudSyncManager.resolveConflict(id, resolution),
    exportBackup: () => cloudSyncManager.exportForBackup(),
    importBackup: (data: string) => cloudSyncManager.importFromBackup(data),
  };
}

export type { CloudSyncConfig, SyncStatus, Conflict };