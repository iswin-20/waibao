'use client';

import React from 'react';
import { Switch as AnimalSwitch } from 'animal-island-ui';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'default';
  className?: string;
}

export function Switch({ checked, onChange, disabled, size = 'default', className }: SwitchProps) {
  return (
    <AnimalSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      size={size}
      className={cn(className)}
    />
  );
}
