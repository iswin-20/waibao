import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = { userId: authUser.userId };

    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      where.status = statuses.length > 1 ? { in: statuses } : statuses[0];
    }
    if (category) where.category = category;

    // 如果已绑定，也获取伴侣创建且被当前用户认领的心愿
    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
        status: 'active',
      },
    });

    if (couple) {
      const partnerId = couple.userAId === authUser.userId ? couple.userBId : couple.userAId;
      if (partnerId) {
        where.OR = [
          { userId: authUser.userId },
          { claimedById: authUser.userId },
        ];
        delete where.userId;
      }
    }

    const [wishes, total] = await Promise.all([
      prisma.wish.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { priority: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          claimedBy: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
      }),
      prisma.wish.count({ where }),
    ]);

    return successResponse({
      wishes,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Wishes list error:', error);
    return errorResponse('获取心愿列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { title, description, imageUrl, category, priority } = await request.json();

    if (!title) {
      return errorResponse('标题不能为空');
    }

    // 如果已绑定，关联到情侣
    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { userAId: authUser.userId },
          { userBId: authUser.userId },
        ],
        status: 'active',
      },
    });

    const wish = await prisma.wish.create({
      data: {
        userId: authUser.userId,
        coupleId: couple?.id || null,
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        category: category || null,
        priority: priority || 'medium',
        status: 'wanting',
      },
    });

    return successResponse(wish, 201);
  } catch (error) {
    console.error('Wish create error:', error);
    return errorResponse('创建心愿失败', 500);
  }
}
