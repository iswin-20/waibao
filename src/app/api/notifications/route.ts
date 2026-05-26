import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = { userId: authUser.userId };

    if (unreadOnly) where.read = false;
    if (type) where.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          sender: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
      }),
      prisma.notification.count({ where: { userId: authUser.userId } }),
      prisma.notification.count({
        where: { userId: authUser.userId, read: false },
      }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Notifications list error:', error);
    return errorResponse('获取通知列表失败', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { ids, all } = await request.json();

    if (all) {
      // 标记所有为已读
      await prisma.notification.updateMany({
        where: {
          userId: authUser.userId,
          read: false,
        },
        data: { read: true },
      });

      return successResponse({ message: '全部标记为已读' });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // 标记指定通知为已读
      await prisma.notification.updateMany({
        where: {
          id: { in: ids },
          userId: authUser.userId,
        },
        data: { read: true },
      });

      return successResponse({ message: `已标记 ${ids.length} 条通知为已读` });
    }

    return errorResponse('请提供要标记的通知 ID');
  } catch (error) {
    console.error('Notifications read error:', error);
    return errorResponse('标记已读失败', 500);
  }
}
