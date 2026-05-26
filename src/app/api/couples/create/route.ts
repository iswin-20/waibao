import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { generateBindCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    // 检查用户是否已经绑定
    const existingCouple = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
        status: { not: 'unbound' },
      },
    });

    if (existingCouple) {
      return errorResponse('你已经处于绑定状态');
    }

    const bindCode = generateBindCode();

    const couple = await prisma.couple.create({
      data: {
        userAId: authUser.userId,
        bindCode,
        status: 'pending',
      },
    });

    return successResponse({ bindCode: couple.bindCode }, 201);
  } catch (error) {
    console.error('Couple create error:', error);
    return errorResponse('创建邀请码失败', 500);
  }
}
