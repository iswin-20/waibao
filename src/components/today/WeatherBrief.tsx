'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, CloudSun, CloudRain, Cloud, Umbrella, ChevronRight } from 'lucide-react';
import { generateMockWeather } from '@/lib/utils';
import type { MockWeather } from '@/types';

function WeatherIcon({ weather }: { weather: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    '晴': <Sun className="w-10 h-10 text-yellow-500" />,
    '多云': <CloudSun className="w-10 h-10 text-yellow-500" />,
    '阴天': <Cloud className="w-10 h-10 text-gray-400" />,
    '小雨': <CloudRain className="w-10 h-10 text-blue-400" />,
    '阵雨': <CloudRain className="w-10 h-10 text-blue-400" />,
  };
  return <>{iconMap[weather] || <CloudSun className="w-10 h-10 text-yellow-500" />}</>;
}

function getAdvice(weather: MockWeather): string {
  const { weather: w, tempMin, tempMax, rainProbability } = weather;
  if (rainProbability > 50) return '今天可能下雨，记得带伞哦～';
  if (tempMax > 32) return '温度较高，注意防暑降温！';
  if (tempMin < 10) return '今天有点冷，多穿点衣服～';
  if (w === '晴') return '天气不错，出去走走吧！';
  return '适合宅在家里的小天气～';
}

export function WeatherBrief() {
  const router = useRouter();
  const weather = useMemo(() => generateMockWeather(), []);
  const advice = getAdvice(weather);

  return (
    <div
      className="waibao-card cursor-pointer hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200"
      onClick={() => router.push('/weather')}
    >
      <div className="flex items-center gap-4">
        <WeatherIcon weather={weather.weather} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-waibao-text">
              {weather.tempMax}°
            </span>
            <span className="text-waibao-text-light text-sm">
              / {weather.tempMin}°
            </span>
            <span className="text-waibao-text-light text-sm ml-1">
              {weather.weather}
            </span>
          </div>
          <p className="text-waibao-text-light text-sm mt-1">
            {advice}
          </p>
          {weather.rainProbability > 30 && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-400">
              <Umbrella className="w-3 h-3" />
              <span>降水概率 {weather.rainProbability}%</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-waibao-text-light/40" />
      </div>
      <div className="mt-2 text-right">
        <span className="text-xs text-waibao-text-light/50">点击查看详情</span>
      </div>
    </div>
  );
}
