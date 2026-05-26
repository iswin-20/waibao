'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/ui/Loading';
import { Greeting } from '@/components/today/Greeting';
import { LoveDays } from '@/components/today/LoveDays';
import { ImportantDates } from '@/components/today/ImportantDates';
import { WeatherBrief } from '@/components/today/WeatherBrief';
import { TodoBrief } from '@/components/today/TodoBrief';
import { MoodEntry } from '@/components/today/MoodEntry';

export default function TodayPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="正在为你准备今日页面..." />;
  }

  return (
    <div className="max-w-md mx-auto pb-24 space-y-4">
      {/* 时间错开动画 - 每个卡片逐次滑入 */}
      <div className="animate-slide-up" style={{ animationDelay: '0s', animationFillMode: 'both' }}>
        <Greeting />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <LoveDays />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <ImportantDates />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <WeatherBrief />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <TodoBrief />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
        <MoodEntry />
      </div>
    </div>
  );
}
