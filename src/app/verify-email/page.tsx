'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Heart, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('缺少验证令牌');
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage(data.data.message);
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.error || '验证失败');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('网络错误，请稍后重试');
      });
  }, [searchParams, router]);

  return (
    <div className="text-center max-w-sm">
      <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center transition-all duration-700 ${
        status === 'loading' ? 'bg-waibao-pink-light animate-pulse-soft' :
        status === 'success' ? 'bg-green-100 scale-110' : 'bg-red-100'
      }`}>
        {status === 'loading' && (
          <Loader2 className="w-10 h-10 text-waibao-primary animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-10 h-10 text-green-500" />
        )}
        {status === 'error' && (
          <XCircle className="w-10 h-10 text-red-500" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-waibao-text font-cute mb-3">
        {status === 'loading' ? '验证中...' :
         status === 'success' ? '邮箱验证成功！' : '验证失败'}
      </h1>

      <p className="text-waibao-text-light mb-8">{message}</p>

      {status === 'success' && (
        <div className="space-y-3">
          <p className="text-sm text-waibao-text-light">
            即将跳转到登录页...
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-all"
          >
            <Heart className="w-4 h-4" />
            立即登录
          </Link>
        </div>
      )}

      {status === 'error' && (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-all"
        >
          <Heart className="w-4 h-4" />
          返回登录
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-warm">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-waibao-primary animate-spin mx-auto mb-4" />
          <p className="text-waibao-text-light">加载中...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
