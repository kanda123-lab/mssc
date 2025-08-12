'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';
import { Tool } from '@/types';

interface LazyToolCardProps {
  tool: Tool;
}

export function LazyToolCard({ tool }: LazyToolCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle smooth navigation
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Start click animation
    setIsClicked(true);
    setIsNavigating(true);
    
    // Add a small delay for the animation to be visible
    setTimeout(() => {
      router.push(tool.path);
    }, 200);
    
    // Reset click state after animation
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
  };

  // Get color based on tool category
  const getCategoryColor = (category: string) => {
    const colors = {
      'api': 'bg-blue-500 hover:bg-blue-600',
      'data': 'bg-green-500 hover:bg-green-600', 
      'database': 'bg-purple-500 hover:bg-purple-600',
      'development': 'bg-orange-500 hover:bg-orange-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before the card is visible
        threshold: 0.1
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load icon component when visible
  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Small delay to allow for smooth transitions
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, isLoaded]);

  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  // Skeleton loader
  if (!isVisible) {
    return (
      <div ref={cardRef} className="flex flex-col items-center p-4 rounded-lg border min-h-[80px] animate-pulse">
        <div className={`h-10 w-10 rounded-lg mb-2 ${getCategoryColor(tool.category)}`}></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef} 
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        onClick={handleClick}
        className={`group relative flex flex-col items-center p-4 rounded-lg border cursor-pointer will-change-transform min-h-[80px] transition-all duration-300 ease-out
          ${isClicked 
            ? 'scale-95 shadow-inner bg-accent/50' 
            : 'hover:bg-accent hover:shadow-lg hover:scale-105 active:scale-95'
          }
          ${isNavigating ? 'animate-pulse' : ''}
        `}
      >
        {/* Loading overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-lg flex items-center justify-center z-20">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-1 py-0.5 bg-black text-white text-[6px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap max-w-[150px] text-center shadow-lg">
          {tool.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black"></div>
        </div>
        
        {/* Icon */}
        <div 
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all duration-300 mb-2 will-change-transform
            ${getCategoryColor(tool.category)}
            ${isClicked 
              ? 'scale-90 rotate-12' 
              : 'group-hover:scale-110 group-hover:rotate-3 group-active:scale-90'
            }
          `}
          title={tool.description}
        >
          {isLoaded && IconComponent && (
            <IconComponent className={`h-5 w-5 transition-all duration-300 ${isClicked ? 'scale-110' : ''}`} />
          )}
        </div>
        
        {/* Tool Name */}
        <h3 className={`text-xs font-medium text-center line-clamp-2 leading-tight px-2 w-full transition-all duration-300
          ${isClicked 
            ? 'text-primary scale-95' 
            : 'group-hover:text-primary group-hover:scale-105'
          }
        `}>
          {tool.name}
        </h3>
      </div>
    </div>
  );
}