'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Tool, ToolUsage, UserPreferences, APIRequest, DatabaseConnection, CrossToolData } from '@/types';

// User Authentication State
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: number;
  lastLogin: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Workspace State
interface Workspace {
  id: string;
  name: string;
  description?: string;
  tools: string[]; // tool IDs
  settings: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  shared: boolean;
  shareUrl?: string;
}

// Activity Tracking
interface Activity {
  id: string;
  userId?: string;
  toolId: string;
  action: string;
  data: any;
  timestamp: number;
  duration?: number;
}

// Global Application State
interface AppState {
  // Authentication
  auth: AuthState;
  
  // User Preferences
  preferences: UserPreferences & {
    language: string;
    timezone: string;
    dateFormat: string;
    compactMode: boolean;
    animationsEnabled: boolean;
    soundEnabled: boolean;
    defaultView: 'grid' | 'list';
  };
  
  // Navigation
  navigation: {
    currentTool: string | null;
    breadcrumbs: Array<{ label: string; path: string }>;
    sidebarCollapsed: boolean;
    searchQuery: string;
    recentTools: ToolUsage[];
    favoriteTools: string[];
    toolCategories: Record<string, boolean>; // expanded state
  };
  
  // Workspaces
  workspaces: {
    current: string | null;
    list: Workspace[];
    settings: Record<string, any>;
  };
  
  // Cross-tool data sharing
  crossToolData: CrossToolData & {
    clipboard: any;
    variables: Record<string, string>;
    templates: Record<string, any>;
    history: Activity[];
  };
  
  // Performance
  performance: {
    loadTimes: Record<string, number>;
    memoryUsage: Record<string, number>;
    errorCount: number;
    lastOptimization: number;
  };
  
  // UI State
  ui: {
    theme: 'light' | 'dark' | 'system';
    loading: boolean;
    notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      timestamp: number;
      read: boolean;
    }>;
    modals: {
      settings: boolean;
      onboarding: boolean;
      help: boolean;
      shortcuts: boolean;
    };
    panels: {
      activity: boolean;
      inspector: boolean;
      console: boolean;
    };
  };
}

// Actions Interface
interface AppActions {
  // Authentication Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Navigation Actions
  setCurrentTool: (toolId: string) => void;
  addBreadcrumb: (label: string, path: string) => void;
  clearBreadcrumbs: () => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  addRecentTool: (toolId: string) => void;
  toggleFavorite: (toolId: string) => void;
  toggleCategory: (categoryId: string) => void;
  
  // Workspace Actions
  createWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setCurrentWorkspace: (id: string) => void;
  shareWorkspace: (id: string) => string;
  
  // Cross-tool Actions
  shareData: (fromTool: string, toTool: string, data: any) => void;
  copyToClipboard: (data: any) => void;
  setGlobalVariable: (key: string, value: string) => void;
  saveTemplate: (name: string, template: any) => void;
  
  // Activity Tracking
  trackActivity: (toolId: string, action: string, data?: any) => void;
  getActivityHistory: (toolId?: string) => Activity[];
  
  // Preferences Actions
  updatePreferences: (updates: Partial<AppState['preferences']>) => void;
  resetPreferences: () => void;
  
  // UI Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<AppState['ui']['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleModal: (modal: keyof AppState['ui']['modals']) => void;
  togglePanel: (panel: keyof AppState['ui']['panels']) => void;
  
  // Performance Actions
  recordLoadTime: (toolId: string, time: number) => void;
  recordMemoryUsage: (toolId: string, usage: number) => void;
  incrementErrorCount: () => void;
  optimizePerformance: () => void;
  
  // Data Management
  exportData: () => string;
  importData: (data: string) => boolean;
  backupData: () => string;
  restoreData: (backup: string) => boolean;
  clearAllData: () => void;
}

