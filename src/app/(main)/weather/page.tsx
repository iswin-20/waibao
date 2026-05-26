'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CloudSun,
  Umbrella,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  Cloud,
  AlertTriangle,
  MapPin,
  Shirt,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, Button } from '@/components/ui';
import { cn, generateMockWeather, generateMockForecast } from '@/lib/utils';
import type { ForecastDay, MockWeather, WeatherAdvice } from '@/types';

function WeatherIcon({ weather, size = 'md' }: { weather: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  if (weather?.includes('晴')) return <Sun className={cn(sizeMap[size], 'text-yellow-500')} />;
  if (weather?.includes('雨')) return <CloudRain className={cn(sizeMap[size], 'text-blue-400')} />;
  if (weather?.includes('阴')) return <Cloud className={cn(sizeMap[size], 'text-gray-400')} />;
  return <CloudSun className={cn(sizeMap[size], 'text-yellow-500')} />;
}

const fallbackAdvice: WeatherAdvice = {
  clothingAdvice: '温度适中，穿得舒服就好。',
  skincareAdvice: '记得做好基础护肤，出门按需防晒。',
  umbrellaAdvice: '',
  summaryAdvice: '',
};

export default function WeatherPage() {
  const router = useRouter();
  const [city, setCity] = useState('上海');
  const [weather, setWeather] = useState<MockWeather>(() => generateMockWeather());
  const [forecast, setForecast] = useState<ForecastDay[]>(() => generateMockForecast());
  const [advice, setAdvice] = useState<WeatherAdvice>(fallbackAdvice);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const loadWeather = async (query = `city=${encodeURIComponent(city || '上海')}`) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?${query}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || '天气加载失败');

      const today = data.data?.today || generateMockWeather();
      setWeather(today);
      setCity(today.city || city);
      setForecast(data.data?.forecast || []);
      setAdvice(data.data?.advice || fallbackAdvice);
    } catch (error) {
      const message = error instanceof Error ? error.message : '天气加载失败';
      toast.error(message);
      setWeather(generateMockWeather());
      setForecast(generateMockForecast());
      setAdvice(fallbackAdvice);
    } finally {
      setLoading(false);
      setLocating(false);
    }
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      toast.error('当前浏览器不支持定位');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        loadWeather(`lat=${latitude}&lng=${longitude}`);
      },
      () => {
        setLocating(false);
        toast.error('无法获取位置，请允许浏览器定位权限');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div className="flex items-center gap-2">
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="waibao-input h-10 py-2 text-sm"
            placeholder="输入城市"
          />
          <Button size="sm" loading={loading && !locating} onClick={() => loadWeather()}>
            刷新
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            loading={locating}
            icon={<MapPin className="w-4 h-4" />}
            onClick={useLocation}
          >
            当前位置
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Shirt className="w-4 h-4" />}
            onClick={() => router.push('/ootd')}
          >
            今日穿搭
          </Button>
        </div>
      </Card>

      <Card className="mb-4 overflow-hidden">
        <div className="bg-gradient-primary p-6 -m-4 mb-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm">{weather.city}</p>
              <p className="text-white/60 text-xs mt-0.5">
                {weather.district || '今日天气'} {weather.reportTime || ''}
              </p>
            </div>
            <WeatherIcon weather={weather.weather} size="lg" />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white">{weather.currentTemp ?? weather.tempMax}</span>
            <span className="text-2xl text-white/80">°C</span>
            <span className="text-white/60 ml-2">/ {weather.tempMin}°C - {weather.tempMax}°C</span>
          </div>
          <p className="text-white/80 mt-1">{weather.weather}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="text-center">
            <Umbrella className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">降水概率</p>
            <p className="text-sm font-bold text-waibao-text">{weather.rainProbability || 0}%</p>
          </div>
          <div className="text-center">
            <Wind className="w-5 h-5 text-waibao-text-light mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">风力</p>
            <p className="text-sm font-bold text-waibao-text">{weather.windLevel || '-'}</p>
          </div>
          <div className="text-center">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">湿度</p>
            <p className="text-sm font-bold text-waibao-text">{weather.humidity || '-'}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-waibao-pink-light/30">
          <Thermometer className="w-4 h-4 text-waibao-primary" />
          <span className="text-xs text-waibao-text-light">
            紫外线：{weather.uvLevel || '-'}；天气数据来自高德地图
          </span>
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>未来三天预报</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {forecast.slice(0, 3).map((day: ForecastDay, idx: number) => (
            <div
              key={`${day.date}-${idx}`}
              className="flex items-center justify-between py-2 px-3 rounded-2xl bg-waibao-pink-light/20"
            >
              <div>
                <p className="text-sm font-bold text-waibao-text">{day.weekday || day.date}</p>
                <p className="text-xs text-waibao-text-light">{day.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <WeatherIcon weather={day.weather} size="sm" />
                <span className="text-sm text-waibao-text-light">{day.weather}</span>
                <span className="text-sm font-bold text-waibao-text min-w-[3rem] text-right">
                  {day.tempMax}°/{day.tempMin}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <CardTitle>穿衣建议</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-waibao-text leading-relaxed">{advice.clothingAdvice}</p>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <CardTitle>护肤建议</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-waibao-text leading-relaxed">{advice.skincareAdvice}</p>
      </Card>

      {weather.source === 'mock' && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-yellow-50 border border-yellow-100">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-700 leading-relaxed">
            当前高德天气不可用，已使用开发模拟数据。请检查高德 Key 的 IP 白名单。
          </p>
        </div>
      )}
    </div>
  );
}
