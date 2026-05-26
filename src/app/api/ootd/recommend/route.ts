import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateOutfitRecommendation } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { weather } = await request.json();

    const items = await prisma.wardrobeItem.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' },
    });

    const recommendation = await generateOutfitRecommendation(weather || {}, items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      color: item.color,
      style: item.style,
      season: item.season,
    })));

    const selectedItems = items.filter((item) => recommendation.itemIds.includes(item.id));

    return successResponse({
      recommendation,
      items: selectedItems,
    });
  } catch (error) {
    console.error('OOTD recommend error:', error);
    return errorResponse('生成穿搭推荐失败', 500);
  }
}
