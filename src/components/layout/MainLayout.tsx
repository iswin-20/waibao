'use client';

import React from 'react';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';

interface MainLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MainLayout({ children, showNav = true }: MainLayoutProps) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="正在加载..." />;
  }

  return (
    <>
      <div className="px-4 pt-4 pb-4">
        {children}
      </div>
      {showNav && <BottomNav />}
    </>
  );
}
