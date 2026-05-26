'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 animate-fade-in',
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-waibao-pink-light flex items-center justify-center mb-4 animate-float">
        {icon || <Heart className="w-8 h-8 text-waibao-primary" />}
      </div>
      <h3 className="text-lg font-bold text-waibao-text mb-2 text-center">{title}</h3>
      {description && (
        <p className="text-sm text-waibao-text-light text-center max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
