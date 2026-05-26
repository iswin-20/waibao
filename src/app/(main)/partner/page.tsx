'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Gift,
  Sparkles,
  CalendarHeart,
  Cake,
  ChevronRight,
  MessageCircleHeart,
  Sun,
  Star,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Badge, Loading, EmptyState, ProgressBar } from '@/components/ui';
import { cn, getDaysUntil, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { PartnerStatus } from '@/components/partner/PartnerStatus';
import { ComfortButtons } from '@/components/partner/ComfortButtons';
import { PartnerBottomNav } from '@/components/layout/PartnerBottomNav';
import type { PartnerStatus as PartnerStatusType, Wish } from '@/types';

// ===== 关爱建议列表 =====
const comfortTips = [
  '给她发一条温暖的消息，告诉她你在想她',
  '点一杯她喜欢的奶茶送到她公司',
  '听她分享今天发生的事情，耐心回应',
  '给她一个拥抱，或者发一个拥抱的表情包',
  '帮她完成一件小事，比如倒杯热水',
  '说一句「你今天真好看」让她开心一整天',
  '分享一首你们有共同回忆的歌',
  '问问她今天有没有什么需要帮忙的',
  '给她点一份喜欢的外卖',
  '写一封小情书或留言给她惊喜',
];

export default function PartnerHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<PartnerStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');

  useEffect(() => {
    // 随机展示一条关爱建议
    setDailyTip(comfortTips[Math.floor(Math.random() * comfortTips.length)]);
    fetchPartnerStatus();
  }, []);

  const fetchPartnerStatus = async () => {
    try {
      const res = await fetch('/api/partner/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch {
      toast.error('获取歪宝状态失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算恋爱天数
  const loveDays = status?.loveDays ?? 0;

  // 计算距离她生日的天数（从重要日期中找生日）
  const birthdayDate = status?.upcomingDates?.find(
    (d) => d.category === 'birthday'
  );
  const daysUntilBirthday = birthdayDate
    ? getDaysUntil(birthdayDate.date)
    : null;

  if (loading) {
    return (
      <div className="max-w-md mx-auto pb-24">
        <Loading fullScreen text="正在查看歪宝状态..." />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24 space-y-4">
      {/* ===== 歪宝状态 ===== */}
      <PartnerStatus status={status} loading={loading} />

      {/* ===== 今日建议 ===== */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-waibao-secondary" />
              今日建议
            </span>
          </CardTitle>
        </CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-waibao-yellow-light flex items-center justify-center shrink-0">
            <MessageCircleHeart className="w-5 h-5 text-waibao-secondary" />
          </div>
          <p className="text-sm text-waibao-text leading-relaxed">{dailyTip}</p>
        </div>
      </Card>

      {/* ===== 恋爱天数 + 生日倒计时 ===== */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex items-center gap-4">
          {/* 恋爱天数 */}
          <div className="flex-1 text-center p-2 rounded-2xl bg-waibao-pink-light/30">
            <CalendarHeart className="w-5 h-5 text-waibao-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-waibao-primary">{loveDays}</p>
            <p className="text-xs text-waibao-text-light">在一起的天数</p>
          </div>

          {/* 生日倒计时 */}
          <div className="flex-1 text-center p-2 rounded-2xl bg-waibao-yellow-light/30">
            <Cake className="w-5 h-5 text-waibao-secondary mx-auto mb-1" />
            {daysUntilBirthday !== null && daysUntilBirthday >= 0 ? (
              <>
                <p className="text-2xl font-bold text-waibao-secondary">
                  {daysUntilBirthday}
                </p>
                <p className="text-xs text-waibao-text-light">距离她生日</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-waibao-text-light">--</p>
                <p className="text-xs text-waibao-text-light">生日未设置</p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ===== 近期心愿 ===== */}
      <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-waibao-primary" />
              近期心愿
            </span>
          </CardTitle>
          <Link
            href="/partner/wishes"
            className="text-xs text-waibao-primary hover:text-waibao-pink-dark transition-colors flex items-center gap-0.5"
          >
            查看全部
            <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>

        {!status?.recentWishes || status.recentWishes.length === 0 ? (
          <EmptyState
            icon={<Gift className="w-6 h-6 text-waibao-primary" />}
            title="歪宝还没有心愿"
            description="等她添加了心愿就会显示在这里啦"
          />
        ) : (
          <div className="space-y-2">
            {status.recentWishes.slice(0, 3).map((wish: Wish) => (
              <div
                key={wish.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-waibao-pink-light/20"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-waibao-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-waibao-text truncate">
                    {wish.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ProgressBar value={wish.progress} size="sm" />
                    <span className="text-xs text-waibao-text-light">
                      {wish.progress}%
                    </span>
                  </div>
                </div>
                {wish.claimedById && (
                  <Badge variant="green">已认领</Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ===== 一键哄哄 ===== */}
      <ComfortButtons />

      {/* ===== 底部导航 ===== */}
      <PartnerBottomNav />
    </div>
  );
}
