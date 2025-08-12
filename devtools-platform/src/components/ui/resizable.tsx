'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanelGroupProps {
  direction: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}

interface ResizablePanelProps {
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  children: ReactNode;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

interface ResizableHandleProps {
  className?: string;
}

export function ResizablePanelGroup({ direction, children, className = '' }: ResizablePanelGroupProps) {
  return (
    <div 
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </div>
  );
}

export function ResizablePanel({ 
  defaultSize, 
  minSize = 10, 
  maxSize = 90, 
  children, 
  className = '',
  direction = 'horizontal'
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  
  return (
    <div 
      className={`${className}`}
      style={{ 
        flex: `0 0 ${size}%`,
        minWidth: direction === 'horizontal' ? `${minSize}%` : undefined,
        minHeight: direction === 'vertical' ? `${minSize}%` : undefined,
        maxWidth: direction === 'horizontal' ? `${maxSize}%` : undefined,
        maxHeight: direction === 'vertical' ? `${maxSize}%` : undefined,
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

export function ResizableHandle({ className = '' }: ResizableHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      // Implement resizing logic here
      // This is a simplified version - in a full implementation,
      // you'd calculate the new sizes based on mouse position
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div
      ref={handleRef}
      className={`bg-border hover:bg-border/80 transition-colors cursor-col-resize ${
        isResizing ? 'bg-blue-500' : ''
      } ${className}`}
      style={{
        width: '2px',
        height: '100%',
        minWidth: '2px',
        flexShrink: 0
      }}
      onMouseDown={handleMouseDown}
    />
  );
}