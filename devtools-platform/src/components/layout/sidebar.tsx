'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { tools, toolCategories } from '@/lib/tools';
import * as Icons from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:sticky md:transform-none',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="flex h-full flex-col overflow-y-auto py-4">
          <div className="px-4">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Developer Tools
            </h2>
          </div>
          
          <div className="space-y-1 px-4">
            <Link
              href="/"
              className={cn(
                'flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === '/' ? 'bg-accent text-accent-foreground' : 'transparent'
              )}
              onClick={() => onClose()}
            >
              <Icons.Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            
            {/* Categorized Tools */}
            {Object.entries(toolsByCategory).map(([categoryKey, categoryTools]) => {
              const categoryInfo = toolCategories[categoryKey as keyof typeof toolCategories];
              const CategoryIcon = Icons[categoryInfo.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
              
              return (
                <div key={categoryKey} className="space-y-1">
                  {/* Category Header */}
                  <div className="flex items-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <CategoryIcon className="mr-2 h-3 w-3" />
                    {categoryInfo.name}
                  </div>
                  
                  {/* Category Tools */}
                  {categoryTools.map((tool) => {
                    const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                    
                    return (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        className={cn(
                          'flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ml-4',
                          pathname === tool.path ? 'bg-accent text-accent-foreground' : 'transparent'
                        )}
                        onClick={() => onClose()}
                      >
                        <IconComponent className="mr-2 h-4 w-4" />
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
          
          <div className="mt-auto px-4">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>DevTools Platform</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Your all-in-one development toolkit
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {tools.length} tools • {Object.keys(toolCategories).length} categories
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}