'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  MessageCircleHeart,
  Sparkles,
  CalendarDays,
  Clock,
  Trash2,
  Share2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Badge, Loading, EmptyState, Modal } from '@/components/ui';
import { cn, formatDate, getEmotionLabel, getEmotionColor } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Diary } from '@/types';

// 情绪类型 => emoji
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

const moodLevelEmojis = ['😊', '😐', '😔', '😢', '😣'];

function getMoodEmoji(emotionType: string | null, emotionLevel: number | null): string {
  if (emotionType && moodEmoji[emotionType]) return moodEmoji[emotionType];
  if (emotionLevel !== null && emotionLevel !== undefined) return moodLevelEmojis[emotionLevel] || '😊';
  return '😊';
}

export default function DiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFullComfort, setShowFullComfort] = useState(false);

  const diaryId = params.id as string;

  useEffect(() => {
    if (diaryId) {
      fetchDiary();
    }
  }, [diaryId]);

  const fetchDiary = async () => {
    try {
      const res = await fetch(`/api/diaries/${diaryId}`);
      const data = await res.json();
      if (data.success) {
        setDiary(data.data);
      } else {
        toast.error('日记不存在或已被删除');
        router.push('/diary');
      }
    } catch {
      toast.error('获取日记失败');
      router.push('/diary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/diaries/${diaryId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('日记已删除');
        router.push('/diary');
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  // 格式化创建时间
  const formatCreatedAt = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return formatDate(dateStr, 'yyyy年M月d日 HH:mm');
  };

  if (loading) {
    return <Loading text="加载日记内容中..." />;
  }

  if (!diary) {
    return (
      <div className="max-w-md mx-auto pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-waibao-text-light hover:text-waibao-text transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">返回</span>
        </button>
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-waibao-primary" />}
          title="日记不存在"
          description="这篇日记可能已被删除或无法访问"
          action={
            <Button variant="primary" onClick={() => router.push('/diary')}>
              返回日记列表
            </Button>
          }
        />
      </div>
    );
  }

  const emotionType = diary.emotionType || null;
  const emotionLevel = diary.emotionLevel ?? null;
  const emoji = getMoodEmoji(emotionType, emotionLevel);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-waibao-primary" />
          <h1 className="text-xl font-bold text-waibao-text">日记详情</h1>
        </div>
        <button
          onClick={() => setDeleteModalOpen(true)}
          className="p-2 rounded-xl text-waibao-text-light hover:text-red-400 hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ===== 日记主卡片 ===== */}
      <div className="animate-slide-up">
        <Card>
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{emoji}</span>
              <div>
                <p className="text-sm font-bold text-waibao-text">
                  {formatDate(diary.date, 'M月d日')}
                </p>
                <p className="text-xs text-waibao-text-light flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(diary.date, 'EEEE')}
                </p>
              </div>
            </div>
            {emotionLevel !== null && (
              <Badge
                variant={
                  emotionLevel <= 1
                    ? 'green'
                    : emotionLevel === 2
                    ? 'yellow'
                    : 'pink'
                }
                className="text-sm"
              >
                {emoji} {getEmotionLabel(emotionLevel)}
              </Badge>
            )}
          </div>

          {/* 分隔线 */}
          <div className="h-px bg-gradient-to-r from-transparent via-waibao-pink-light/40 to-transparent mb-4" />

          {/* 日记内容 */}
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-waibao-text leading-relaxed whitespace-pre-wrap">
              {diary.content}
            </p>
          </div>

          {/* 时间戳 */}
          <div className="flex items-center gap-1 mt-4 text-xs text-waibao-text-light/50">
            <Clock className="w-3 h-3" />
            <span>记录于 {formatCreatedAt(diary.createdAt)}</span>
          </div>
        </Card>

        {/* ===== AI 安慰 ===== */}
        {diary.aiComfortText && (
          <Card className="mt-4 !bg-gradient-waibao border border-waibao-pink-light/30">
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-1.5 text-base">
                  <MessageCircleHeart className="w-4 h-4 text-waibao-primary" />
                  歪宝的安慰
                </span>
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <p className={cn(
                'text-sm text-waibao-text leading-relaxed',
                !showFullComfort && 'line-clamp-4'
              )}>
                {diary.aiComfortText}
              </p>
              {diary.aiComfortText.length > 150 && (
                <button
                  onClick={() => setShowFullComfort(!showFullComfort)}
                  className="text-xs text-waibao-primary hover:text-waibao-pink-dark transition-colors"
                >
                  {showFullComfort ? '收起' : '展开全文'}
                </button>
              )}
              <div className="flex items-center gap-1 text-xs text-waibao-text-light/70">
                <Sparkles className="w-3 h-3" />
                <span>歪宝 AI 自动生成</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ===== 底部操作 ===== */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="secondary"
          className="flex-1"
          icon={<Share2 className="w-4 h-4" />}
          onClick={() => {
            navigator.clipboard.writeText(
              `📖 歪宝的日记 (${formatDate(diary.date, 'M月d日')})\n\n${diary.content}\n\n—— 来自 歪宝小窝`
            );
            toast.success('日记内容已复制 ✨');
          }}
        >
          分享日记
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => router.push('/diary')}
        >
          返回列表
        </Button>
      </div>

      {/* ===== 删除确认 Modal ===== */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="删除日记"
      >
        <div className="space-y-4">
          <p className="text-sm text-waibao-text-light">
            确定要删除这篇日记吗？此操作不可撤销。
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleting}
              onClick={handleDelete}
            >
              确认删除
            </Button>
          </div>
        </div>
      </Modal>

      {/* 底部装饰 */}
      <div className="text-center mt-8">
        <Sparkles className="w-5 h-5 text-waibao-secondary mx-auto mb-1" />
        <p className="text-xs text-waibao-text-light">
          每一篇日记都是成长的足迹 💕
        </p>
      </div>
    </div>
  );
}
