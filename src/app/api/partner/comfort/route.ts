import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateComfortMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
        status: 'active',
      },
    });

    if (!couple) {
      return errorResponse('尚未绑定伴侣', 403);
    }

    const partnerId = couple.userAId === authUser.userId ? couple.userBId : couple.userAId;
    if (!partnerId) {
      return errorResponse('伴侣信息不完整', 400);
    }

    const body = await request.json().catch(() => ({}));
    const providedComfortText =
      typeof body.comfortText === 'string' ? body.comfortText.trim() : '';

    const latestDiary = await prisma.diary.findFirst({
      where: { userId: partnerId },
      orderBy: { date: 'desc' },
      select: { emotionType: true, emotionLevel: true },
    });

    const comfortText = providedComfortText || await generateComfortMessage(
      latestDiary?.emotionType || undefined,
      latestDiary?.emotionLevel || undefined
    );

    await prisma.notification.create({
      data: {
        userId: partnerId,
        senderId: authUser.userId,
        type: 'comfort',
        title: `${authUser.email} 给你发来了一条关心`,
        content: comfortText,
        read: false,
      },
    });

    return successResponse({ comfortText });
  } catch (error) {
    console.error('Partner comfort error:', error);
    return errorResponse('发送关心消息失败', 500);
  }
}
