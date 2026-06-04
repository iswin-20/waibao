'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  role: string;
}

interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: User;
}

function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('token') || '';
}

function storeToken(token?: string) {
  if (typeof window === 'undefined' || !token) return;
  window.localStorage.setItem('token', token);
}

function clearStoredToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('token');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        storeToken(data.data?.token);
        setUser(data.data.user);
        return true;
      }
      clearStoredToken();
      return false;
    } catch {
      clearStoredToken();
      return false;
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthActionResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        storeToken(data.data?.token);
        const nextUser = data.data.user;
        setUser(nextUser);
        return { success: true, user: nextUser };
      }
      clearStoredToken();
      return { success: false, error: data.error || '注册失败' };
    } catch {
      clearStoredToken();
      return { success: false, error: '注册失败，请稍后重试' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
