'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarHeart, Droplets, AlertCircle, Plus, Heart, Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, Button, Modal, Input, Badge, Loading, EmptyState } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

interface PeriodRecord {
  id: string;
  startDate: string;
  endDate: string | null;
  painLevel: string | null;
  mood: string | null;
  flowLevel: string | null;
  note: string | null;
  createdAt: string;
}

interface PeriodPredictResult {
  predictNextDate: string | null;
  avgCycleLength?: number;
}

// 生成经期天数集合（用于日历标记）
function getPeriodDays(records: PeriodRecord[]): string[] {
  const days: string[] = [];
  records.forEach((r) => {
    const start = parseISO(r.startDate);
    const end = r.endDate ? parseISO(r.endDate) : start;
    const range = eachDayOfInterval({ start, end });
    range.forEach((d) => {
      days.push(format(d, 'yyyy-MM-dd'));
    });
  });
  return days;
}

// 疼痛程度选项
const painOptions = [
  { value: 'none', label: '无不适' },
  { value: 'mild', label: '轻微疼痛' },
  { value: 'moderate', label: '明显疼痛' },
  { value: 'severe', label: '非常疼痛' },
];

// 情绪选项
const moodOptions = [
  { value: 'happy', label: '开心' },
  { value: 'calm', label: '平静' },
  { value: 'sad', label: '低落' },
  { value: 'irritable', label: '烦躁' },
  { value: 'tired', label: '疲惫' },
];

// 流量选项
const flowOptions = [
  { value: 'light', label: '少量' },
  { value: 'medium', label: '中等' },
  { value: 'heavy', label: '量多' },
];