// Default State
const defaultState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
  },
  
  preferences: {
    theme: 'system',
    sidebarCollapsed: false,
    favoriteCategory: '',
    notifications: true,
    autoSave: true,
    keyboardShortcuts: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MMM dd, yyyy',
    compactMode: false,
    animationsEnabled: true,
    soundEnabled: false,
    defaultView: 'grid',
  },
  
  navigation: {
    currentTool: null,
    breadcrumbs: [],
    sidebarCollapsed: false,
    searchQuery: '',
    recentTools: [],
    favoriteTools: [],
    toolCategories: {
      api: true,
      data: true,
      database: true,
      development: true,
    },
  },
  
  workspaces: {
    current: 'default',
    list: [
      {
        id: 'default',
        name: 'Default Workspace',
        description: 'Your main workspace',
        tools: [],
        settings: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
        shared: false,
      },
    ],
    settings: {},
  },
  
  crossToolData: {
    sharedConnections: [],
    exportedQueries: [],
    apiResponses: [],
    globalVariables: {},
    clipboard: null,
    variables: {},
    templates: {},
    history: [],
  },
  
  performance: {
    loadTimes: {},
    memoryUsage: {},
    errorCount: 0,
    lastOptimization: Date.now(),
  },
  
  ui: {
    theme: 'system',
    loading: false,
    notifications: [],
    modals: {
      settings: false,
      onboarding: false,
      help: false,
      shortcuts: false,
    },
    panels: {
      activity: false,
      inspector: false,
      console: false,
    },
  },
};

