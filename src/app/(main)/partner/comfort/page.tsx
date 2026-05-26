'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  MessageCircleHeart,
  Send,
  Sun,
  Coffee,
  Music,
  Cloud,
  Star,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Badge, Loading } from '@/components/ui';
import { cn } from '@/lib/utils';
import { PartnerBottomNav } from '@/components/layout/PartnerBottomNav';
import toast from 'react-hot-toast';

// ===== 话术分类 =====
interface ComfortMessage {
  id: string;
  category: string;
  icon: React.ReactNode;
  text: string;
  emoji: string;
}

const comfortMessages: ComfortMessage[] = [
  // 日常关怀
  { id: 'c1', category: '日常', icon: <Sun className="w-4 h-4" />, text: '今天过得开心吗？我一直都在想你哦~', emoji: '☀️' },
  { id: 'c2', category: '日常', icon: <Sun className="w-4 h-4" />, text: '歪宝今天有没有好好吃饭？记得要按时吃饭哦！', emoji: '🍚' },
  { id: 'c3', category: '日常', icon: <Sun className="w-4 h-4" />, text: '今天天气变化大，记得多穿点衣服，别着凉了', emoji: '🧥' },

  // 甜言蜜语
  { id: 's1', category: '甜言蜜语', icon: <Heart className="w-4 h-4" />, text: '你是世界上最好的歪宝，能遇见你是我最大的幸运', emoji: '💕' },
  { id: 's2', category: '甜言蜜语', icon: <Heart className="w-4 h-4" />, text: '每次想到你，我的心就暖暖的，想一直陪在你身边', emoji: '🥰' },
  { id: 's3', category: '甜言蜜语', icon: <Heart className="w-4 h-4" />, text: '歪宝今天也好可爱，感觉全世界都亮了', emoji: '✨' },
  { id: 's4', category: '甜言蜜语', icon: <Heart className="w-4 h-4" />, text: '想把你捧在手心里，做全世界最幸福的小宝宝', emoji: '🤲' },

  // 安抚情绪
  { id: 'm1', category: '安抚情绪', icon: <Cloud className="w-4 h-4" />, text: '累了就好好休息吧，我会一直在你身边陪着你的', emoji: '😴' },
  { id: 'm2', category: '安抚情绪', icon: <Cloud className="w-4 h-4" />, text: '不要不开心啦，你笑起来最好看了，比星星还闪亮', emoji: '⭐' },
  { id: 'm3', category: '安抚情绪', icon: <Cloud className="w-4 h-4" />, text: '有我在呢，不要担心，什么事都可以跟我说的', emoji: '🤗' },
  { id: 'm4', category: '安抚情绪', icon: <Cloud className="w-4 h-4" />, text: '不管发生什么，我都会一直支持你、相信你', emoji: '💪' },

  // 浪漫时刻
  { id: 'r1', category: '浪漫时刻', icon: <Star className="w-4 h-4" />, text: '想和你一起看星星、看月亮、看每一个日出日落', emoji: '🌙' },
  { id: 'r2', category: '浪漫时刻', icon: <Star className="w-4 h-4" />, text: '今天的晚霞很美，但都不及你万分之一好看', emoji: '🌅' },
  { id: 'r3', category: '浪漫时刻', icon: <Star className="w-4 h-4" />, text: '想牵着你的手，一起去吃你想吃的所有好吃的', emoji: '🍦' },
  { id: 'r4', category: '浪漫时刻', icon: <Star className="w-4 h-4" />, text: '我们的故事还很长，余生请多多指教', emoji: '📖' },

  // 贴心问候
  { id: 'q1', category: '贴心问候', icon: <Coffee className="w-4 h-4" />, text: '记得多喝水哦，皮肤才会水水嫩嫩的~', emoji: '💧' },
  { id: 'q2', category: '贴心问候', icon: <Coffee className="w-4 h-4" />, text: '今天有没有什么想吃的？我带你去吃好吃的', emoji: '🎂' },
  { id: 'q3', category: '贴心问候', icon: <Coffee className="w-4 h-4" />, text: '工作/学习辛苦啦！给你一个大大的拥抱', emoji: '🫂' },
  { id: 'q4', category: '贴心问候', icon: <Coffee className="w-4 h-4" />, text: '睡前记得泡个热水脚，今晚一定能睡个好觉', emoji: '🛁' },
];

// ===== 按分类分组 =====
function groupByCategory(messages: ComfortMessage[]): Record<string, ComfortMessage[]> {
  const groups: Record<string, ComfortMessage[]> = {};
  messages.forEach((m) => {
    if (!groups[m.category]) groups[m.category] = [];
    groups[m.category].push(m);
  });
  return groups;
}

export default function PartnerComfortPage() {
  const router = useRouter();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const grouped = groupByCategory(comfortMessages);
  const categories = ['全部', ...Object.keys(grouped)];

  const filteredMessages =
    activeCategory === '全部'
      ? comfortMessages
      : grouped[activeCategory] || [];

  const categoryIcons: Record<string, React.ReactNode> = {
    '日常': <Sun className="w-4 h-4" />,
    '甜言蜜语': <Heart className="w-4 h-4" />,
    '安抚情绪': <Cloud className="w-4 h-4" />,
    '浪漫时刻': <Star className="w-4 h-4" />,
    '贴心问候': <Coffee className="w-4 h-4" />,
  };

  const handleSendComfort = async (message: ComfortMessage) => {
    setSendingId(message.id);
    try {
      const res = await fetch('/api/partner/comfort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comfortText: message.text }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('关心已传达给歪宝 💕');
      } else {
        toast.error(data.error || '发送失败');
      }
    } catch {
      toast.error('发送失败，请稍后重试');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-waibao-text-light hover:text-waibao-text transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回</span>
      </button>

      {/* 页面标题 */}
      <div className="flex items-center gap-2 mb-1">
        <MessageCircleHeart className="w-5 h-5 text-waibao-primary" />
        <h1 className="text-xl font-bold text-waibao-text">哄哄歪宝</h1>
      </div>
      <p className="text-xs text-waibao-text-light mb-4">
        选择一句暖心话发送给歪宝，让她感受到你的关心
      </p>

      {/* 分类标签 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              activeCategory === cat
                ? 'bg-gradient-primary text-white shadow-colored'
                : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
            )}
          >
            {cat !== '全部' && categoryIcons[cat]}
            {cat}
          </button>
        ))}
      </div>

      {/* 话术列表 */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-waibao-text-light">暂无该分类的话术</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} hoverable>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-waibao flex items-center justify-center shrink-0 text-lg">
                  {message.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="pink">{message.category}</Badge>
                  </div>
                  <p className="text-sm text-waibao-text leading-relaxed mb-2">
                    {message.text}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-3.5 h-3.5" />}
                    loading={sendingId === message.id}
                    onClick={() => handleSendComfort(message)}
                  >
                    发送关心
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 底部装饰 */}
      <div className="text-center mt-6 mb-4">
        <Sparkles className="w-5 h-5 text-waibao-secondary mx-auto mb-1" />
        <p className="text-xs text-waibao-text-light">
          每一句话都在说：我在乎你 💕
        </p>
      </div>

      {/* 底部导航 */}
      <PartnerBottomNav />
    </div>
  );
}
