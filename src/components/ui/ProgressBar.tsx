'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, color, className, showLabel = false, size = 'md' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex-1 rounded-full bg-waibao-pink-light/40 overflow-hidden waibao-progress',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            sizeClasses[size]
          )}
          style={{
            width: `${clampedValue}%`,
            background: color || 'linear-gradient(135deg, #FF9B9B 0%, #FFB3B3 100%)',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-waibao-text-light font-medium min-w-[2.5rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
