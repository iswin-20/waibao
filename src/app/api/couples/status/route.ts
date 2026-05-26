import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
      },
      include: {
        userA: {
          select: { id: true, nickname: true, avatar: true, email: true },
        },
        userB: {
          select: { id: true, nickname: true, avatar: true, email: true },
        },
      },
    });

    if (!couple) {
      return successResponse({ status: 'none', couple: null });
    }

    const partner = couple.userAId === authUser.userId ? couple.userB : couple.userA;
    const loveDays = couple.loveStartDate
      ? Math.floor((Date.now() - new Date(couple.loveStartDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return successResponse({
      id: couple.id,
      status: couple.status,
      bindCode: couple.bindCode,
      loveStartDate: couple.loveStartDate,
      loveDays,
      partner: partner
        ? {
            id: partner.id,
            nickname: partner.nickname,
            avatar: partner.avatar,
            email: partner.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Couple status error:', error);
    return errorResponse('获取绑定状态失败', 500);
  }
}
