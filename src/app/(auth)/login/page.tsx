'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, Heart, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === '1') {
      setBanner({ type: 'success', text: '邮箱验证成功！请登录' });
    } else if (params.get('error')) {
      setBanner({ type: 'error', text: params.get('error')! });
    }
    // 清除 URL 参数
    if (params.get('verified') || params.get('error')) {
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('欢迎回来！');
        router.push('/');
      } else {
        toast.error('邮箱或密码错误');
      }
    } catch {
      toast.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Logo & 标题 */}
      <div className="text-center mb-10 animate-float">

        {/* 验证结果横幅 */}
        {banner && (
          <div className={`mb-4 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm ${
            banner.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {banner.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />
            }
            <span className="flex-1">{banner.text}</span>
            <button onClick={() => setBanner(null)} className="shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-colored">
          <Heart className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-waibao-text font-cute">歪宝小窝</h1>
        <p className="text-waibao-text-light mt-2">你被看见、被记得、被爱着</p>
      </div>

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
        />

        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
        />

        <Button type="submit" className="w-full" loading={loading}>
          登录
        </Button>
      </form>

      {/* 注册链接 */}
      <p className="mt-6 text-sm text-waibao-text-light">
        还没有账号？{' '}
        <Link href="/register" className="text-waibao-primary font-medium hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}
