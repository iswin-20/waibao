'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, MessageCircleHeart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, Loading, EmptyState, Badge } from '@/components/ui';
import { cn, formatDate, getEmotionLabel, getEmotionColor } from '@/lib/utils';
import type { Diary } from '@/types';

// 按月份分组
function groupByMonth(diaries: Diary[]): Record<string, Diary[]> {
  const groups: Record<string, Diary[]> = {};
  diaries.forEach((d) => {
    const month = d.date.substring(0, 7); // yyyy-MM
    if (!groups[month]) groups[month] = [];
    groups[month].push(d);
  });
  return groups;
}

// 情绪类型映射为 emoji
const moodEmoji: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  calm: '😌',
  excited: '🤗',
  tired: '😴',
  loved: '🥰',
};

function MoodTag({ level }: { level: number | null }) {
  if (level === null || level === undefined) return null;
  const emojis = ['😊', '😐', '😔', '😢', '😣'];
  return (
    <span className="text-xs">{emojis[level] || '😊'}</span>
  );
}

// 获取情绪标签对应的 emoji
function getMoodEmoji(emotionType: string | null): string {
  if (!emotionType) return '😊';
  return moodEmoji[emotionType] || '😊';
}

export default function DiaryPage() {
  const router = useRouter();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDiaries();
  }, []);

  const fetchDiaries = async () => {
    try {
      const res = await fetch('/api/diaries');
      const data = await res.json();
      if (data.success) {
        setDiaries(data.data?.diaries || []);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => groupByMonth(diaries), [diaries]);
  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  // 格式化月份显示
  const formatMonthKey = (key: string) => {
    const [year, month] = key.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  if (loading) {
    return <Loading text="加载日记中..." />;
  }

  return (
    <div className="max-w-md mx-auto pb-8">
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
        <BookOpen className="w-5 h-5 text-waibao-primary" />
        <h1 className="text-xl font-bold text-waibao-text">歪宝的日记</h1>
      </div>

      {diaries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-waibao-primary" />}
          title="还没有日记"
          description="每天记录心情，歪宝会给你温暖的安慰哦～"
        />
      ) : (
        <div className="space-y-6">
          {monthKeys.map((monthKey) => (
            <div key={monthKey} className="animate-slide-up">
              {/* 月份标题 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-waibao-pink-light/40" />
                <span className="text-sm font-bold text-waibao-text-light px-2">
                  {formatMonthKey(monthKey)}
                </span>
                <div className="h-px flex-1 bg-waibao-pink-light/40" />
              </div>

              {/* 日记列表 */}
              <div className="space-y-3">
                {grouped[monthKey].map((diary) => {
                  const isExpanded = expandedIds.has(diary.id);
                  const summary = diary.content.length > 80
                    ? diary.content.substring(0, 80) + '...'
                    : diary.content;

                  return (
                    <Card
                      key={diary.id}
                      hoverable
                      onClick={() => toggleExpand(diary.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-waibao-pink-light flex items-center justify-center">
                          <span className="text-lg">{getMoodEmoji(diary.emotionType)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* 日期和情绪标签 */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-waibao-text">
                              {formatDate(diary.date, 'M月d日')}
                            </span>
                            {diary.emotionLevel !== null && diary.emotionLevel !== undefined && (
                              <Badge variant={diary.emotionLevel <= 1 ? 'green' : diary.emotionLevel === 2 ? 'yellow' : 'pink'}>
                                <MoodTag level={diary.emotionLevel} />
                                <span className="ml-0.5">{getEmotionLabel(diary.emotionLevel)}</span>
                              </Badge>
                            )}
                          </div>

                          {/* 内容摘要 / 全文 */}
                          <p className={cn(
                            'text-sm text-waibao-text leading-relaxed',
                            !isExpanded && 'line-clamp-2'
                          )}>
                            {diary.content}
                          </p>

                          {/* AI 安慰文案 */}
                          {diary.aiComfortText && (
                            <div className="flex items-start gap-1.5 mt-2 p-2.5 rounded-xl bg-gradient-waibao">
                              <MessageCircleHeart className="w-4 h-4 text-waibao-primary mt-0.5 shrink-0" />
                              <p className="text-xs text-waibao-text leading-relaxed">
                                {isExpanded
                                  ? diary.aiComfortText
                                  : diary.aiComfortText.length > 60
                                    ? diary.aiComfortText.substring(0, 60) + '...'
                                    : diary.aiComfortText
                                }
                              </p>
                            </div>
                          )}

                          {/* 展开/收起 */}
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-waibao-text-light/50">
                            {isExpanded ? (
                              <><ChevronUp className="w-3 h-3" /> 收起</>
                            ) : (
                              <><ChevronDown className="w-3 h-3" /> 展开全文</>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 底部装饰 */}
      {diaries.length > 0 && (
        <div className="text-center mt-8">
          <Sparkles className="w-5 h-5 text-waibao-secondary mx-auto mb-1" />
          <p className="text-xs text-waibao-text-light">
            记录生活的点滴，歪宝一直在你身边 💕
          </p>
        </div>
      )}
    </div>
  );
}
