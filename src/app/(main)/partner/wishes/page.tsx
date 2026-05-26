'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gift, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Badge, Loading, EmptyState, ProgressBar } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PartnerBottomNav } from '@/components/layout/PartnerBottomNav';
import toast from 'react-hot-toast';
import type { Wish } from '@/types';

const categoryConfig: Record<string, { variant: 'pink' | 'yellow' | 'green' | 'purple'; label: string }> = {
  buy: { variant: 'pink', label: '想买' },
  food: { variant: 'yellow', label: '想吃' },
  travel: { variant: 'green', label: '想去' },
  movie: { variant: 'purple', label: '想看' },
};

const categoryBgClass: Record<string, string> = {
  buy: 'bg-waibao-pink-light',
  food: 'bg-waibao-yellow-light',
  travel: 'bg-waibao-green-light',
  movie: 'bg-waibao-purple-light',
};

export default function PartnerWishesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      // 获取伴侣的心愿: 使用 status 参数获取 wanting + claimed + completed
      const res = await fetch('/api/wishes?status=wanting,claimed,preparing');
      const data = await res.json();
      if (data.success) {
        setWishes(data.data?.wishes || []);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const handleClaimWish = async (wishId: string) => {
    setClaimingId(wishId);
    try {
      const res = await fetch('/api/partner/claim-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('已认领心愿！开始准备惊喜吧 🎁');
        fetchWishes();
      } else {
        toast.error(data.error || '认领失败');
      }
    } catch {
      toast.error('认领失败，请稍后重试');
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) {
    return <Loading text="加载歪宝的心愿中..." />;
  }

  const wantingWishes = wishes.filter((w) => w.status === 'wanting');
  const claimedWishes = wishes.filter(
    (w) => w.status === 'claimed' || w.status === 'preparing'
  );
  const completedWishes = wishes.filter((w) => w.status === 'completed');

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-waibao-text-light hover:text-waibao-text transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回</span>
      </button>

      {/* 页面标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-waibao-primary" />
        <h1 className="text-xl font-bold text-waibao-text">歪宝的心愿</h1>
        <Badge variant="pink">{wishes.length}</Badge>
      </div>

      {/* 可认领的心愿 */}
      {wantingWishes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-waibao-text mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-waibao-secondary" />
            可认领的心愿
          </h2>
          <div className="space-y-3">
            {wantingWishes.map((wish) => {
              const cat = wish.category || 'buy';
              const cfg = categoryConfig[cat] || categoryConfig.buy;
              const bgClass = categoryBgClass[cat] || 'bg-waibao-pink-light';
              return (
                <Card key={wish.id}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgClass)}>
                      <Gift className="w-5 h-5 text-waibao-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-waibao-text truncate">{wish.title}</h3>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      {wish.description && (
                        <p className="text-xs text-waibao-text-light line-clamp-2 mb-2">
                          {wish.description}
                        </p>
                      )}
                      <ProgressBar value={wish.progress} size="sm" />
                      <div className="mt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Heart className="w-4 h-4" />}
                          loading={claimingId === wish.id}
                          onClick={() => handleClaimWish(wish.id)}
                        >
                          认领心愿
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 已认领的心愿 */}
      {claimedWishes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-waibao-text mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-waibao-primary" />
            你认领的心愿
          </h2>
          <div className="space-y-3">
            {claimedWishes.map((wish) => {
              const cat = wish.category || 'buy';
              const cfg = categoryConfig[cat] || categoryConfig.buy;
              const bgClass = categoryBgClass[cat] || 'bg-waibao-pink-light';
              const isClaimedByMe = wish.claimedById === user?.id;
              return (
                <Card key={wish.id}>
                  <div className="flex items-start gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgClass)}>
                      <Heart className="w-5 h-5 text-waibao-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-waibao-text truncate">{wish.title}</h3>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        {isClaimedByMe && (
                          <Badge variant="green">准备中</Badge>
                        )}
                      </div>
                      {wish.description && (
                        <p className="text-xs text-waibao-text-light line-clamp-2 mb-2">
                          {wish.description}
                        </p>
                      )}
                      <ProgressBar value={wish.progress} size="sm" />
                      {isClaimedByMe && (
                        <p className="text-xs text-waibao-primary mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          正在给歪宝准备惊喜中...
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 空白状态 */}
      {wantingWishes.length === 0 && claimedWishes.length === 0 && completedWishes.length === 0 && (
        <EmptyState
          icon={<Gift className="w-8 h-8 text-waibao-primary" />}
          title="歪宝还没有心愿"
          description="等她添加了心愿，可以在这里认领给她惊喜哦～"
        />
      )}

      {/* 已完成 */}
      {completedWishes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-waibao-text mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-waibao-green" />
            已完成的心愿
          </h2>
          <div className="space-y-3 opacity-60">
            {completedWishes.map((wish) => {
              const cat = wish.category || 'buy';
              const cfg = categoryConfig[cat] || categoryConfig.buy;
              return (
                <Card key={wish.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-waibao-green-light flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-waibao-green-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-waibao-text truncate">{wish.title}</h3>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-waibao-text-light">
                        已完成
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <PartnerBottomNav />
    </div>
  );
}
