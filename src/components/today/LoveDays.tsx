'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Link2, KeyRound, Copy, Check } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { getLoveDays } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CoupleStatus {
  id: string;
  status: 'none' | 'pending' | 'active' | 'unbound';
  bindCode: string;
  loveStartDate: string | null;
  loveDays: number;
  partner: { id: string; nickname: string; avatar: string | null; email: string } | null;
}

export function LoveDays() {
  const router = useRouter();
  const [couple, setCouple] = useState<CoupleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBindCode, setShowBindCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/couples/status')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCouple(res.data);
          // 如果状态是 pending，自动弹出邀请码
          if (res.data.status === 'pending') {
            setShowBindCode(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('邀请码已复制！');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <div className="waibao-card">
        <Loading size="sm" />
      </div>
    );
  }

  if (!couple || couple.status === 'none') {
    return (
      <div className="waibao-card bg-gradient-to-br from-waibao-pink-light/30 to-white">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-waibao-pink-light flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-waibao-primary" />
          </div>
          <p className="text-waibao-text font-medium">尚未绑定伴侣</p>
          <p className="text-waibao-text-light text-sm mt-1 mb-3">
            去「我的」页面生成邀请码，邀请另一半吧～
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="text-xs text-waibao-primary font-medium hover:underline"
          >
            去绑定 →
          </button>
        </div>
      </div>
    );
  }

  if (couple.status === 'pending') {
    return (
      <>
        <div
          className="waibao-card bg-gradient-to-br from-waibao-yellow-light/30 to-white cursor-pointer hover:shadow-soft transition-shadow"
          onClick={() => setShowBindCode(true)}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-waibao-yellow-light flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-waibao-text font-medium">等待另一半绑定</p>
            <p className="text-waibao-text-light text-xs mt-2">
              点击查看邀请码
            </p>
          </div>
        </div>

        <Modal isOpen={showBindCode} onClose={() => setShowBindCode(false)} title="你的邀请码">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <p className="text-waibao-text-light text-sm mb-4">
              把邀请码发给另一半，对方注册时输入即可绑定
            </p>
            <div className="flex items-center gap-3 justify-center mb-4">
              <span className="text-2xl font-mono font-bold text-waibao-primary tracking-[0.3em] bg-waibao-pink-light/30 px-6 py-3 rounded-2xl">
                {couple.bindCode}
              </span>
            </div>
            <button
              onClick={() => handleCopy(couple.bindCode)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-white rounded-full font-medium hover:opacity-90 transition-all"
            >
              {copied ? (
                <><Check className="w-4 h-4" /> 已复制</>
              ) : (
                <><Copy className="w-4 h-4" /> 复制邀请码</>
              )}
            </button>
          </div>
        </Modal>
      </>
    );
  }

  const days = couple.loveStartDate ? getLoveDays(couple.loveStartDate) : couple.loveDays;

  return (
    <div className="waibao-card bg-gradient-to-br from-waibao-pink-light/30 via-white to-waibao-yellow-light/20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary mb-3">
          <Heart className="w-6 h-6 text-white" fill="white" />
        </div>
        <p className="text-waibao-text-light text-sm">我们已经恋爱</p>
        <p className="font-cute text-4xl text-waibao-primary mt-1">
          {days}
          <span className="text-xl text-waibao-text-light ml-1">天</span>
        </p>
        <p className="text-waibao-text-light text-sm mt-1 flex items-center justify-center gap-1">
          <Heart className="w-3.5 h-3.5 text-waibao-primary" fill="#FF9B9B" />
          {couple.partner?.nickname || '另一半'} {new Date().getFullYear() - (couple.loveStartDate ? new Date(couple.loveStartDate).getFullYear() : 0) >= 1 ? `第 ${new Date().getFullYear() - new Date(couple.loveStartDate!).getFullYear() + 1} 年` : ''}
          <Heart className="w-3.5 h-3.5 text-waibao-primary" fill="#FF9B9B" />
        </p>
        {couple.partner && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-waibao-text-light bg-waibao-pink-light/50 px-3 py-1 rounded-full">
            <Link2 className="w-3 h-3" />
            <span>和 {couple.partner.nickname} 绑定中</span>
          </div>
        )}
      </div>
    </div>
  );
}
