'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  className?: string;
  children: React.ReactNode;
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setOpen(!open);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: (event: React.MouseEvent) => {
        handleClick(event);
        // Call original onClick if it exists
        const originalOnClick = (children as React.ReactElement).props.onClick;
        if (originalOnClick) {
          originalOnClick(event);
        }
      },
    });
  }

  return (
    <button onClick={handleClick} className="inline-flex items-center gap-1">
      {children}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

export function DropdownMenuContent({ 
  align = 'center', 
  className, 
  children 
}: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        alignClass[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className, children, ...props }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setOpen(false);
    props.onClick?.(event);
  };

  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
    />
  );
}