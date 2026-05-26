/**
 * DeepSeek AI 集成
 * 用于情绪分析、安慰文案、天气建议、经期建议等
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
  }[];
}

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const MODEL = 'deepseek-chat';

async function callDeepSeek(
  messages: DeepSeekMessage[],
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!API_KEY) {
    // 开发环境无 API key 时返回模拟数据
    return mockAIResponse(messages);
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    return mockAIResponse(messages);
  }
}

// ===== 情绪分析 =====
export interface EmotionAnalysisResult {
  emotionLevel: number;   // 0-4
  emotionType: string;    // 委屈 / 焦虑 / 生气 / 难过 / 疲惫
  comfortText: string;    // 安慰文案
  notifyPartner: boolean; // 是否提醒男朋友
  boyfriendMessage: string; // 给男朋友的消息
}

export async function analyzeEmotion(
  diaryContent: string,
  moodScore?: number,
  isPeriod?: boolean,
  consecutiveLowDays?: number
): Promise<EmotionAnalysisResult> {
  const systemPrompt = `你是一个温暖、善解人意的情绪分析助手，属于"歪宝小窝"应用。
请分析用户的日记内容，返回 JSON 格式的情绪分析结果。

分析维度：
- emotionLevel: 0=正常, 1=轻微低落, 2=明显不开心, 3=需要关心, 4=强烈异常
- emotionType: 委屈 / 焦虑 / 生气 / 难过 / 疲惫 / 正常
- comfortText: 温暖的安慰文案（2-3句话）
- notifyPartner: 是否需要提醒男朋友（emotionLevel>=3 或 出现明显负面情绪时为true）
- boyfriendMessage: 给男朋友的提醒消息（不要直接暴露日记内容，委婉表达）

只返回 JSON，不要有其他文字。`;

  const userPrompt = `日记内容：${diaryContent}
${moodScore ? `心情评分：${moodScore}/5` : ''}
${isPeriod ? '用户处于经期' : ''}
${consecutiveLowDays ? `连续低落天数：${consecutiveLowDays}` : ''}

请分析情绪并返回 JSON。`;

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.5, 800);

  try {
    // 尝试从返回中提取 JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as EmotionAnalysisResult;
    }
    return JSON.parse(result) as EmotionAnalysisResult;
  } catch {
    return {
      emotionLevel: 1,
      emotionType: '正常',
      comfortText: '今天看起来还不错，继续保持好心情哦！',
      notifyPartner: false,
      boyfriendMessage: '',
    };
  }
}

// ===== 天气建议 =====
export interface WeatherAdvice {
  clothingAdvice: string;
  skincareAdvice: string;
  umbrellaAdvice: string;
  summaryAdvice: string;
}

export async function generateWeatherAdvice(
  weather: string,
  tempMin: number,
  tempMax: number,
  rainProbability: number,
  uvLevel?: string
): Promise<WeatherAdvice> {
  const systemPrompt = `你是一个贴心的生活助手，根据天气情况给出穿衣和护肤建议。
返回 JSON 格式：{ clothingAdvice, skincareAdvice, umbrellaAdvice, summaryAdvice }
温柔、实用、中文。只返回 JSON。`;

  const userPrompt = `天气：${weather}
温度：${tempMin}°C - ${tempMax}°C
降雨概率：${rainProbability}%
${uvLevel ? `紫外线：${uvLevel}` : ''}

请给出建议。`;

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.7, 500);

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as WeatherAdvice;
    return JSON.parse(result) as WeatherAdvice;
  } catch {
    return {
      clothingAdvice: '今天天气适中，穿得舒服就好。',
      skincareAdvice: '记得做好基础护肤哦。',
      umbrellaAdvice: rainProbability > 30 ? '建议带伞出门。' : '今天不用带伞。',
      summaryAdvice: `今天${weather}，${tempMin}°C到${tempMax}°C，注意适当穿搭。`,
    };
  }
}

// ===== 经期建议 =====
export async function generatePeriodAdvice(
  painLevel: string,
  mood: string,
  day: number
): Promise<string> {
  const systemPrompt = `你是一个温暖的女性健康助手，给出贴心的经期建议。
语气温柔、关怀，简短实用。不要给出医疗建议。`;

  const userPrompt = `疼痛程度：${painLevel}
情绪状态：${mood}
第${day}天

请给出关怀建议。`;

  return callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.7, 300);
}

// ===== 男朋友话术 =====
export async function generateComfortMessage(
  partnerEmotionType?: string,
  partnerEmotionLevel?: number
): Promise<string> {
  const systemPrompt = `你是一个温柔的男朋友/女朋友，给伴侣发送关心消息。
要求：简短、温暖、不肉麻、真诚。30字以内。`;

  const userPrompt = partnerEmotionType
    ? `对方现在有点${partnerEmotionType}（情绪等级${partnerEmotionLevel}/4），请发一句关心。`
    : '给对方发一句日常关心。';

  return callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.8, 100);
}

export interface OutfitItemInput {
  id: string;
  name?: string | null;
  type: string;
  color?: string | null;
  style?: string | null;
  season?: string | null;
}

export interface OutfitRecommendation {
  summary: string;
  itemIds: string[];
  tips: string[];
}

export async function generateOutfitRecommendation(
  weather: {
    city?: string;
    weather?: string;
    currentTemp?: number;
    tempMin?: number;
    tempMax?: number;
    humidity?: number;
    windLevel?: string;
  },
  items: OutfitItemInput[]
): Promise<OutfitRecommendation> {
  if (items.length === 0) {
    return {
      summary: '衣橱里还没有衣服，先上传几件单品吧。',
      itemIds: [],
      tips: ['建议先上传上衣、下装和外套，推荐会更准。'],
    };
  }

  const systemPrompt = `你是一个实用、审美温柔的穿搭助手。根据天气和衣橱单品推荐一套 OOTD。
只返回 JSON，格式：
{
  "summary": "一句中文穿搭总结",
  "itemIds": ["被选中的衣服 id，2-5 个"],
  "tips": ["2-4 条中文提醒"]
}
要求：优先考虑温度、降雨、风力和舒适度；只选择用户衣橱里存在的 id。`;

  const userPrompt = JSON.stringify({
    weather,
    wardrobe: items,
  });

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], 0.45, 700);

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result) as OutfitRecommendation;
    const validIds = new Set(items.map((item) => item.id));
    return {
      summary: parsed.summary || '今天这套以舒适、清爽为主。',
      itemIds: (parsed.itemIds || []).filter((id) => validIds.has(id)).slice(0, 5),
      tips: (parsed.tips || []).slice(0, 4),
    };
  } catch {
    const sorted = [...items].sort((a, b) => a.type.localeCompare(b.type));
    return {
      summary: '今天建议选择轻便、好活动的一套，按温度适当加外套。',
      itemIds: sorted.slice(0, 3).map((item) => item.id),
      tips: ['出门前再看一眼实时天气。', '如果有雨，优先选择不怕湿的鞋包。'],
    };
  }
}

// ===== 模拟 AI 响应（无 API key 时使用）=====
function mockAIResponse(messages: DeepSeekMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content || '';

  if (lastMessage.includes('情绪') || lastMessage.includes('日记')) {
    return JSON.stringify({
      emotionLevel: 2,
      emotionType: '有点小委屈',
      comfortText: '看起来今天遇到了一些不太开心的事情呢。不过没关系的，每个人都有心情不好的时候，你已经做得很好了。记得好好休息，明天的太阳一样温暖。',
      notifyPartner: true,
      boyfriendMessage: '歪宝今天好像有点不开心，记得温柔一点哄哄她。可以给她一个抱抱，或者陪她说说话。',
    });
  }

  if (lastMessage.includes('天气') || lastMessage.includes('穿衣')) {
    return JSON.stringify({
      clothingAdvice: '今天有点凉，建议穿薄外套或针织衫。',
      skincareAdvice: '紫外线中等，简单防晒就好。记得多喝水。',
      umbrellaAdvice: '下午可能会下雨，出门记得带伞。',
      summaryAdvice: '今天温度适中但可能有雨，建议穿薄外套并带伞出门。',
    });
  }

  if (lastMessage.includes('经期') || lastMessage.includes('period')) {
    return '今天可能会比较累，记得多休息，少喝冰的。如果肚子不舒服，可以准备热水袋暖暖肚子。你不是矫情，是身体真的需要被照顾。';
  }

  if (lastMessage.includes('关心') || lastMessage.includes('哄')) {
    return '抱抱歪宝，今天辛苦啦。不开心可以慢慢说，我一直都在。';
  }

  return '今天也要加油哦，你是最棒的小宝宝！';
}

export default {
  analyzeEmotion,
  generateWeatherAdvice,
  generatePeriodAdvice,
  generateComfortMessage,
  generateOutfitRecommendation,
};
