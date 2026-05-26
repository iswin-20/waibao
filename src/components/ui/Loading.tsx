'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ fullScreen = false, text, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Heart className={cn(
        'text-waibao-primary animate-pulse-soft',
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-waibao-text-light text-sm animate-pulse-soft">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-warm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}
