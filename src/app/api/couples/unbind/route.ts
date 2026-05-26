import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

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
      return errorResponse('当前没有可解绑的伴侣关系');
    }

    await prisma.couple.update({
      where: { id: couple.id },
      data: { status: 'unbound' },
    });

    return successResponse({ message: '已解绑' });
  } catch (error) {
    console.error('Couple unbind error:', error);
    return errorResponse('解绑失败', 500);
  }
}
