'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CloudSun, Umbrella, Sun, Wind, Droplets, Thermometer, CloudRain, Cloud, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import { cn, generateMockWeather, generateMockForecast } from '@/lib/utils';
import type { MockWeather, ForecastDay } from '@/types';

function WeatherIcon({ weather, size = 'md' }: { weather: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const iconMap: Record<string, React.ReactNode> = {
    '晴': <Sun className={cn(sizeMap[size], 'text-yellow-500')} />,
    '多云': <CloudSun className={cn(sizeMap[size], 'text-yellow-500')} />,
    '阴天': <Cloud className={cn(sizeMap[size], 'text-gray-400')} />,
    '小雨': <CloudRain className={cn(sizeMap[size], 'text-blue-400')} />,
    '阵雨': <CloudRain className={cn(sizeMap[size], 'text-blue-400')} />,
  };
  return <>{iconMap[weather] || <CloudSun className={cn(sizeMap[size], 'text-yellow-500')} />}</>;
}

function getClothingAdvice(w: MockWeather): string {
  const { tempMin, tempMax, weather, rainProbability } = w;
  const advice: string[] = [];
  if (tempMax > 32) advice.push('穿轻薄透气的短袖');
  else if (tempMax > 25) advice.push('穿短袖或薄长袖');
  else if (tempMax > 20) advice.push('穿长袖，带一件外套');
  else if (tempMin < 10) advice.push('穿厚外套或羽绒服，注意保暖');
  else advice.push('穿长袖外套，适中厚度');

  if (rainProbability > 50) advice.push('今天可能下雨，记得带伞');
  if (weather === '晴') advice.push('可以戴太阳镜防晒');
  return advice.join('，');
}

function getSkincareAdvice(w: MockWeather): string {
  const { uvLevel, weather, humidity } = w;
  const advice: string[] = [];
  if (uvLevel === '强') advice.push('紫外线较强，出门涂防晒霜 SPF30+');
  else if (uvLevel === '中等') advice.push('建议涂抹防晒霜 SPF15+');
  else advice.push('紫外线较弱，可简单护肤');

  if (humidity < 50) advice.push('空气干燥，注意补水保湿');
  else if (humidity > 70) advice.push('湿度较高，做好清爽护肤');

  if (weather === '晴') advice.push('白天注意补水');
  return advice.join('，');
}

export default function WeatherPage() {
  const router = useRouter();
  const weather = useMemo(() => generateMockWeather(), []);
  const forecast = useMemo(() => generateMockForecast(), []);

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

      {/* 今日天气大卡片 */}
      <Card className="mb-4 overflow-hidden">
        <div className="bg-gradient-primary p-6 -m-4 mb-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{weather.city}</p>
              <p className="text-white/60 text-xs mt-0.5">今日天气</p>
            </div>
            <WeatherIcon weather={weather.weather} size="lg" />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white">{weather.tempMax}</span>
            <span className="text-2xl text-white/80">°C</span>
            <span className="text-white/60 ml-2">/ {weather.tempMin}°C</span>
          </div>
          <p className="text-white/80 mt-1">{weather.weather}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="text-center">
            <Umbrella className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">降水概率</p>
            <p className="text-sm font-bold text-waibao-text">{weather.rainProbability}%</p>
          </div>
          <div className="text-center">
            <Wind className="w-5 h-5 text-waibao-text-light mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">风速</p>
            <p className="text-sm font-bold text-waibao-text">{weather.windLevel}</p>
          </div>
          <div className="text-center">
            <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-waibao-text-light">湿度</p>
            <p className="text-sm font-bold text-waibao-text">{weather.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-waibao-pink-light/30">
          <Thermometer className="w-4 h-4 text-waibao-primary" />
          <span className="text-xs text-waibao-text-light">
            紫外线：{weather.uvLevel} &nbsp;|&nbsp; 体感温度约 {weather.tempMin + 2}°C ~ {weather.tempMax - 1}°C
          </span>
        </div>
      </Card>

      {/* 未来三天预报 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>未来三天预报</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {forecast.map((day: ForecastDay, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-2xl bg-waibao-pink-light/20"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold text-waibao-text">{day.weekday}</p>
                  <p className="text-xs text-waibao-text-light">{day.date}</p>
                </div>
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

      {/* 穿衣建议 */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-yellow-500" />
            <CardTitle>穿衣建议</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-waibao-text leading-relaxed">
          {getClothingAdvice(weather)}
        </p>
      </Card>

      {/* 护肤建议 */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            <CardTitle>护肤建议</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-waibao-text leading-relaxed">
          {getSkincareAdvice(weather)}
        </p>
      </Card>

      {/* 底部提示 */}
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-yellow-50 border border-yellow-100">
        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-700 leading-relaxed">
          数据来源模拟展示，仅供参考。后续可接入真实天气 API 获取准确信息。
        </p>
      </div>
    </div>
  );
}
