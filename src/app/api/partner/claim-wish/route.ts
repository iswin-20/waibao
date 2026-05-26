import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    // 检查用户是否已绑定
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

    const { wishId } = await request.json();

    if (!wishId) {
      return errorResponse('请提供心愿 ID');
    }

    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
    });

    if (!wish) {
      return errorResponse('心愿不存在', 404);
    }

    // 只能认领伴侣的心愿，不能认领自己的
    const partnerId = couple.userAId === authUser.userId ? couple.userBId : couple.userAId;
    if (wish.userId !== partnerId) {
      return errorResponse('只能认领伴侣的心愿', 403);
    }

    if (wish.claimedById) {
      return errorResponse('该心愿已被认领');
    }

    if (wish.status !== 'wanting') {
      return errorResponse('该心愿当前状态无法认领');
    }

    // 认领心愿
    const updated = await prisma.wish.update({
      where: { id: wishId },
      data: {
        claimedById: authUser.userId,
        status: 'claimed',
      },
      include: {
        claimedBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: partnerId!,
        senderId: authUser.userId,
        type: 'wish_claimed',
        title: '心愿被认领啦',
        content: `有人认领了你的心愿「${wish.title}」，准备给你惊喜哦～`,
        read: false,
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Claim wish error:', error);
    return errorResponse('认领心愿失败', 500);
  }
}
