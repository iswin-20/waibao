'use client';

import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircleHeart, History } from 'lucide-react';
import { Button, Card, Loading } from '@/components/ui';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ComfortRecord {
  id: string;
  text: string;
  createdAt: string;
}

export function ComfortButtons() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ComfortRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleComfort = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/partner/comfort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.comfortText);
        toast.success('已传达你的关心 💕');
        // 刷新历史
        fetchHistory();
      } else {
        toast.error(data.error || '发送失败');
      }
    } catch {
      toast.error('发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      // 从通知中获取最近的关心记录
      const res = await fetch('/api/notifications?type=comfort&limit=10');
      const data = await res.json();
      if (data.success) {
        const items = data.data?.notifications || [];
        const records: ComfortRecord[] = items.map((n: any, i: number) => ({
          id: n.id || String(i),
          text: n.content || '',
          createdAt: n.createdAt || '',
        }));
        setHistory(records);
      }
    } catch {
      // 静默
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleHistory = () => {
    if (!showHistory && history.length === 0) {
      fetchHistory();
    }
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* 大号哄哄按钮 */}
      <div className="text-center">
        <button
          onClick={handleComfort}
          disabled={loading}
          className={cn(
            'relative group w-40 h-40 mx-auto rounded-full transition-all duration-300',
            'flex flex-col items-center justify-center gap-2',
            'bg-gradient-to-br from-waibao-pink-light via-waibao-primary to-waibao-pink-dark',
            'text-white font-bold text-lg shadow-colored',
            'hover:shadow-lg hover:scale-105 active:scale-95',
            'disabled:opacity-70 disabled:cursor-not-allowed',
            loading && 'animate-pulse-soft'
          )}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">正在发送...</span>
            </>
          ) : (
            <>
              <Heart className="w-12 h-12 fill-white/30 animate-bounce-slow" />
              <span>哄哄歪宝</span>
              <Sparkles className="w-5 h-5 text-yellow-200 absolute top-7 right-8 animate-wiggle" />
              <Sparkles className="w-4 h-4 text-yellow-200 absolute bottom-8 left-8 animate-wiggle" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </button>
      </div>

      {/* AI 生成的关心结果 */}
      {result && (
        <Card className="!bg-gradient-waibao border border-waibao-pink-light/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-waibao-primary/20 flex items-center justify-center shrink-0">
              <MessageCircleHeart className="w-5 h-5 text-waibao-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-waibao-text mb-1">AI 帮你传达的关心</p>
              <p className="text-sm text-waibao-text leading-relaxed">{result}</p>
            </div>
          </div>
        </Card>
      )}

      {/* 历史记录 */}
      <div>
        <button
          onClick={handleToggleHistory}
          className="flex items-center gap-1.5 text-xs text-waibao-text-light hover:text-waibao-text transition-colors mx-auto"
        >
          <History className="w-3.5 h-3.5" />
          <span>{showHistory ? '收起历史记录' : '查看历史话术'}</span>
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {historyLoading ? (
              <Loading size="sm" />
            ) : history.length === 0 ? (
              <p className="text-xs text-waibao-text-light/60 text-center py-2">
                还没有发送过关心消息哦
              </p>
            ) : (
              history.map((record) => (
                <Card key={record.id} className="!py-2 !px-3">
                  <div className="flex items-start gap-2">
                    <Heart className="w-3.5 h-3.5 text-waibao-primary mt-1 shrink-0" />
                    <p className="text-xs text-waibao-text leading-relaxed">{record.text}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
