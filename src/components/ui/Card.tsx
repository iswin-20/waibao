'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable = false, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'waibao-card',
        hoverable && 'cursor-pointer hover:shadow-soft-lg hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-bold text-waibao-text', className)}>
      {children}
    </h3>
  );
}
