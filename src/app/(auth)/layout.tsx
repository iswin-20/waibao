'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading } from '@/components/ui/Loading';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading) return <Loading fullScreen text="正在加载..." />;
  if (isLoggedIn) return null;

  return <>{children}</>;
}
