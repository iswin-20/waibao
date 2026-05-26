'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (!src) {
    return (
      <div className={cn(
        'waibao-avatar flex items-center justify-center bg-waibao-pink-light',
        sizeClasses[size],
        className
      )}>
        <UserIcon className={cn(
          'text-waibao-primary',
          size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-10 h-10' : 'w-6 h-6'
        )} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('waibao-avatar', sizeClasses[size], className)}
    />
  );
}
