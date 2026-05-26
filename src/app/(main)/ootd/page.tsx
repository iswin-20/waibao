'use client';

import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ImagePlus, Sparkles, Shirt, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { cn, generateMockWeather } from '@/lib/utils';
import type { MockWeather, WardrobeItem } from '@/types';

type WearSlot = 'top' | 'jacket' | 'pants' | 'skirt' | 'shoes';

interface OutfitRecommendation {
  summary?: string;
  tips?: string[];
  itemIds?: string[];
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

export default function OotdPage() {
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [worn, setWorn] = useState<Partial<Record<WearSlot, WardrobeItem>>>({});
  const [weather, setWeather] = useState<MockWeather>(() => generateMockWeather());
  const [recommendation, setRecommendation] = useState<OutfitRecommendation>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recommending, setRecommending] = useState(false);
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
      setFile(null);
      setPreview('');
      setForm({ name: '', type: 'top', color: '', style: 'casual', season: 'all' });
      await loadWardrobe();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const wearItem = (item: WardrobeItem) => {
    if (!isWearSlot(item.type)) {
      toast('包包和配饰暂时只入库，不放到模特身上');
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '推荐失败');
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-waibao-text-light hover:text-waibao-text transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm">返回</span>
      </button>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-waibao-primary" />
              <span>OOTD 穿搭</span>
            </div>
          </CardTitle>
          <Button
            size="sm"
            loading={recommending}
            icon={<Sparkles className="w-4 h-4" />}
            onClick={recommend}
          >
            AI 搭配
          </Button>
        </CardHeader>
        <p className="text-sm text-waibao-text-light">
          {weather.city || '今日天气'} · {weather.weather || '多云'} · {weather.tempMin}°/{weather.tempMax}°
        </p>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-5">
          <div className="relative h-[260px] w-[130px] shrink-0">
            <div className="mx-auto h-10 w-10 rounded-full bg-[#ffe0cf]" />
            <div className="mx-auto h-4 w-4 bg-[#ffe0cf]" />
            <div className="relative mx-auto h-[92px] w-[78px] rounded-[28px] bg-[#f4e8e3]">
              {imageOf(worn.top) && (
                <img src={imageOf(worn.top)} alt="" className="absolute left-1/2 top-0 z-10 h-[90px] w-[96px] -translate-x-1/2 object-contain" />
              )}
              {imageOf(worn.jacket) && (
                <img src={imageOf(worn.jacket)} alt="" className="absolute left-1/2 top-0 z-20 h-[98px] w-[108px] -translate-x-1/2 object-contain" />
              )}
            </div>
            <div className="relative mx-auto mt-1 h-[86px] w-[76px] rounded-[12px] bg-[#eee3de]">
              {imageOf(worn.pants || worn.skirt) && (
                <img src={imageOf(worn.pants || worn.skirt)} alt="" className="absolute left-1/2 -top-1 z-10 h-[96px] w-[98px] -translate-x-1/2 object-contain" />
              )}
            </div>
            <div className="relative mx-auto mt-1 h-8 w-[86px]">
              {imageOf(worn.shoes) && (
                <img src={imageOf(worn.shoes)} alt="" className="absolute left-1/2 top-0 z-10 h-8 w-[94px] -translate-x-1/2 object-contain" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-waibao-text">试穿预览</p>
            <p className="mt-2 text-sm leading-relaxed text-waibao-text-light">
              点击衣橱单品，会按上衣、外套、下装、鞋子放到模特身上。上传时会自动生成白底图保存。
            </p>
          </div>
        </div>
      </Card>

      {recommendation.summary && (
        <Card className="mb-4 bg-yellow-50/80">
          <CardTitle>AI 推荐</CardTitle>
          <p className="mt-3 text-sm leading-relaxed text-waibao-text">{recommendation.summary}</p>
          {!!recommendation.tips?.length && (
            <div className="mt-3 space-y-1">
              {recommendation.tips.map((tip) => (
                <p key={tip} className="text-xs text-waibao-text-light">· {tip}</p>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>上传衣服</CardTitle>
          <span className="text-xs text-waibao-text-light">生成白底图入库</span>
        </CardHeader>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-waibao-pink-light bg-waibao-pink-light/20 p-4 text-center">
          {preview ? (
            <img src={preview} alt="预览" className="h-32 w-full object-contain" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-waibao-primary" />
              <span className="mt-2 text-sm text-waibao-text-light">选择衣服图片</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>

        <div className="mt-4 space-y-3">
          <Input
            label="名称"
            placeholder="例如 白色短袖"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="颜色"
            placeholder="白色 / 黑色 / 蓝色..."
            value={form.color}
            onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
          />
        </div>

        <div className="mt-4 space-y-4">
          <OptionGroup label="类型" value={form.type} options={typeOptions} onChange={(type) => setForm((prev) => ({ ...prev, type }))} />
          <OptionGroup label="风格" value={form.style} options={styleOptions} onChange={(style) => setForm((prev) => ({ ...prev, style }))} />
          <OptionGroup label="季节" value={form.season} options={seasonOptions} onChange={(season) => setForm((prev) => ({ ...prev, season }))} />
        </div>

        <Button className="mt-5 w-full" loading={uploading} onClick={submitUpload}>
          生成白底图并保存
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>我的衣橱</CardTitle>
          <span className="text-xs text-waibao-text-light">{items.length} 件</span>
        </CardHeader>
        {loading ? (
          <p className="py-8 text-center text-sm text-waibao-text-light">加载中...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-waibao-text-light">衣橱还空着，先上传几件衣服吧。</p>
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
                    'relative rounded-2xl border p-2 text-left transition-colors',
                    selected ? 'border-waibao-primary bg-waibao-pink-light/60' : 'border-transparent bg-waibao-pink-light/25'
                  )}
                >
                  <img
                    src={imageOf(item)}
                    alt={item.name || typeLabelMap[item.type] || '单品'}
                    className="h-24 w-full rounded-xl bg-white object-contain"
                  />
                  <p className="mt-2 truncate text-xs font-bold text-waibao-text">
                    {item.name || typeLabelMap[item.type] || '单品'}
                  </p>
                  <p className="truncate text-[11px] text-waibao-text-light">
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
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-waibao-text-light shadow-sm"
                  >
                    <Trash2 className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>
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
      <p className="mb-2 ml-1 text-sm font-medium text-waibao-text">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-all',
              value === option.value
                ? 'bg-gradient-primary text-white shadow-colored'
                : 'bg-waibao-pink-light/40 text-waibao-text hover:bg-waibao-pink-light'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
