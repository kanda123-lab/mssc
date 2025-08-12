'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Keyboard, 
  Search, 
  Command, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Enter,
  Escape,
  X,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tools } from '@/lib/tools';
import { Tool, KeyboardShortcut } from '@/types';
import { StorageManager } from '@/lib/storage';
import { useToast } from '@/components/ui/toast';

// Keyboard shortcut definitions
const SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { key: 'cmd+k', description: 'Open command palette', action: 'open-palette', category: 'Navigation' },
  { key: 'cmd+/', description: 'Show keyboard shortcuts', action: 'show-shortcuts', category: 'Navigation' },
  { key: 'cmd+shift+p', description: 'Open tool picker', action: 'open-picker', category: 'Navigation' },
  { key: 'esc', description: 'Close current dialog', action: 'close-dialog', category: 'Navigation' },
  
  // Tools
  { key: 'cmd+1', description: 'API Tester', action: 'open-api-tester', category: 'Tools' },
  { key: 'cmd+2', description: 'WebSocket Tester', action: 'open-websocket-tester', category: 'Tools' },
  { key: 'cmd+3', description: 'JSON Formatter', action: 'open-json-formatter', category: 'Tools' },
  { key: 'cmd+4', description: 'Base64 Encoder/Decoder', action: 'open-base64-encoder', category: 'Tools' },
  { key: 'cmd+5', description: 'Mock Server', action: 'open-mock-server', category: 'Tools' },
  
  // Actions
  { key: 'cmd+s', description: 'Save current data', action: 'save', category: 'Actions' },
  { key: 'cmd+z', description: 'Undo last action', action: 'undo', category: 'Actions' },
  { key: 'cmd+shift+z', description: 'Redo last action', action: 'redo', category: 'Actions' },
  { key: 'cmd+c', description: 'Copy to clipboard', action: 'copy', category: 'Actions' },
  { key: 'cmd+v', description: 'Paste from clipboard', action: 'paste', category: 'Actions' },
  
  // Search and Filter
  { key: 'cmd+f', description: 'Focus search', action: 'focus-search', category: 'Search' },
  { key: 'cmd+g', description: 'Find next', action: 'find-next', category: 'Search' },
  { key: 'cmd+shift+g', description: 'Find previous', action: 'find-previous', category: 'Search' },
  { key: 'cmd+e', description: 'Clear search', action: 'clear-search', category: 'Search' }
];

