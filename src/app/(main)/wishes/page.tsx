'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Gift, Trophy, CheckCircle, Upload, Sparkles, Star, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Modal, Input, Badge, Loading, EmptyState, ProgressBar } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import type { Wish } from '@/types';

type TabType = 'wanting' | 'completed' | 'wall';

const categoryConfig: Record<string, { variant: 'pink' | 'yellow' | 'green' | 'purple'; label: string }> = {
  buy: { variant: 'pink', label: '想买' },
  food: { variant: 'yellow', label: '想吃' },
  travel: { variant: 'green', label: '想去' },
  movie: { variant: 'purple', label: '想看' },
};

const categoryBgClass: Record<string, string> = {
  buy: 'bg-waibao-pink-light',
  food: 'bg-waibao-yellow-light',
  travel: 'bg-waibao-green-light',
  purple: 'bg-waibao-purple-light',
};

const categoryIconClass: Record<string, string> = {
  buy: 'text-waibao-pink-dark',
  food: 'text-yellow-700',
  travel: 'text-green-700',
  movie: 'text-purple-700',
};

export default function WishesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('wanting');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('buy');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      const res = await fetch('/api/wishes');
      const data = await res.json();
      if (data.success) {
        setWishes(data.data?.wishes || []);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const wantingWishes = wishes.filter((w) => w.status === 'wanting' || w.status === 'claimed' || w.status === 'preparing');
  const completedWishes = wishes.filter((w) => w.status === 'completed');

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error('请输入心愿标题');
      return;
    }
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription || null,
          category: formCategory,
          priority: formPriority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('心愿已添加！希望早日实现 💫');
        setIsModalOpen(false);
        setFormTitle('');
        setFormDescription('');
        setFormCategory('buy');
        setFormPriority('medium');
        fetchWishes();
      } else {
        toast.error(data.error || '添加失败');
      }
    } catch {
      toast.error('添加失败，请稍后重试');
    }
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'wanting', label: '想要中', icon: <Gift className="w-4 h-4" /> },
    { key: 'completed', label: '已完成', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'wall', label: '心愿墙', icon: <Sparkles className="w-4 h-4" /> },
  ];

  if (loading) {
    return <Loading text="加载心愿中..." />;
  }

  return (
    <div className="max-w-md mx-auto pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-waibao-text-light hover:text-waibao-text transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回</span>
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-waibao-text">
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-waibao-secondary" />
            歪宝的心愿
          </span>
        </h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          新增心愿
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-waibao-pink-light/30 rounded-2xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white text-waibao-primary shadow-soft'
                : 'text-waibao-text-light hover:text-waibao-text'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 想要中 */}
      {activeTab === 'wanting' && (
        <>
          {wantingWishes.length === 0 && completedWishes.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-8 h-8 text-waibao-primary" />}
              title="还没有心愿哦"
              description="点击「新增心愿」写下你的小愿望吧～"
              action={
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsModalOpen(true)}
                >
                  新增心愿
                </Button>
              }
            />
          ) : wantingWishes.length === 0 ? (
            <EmptyState
              icon={<Trophy className="w-8 h-8 text-waibao-primary" />}
              title="心愿都实现啦！"
              description="太棒啦！歪宝的心愿都完成了，真是幸福呢 💕"
            />
          ) : (
            <div className="space-y-3">
              {wantingWishes.map((wish) => {
                const cat = wish.category || 'buy';
                const cfg = categoryConfig[cat] || categoryConfig.buy;
                const bgClass = categoryBgClass[cat] || 'bg-waibao-pink-light';
                const isClaimedByPartner = wish.claimedBy && wish.claimedById !== user?.id;
                return (
                  <Card key={wish.id} hoverable>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgClass)}>
                        <Gift className="w-5 h-5 text-waibao-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-waibao-text truncate">{wish.title}</h3>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        {wish.description && (
                          <p className="text-xs text-waibao-text-light line-clamp-2 mb-2">
                            {wish.description}
                          </p>
                        )}
                        <ProgressBar value={wish.progress} size="sm" />
                        {isClaimedByPartner && (
                          <p className="text-xs text-waibao-primary mt-1.5 flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {wish.claimedBy?.nickname || '另一半'} 准备认领中
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 已完成 */}
      {activeTab === 'completed' && (
        <>
          {completedWishes.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-8 h-8 text-waibao-green" />}
              title="还没有已完成的心愿"
              description="努力实现心愿，完成后就会出现在这里啦 ✨"
            />
          ) : (
            <div className="space-y-3">
              {completedWishes.map((wish) => {
                const cat = wish.category || 'buy';
                const cfg = categoryConfig[cat] || categoryConfig.buy;
                return (
                  <Card key={wish.id}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-waibao-green-light flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5 text-waibao-green-dark" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-waibao-text truncate">{wish.title}</h3>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-waibao-text-light">
                          <span>进度 {wish.progress}%</span>
                          {wish.updatedAt && (
                            <span>完成于 {formatDate(wish.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 心愿墙 */}
      {activeTab === 'wall' && (
        <>
          {completedWishes.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-8 h-8 text-waibao-secondary" />}
              title="心愿墙还空空的"
              description="当有心愿完成时，会展示在这里作为美好的回忆～"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {completedWishes.map((wish) => {
                const cat = wish.category || 'buy';
                const cfg = categoryConfig[cat] || categoryConfig.buy;
                const bgClass = categoryBgClass[cat] || 'bg-waibao-pink-light';
                return (
                  <Card key={wish.id} className="text-center">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2', bgClass)}>
                      <Trophy className="w-6 h-6 text-waibao-primary" />
                    </div>
                    <h3 className="font-bold text-waibao-text text-sm mb-1">{wish.title}</h3>
                    <Badge variant={cfg.variant} className="mx-auto">{cfg.label}</Badge>
                    {wish.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={wish.imageUrl}
                          alt={wish.title}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                      </div>
                    )}
                    {!wish.imageUrl && (
                      <div className="mt-2 p-4 rounded-xl bg-waibao-pink-light/20 border-2 border-dashed border-waibao-pink-light/40">
                        <Upload className="w-5 h-5 text-waibao-text-light/40 mx-auto" />
                        <p className="text-xs text-waibao-text-light/40 mt-1">上传图片</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 新增心愿 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新增心愿"
      >
        <div className="space-y-4">
          <Input
            label="心愿标题"
            placeholder="写下你的小愿望..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">分类</label>
            <div className="flex gap-2">
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFormCategory(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    formCategory === key
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">优先级</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFormPriority(p)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all',
                    formPriority === p
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-1">描述（可选）</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="详细描述你的心愿..."
              rows={3}
              className="waibao-input w-full resize-none"
            />
          </div>

          <Button variant="primary" className="w-full" onClick={handleSubmit}>
            添加心愿 ✨
          </Button>
        </div>
      </Modal>
    </div>
  );
}
