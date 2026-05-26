'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sun,
  CloudSun,
  CalendarHeart,
  Wand2,
  User,
} from 'lucide-react';

const navItems = [
  { href: '/', label: '今日', icon: Sun },
  { href: '/weather', label: '天气', icon: CloudSun },
  { href: '/period', label: '例假', icon: CalendarHeart },
  { href: '/wishes', label: '心愿', icon: Wand2 },
  { href: '/profile', label: '我的', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* 背景 */}
      <div className="max-w-md mx-auto">
        <div className="glass rounded-t-3xl px-2 py-1">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-item relative px-3 py-1',
                    isActive && 'active'
                  )}
                >
                  {isActive && (
                    <span className="absolute -top-1 w-8 h-1 bg-gradient-primary rounded-full" />
                  )}
                  <Icon className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isActive ? 'text-waibao-primary' : 'text-waibao-text-light'
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
