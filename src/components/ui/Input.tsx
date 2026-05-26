'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-waibao-text ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-waibao-text-light">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'waibao-input',
            icon && 'pl-12',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-200',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 ml-1">{error}</p>
      )}
    </div>
  );
}
