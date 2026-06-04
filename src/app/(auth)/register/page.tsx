'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User, Heart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [bindCode, setBindCode] = useState('');
  const [role, setRole] = useState<'waibao' | 'partner'>('waibao');
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeCooldown, setCodeCooldown] = useState(0);
  const { register } = useAuth();
  const router = useRouter();

  const getTokenHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const token = window.localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const startCooldown = () => {
    setCodeCooldown(60);
    const timer = window.setInterval(() => {
      setCodeCooldown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const sendCode = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast.error('请先填写邮箱');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error('请输入正确的邮箱');
      return;
    }

    setCodeLoading(true);
    try {
      const res = await fetch('/api/auth/register-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '验证码发送失败');
      toast.success('验证码已发送，请查看邮箱');
      startCooldown();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '验证码发送失败');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nickname) {
      toast.error('请填写所有必填项');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('请输入正确的邮箱');
      return;
    }
    if (password.length < 6) {
      toast.error('密码至少6位');
      return;
    }
    if (!/^\d{6}$/.test(emailCode.trim())) {
      toast.error('请输入 6 位邮箱验证码');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        email: email.trim(),
        emailCode: emailCode.trim(),
        password,
        nickname: nickname.trim(),
        role,
      });

      if (result.success) {
        if (bindCode.trim()) {
          try {
            const bindRes = await fetch('/api/couples/bind', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...getTokenHeader(),
              },
              body: JSON.stringify({ bindCode: bindCode.trim().toUpperCase() }),
            });
            const bindData = await bindRes.json();
            if (!bindRes.ok || !bindData.success) {
              toast.error(bindData.error || '邀请码绑定失败，可稍后在我的页面绑定');
            }
          } catch {
            toast.error('邀请码绑定失败，可稍后在我的页面绑定');
          }
        }
        toast.success(`欢迎来到歪宝小窝，${nickname}！`);
        router.push(result.user?.role === 'partner' ? '/partner' : '/');
      } else {
        toast.error(result.error || '注册失败');
      }
    } catch {
      toast.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-waibao-text font-cute">创建小窝</h1>
        <p className="text-waibao-text-light mt-1">开启属于你的温暖旅程</p>
      </div>

      {/* 角色选择 */}
      <div className="w-full max-w-sm mb-6">
        <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">
          你是谁？
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('waibao')}
            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
              role === 'waibao'
                ? 'border-waibao-primary bg-waibao-pink-light/50 shadow-colored'
                : 'border-gray-200 bg-white hover:border-waibao-pink-light'
            }`}
          >
            <Heart className={`w-6 h-6 mx-auto mb-1 ${role === 'waibao' ? 'text-waibao-primary' : 'text-gray-400'}`} />
            <p className={`font-medium text-sm ${role === 'waibao' ? 'text-waibao-primary' : 'text-gray-500'}`}>
              我是歪宝
            </p>
            <p className="text-xs text-gray-400 mt-0.5">被宠爱的小可爱</p>
          </button>
          <button
            type="button"
            onClick={() => setRole('partner')}
            className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
              role === 'partner'
                ? 'border-waibao-primary bg-waibao-pink-light/50 shadow-colored'
                : 'border-gray-200 bg-white hover:border-waibao-pink-light'
            }`}
          >
            <Sparkles className={`w-6 h-6 mx-auto mb-1 ${role === 'partner' ? 'text-waibao-primary' : 'text-gray-400'}`} />
            <p className={`font-medium text-sm ${role === 'partner' ? 'text-waibao-primary' : 'text-gray-500'}`}>
              我是男朋友
            </p>
            <p className="text-xs text-gray-400 mt-0.5">宠她的人</p>
          </button>
        </div>
      </div>

      {/* 注册表单 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          label="昵称"
          placeholder={role === 'waibao' ? '给歪宝起个可爱的名字' : '你的称呼'}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          icon={<User className="w-5 h-5" />}
        />

        <Input
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-5 h-5" />}
        />

        <div className="grid grid-cols-[1fr_auto] items-end gap-2">
          <Input
            label="邮箱验证码"
            placeholder="6 位数字"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            icon={<Sparkles className="w-5 h-5" />}
          />
          <Button
            type="button"
            variant="secondary"
            className="h-[50px] px-4 whitespace-nowrap"
            loading={codeLoading}
            disabled={codeCooldown > 0}
            onClick={sendCode}
          >
            {codeCooldown > 0 ? `${codeCooldown}s` : '发送'}
          </Button>
        </div>

        <Input
          label="密码"
          type="password"
          placeholder="至少6位密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
        />

        <Input
          label="确认密码"
          type="password"
          placeholder="再输入一次密码"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock className="w-5 h-5" />}
        />

        <Input
          label="邀请码（可选）"
          placeholder="另一半发来的邀请码"
          value={bindCode}
          onChange={(e) => setBindCode(e.target.value)}
          icon={<Sparkles className="w-5 h-5" />}
        />

        <Button type="submit" className="w-full" loading={loading}>
          注册
        </Button>
      </form>

      {/* 登录链接 */}
      <p className="mt-6 text-sm text-waibao-text-light">
        已有账号？{' '}
        <Link href="/login" className="text-waibao-primary font-medium hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
