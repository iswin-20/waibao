'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarHeart,
  Gift,
  Cake,
  Sparkles,
  PartyPopper,
  Star,
  Heart,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { getDaysUntil, formatDate } from '@/lib/utils';
import type { ImportantDate } from '@/types';

const categoryIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
  birthday: {
    icon: <Cake className="w-4 h-4" />,
    bg: 'bg-waibao-pink-light',
  },
  anniversary: {
    icon: <Heart className="w-4 h-4" />,
    bg: 'bg-waibao-pink-light',
  },
  holiday: {
    icon: <PartyPopper className="w-4 h-4" />,
    bg: 'bg-waibao-yellow-light',
  },
  travel: {
    icon: <Sparkles className="w-4 h-4" />,
    bg: 'bg-waibao-green-light',
  },
};

function getDateIcon(date: ImportantDate) {
  const cat = date.category?.toLowerCase();
  if (cat && categoryIcons[cat]) {
    return categoryIcons[cat];
  }
  return { icon: <Gift className="w-4 h-4" />, bg: 'bg-waibao-purple-light' };
}

function getDaysText(days: number): string {
  if (days === 0) return '就是今天！';
  if (days === 1) return '明天就到了～';
  if (days <= 7) return `${days}天后`;
  return `${days}天后`;
}

export function ImportantDates() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/important-dates?upcoming=true')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDates(res.data?.dates || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="waibao-card">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-waibao-primary" />
            <span>重要日子</span>
          </div>
        </CardTitle>
      </CardHeader>

      {loading ? (
        <Loading size="sm" />
      ) : dates.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-waibao-text-light">
          <Star className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">还没有重要日子～</p>
          <p className="text-xs mt-1 opacity-60">和 TA 一起记录专属纪念日吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map((date) => {
            const days = getDaysUntil(date.date);
            const { icon, bg } = getDateIcon(date);

            return (
              <div
                key={date.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-waibao-pink-light/20 hover:bg-waibao-pink-light/40 transition-colors"
              >
                <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-waibao-text font-medium text-sm truncate">
                    {date.title}
                  </p>
                  <p className="text-waibao-text-light text-xs mt-0.5">
                    {formatDate(date.date)}
                    {date.repeatType === 'yearly' && ' · 每年'}
                  </p>
                </div>
                <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                  days <= 1
                    ? 'bg-waibao-primary text-white'
                    : days <= 7
                    ? 'bg-waibao-yellow-light text-yellow-700'
                    : 'bg-waibao-pink-light text-waibao-pink-dark'
                }`}>
                  {getDaysText(days)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
