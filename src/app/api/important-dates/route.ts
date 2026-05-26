import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = { userId: authUser.userId };

    if (category) where.category = category;

    let dates = await prisma.importantDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    if (upcoming) {
      const now = new Date();
      dates = dates.filter((d) => {
        const date = new Date(d.date);
        // 对 yearly 类型，将年份改为今年来判断是否即将到来
        if (d.repeatType === 'yearly') {
          const thisYear = new Date(date);
          thisYear.setFullYear(now.getFullYear());
          if (thisYear < now) {
            thisYear.setFullYear(now.getFullYear() + 1);
          }
          const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 30;
        }
        const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      });

      dates.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (a.repeatType === 'yearly') dateA.setFullYear(now.getFullYear());
        if (b.repeatType === 'yearly') dateB.setFullYear(now.getFullYear());
        return dateA.getTime() - dateB.getTime();
      });
    }

    const total = dates.length;
    const paginatedDates = dates.slice((page - 1) * pageSize, page * pageSize);

    return successResponse({
      dates: paginatedDates,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Important dates list error:', error);
    return errorResponse('获取重要日期失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { title, date, repeatType, remindDaysBefore, showOnHome, notifyPartner, category } =
      await request.json();

    if (!title || !date) {
      return errorResponse('标题和日期不能为空');
    }

    // 如果 notifyPartner 为 true，获取情侣关联
    let coupleId: string | null = null;
    if (notifyPartner) {
      const couple = await prisma.couple.findFirst({
        where: {
          OR: [
            { userAId: authUser.userId },
            { userBId: authUser.userId },
          ],
          status: 'active',
        },
      });
      coupleId = couple?.id || null;
    }

    const importantDate = await prisma.importantDate.create({
      data: {
        userId: authUser.userId,
        coupleId,
        title,
        date: new Date(date),
        repeatType: repeatType || 'none',
        remindDaysBefore: remindDaysBefore ?? 0,
        showOnHome: showOnHome ?? true,
        notifyPartner: notifyPartner ?? false,
        category: category || null,
      },
    });

    return successResponse(importantDate, 201);
  } catch (error) {
    console.error('Important date create error:', error);
    return errorResponse('创建重要日期失败', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('请提供要删除的日期 ID');
    }

    const date = await prisma.importantDate.findUnique({
      where: { id },
    });

    if (!date) {
      return errorResponse('日期不存在', 404);
    }

    if (date.userId !== authUser.userId) {
      return errorResponse('无权删除该日期', 403);
    }

    await prisma.importantDate.delete({
      where: { id },
    });

    return successResponse({ message: '日期已删除' });
  } catch (error) {
    console.error('Important date delete error:', error);
    return errorResponse('删除日期失败', 500);
  }
}