// Tool shortcuts mapping
const TOOL_SHORTCUTS = {
  'cmd+1': '/tools/api-tester',
  'cmd+2': '/tools/websocket-tester', 
  'cmd+3': '/tools/json-formatter',
  'cmd+4': '/tools/base64-encoder',
  'cmd+5': '/tools/mock-server',
  'cmd+6': '/tools/sql-query-builder',
  'cmd+7': '/tools/mongodb-query-builder',
  'cmd+8': '/tools/database-connection-builder',
  'cmd+9': '/tools/npm-analyzer',
  'cmd+0': '/tools/env-manager'
};

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPalette, setShowPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showToolPicker, setShowToolPicker] = useState(false);

  const handleShortcut = useCallback((action: string, event?: KeyboardEvent) => {
    switch (action) {
      case 'open-palette':
        setShowPalette(true);
        break;
      case 'show-shortcuts':
        setShowShortcuts(true);
        break;
      case 'open-picker':
        setShowToolPicker(true);
        break;
      case 'close-dialog':
        setShowPalette(false);
        setShowShortcuts(false);
        setShowToolPicker(false);
        break;
      case 'save':
        event?.preventDefault();
        showToast({
          type: 'info',
          title: 'Save',
          message: 'Auto-save is enabled for all tools'
        });
        break;
      case 'focus-search':
        event?.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        break;
      default:
        // Handle tool shortcuts
        const path = TOOL_SHORTCUTS[action as keyof typeof TOOL_SHORTCUTS];
        if (path) {
          event?.preventDefault();
          router.push(path);
        }
    }
  }, [router, showToast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key.toLowerCase();
      
      // Build shortcut string
      let shortcut = '';
      if (isCmd) shortcut += 'cmd+';
      if (isShift) shortcut += 'shift+';
      shortcut += key;

      // Handle escape key specifically
      if (key === 'escape') {
        handleShortcut('close-dialog', event);
        return;
      }

      // Find matching shortcut
      const matchedShortcut = SHORTCUTS.find(s => s.key === shortcut);
      if (matchedShortcut) {
        handleShortcut(matchedShortcut.action, event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleShortcut]);

  return (
    <>
      {children}
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={showPalette} 
        onClose={() => setShowPalette(false)}
        onNavigate={(path) => {
          router.push(path);
          setShowPalette(false);
        }}
      />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      
      {/* Tool Picker */}
      <ToolPickerDialog
        isOpen={showToolPicker}
        onClose={() => setShowToolPicker(false)}
        onSelect={(toolId) => {
          router.push(`/tools/${toolId}`);
          setShowToolPicker(false);
        }}
      />
    </>
  );
}

// Command Palette Component
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter commands based on query
  const filteredCommands = [
    ...tools.map(tool => ({
      id: tool.id,
      title: tool.name,
      description: tool.description,
      path: `/tools/${tool.id}`,
      category: tool.category,
      icon: '🔧'
    })),
    {
      id: 'home',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      path: '/',
      category: 'navigation',
      icon: '🏠'
    }
  ].filter(cmd => 
    query === '' || 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        onNavigate(selected.path);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50">
      <Card className="w-full max-w-2xl mx-4 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for tools and commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No commands found
              </div>
            ) : (
              filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={() => onNavigate(command.path)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 text-left hover:bg-muted transition-colors',
                    index === selectedIndex && 'bg-muted'
                  )}
                >
                  <span className="text-lg">{command.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{command.title}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {command.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {command.category}
                  </Badge>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t text-xs text-muted-foreground">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Keyboard Shortcuts Dialog
interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const categories = [...new Set(SHORTCUTS.map(s => s.category))];
  
  const formatShortcut = (shortcut: string) => {
    return shortcut
      .replace('cmd+', '⌘')
      .replace('shift+', '⇧')
      .replace('ctrl+', 'Ctrl+')
      .replace('alt+', '⌥')
      .toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {SHORTCUTS
                  .filter(s => s.category === category)
                  .map(shortcut => (
                    <div key={shortcut.key} className="flex items-center justify-between py-1">
                      <span className="text-sm">{shortcut.description}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {formatShortcut(shortcut.key)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t text-xs text-muted-foreground">
          Press <Badge variant="outline" className="mx-1">⌘/</Badge> to show this dialog anytime
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tool Picker Dialog
interface ToolPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (toolId: string) => void;
}

function ToolPickerDialog({ isOpen, onClose, onSelect }: ToolPickerDialogProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, tools.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSelect(tools[selectedIndex].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Quick Tool Access</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              className={cn(
                'flex items-center gap-3 p-3 text-left rounded-lg border transition-colors',
                index === selectedIndex ? 'border-primary bg-primary/10' : 'hover:bg-muted'
              )}
            >
              <div className="text-2xl">
                {tool.category === 'api' && '🌐'}
                {tool.category === 'data' && '📝'}
                {tool.category === 'database' && '🗄️'}
                {tool.category === 'development' && '⚙️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{tool.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {tool.description}
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                ⌘{index + 1}
              </Badge>
            </button>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Use ↑↓ to navigate, Enter to select, or press ⌘1-9 directly
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Key combination component for displaying shortcuts
export function KeyCombination({ combination }: { combination: string }) {
  const keys = combination
    .replace('cmd+', '⌘+')
    .replace('shift+', '⇧+')
    .replace('ctrl+', 'Ctrl+')
    .replace('alt+', '⌥+')
    .split('+');

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">
            {key}
          </kbd>
          {index < keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Hook for managing keyboard shortcuts in components
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key.toLowerCase();
      
      let shortcut = '';
      if (isCmd) shortcut += 'cmd+';
      if (isShift) shortcut += 'shift+';
      shortcut += key;

      const handler = shortcuts[shortcut];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}