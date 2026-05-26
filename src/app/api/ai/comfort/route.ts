import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateComfortMessage } from '@/lib/ai';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { emotionType, emotionLevel } = await request.json();

    const comfortText = await generateComfortMessage(emotionType, emotionLevel);

    return successResponse({ comfortText });
  } catch (error) {
    console.error('AI comfort error:', error);
    return errorResponse('生成安慰文案失败', 500);
  }
}
