'use client';

import React from 'react';
import { Heart, Droplets, Sparkles } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { cn, getEmotionLabel, getEmotionColor } from '@/lib/utils';
import type { PartnerStatus as PartnerStatusType } from '@/types';

interface PartnerStatusProps {
  status: PartnerStatusType | null;
  loading?: boolean;
}

const moodEmoji: Record<number, string> = {
  0: '😊',
  1: '😐',
  2: '😔',
  3: '😢',
  4: '😣',
};

export function PartnerStatus({ status, loading = false }: PartnerStatusProps) {
  if (loading || !status) {
    return (
      <div className="waibao-card p-6 text-center animate-pulse-soft">
        <div className="w-20 h-20 rounded-full bg-waibao-pink-light mx-auto mb-3" />
        <div className="h-5 w-32 bg-waibao-pink-light rounded-full mx-auto mb-2" />
        <div className="h-4 w-24 bg-waibao-pink-light/60 rounded-full mx-auto" />
      </div>
    );
  }

  const { user, todayMood, periodStatus } = status;
  const emotionLevel = todayMood?.emotionLevel ?? 0;
  const emoji = moodEmoji[emotionLevel] || '😊';
  const emotionColor = getEmotionColor(emotionLevel);

  return (
    <div className="waibao-card p-6 text-center animate-slide-up">
      {/* 歪宝头像 */}
      <div className="relative inline-block mb-3">
        <Avatar
          src={user?.avatar}
          alt={user?.nickname || '歪宝'}
          size="xl"
          className="mx-auto ring-4 ring-waibao-pink-light/50"
        />
        {/* 状态呼吸动效 */}
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-waibao-primary flex items-center justify-center shadow-colored animate-bounce-slow">
          <Heart className="w-3.5 h-3.5 text-white fill-white" />
        </span>
      </div>

      {/* 歪宝昵称 */}
      <h2 className="text-xl font-bold text-waibao-text mb-1">
        {user?.nickname || '歪宝'}
      </h2>

      {/* 今日情绪 */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="text-2xl">{emoji}</span>
        <span className={cn('text-sm font-bold', emotionColor)}>
          {getEmotionLabel(emotionLevel)}
        </span>
      </div>

      {/* 特殊时期提醒 */}
      {periodStatus === 'period' && (
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-waibao-pink-light/60 text-waibao-pink-dark text-sm font-medium">
          <Droplets className="w-4 h-4" />
          <span>特殊时期，需要更多关爱</span>
        </div>
      )}

      {/* 底部装饰 */}
      {!periodStatus && (
        <div className="flex items-center justify-center gap-1 text-xs text-waibao-text-light/60 mt-2">
          <Sparkles className="w-3 h-3" />
          <span>歪宝今天也在想你哦</span>
          <Sparkles className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
