'use client';

import Link from 'next/link';
import { Moon, Sun, HelpCircle, Keyboard, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/help-system';
import { useState } from 'react';

interface HeaderProps {}

export function Header({}: HeaderProps = {}) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-3 sm:px-4">
        
        {/* Logo */}
        <Link className="flex items-center space-x-2 mr-2 sm:mr-4" href="/">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <span className="text-sm font-bold">DT</span>
          </div>
          <span className="hidden font-bold sm:inline-block text-sm md:text-base">
            DevTools Platform
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-1">
            <HelpButton className="mr-1" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Trigger keyboard shortcuts help
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: '/',
                  metaKey: true,
                  bubbles: true
                }));
              }}
              title="Show keyboard shortcuts (Cmd+/)"
            >
              <Keyboard className="h-4 w-4" />
              <span className="sr-only">Keyboard shortcuts</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="relative bg-gradient-to-r from-orange-100 to-blue-100 dark:from-blue-900 dark:to-purple-900 border-2 border-orange-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 px-3 py-2"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 text-orange-600 dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 text-blue-600 dark:rotate-0 dark:scale-100" />
            <span className="ml-2 hidden sm:inline text-xs font-medium">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Authentication */}
          {session?.user ? (
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[100px] sm:max-w-none truncate">
                  {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm p-1 sm:p-2"
              >
                <LogOut className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button asChild variant="outline" size="sm" className="ml-2 text-xs sm:text-sm">
              <Link href="/auth/signin">
                <User className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}