export default function PeriodPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<PeriodRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [predictResult, setPredictResult] = useState<PeriodPredictResult | null>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);

  // 表单状态
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formPainLevel, setFormPainLevel] = useState('none');
  const [formMood, setFormMood] = useState('calm');
  const [formFlowLevel, setFormFlowLevel] = useState('medium');
  const [formNote, setFormNote] = useState('');

  // 加载已有记录
  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch('/api/periods');
        const data = await res.json();
        if (data.success) {
          setRecords(data.data?.records || []);
        }
      } catch {
        // 静默失败，使用空列表
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, []);

  // 预测 API
  const handlePredict = async () => {
    setLoadingPredict(true);
    try {
      const res = await fetch('/api/periods/predict');
      const data = await res.json();
      if (data.success && data.data) {
        setPredictResult(data.data);
      } else {
        toast.error('暂时无法预测，请先记录更多经期数据');
      }
    } catch {
      toast.error('预测失败，请稍后重试');
    } finally {
      setLoadingPredict(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!formStartDate) {
      toast.error('请选择开始日期');
      return;
    }
    try {
      const res = await fetch('/api/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: formStartDate,
          endDate: formEndDate || null,
          painLevel: formPainLevel,
          mood: formMood,
          flowLevel: formFlowLevel,
          note: formNote || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('记录已保存！歪宝会帮你记住的 💕');
        setIsModalOpen(false);
        setFormStartDate('');
        setFormEndDate('');
        setFormPainLevel('none');
        setFormMood('calm');
        setFormFlowLevel('medium');
        setFormNote('');
        // 刷新记录
        const res2 = await fetch('/api/periods');
        const data2 = await res2.json();
        if (data2.success) setRecords(data2.data?.records || []);
      } else {
        toast.error(data.error || '保存失败');
      }
    } catch {
      toast.error('保存失败，请稍后重试');
    }
  };

  // 日历计算
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const periodDays = useMemo(() => getPeriodDays(records), [records]);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  if (loading) {
    return <Loading text="加载经期数据..." />;
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

      {/* 日历卡片 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <CalendarHeart className="w-5 h-5 text-waibao-primary" />
              <span>经期日历</span>
            </div>
          </CardTitle>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            记录经期
          </Button>
        </CardHeader>

        {/* 月份导航 */}
        <div className="relative grid grid-cols-[1fr_4rem_1fr] items-center min-h-12 mb-3 px-2">
          <span className="absolute right-2 top-0 text-xs font-bold text-waibao-text-light">
            {format(currentMonth, 'yyyy')}
          </span>
          <div className="flex justify-center pr-5">
            <button
              type="button"
              aria-label="上个月"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-waibao-pink-light/50 transition-colors hover:bg-waibao-pink-light"
            >
              <ChevronLeft className="w-4 h-4 text-waibao-primary" />
            </button>
          </div>
          <h3 className="text-center text-lg font-bold text-waibao-text">
            {format(currentMonth, 'M月')}
          </h3>
          <div className="flex justify-center pl-5">
            <button
              type="button"
              aria-label="下个月"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-waibao-pink-light/50 transition-colors hover:bg-waibao-pink-light"
            >
              <ChevronRight className="w-4 h-4 text-waibao-primary" />
            </button>
          </div>
        </div>

        {/* 星期头 */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs text-waibao-text-light py-1">
              {d}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const hasPeriod = periodDays.includes(dateStr);

            return (
              <div
                key={dateStr}
                className={cn(
                  'relative flex items-center justify-center py-2 text-sm rounded-full',
                  isCurrentMonth ? 'text-waibao-text' : 'text-waibao-text-light/30',
                  isToday && 'font-bold',
                )}
              >
                {isCurrentMonth && (
                  <>
                    <span className={cn(
                      'z-10 relative',
                      hasPeriod && 'text-white font-bold',
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasPeriod && (
                      <div className="absolute inset-0 rounded-full bg-gradient-primary" />
                    )}
                    {isToday && !hasPeriod && (
                      <div className="absolute inset-0 rounded-full border-2 border-waibao-primary" />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-waibao-pink-light/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-primary" />
            <span className="text-xs text-waibao-text-light">经期</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-waibao-primary" />
            <span className="text-xs text-waibao-text-light">今天</span>
          </div>
        </div>
      </Card>

      {/* 预测下次经期 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-waibao-secondary" />
              <span>预测下次经期</span>
            </div>
          </CardTitle>
        </CardHeader>
        {predictResult ? (
          <div className="text-center py-3">
            <p className="text-sm text-waibao-text-light">预计下次经期</p>
            {predictResult.predictNextDate ? (
              <>
                <p className="text-xl font-bold text-waibao-primary mt-1">
                  {formatDate(predictResult.predictNextDate)}
                </p>
                {predictResult.avgCycleLength && (
                  <p className="text-xs text-waibao-text-light mt-1">
                    平均周期约 {predictResult.avgCycleLength} 天
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-waibao-text-light mt-1">
                暂无足够数据预测
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-waibao-text-light mb-3">
              记录经期后即可预测下次时间
            </p>
            <Button
              variant="secondary"
              size="sm"
              loading={loadingPredict}
              onClick={handlePredict}
            >
              开始预测
            </Button>
          </div>
        )}
      </Card>

      {/* 经期建议 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-waibao-primary" />
              <span>经期小贴士</span>
            </div>
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-waibao-pink-light/30">
            <div className="w-8 h-8 rounded-full bg-waibao-pink-light flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-waibao-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-waibao-text">保持温暖</p>
              <p className="text-xs text-waibao-text-light mt-0.5">
                经期注意保暖，多喝热水或姜茶，避免生冷食物。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-waibao-yellow-light/30">
            <div className="w-8 h-8 rounded-full bg-waibao-yellow-light flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-waibao-text">适度运动</p>
              <p className="text-xs text-waibao-text-light mt-0.5">
                适当进行散步、瑜伽等轻度运动，有助于缓解不适。
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-waibao-green-light/30">
            <div className="w-8 h-8 rounded-full bg-waibao-green-light flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-waibao-text">充足休息</p>
              <p className="text-xs text-waibao-text-light mt-0.5">
                保证充足睡眠，避免过度劳累，让身体好好休息。
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 免责声明 */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-waibao-pink-light/20 border border-waibao-pink-light">
        <AlertCircle className="w-4 h-4 text-waibao-primary mt-0.5 shrink-0" />
        <p className="text-xs text-waibao-text-light leading-relaxed">
          本功能仅用于生活记录和温馨提醒，不作为医疗诊断依据。
        </p>
      </div>

      {/* 记录经期 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="记录经期"
      >
        <div className="space-y-4">
          <Input
            label="开始日期"
            type="date"
            value={formStartDate}
            onChange={(e) => setFormStartDate(e.target.value)}
          />
          <Input
            label="结束日期（可选）"
            type="date"
            value={formEndDate}
            onChange={(e) => setFormEndDate(e.target.value)}
          />

          {/* 疼痛程度 */}
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">疼痛程度</label>
            <div className="flex flex-wrap gap-2">
              {painOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormPainLevel(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    formPainLevel === opt.value
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 情绪选择 */}
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">情绪</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormMood(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    formMood === opt.value
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 流量选择 */}
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-2">流量</label>
            <div className="flex flex-wrap gap-2">
              {flowOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormFlowLevel(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    formFlowLevel === opt.value
                      ? 'bg-gradient-primary text-white shadow-colored'
                      : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-waibao-text ml-1 mb-1">备注</label>
            <textarea
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="记录一下今天的感觉..."
              rows={3}
              className="waibao-input w-full resize-none"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
          >
            保存记录
          </Button>
        </div>
      </Modal>
    </div>
  );
}
