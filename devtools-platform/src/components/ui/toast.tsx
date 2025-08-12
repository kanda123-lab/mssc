'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { NotificationConfig } from '@/types';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  ExternalLink
} from 'lucide-react';

interface Toast extends NotificationConfig {
  id: string;
  createdAt: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (config: NotificationConfig) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((config: NotificationConfig): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toast: Toast = {
      ...config,
      id,
      createdAt: Date.now(),
      duration: config.duration ?? (config.type === 'error' ? 8000 : 4000)
    };

    setToasts(current => {
      const newToasts = [toast, ...current].slice(0, maxToasts);
      return newToasts;
    });

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }

    return id;
  }, [maxToasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-background animate-in slide-in-from-right-full duration-300";
    
    switch (toast.type) {
      case 'success':
        return cn(baseStyles, "border-green-200 bg-green-50 text-green-900");
      case 'error':
        return cn(baseStyles, "border-red-200 bg-red-50 text-red-900");
      case 'warning':
        return cn(baseStyles, "border-yellow-200 bg-yellow-50 text-yellow-900");
      case 'info':
        return cn(baseStyles, "border-blue-200 bg-blue-50 text-blue-900");
      default:
        return cn(baseStyles, "border-gray-200");
    }
  };

  const getIconStyles = () => {
    switch (toast.type) {
      case 'success':
        return "text-green-600";
      case 'error':
        return "text-red-600";
      case 'warning':
        return "text-yellow-600";
      case 'info':
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={getStyles()}>
      <div className={cn("flex-shrink-0 mt-0.5", getIconStyles())}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{toast.title}</h4>
        <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        
        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toast.action.onClick}
            className="mt-2 h-auto p-0 text-xs font-medium hover:underline"
          >
            {toast.action.label}
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 h-auto p-1 hover:bg-black/10 rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Convenience functions for different toast types
export const toast = {
  success: (title: string, message: string, options?: Partial<NotificationConfig>) => {
    // This would need to be called within a component that has access to the toast context
    return { type: 'success' as const, title, message, ...options };
  },
  
  error: (title: string, message: string, options?: Partial<NotificationConfig>) => {
    return { type: 'error' as const, title, message, ...options };
  },
  
  warning: (title: string, message: string, options?: Partial<NotificationConfig>) => {
    return { type: 'warning' as const, title, message, ...options };
  },
  
  info: (title: string, message: string, options?: Partial<NotificationConfig>) => {
    return { type: 'info' as const, title, message, ...options };
  }
};