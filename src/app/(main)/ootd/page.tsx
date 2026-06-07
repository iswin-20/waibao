'use client';

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BarChart3,
  CalendarDays,
  ImagePlus,
  Pencil,
  Plus,
  Shirt,
  Sparkles,
  ThermometerSun,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { cn, generateMockWeather } from '@/lib/utils';
import type { MockWeather, WardrobeItem } from '@/types';

type WearSlot = 'top' | 'jacket' | 'pants' | 'skirt' | 'shoes';

interface OutfitRecommendation {
  summary?: string;
  tips?: string[];
  itemIds?: string[];
}

interface DiaryEntry {
  id: string;
  date: string;
  items: WardrobeItem[];
  total: number;
}

const typeOptions = [
  { value: 'top', label: '上衣' },
  { value: 'jacket', label: '外套' },
  { value: 'pants', label: '裤装' },
  { value: 'skirt', label: '裙装' },
  { value: 'shoes', label: '鞋子' },
  { value: 'bag', label: '包包' },
  { value: 'accessory', label: '配饰' },
];

const styleOptions = [
  { value: 'casual', label: '日常' },
  { value: 'cute', label: '甜美' },
  { value: 'sporty', label: '运动' },
  { value: 'elegant', label: '优雅' },
  { value: 'formal', label: '通勤' },
];

const seasonOptions = [
  { value: 'all', label: '四季' },
  { value: 'spring', label: '春' },
  { value: 'summer', label: '夏' },
  { value: 'autumn', label: '秋' },
  { value: 'winter', label: '冬' },
];

const typeLabelMap = typeOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const basePriceByType: Record<string, number> = {
  top: 329,
  jacket: 699,
  pants: 459,
  skirt: 429,
  shoes: 589,
  bag: 699,
  accessory: 139,
};

function imageOf(item?: WardrobeItem | null) {
  return item?.whiteImageUrl || item?.imageUrl || '';
}

function isWearSlot(type: string): type is WearSlot {
  return ['top', 'jacket', 'pants', 'skirt', 'shoes'].includes(type);
}

function buildWorn(items: WardrobeItem[]) {
  return items.reduce<Partial<Record<WearSlot, WardrobeItem>>>((worn, item) => {
    if (isWearSlot(item.type)) worn[item.type] = item;
    return worn;
  }, {});
}

function dateKeyOf(item: WardrobeItem) {
  if (!item.createdAt) return new Date().toISOString().slice(0, 10);
  return new Date(item.createdAt).toISOString().slice(0, 10);
}

function itemSalt(id: string) {
  return id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 120;
}

function estimateItemPrice(item: WardrobeItem) {
  return (basePriceByType[item.type] || 299) + itemSalt(item.id) + 0.15;
}

