'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'yellow' | 'green' | 'purple' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'pink', className }: BadgeProps) {
  const variants = {
    pink: 'bg-waibao-pink-light text-waibao-pink-dark',
    yellow: 'bg-waibao-yellow-light text-yellow-700',
    green: 'bg-waibao-green-light text-green-700',
    purple: 'bg-waibao-purple-light text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
