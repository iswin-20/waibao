// ===== 用户 =====
export interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  birthday: string | null;
  gender: string | null;
  role: 'waibao' | 'partner';
  mbti: string | null;
  loveNickname: string | null;
  comfortStyle: string | null;
  dislikeStyle: string | null;
  createdAt: string;
}

export interface UserProfile extends User {
  couple?: Couple | null;
}

// ===== 情侣 =====
export interface Couple {
  id: string;
  userAId: string;
  userBId: string | null;
  bindCode: string;
  loveStartDate: string | null;
  status: 'pending' | 'active' | 'unbound';
  partner?: User | null;
}

// ===== 日记 =====
export interface Diary {
  id: string;
  userId: string;
  date: string;
  content: string;
  moodScore: number | null;
  aiComfortText: string | null;
  emotionLevel: number | null;
  emotionType: string | null;
  notifyPartner: boolean;
  createdAt: string;
}

// ===== 重要日期 =====
export interface ImportantDate {
  id: string;
  userId: string;
  title: string;
  date: string;
  repeatType: 'none' | 'yearly';
  remindDaysBefore: number;
  showOnHome: boolean;
  notifyPartner: boolean;
  category: string | null;
}

// ===== 天气 =====
export interface WeatherRecord {
  id: string;
  city: string | null;
  temperature: string | null;
  weather: string | null;
  rainProbability: number | null;
  clothingAdvice: string | null;
  skincareAdvice: string | null;
}

export interface MockWeather {
  city: string;
  province?: string;
  district?: string;
  adcode?: string;
  weather: string;
  currentTemp?: number;
  tempMin: number;
  tempMax: number;
  rainProbability: number;
  humidity: number;
  windLevel: string;
  uvLevel: string;
  reportTime?: string;
  source?: string;
}

export interface ForecastDay extends MockWeather {
  date: string;
  weekday: string;
}

// ===== 经期 =====
export interface PeriodRecord {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  painLevel: string | null;
  mood: string | null;
  flowLevel: string | null;
  note: string | null;
  createdAt: string;
}

// ===== 待办 =====
export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  category: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ===== 心愿 =====
export interface Wish {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  status: 'wanting' | 'claimed' | 'preparing' | 'completed' | 'archived';
  claimedById: string | null;
  claimedBy?: User | null;
  createdAt: string;
  updatedAt: string;
}

// ===== 衣橱 =====
export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  whiteImageUrl?: string | null;
  name?: string | null;
  type: string;
  color: string | null;
  style: string | null;
  season: string | null;
  createdAt?: string;
}

// ===== 通知 =====
export interface Notification {
  id: string;
  userId: string;
  senderId: string;
  type: 'emotion_alert' | 'period_reminder' | 'wish_claimed' | 'date_reminder' | 'comfort';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// ===== API 响应 =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ===== AI 分析结果 =====
export interface EmotionAnalysis {
  emotionLevel: number;
  emotionType: string;
  comfortText: string;
  notifyPartner: boolean;
  boyfriendMessage: string;
}

export interface WeatherAdvice {
  clothingAdvice: string;
  skincareAdvice: string;
  umbrellaAdvice: string;
  summaryAdvice: string;
}

// ===== 情侣状态（男朋友端查看）=====
export interface PartnerStatus {
  user: Pick<User, 'nickname' | 'avatar'>;
  todayMood?: {
    emotionLevel: number;
    emotionType: string;
  };
  periodStatus?: string;
  hasUnreadDiary: boolean;
  loveDays: number;
  upcomingDates: ImportantDate[];
  recentWishes: Wish[];
}