function formatMoney(value: number) {
  return `￥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildDiaryEntries(items: WardrobeItem[]): DiaryEntry[] {
  const grouped = new Map<string, WardrobeItem[]>();

  items.forEach((item) => {
    const date = dateKeyOf(item);
    grouped.set(date, [...(grouped.get(date) || []), item]);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, group]) => ({
      id: date,
      date,
      items: group,
      total: group.reduce((sum, item) => sum + estimateItemPrice(item), 0),
    }));
}

function ModelPreview({
  isPartner,
  worn,
}: {
  isPartner: boolean;
  worn: Partial<Record<WearSlot, WardrobeItem>>;
}) {
  const topSrc = imageOf(worn.top);
  const jacketSrc = imageOf(worn.jacket);
  const bottomSrc = imageOf(worn.pants || worn.skirt);
  const shoesSrc = imageOf(worn.shoes);

  return (
    <section id="try-on-preview" className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(34,34,34,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#282824]">试穿预览</h2>
          <p className="mt-1 text-xs text-[#8a8a82]">{isPartner ? '男朋友端男模特' : '女朋友端女模特'}</p>
        </div>
        <span className="rounded-full bg-[#f2eee9] px-3 py-1 text-xs font-semibold text-[#5b5249]">
          {Object.keys(worn).length} 件
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-[250px] w-[138px] shrink-0">
          {!isPartner && (
            <div className="absolute left-1/2 top-1 z-0 h-20 w-[70px] -translate-x-1/2 rounded-t-[38px] rounded-b-[30px] bg-[#4d382f]" />
          )}
          <div className="absolute left-1/2 top-4 z-20 h-11 w-11 -translate-x-1/2 overflow-hidden rounded-full bg-[#ffe0cf] shadow-sm">
            <div
              className={cn(
                'absolute left-1/2 -translate-x-1/2 bg-[#4d382f]',
                isPartner
                  ? '-top-1 h-5 w-12 rounded-b-[16px] rounded-t-[20px]'
                  : '-top-2 h-7 w-[54px] rounded-b-[20px] rounded-t-[28px]'
              )}
            />
          </div>
          <div className="absolute left-1/2 top-[58px] z-10 h-7 w-5 -translate-x-1/2 rounded-b-xl bg-[#ffe0cf]" />
          <div className="absolute left-[24px] top-[84px] z-0 h-[82px] w-4 rotate-[7deg] rounded-full bg-[#ffe0cf]" />
          <div className="absolute right-[24px] top-[84px] z-0 h-[82px] w-4 -rotate-[7deg] rounded-full bg-[#ffe0cf]" />
          <div
            className={cn(
              'absolute left-1/2 top-[74px] z-20 -translate-x-1/2 bg-[#f4e8e3] shadow-inner',
              isPartner ? 'h-[98px] w-[88px] rounded-[22px]' : 'h-[98px] w-[76px] rounded-[30px_30px_18px_18px]'
            )}
          >
            {topSrc && (
              <img src={topSrc} alt="" className="absolute left-1/2 top-0 z-30 h-[98px] w-[112px] -translate-x-1/2 object-contain" />
            )}
            {jacketSrc && (
              <img src={jacketSrc} alt="" className="absolute left-1/2 -top-1 z-40 h-[104px] w-[124px] -translate-x-1/2 object-contain" />
            )}
          </div>
          <div className="absolute left-1/2 top-[178px] z-10 h-[62px] w-[78px] -translate-x-1/2 rounded-[16px_16px_28px_28px] bg-[#eee3de] shadow-inner">
            {bottomSrc && (
              <img src={bottomSrc} alt="" className="absolute left-1/2 -top-2 z-30 h-[78px] w-[104px] -translate-x-1/2 object-contain" />
            )}
          </div>
          <div className="absolute left-1/2 top-[236px] z-20 h-8 w-[96px] -translate-x-1/2">
            {shoesSrc && (
              <img src={shoesSrc} alt="" className="absolute left-1/2 top-0 z-30 h-8 w-[102px] -translate-x-1/2 object-contain" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {(['top', 'jacket', 'pants', 'skirt', 'shoes'] as WearSlot[]).map((slot) => (
            <div key={slot} className="flex items-center gap-3 rounded-2xl bg-[#f7f7f4] px-3 py-2">
              <span className="w-10 text-xs font-semibold text-[#8a8a82]">{typeLabelMap[slot]}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#2f2f2b]">
                {worn[slot]?.name || '未选择'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OotdPage() {
  const { user } = useAuth();
  const isPartner = user?.role === 'partner';
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [worn, setWorn] = useState<Partial<Record<WearSlot, WardrobeItem>>>({});
  const [weather, setWeather] = useState<MockWeather>(() => generateMockWeather());
  const [recommendation, setRecommendation] = useState<OutfitRecommendation>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'top',
    color: '',
    style: 'casual',
    season: 'all',
  });

  const selectedIds = useMemo(
    () => Object.values(worn).filter(Boolean).map((item) => item!.id),
    [worn]
  );

  const diaryEntries = useMemo(() => buildDiaryEntries(items), [items]);

  const loadWardrobe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wardrobe');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '衣橱加载失败');
      setItems(data.data?.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '衣橱加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = async () => {
    try {
      const res = await fetch('/api/weather?city=上海');
      const data = await res.json();
      if (res.ok && data.success && data.data?.today) {
        setWeather(data.data.today);
      }
    } catch {
      setWeather(generateMockWeather());
    }
  };

  useEffect(() => {
    loadWardrobe();
    loadWeather();
  }, []);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const resetUploadForm = () => {
    setFile(null);
    setPreview('');
    setForm({ name: '', type: 'top', color: '', style: 'casual', season: 'all' });
  };

  const submitUpload = async () => {
    if (!file) {
      toast.error('请先选择衣服图片');
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('name', form.name);
      payload.append('type', form.type);
      payload.append('color', form.color);
      payload.append('style', form.style);
      payload.append('season', form.season);

      const res = await fetch('/api/wardrobe', {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '上传失败');

      toast.success('已生成白底图并保存');
      resetUploadForm();
      setShowComposer(false);
      await loadWardrobe();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const wearItem = (item: WardrobeItem) => {
    if (!isWearSlot(item.type)) {
      toast('包包和配饰先入库，不放到模特身上');
      return;
    }

    setWorn((prev) => {
      const slot = item.type as WearSlot;
      const next = { ...prev };
      if (slot === 'pants') delete next.skirt;
      if (slot === 'skirt') delete next.pants;
      next[slot] = item;
      return next;
    });
  };

  const deleteItem = async (item: WardrobeItem) => {
    try {
      const res = await fetch(`/api/wardrobe/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '删除失败');
      toast.success('已删除');
      setWorn((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((slot) => {
          if (next[slot as WearSlot]?.id === item.id) delete next[slot as WearSlot];
        });
        return next;
      });
      await loadWardrobe();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const previewDiaryEntry = (entry: DiaryEntry) => {
    setWorn(buildWorn(entry.items));
    document.getElementById('try-on-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast.success('已放到试穿预览');
  };

  const remindDiaryDelete = () => {
    toast('现在还没有独立的穿搭记录表，先不删除衣橱单品');
  };

  const recommend = async () => {
    setRecommending(true);
    try {
      const res = await fetch('/api/ootd/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '推荐失败');

      const picked = data.data?.items || [];
      setRecommendation(data.data?.recommendation || {});
      setWorn(buildWorn(picked));
      if (picked.length === 0) toast('先上传几件衣服吧');
      else document.getElementById('try-on-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '推荐失败');
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#f4f4f2] px-5 pb-28 pt-16">
      <main className="mx-auto max-w-md">
        <header className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="text-[34px] font-black leading-none tracking-normal text-[#282824]">穿搭日记</h1>
            <p className="mt-3 text-base font-medium text-[#8b8b83]">记录每日穿搭</p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposer((value) => !value)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[#28251f] text-white shadow-[0_16px_28px_rgba(40,37,31,0.22)] transition-transform active:scale-95"
            aria-label="新增衣服"
          >
            {showComposer ? <X className="h-7 w-7" /> : <Plus className="h-8 w-8" />}
          </button>
        </header>

        <section className="mb-5 grid grid-cols-[1fr_auto] gap-3">
          <div className="flex min-w-0 items-center gap-3 rounded-[22px] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(34,34,34,0.05)]">
            <ThermometerSun className="h-5 w-5 shrink-0 text-[#3d3a34]" />
            <p className="min-w-0 truncate text-sm font-semibold text-[#3d3a34]">
              {weather.city || '今日天气'} · {weather.weather || '多云'} · {weather.tempMin}° / {weather.tempMax}°
            </p>
          </div>
          <button
            type="button"
            onClick={recommend}
            disabled={recommending}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[#3d3a34] shadow-[0_12px_26px_rgba(34,34,34,0.05)] disabled:opacity-60"
            aria-label="AI 搭配"
          >
            {recommending ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Wand2 className="h-5 w-5" />}
          </button>
        </section>

        {showComposer && (
          <section className="mb-6 rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(34,34,34,0.07)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#282824]">新增单品</h2>
                <p className="mt-1 text-xs text-[#8a8a82]">上传后自动生成白底图入库</p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f2ef] text-[#5d5a54]"
                aria-label="关闭上传"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-[#dedbd4] bg-[#f8f8f5] p-4 text-center">
              {preview ? (
                <img src={preview} alt="预览" className="h-36 w-full rounded-2xl object-contain" />
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-[#3d3a34]" />
                  <span className="mt-2 text-sm font-semibold text-[#77746e]">选择衣服图片</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Input
                label="名称"
                placeholder="白色短袖"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Input
                label="颜色"
                placeholder="白色"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              />
            </div>

            <div className="mt-4 space-y-4">
              <OptionGroup label="类型" value={form.type} options={typeOptions} onChange={(type) => setForm((prev) => ({ ...prev, type }))} />
              <OptionGroup label="风格" value={form.style} options={styleOptions} onChange={(style) => setForm((prev) => ({ ...prev, style }))} />
              <OptionGroup label="季节" value={form.season} options={seasonOptions} onChange={(season) => setForm((prev) => ({ ...prev, season }))} />
            </div>

            <Button className="mt-5 w-full rounded-full bg-[#28251f] shadow-none hover:brightness-100" loading={uploading} onClick={submitUpload}>
              保存到衣橱
            </Button>
          </section>
        )}

        <section className="space-y-5">
          {loading ? (
            <div className="rounded-[28px] bg-white py-14 text-center text-sm font-semibold text-[#8a8a82] shadow-[0_16px_36px_rgba(34,34,34,0.06)]">
              正在加载穿搭...
            </div>
          ) : diaryEntries.length === 0 ? (
            <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_16px_36px_rgba(34,34,34,0.06)]">
              <Shirt className="mx-auto h-9 w-9 text-[#9d9a92]" />
              <p className="mt-4 text-base font-bold text-[#34312d]">还没有穿搭日记</p>
              <p className="mt-2 text-sm text-[#8a8a82]">点右上角加号，先上传几件衣服。</p>
            </div>
          ) : (
            diaryEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-[30px] bg-white p-4 shadow-[0_16px_36px_rgba(34,34,34,0.065)]"
              >
                <div className="mb-5 flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => previewDiaryEntry(entry)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <CalendarDays className="h-5 w-5 shrink-0 text-[#77746e]" />
                      <span className="truncate text-[19px] font-semibold leading-none text-[#282824]">{entry.date}</span>
                      <span className="shrink-0 text-sm font-semibold text-[#7d7a73]">{entry.items.length} 件</span>
                      <span className="text-[#b2aea6]">·</span>
                      <span className="shrink-0 text-sm font-semibold text-[#7d7a73]">{formatMoney(entry.total)}</span>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => previewDiaryEntry(entry)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0efec] text-[#2f2d28]"
                      aria-label="编辑穿搭"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={remindDiaryDelete}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2efec] text-[#b5454a]"
                      aria-label="删除穿搭"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 overflow-hidden">
                  {entry.items.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => wearItem(item)}
                      className="h-[86px] w-[86px] shrink-0 overflow-hidden rounded-[22px] bg-[#f6f6f2]"
                    >
                      <img
                        src={imageOf(item)}
                        alt={item.name || typeLabelMap[item.type] || '单品'}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        {recommendation.summary && (
          <section className="mt-6 rounded-[28px] bg-[#fff7dc] p-5 shadow-[0_16px_36px_rgba(34,34,34,0.04)]">
            <h2 className="text-lg font-bold text-[#34312d]">AI 推荐</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4a463f]">{recommendation.summary}</p>
            {!!recommendation.tips?.length && (
              <div className="mt-3 space-y-1">
                {recommendation.tips.map((tip) => (
                  <p key={tip} className="text-xs text-[#77746e]">· {tip}</p>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-6">
          <ModelPreview isPartner={isPartner} worn={worn} />
        </div>

        <section className="mt-6 rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(34,34,34,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#282824]">衣橱</h2>
              <p className="mt-1 text-xs text-[#8a8a82]">{items.length} 件单品</p>
            </div>
            <div className="flex rounded-full bg-[#f5f4f1] p-1">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2d2a25] shadow-sm">
                <Archive className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center text-[#8a8a82]">
                <BarChart3 className="h-4 w-4" />
              </span>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#8a8a82]">衣橱还是空的，先上传几件衣服吧。</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {items.map((item) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => wearItem(item)}
                    className={cn(
                      'relative rounded-[22px] border p-2 text-left transition-colors',
                      selected ? 'border-[#2b2924] bg-[#f0efec]' : 'border-transparent bg-[#f7f7f4]'
                    )}
                  >
                    <img
                      src={imageOf(item)}
                      alt={item.name || typeLabelMap[item.type] || '单品'}
                      className="h-24 w-full rounded-2xl bg-white object-contain"
                    />
                    <p className="mt-2 truncate text-xs font-bold text-[#34312d]">
                      {item.name || typeLabelMap[item.type] || '单品'}
                    </p>
                    <p className="truncate text-[11px] text-[#8a8a82]">
                      {typeLabelMap[item.type] || '单品'} · {item.color || '未填色'}
                    </p>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteItem(item);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.stopPropagation();
                          deleteItem(item);
                        }
                      }}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1.5 text-[#b5454a] shadow-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 ml-1 text-sm font-semibold text-[#34312d]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-semibold transition-all',
              value === option.value
                ? 'bg-[#28251f] text-white'
                : 'bg-[#f1f0ed] text-[#5f5b54] hover:bg-[#e8e6e1]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
