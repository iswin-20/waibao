import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    // 获取最近的经期记录，按开始日期倒序
    const recentRecords = await prisma.periodRecord.findMany({
      where: { userId: authUser.userId },
      orderBy: { startDate: 'desc' },
      take: 3,
    });

    if (recentRecords.length === 0) {
      return successResponse({
        predictNextDate: null,
        message: '暂无足够数据预测',
      });
    }

    // 计算平均周期长度
    let avgCycleLength = 28; // 默认 28 天
    if (recentRecords.length >= 2) {
      // 按时间正序排列以便计算间隔
      const sorted = [...recentRecords].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const gaps: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        const diff = Math.round(
          (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime())
          / (1000 * 60 * 60 * 24)
        );
        if (diff > 0 && diff < 60) {
          gaps.push(diff);
        }
      }

      if (gaps.length > 0) {
        avgCycleLength = Math.round(gaps.reduce((a, b) => a + b) / gaps.length);
      }
    }

    // 基于最新记录预测下次日期
    const latestStart = new Date(recentRecords[0].startDate);
    const predictNextDate = new Date(latestStart.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);

    // 估算排卵期（下次经期前 14 天左右）
    const ovulationDate = new Date(predictNextDate.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 估算安全期（粗略估算，仅供参考）
    const safePeriodStart = new Date(predictNextDate.getTime() - 19 * 24 * 60 * 60 * 1000);
    const safePeriodEnd = new Date(predictNextDate.getTime() - 10 * 24 * 60 * 60 * 1000);

    return successResponse({
      predictNextDate: predictNextDate.toISOString(),
      avgCycleLength,
      ovulationDate: ovulationDate.toISOString(),
      safePeriod: {
        start: safePeriodStart.toISOString(),
        end: safePeriodEnd.toISOString(),
      },
      lastPeriodStart: latestStart.toISOString(),
      daysSinceLastPeriod: Math.round(
        (Date.now() - latestStart.getTime()) / (1000 * 60 * 60 * 24)
      ),
    });
  } catch (error) {
    console.error('Period predict error:', error);
    return errorResponse('预测失败', 500);
  }
}
