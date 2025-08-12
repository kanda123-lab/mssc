'use client';

import { Header } from './header';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { ToastProvider } from '@/components/ui/toast';
import { KeyboardShortcutsProvider } from '@/components/ui/keyboard-shortcuts';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ToastProvider>
      <KeyboardShortcutsProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
              <div className="container main-content">
                <div className="space-y-8 fade-in">
                  <ErrorBoundary fallbackComponent="tool">
                    {children}
                  </ErrorBoundary>
                </div>
              </div>
            </main>
          </div>
        </ErrorBoundary>
      </KeyboardShortcutsProvider>
    </ToastProvider>
  );
}