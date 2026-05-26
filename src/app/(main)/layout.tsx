'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loading } from '@/components/ui/Loading';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) {
    return <Loading fullScreen text="正在加载..." />;
  }

  if (!isLoggedIn) {
    return <Loading fullScreen text="正在前往登录..." />;
  }

  return <MainLayout>{children}</MainLayout>;
}
