import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateMockWeather, generateMockForecast } from '@/lib/utils';
import { generateWeatherAdvice } from '@/lib/ai';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

export const dynamic = 'force-dynamic';

interface AmapLiveWeather {
  province?: string;
  city?: string;
  adcode?: string;
  weather?: string;
  temperature?: string;
  winddirection?: string;
  windpower?: string;
  humidity?: string;
  reporttime?: string;
}

interface AmapForecastCast {
  date?: string;
  week?: string;
  dayweather?: string;
  nightweather?: string;
  daytemp?: string;
  nighttemp?: string;
  daywind?: string;
  nightwind?: string;
  daypower?: string;
  nightpower?: string;
}

const weekMap: Record<string, string> = {
  '1': '周一',
  '2': '周二',
  '3': '周三',
  '4': '周四',
  '5': '周五',
  '6': '周六',
  '7': '周日',
};

function toInt(value: unknown, fallback = 0): number {
  const parsed = parseInt(String(value ?? ''), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function estimateRainProbability(weather?: string): number {
  if (!weather) return 0;
  if (weather.includes('暴雨') || weather.includes('大雨')) return 90;
  if (weather.includes('中雨')) return 75;
  if (weather.includes('小雨') || weather.includes('阵雨')) return 55;
  if (weather.includes('雪')) return 60;
  if (weather.includes('阴')) return 20;
  return 5;
}

async function fetchAmapJson(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ key: WEATHER_API_KEY, ...params });
  const res = await fetch(`${AMAP_BASE_URL}${path}?${query.toString()}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Amap API error: ${res.status}`);
  return res.json();
}

async function resolveAmapLocation(searchParams: URLSearchParams) {
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const city = searchParams.get('city') || '上海';

  if (lat && lng) {
    const geoData = await fetchAmapJson('/geocode/regeo', {
      location: `${lng},${lat}`,
      extensions: 'base',
      radius: '1000',
    });
    const component = geoData?.regeocode?.addressComponent;
    const adcode = component?.adcode;
    const resolvedCity = Array.isArray(component?.city) || !component?.city
      ? component?.province
      : component.city;
    if (adcode) {
      return {
        adcode,
        city: resolvedCity || component?.province || city,
        province: component?.province || '',
        district: component?.district || '',
        source: 'location',
      };
    }
  }

  const geoData = await fetchAmapJson('/geocode/geo', {
    address: city,
  });
  const geocode = geoData?.geocodes?.[0];
  return {
    adcode: geocode?.adcode || city,
    city: geocode?.city || city,
    province: geocode?.province || '',
    district: geocode?.district || '',
    source: 'city',
  };
}

async function fetchAmapWeather(searchParams: URLSearchParams) {
  const location = await resolveAmapLocation(searchParams);

  const [liveData, forecastData] = await Promise.all([
    fetchAmapJson('/weather/weatherInfo', {
      city: location.adcode,
      extensions: 'base',
    }),
    fetchAmapJson('/weather/weatherInfo', {
      city: location.adcode,
      extensions: 'all',
    }),
  ]);

  const live: AmapLiveWeather | undefined = liveData?.lives?.[0];
  const casts: AmapForecastCast[] = forecastData?.forecasts?.[0]?.casts || [];
  if (!live && casts.length === 0) {
    throw new Error('Amap weather response is empty');
  }

  const todayCast = casts[0];
  const weather = live?.weather || todayCast?.dayweather || '多云';
  const currentTemp = toInt(live?.temperature, toInt(todayCast?.daytemp, 24));
  const tempMin = toInt(todayCast?.nighttemp, currentTemp - 3);
  const tempMax = toInt(todayCast?.daytemp, currentTemp + 2);
  const humidity = toInt(live?.humidity, 55);

  const today = {
    city: live?.city || location.city,
    province: location.province,
    district: location.district,
    adcode: live?.adcode || location.adcode,
    weather,
    currentTemp,
    tempMin,
    tempMax,
    rainProbability: estimateRainProbability(weather),
    humidity,
    windLevel: live?.windpower ? `${live.winddirection || ''}${live.windpower}级` : `${todayCast?.daywind || ''}${todayCast?.daypower || '1'}级`,
    uvLevel: weather.includes('晴') ? '强' : weather.includes('阴') || weather.includes('雨') ? '弱' : '中等',
    reportTime: live?.reporttime || '',
    source: 'amap',
  };

  const forecast = casts.slice(0, 4).map((day) => {
    const dayWeather = day.dayweather || day.nightweather || weather;
    return {
      date: day.date,
      weekday: weekMap[String(day.week)] || '',
      weather: dayWeather,
      tempMin: toInt(day.nighttemp, tempMin),
      tempMax: toInt(day.daytemp, tempMax),
      rainProbability: estimateRainProbability(dayWeather),
      humidity,
      windLevel: day.daywind ? `${day.daywind} ${day.daypower || ''}级` : today.windLevel,
      uvLevel: dayWeather.includes('晴') ? '强' : '中等',
    };
  });

  return { today, forecast };
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || '上海';

    let today: Record<string, unknown>;
    let forecast: Record<string, unknown>[];

    if (WEATHER_API_KEY) {
      try {
        const amapWeather = await fetchAmapWeather(searchParams);
        today = amapWeather.today;
        forecast = amapWeather.forecast;

        const advice = await generateWeatherAdvice(
          today.weather as string,
          today.tempMin as number,
          today.tempMax as number,
          today.rainProbability as number,
          today.uvLevel as string
        );

        await prisma.weatherRecord.create({
          data: {
            userId: authUser.userId,
            city: today.city as string,
            temperature: `${today.tempMin}-${today.tempMax}`,
            weather: today.weather as string,
            rainProbability: today.rainProbability as number,
            clothingAdvice: advice.clothingAdvice,
            skincareAdvice: advice.skincareAdvice,
            windLevel: today.windLevel as string,
          },
        });

        return successResponse({ today, forecast, advice });
      } catch (apiErr) {
        console.error('Amap weather API error, falling back to mock:', apiErr);
      }
    }

    // 使用模拟数据
    today = generateMockWeather();
    today.source = 'mock';
    forecast = generateMockForecast();

    const advice = await generateWeatherAdvice(
      today.weather as string,
      today.tempMin as number,
      today.tempMax as number,
      today.rainProbability as number,
      today.uvLevel as string
    );

    // 保存天气记录
    await prisma.weatherRecord.create({
      data: {
        userId: authUser.userId,
        city: today.city as string,
        temperature: `${today.tempMin}-${today.tempMax}`,
        weather: today.weather as string,
        rainProbability: today.rainProbability as number,
        clothingAdvice: advice.clothingAdvice,
        skincareAdvice: advice.skincareAdvice,
        windLevel: today.windLevel as string,
      },
    });

    return successResponse({ today, forecast, advice });
  } catch (error) {
    console.error('Weather error:', error);
    return errorResponse('获取天气数据失败', 500);
  }
}
