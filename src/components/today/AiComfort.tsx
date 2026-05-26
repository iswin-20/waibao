'use client';

import React from 'react';
import { Heart, Sparkles, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getEmotionLabel, getEmotionColor } from '@/lib/utils';

interface AiComfortProps {
  emotionLevel: number;
  emotionType: string;
  comfortText: string;
}

export function AiComfort({ emotionLevel, emotionType, comfortText }: AiComfortProps) {
  const label = getEmotionLabel(emotionLevel);

  const badgeVariant = (() => {
    if (emotionLevel <= 0) return 'green';
    if (emotionLevel <= 1) return 'yellow';
    if (emotionLevel <= 2) return 'pink';
    return 'purple';
  })();

  return (
    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-waibao-pink-light/30 via-white to-waibao-purple-light/20 border border-waibao-pink-light/30">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-waibao-text">歪宝的安慰</span>
            <Badge variant={badgeVariant}>
              {label}
              {emotionType ? ` · ${emotionType}` : ''}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-waibao-text leading-relaxed whitespace-pre-wrap">
            {comfortText}
          </p>
          {emotionLevel >= 3 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-waibao-pink-dark bg-waibao-pink-light/50 px-3 py-2 rounded-xl">
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span>小提醒已发送给男朋友～</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
