import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    // 查找绑定关系
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

    // 获取伴侣信息
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { nickname: true, avatar: true },
    });

    if (!partner) {
      return errorResponse('伴侣不存在', 404);
    }

    // 查找对方最近日记的情绪等级
    const latestDiary = await prisma.diary.findFirst({
      where: { userId: partnerId },
      orderBy: { date: 'desc' },
      select: {
        emotionLevel: true,
        emotionType: true,
        date: true,
        content: true,
      },
    });

    // 检查伴侣是否有未读的日记（emotionLevel >= 1 的最近日记）
    const hasUnreadDiary =
      latestDiary !== null &&
      latestDiary.emotionLevel !== null &&
      latestDiary.emotionLevel >= 1;

    // 查找伴侣最近的心愿
    const recentWishes = await prisma.wish.findMany({
      where: {
        userId: partnerId,
        status: { in: ['wanting', 'claimed', 'preparing'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        progress: true,
        status: true,
        claimedById: true,
      },
    });

    // 查找即将到来的重要日期
    const importantDates = await prisma.importantDate.findMany({
      where: {
        userId: partnerId,
        showOnHome: true,
      },
      orderBy: { date: 'asc' },
    });

    const now = new Date();
    const upcomingDates = importantDates.filter((d) => {
      const date = new Date(d.date);
      if (d.repeatType === 'yearly') {
        const thisYear = new Date(date);
        thisYear.setFullYear(now.getFullYear());
        if (thisYear < now) {
          thisYear.setFullYear(now.getFullYear() + 1);
        }
        const diff = (thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 60;
      }
      const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= -7 && diff <= 60;
    });

    // 计算恋爱天数
    const loveDays = couple.loveStartDate
      ? Math.floor(
          (Date.now() - new Date(couple.loveStartDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    // 检查伴侣是否在经期
    const latestPeriod = await prisma.periodRecord.findFirst({
      where: { userId: partnerId },
      orderBy: { startDate: 'desc' },
    });

    let periodStatus: string | undefined;
    if (latestPeriod) {
      const periodEnd = latestPeriod.endDate
        ? new Date(latestPeriod.endDate)
        : new Date(latestPeriod.startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      if (now >= latestPeriod.startDate && now <= periodEnd) {
        periodStatus = 'period';
      }
    }

    return successResponse({
      user: {
        nickname: partner.nickname,
        avatar: partner.avatar,
      },
      todayMood: latestDiary?.emotionLevel
        ? {
            emotionLevel: latestDiary.emotionLevel,
            emotionType: latestDiary.emotionType,
          }
        : undefined,
      periodStatus,
      hasUnreadDiary,
      loveDays,
      upcomingDates: upcomingDates.map((d) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        repeatType: d.repeatType,
        category: d.category,
        remindDaysBefore: d.remindDaysBefore,
      })),
      recentWishes,
    });
  } catch (error) {
    console.error('Partner status error:', error);
    return errorResponse('获取伴侣状态失败', 500);
  }
}
