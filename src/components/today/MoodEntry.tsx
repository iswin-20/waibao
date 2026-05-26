'use client';

import React, { useEffect, useState } from 'react';
import { BookHeart, Send, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { AiComfort } from './AiComfort';
import toast from 'react-hot-toast';
import type { Diary, EmotionAnalysis } from '@/types';

const moodOptions = [
  { emoji: '😊', label: '开心', score: 5 },
  { emoji: '😢', label: '难过', score: 2 },
  { emoji: '😤', label: '生气', score: 1 },
  { emoji: '😰', label: '焦虑', score: 3 },
  { emoji: '😌', label: '平静', score: 4 },
];

export function MoodEntry() {
  const [todayDiary, setTodayDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    fetch(`/api/diaries?startDate=${dateStr}&endDate=${dateStr}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data?.diaries?.length > 0) {
          const diary = res.data.diaries[0];
          setTodayDiary(diary);
          if (diary.aiComfortText) {
            setAnalysis({
              emotionLevel: diary.emotionLevel ?? 0,
              emotionType: diary.emotionType ?? '',
              comfortText: diary.aiComfortText ?? '',
              notifyPartner: diary.notifyPartner ?? false,
              boyfriendMessage: '',
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || selectedMood === null) {
      toast.error('写点什么再提交吧～', {
        icon: '💭',
        style: { borderRadius: '16px', background: '#FFF8F0', color: '#4A4A4A' },
      });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create diary
      const diaryRes = await fetch('/api/diaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), moodScore: selectedMood }),
      });

      if (!diaryRes.ok) {
        toast.error('记录失败，请重试');
        return;
      }

      const diaryData = await diaryRes.json();

      // 2. AI analyze emotion
      const analyzeRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diaryId: diaryData.data?.id,
          diaryContent: content.trim(),
          moodScore: selectedMood,
          isPeriod: false,
        }),
      });

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        if (analyzeData.success) {
          setAnalysis(analyzeData.data);
          setTodayDiary({
            ...diaryData.data,
            aiComfortText: analyzeData.data.comfortText,
            emotionLevel: analyzeData.data.emotionLevel,
            emotionType: analyzeData.data.emotionType,
            notifyPartner: analyzeData.data.notifyPartner,
          });
        }
      }

      setTodayDiary((prev) => prev || diaryData.data);
      toast.success('日记已保存，歪宝陪着你～', {
        icon: '📖',
        style: { borderRadius: '16px', background: '#FFF8F0', color: '#4A4A4A' },
      });
    } catch {
      toast.error('出了点小问题，稍后再试试吧');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="waibao-card">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <BookHeart className="w-5 h-5 text-waibao-primary" />
            <span>今日心情</span>
          </div>
        </CardTitle>
      </CardHeader>

      {loading ? (
        <Loading size="sm" />
      ) : todayDiary && todayDiary.content ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-waibao-pink-light/20">
            <p className="text-sm text-waibao-text leading-relaxed whitespace-pre-wrap">
              {todayDiary.content}
            </p>
            {todayDiary.moodScore && (
              <div className="mt-2 flex items-center gap-1">
                {moodOptions
                  .filter((m) => m.score === todayDiary.moodScore)
                  .map((m) => (
                    <span key={m.score} className="text-sm">
                      {m.emoji} {m.label}
                    </span>
                  ))}
              </div>
            )}
          </div>
          {analysis && (
            <AiComfort
              emotionLevel={analysis.emotionLevel}
              emotionType={analysis.emotionType}
              comfortText={analysis.comfortText}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-waibao-text-light">今天心情怎么样？</p>

          {/* Mood emoji picker */}
          <div className="flex gap-3 justify-center">
            {moodOptions.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 ${
                  selectedMood === mood.score
                    ? 'bg-waibao-pink-light/60 scale-110 shadow-soft'
                    : 'hover:bg-waibao-pink-light/30 hover:scale-105'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className={`text-xs ${
                  selectedMood === mood.score ? 'text-waibao-primary font-medium' : 'text-waibao-text-light'
                }`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          {/* Diary input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的心情和故事..."
            className="waibao-input min-h-[100px] resize-none"
            rows={3}
          />

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !content.trim() || selectedMood === null}
            className="w-full"
            icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            {submitting ? '记录中...' : '记录心情'}
          </Button>
        </div>
      )}
    </div>
  );
}