// Create the store with multiple middleware
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...defaultState,
        
        // Authentication Actions
        login: async (email: string, password: string) => {
          set((state) => {
            state.auth.isLoading = true;
          });
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock successful login
            const user: User = {
              id: 'user-' + Date.now(),
              email,
              name: email.split('@')[0],
              plan: 'free',
              createdAt: Date.now(),
              lastLogin: Date.now(),
            };
            
            set((state) => {
              state.auth.user = user;
              state.auth.isAuthenticated = true;
              state.auth.isLoading = false;
              state.auth.token = 'mock-jwt-token';
            });
            
            return true;
          } catch (error) {
            set((state) => {
              state.auth.isLoading = false;
            });
            return false;
          }
        },
        
        logout: () => {
          set((state) => {
            state.auth.user = null;
            state.auth.isAuthenticated = false;
            state.auth.token = null;
          });
        },
        
        updateProfile: (updates: Partial<User>) => {
          set((state) => {
            if (state.auth.user) {
              Object.assign(state.auth.user, updates);
            }
          });
        },
        
        // Navigation Actions
        setCurrentTool: (toolId: string) => {
          set((state) => {
            state.navigation.currentTool = toolId;
          });
          get().addRecentTool(toolId);
          get().trackActivity(toolId, 'navigate');
        },
        
        addBreadcrumb: (label: string, path: string) => {
          set((state) => {
            const exists = state.navigation.breadcrumbs.some(b => b.path === path);
            if (!exists) {
              state.navigation.breadcrumbs.push({ label, path });
            }
          });
        },
        
        clearBreadcrumbs: () => {
          set((state) => {
            state.navigation.breadcrumbs = [];
          });
        },
        
        toggleSidebar: () => {
          set((state) => {
            state.navigation.sidebarCollapsed = !state.navigation.sidebarCollapsed;
            state.preferences.sidebarCollapsed = state.navigation.sidebarCollapsed;
          });
        },
        
        setSearchQuery: (query: string) => {
          set((state) => {
            state.navigation.searchQuery = query;
          });
        },
        
        addRecentTool: (toolId: string) => {
          set((state) => {
            const recent = state.navigation.recentTools;
            const existing = recent.findIndex(r => r.toolId === toolId);
            
            if (existing >= 0) {
              recent.splice(existing, 1);
            }
            
            recent.unshift({
              toolId,
              timestamp: Date.now(),
              duration: 0,
            });
            
            // Keep only last 10
            state.navigation.recentTools = recent.slice(0, 10);
          });
        },
        
        toggleFavorite: (toolId: string) => {
          set((state) => {
            const favorites = state.navigation.favoriteTools;
            const index = favorites.indexOf(toolId);
            
            if (index >= 0) {
              favorites.splice(index, 1);
            } else {
              favorites.push(toolId);
            }
          });
        },
        
        toggleCategory: (categoryId: string) => {
          set((state) => {
            state.navigation.toolCategories[categoryId] = !state.navigation.toolCategories[categoryId];
          });
        },
        
        // Workspace Actions
        createWorkspace: (workspace) => {
          const id = 'ws-' + Date.now();
          const newWorkspace: Workspace = {
            ...workspace,
            id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          set((state) => {
            state.workspaces.list.push(newWorkspace);
          });
          
          return id;
        },
        
        updateWorkspace: (id: string, updates: Partial<Workspace>) => {
          set((state) => {
            const workspace = state.workspaces.list.find(w => w.id === id);
            if (workspace) {
              Object.assign(workspace, updates);
              workspace.updatedAt = Date.now();
            }
          });
        },
        
        deleteWorkspace: (id: string) => {
          set((state) => {
            state.workspaces.list = state.workspaces.list.filter(w => w.id !== id);
            if (state.workspaces.current === id) {
              state.workspaces.current = 'default';
            }
          });
        },
        
        setCurrentWorkspace: (id: string) => {
          set((state) => {
            state.workspaces.current = id;
          });
        },
        
        shareWorkspace: (id: string) => {
          const shareUrl = `${window.location.origin}/workspace/shared/${id}`;
          
          set((state) => {
            const workspace = state.workspaces.list.find(w => w.id === id);
            if (workspace) {
              workspace.shared = true;
              workspace.shareUrl = shareUrl;
            }
          });
          
          return shareUrl;
        },
        
        // Cross-tool Actions
        shareData: (fromTool: string, toTool: string, data: any) => {
          set((state) => {
            // Store the shared data with metadata
            const sharedData = {
              id: 'shared-' + Date.now(),
              fromTool,
              toTool,
              data,
              timestamp: Date.now(),
            };
            
            state.crossToolData.history.push({
              id: 'activity-' + Date.now(),
              toolId: fromTool,
              action: 'share_data',
              data: sharedData,
              timestamp: Date.now(),
            });
          });
          
          get().trackActivity(fromTool, 'share_data', { toTool, dataType: typeof data });
        },
        
        copyToClipboard: (data: any) => {
          set((state) => {
            state.crossToolData.clipboard = data;
          });
        },
        
        setGlobalVariable: (key: string, value: string) => {
          set((state) => {
            state.crossToolData.variables[key] = value;
          });
        },
        
        saveTemplate: (name: string, template: any) => {
          set((state) => {
            state.crossToolData.templates[name] = {
              ...template,
              createdAt: Date.now(),
            };
          });
        },
        
        // Activity Tracking
        trackActivity: (toolId: string, action: string, data?: any) => {
          const activity: Activity = {
            id: 'activity-' + Date.now(),
            userId: get().auth.user?.id,
            toolId,
            action,
            data,
            timestamp: Date.now(),
          };
          
          set((state) => {
            state.crossToolData.history.unshift(activity);
            // Keep only last 100 activities
            state.crossToolData.history = state.crossToolData.history.slice(0, 100);
          });
        },
        
        getActivityHistory: (toolId?: string) => {
          const history = get().crossToolData.history;
          return toolId ? history.filter(a => a.toolId === toolId) : history;
        },
        
        // Preferences Actions
        updatePreferences: (updates: Partial<AppState['preferences']>) => {
          set((state) => {
            Object.assign(state.preferences, updates);
          });
        },
        
        resetPreferences: () => {
          set((state) => {
            state.preferences = { ...defaultState.preferences };
          });
        },
        
        // UI Actions
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.ui.theme = theme;
            state.preferences.theme = theme;
          });
        },
        
        setLoading: (loading: boolean) => {
          set((state) => {
            state.ui.loading = loading;
          });
        },
        
        addNotification: (notification) => {
          const newNotification = {
            ...notification,
            id: 'notif-' + Date.now(),
            timestamp: Date.now(),
            read: false,
          };
          
          set((state) => {
            state.ui.notifications.unshift(newNotification);
            // Keep only last 50 notifications
            state.ui.notifications = state.ui.notifications.slice(0, 50);
          });
        },
        
        markNotificationRead: (id: string) => {
          set((state) => {
            const notif = state.ui.notifications.find(n => n.id === id);
            if (notif) {
              notif.read = true;
            }
          });
        },
        
        clearNotifications: () => {
          set((state) => {
            state.ui.notifications = [];
          });
        },
        
        toggleModal: (modal: keyof AppState['ui']['modals']) => {
          set((state) => {
            state.ui.modals[modal] = !state.ui.modals[modal];
          });
        },
        
        togglePanel: (panel: keyof AppState['ui']['panels']) => {
          set((state) => {
            state.ui.panels[panel] = !state.ui.panels[panel];
          });
        },
        
        // Performance Actions
        recordLoadTime: (toolId: string, time: number) => {
          set((state) => {
            state.performance.loadTimes[toolId] = time;
          });
        },
        
        recordMemoryUsage: (toolId: string, usage: number) => {
          set((state) => {
            state.performance.memoryUsage[toolId] = usage;
          });
        },
        
        incrementErrorCount: () => {
          set((state) => {
            state.performance.errorCount++;
          });
        },
        
        optimizePerformance: () => {
          set((state) => {
            state.performance.lastOptimization = Date.now();
            // Clear old load times and memory usage
            state.performance.loadTimes = {};
            state.performance.memoryUsage = {};
          });
        },
        
        // Data Management
        exportData: () => {
          const state = get();
          const exportData = {
            preferences: state.preferences,
            workspaces: state.workspaces,
            crossToolData: state.crossToolData,
            navigation: state.navigation,
            exportedAt: Date.now(),
            version: '1.0.0',
          };
          
          return JSON.stringify(exportData, null, 2);
        },
        
        importData: (data: string) => {
          try {
            const importedData = JSON.parse(data);
            
            set((state) => {
              if (importedData.preferences) {
                state.preferences = { ...state.preferences, ...importedData.preferences };
              }
              if (importedData.workspaces) {
                state.workspaces = { ...state.workspaces, ...importedData.workspaces };
              }
              if (importedData.crossToolData) {
                state.crossToolData = { ...state.crossToolData, ...importedData.crossToolData };
              }
              if (importedData.navigation) {
                state.navigation = { ...state.navigation, ...importedData.navigation };
              }
            });
            
            return true;
          } catch (error) {
            console.error('Failed to import data:', error);
            return false;
          }
        },
        
        backupData: () => {
          const state = get();
          const backup = {
            ...state,
            backedUpAt: Date.now(),
            version: '1.0.0',
          };
          
          return JSON.stringify(backup, null, 2);
        },
        
        restoreData: (backup: string) => {
          try {
            const backupData = JSON.parse(backup);
            
            set(() => ({
              ...backupData,
              auth: defaultState.auth, // Don't restore auth state
            }));
            
            return true;
          } catch (error) {
            console.error('Failed to restore backup:', error);
            return false;
          }
        },
        
        clearAllData: () => {
          set(() => ({
            ...defaultState,
            auth: get().auth, // Keep auth state
          }));
        },
      })),
      {
        name: 'devtools-app-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          preferences: state.preferences,
          navigation: {
            favoriteTools: state.navigation.favoriteTools,
            recentTools: state.navigation.recentTools,
            toolCategories: state.navigation.toolCategories,
          },
          workspaces: state.workspaces,
          crossToolData: state.crossToolData,
        }),
      }
    )
  )
);

// Selectors for easier access to state
export const useAuth = () => useAppStore((state) => state.auth);
export const usePreferences = () => useAppStore((state) => state.preferences);
export const useNavigation = () => useAppStore((state) => state.navigation);
export const useWorkspaces = () => useAppStore((state) => state.workspaces);
export const useCrossToolData = () => useAppStore((state) => state.crossToolData);
export const useUI = () => useAppStore((state) => state.ui);
export const usePerformance = () => useAppStore((state) => state.performance);