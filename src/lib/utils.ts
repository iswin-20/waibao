import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  differenceInDays,
  differenceInCalendarDays,
  isToday,
  isTomorrow,
  isPast,
  addDays,
  parseISO,
  startOfDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/** Tailwind class merge utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 获取当前时间段问候语 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return '早安';
  if (hour >= 11 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 24) return '晚上好';
  return '夜深啦';
}

/** 获取鼓励语 */
export function getEncouragement(): string {
  const messages = [
    '加油，你是最棒的小宝宝！',
    '今天也要开开心心的！',
    '你值得被温柔对待 💕',
    '每一天都是美好的一天！',
    '别忘了，有人在默默爱着你 ❤️',
    '你已经做得很好了！',
    '今天也要好好吃饭哦～',
    '你是独一无二的存在！',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/** 计算恋爱天数 */
export function getLoveDays(loveStartDate: string | Date): number {
  const start = typeof loveStartDate === 'string' ? parseISO(loveStartDate) : loveStartDate;
  return differenceInCalendarDays(new Date(), start);
}

/** 格式化日期 */
export function formatDate(date: string | Date, fmt: string = 'yyyy年M月d日'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt, { locale: zhCN });
}

/** 格式化相对时间 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const days = differenceInCalendarDays(d, now);

  if (isToday(d)) return '今天';
  if (isTomorrow(d)) return '明天';
  if (days < 0 && days > -7) return `${Math.abs(days)}天前`;
  if (days > 0 && days < 7) return `${days}天后`;
  return format(d, 'M月d日', { locale: zhCN });
}

/** 计算距离某天还有多少天（可正可负） */
export function getDaysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  return differenceInCalendarDays(target, today);
}

/** 判断日期是否在 7 天内 */
export function isWithinDays(date: string | Date, days: number): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diff = getDaysUntil(d);
  return diff >= 0 && diff <= days;
}

/** 生成随机邀请码 */
export function generateBindCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WY${code}`;
}

/** 检查是否是深夜 (0-5点) */
export function isLateNight(): boolean {
  const hour = new Date().getHours();
  return hour >= 0 && hour < 5;
}

/** 获取情绪等级标签 */
export function getEmotionLabel(level: number): string {
  const labels = ['正常', '轻微低落', '明显不开心', '需要关心', '强烈异常'];
  return labels[level] || '未知';
}

/** 获取情绪颜色 */
export function getEmotionColor(level: number): string {
  const colors = [
    'text-green-500',
    'text-yellow-500',
    'text-orange-500',
    'text-red-400',
    'text-red-600',
  ];
  return colors[level] || 'text-gray-500';
}

/** 获取 Todo 完成鼓励 */
export function getTodoEncouragement(): string {
  const messages = [
    '歪宝真棒，又完成一件事啦！',
    '太厉害了！今天也很有效率！',
    '完成啦！奖励自己休息一下吧～',
    '好棒！离目标又近了一步！',
    '哇，今天也是能干的小宝宝！',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/** 生成随机天气数据（开发用）*/
export function generateMockWeather() {
  const weathers = ['晴', '多云', '阴天', '小雨', '阵雨', '晴'];
  const w = weathers[Math.floor(Math.random() * weathers.length)];
  const tempMin = 18 + Math.floor(Math.random() * 5);
  const tempMax = tempMin + 5 + Math.floor(Math.random() * 5);
  const rainProb = w.includes('雨') ? 60 + Math.floor(Math.random() * 40) : Math.floor(Math.random() * 30);

  return {
    city: '上海',
    weather: w,
    tempMin,
    tempMax,
    rainProbability: rainProb,
    humidity: 50 + Math.floor(Math.random() * 30),
    windLevel: `${1 + Math.floor(Math.random() * 3)}级`,
    uvLevel: ['弱', '中等', '强'][Math.floor(Math.random() * 3)],
  };
}

/** 生成未来三天模拟天气 */
export function generateMockForecast() {
  const days = [];
  for (let i = 1; i <= 3; i++) {
    const dayData = generateMockWeather();
    days.push({
      date: format(addDays(new Date(), i), 'M/d', { locale: zhCN }),
      weekday: format(addDays(new Date(), i), 'EEEE', { locale: zhCN }),
      ...dayData,
    });
  }
  return days;
}
