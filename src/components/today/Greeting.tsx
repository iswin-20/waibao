'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { getGreeting, getEncouragement } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Greeting() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const encouragement = getEncouragement();
  const nickname = user?.nickname || '小宝宝';

  return (
    <div className="waibao-card bg-gradient-to-br from-waibao-pink-light/60 via-white to-waibao-yellow-light/40">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Heart className="w-6 h-6 text-waibao-primary animate-float" fill="#FF9B9B" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-cute text-2xl text-waibao-text leading-tight">
            {greeting}，{nickname}～
          </h1>
          <p className="mt-2 text-waibao-text-light text-sm leading-relaxed">
            {encouragement}
          </p>
        </div>
      </div>
    </div>
  );
}
