import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { bindCode } = await request.json();

    if (!bindCode) {
      return errorResponse('请输入邀请码');
    }

    // 检查用户是否已经绑定
    const alreadyBound = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
        status: { not: 'unbound' },
      },
    });

    if (alreadyBound) {
      return errorResponse('你已经处于绑定状态');
    }

    // 查找邀请码
    const couple = await prisma.couple.findUnique({
      where: { bindCode },
    });

    if (!couple) {
      return errorResponse('邀请码无效');
    }

    if (couple.status !== 'pending') {
      return errorResponse('该邀请码已失效');
    }

    if (couple.userAId === authUser.userId) {
      return errorResponse('不能绑定自己的邀请码');
    }

    // 执行绑定
    const updated = await prisma.couple.update({
      where: { id: couple.id },
      data: {
        userBId: authUser.userId,
        status: 'active',
        loveStartDate: couple.loveStartDate || new Date(),
      },
    });

    return successResponse({
      id: updated.id,
      status: updated.status,
      loveStartDate: updated.loveStartDate,
    });
  } catch (error) {
    console.error('Couple bind error:', error);
    return errorResponse('绑定失败', 500);
  }
}
