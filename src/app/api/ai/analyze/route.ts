import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { analyzeEmotion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { diaryContent, moodScore, isPeriod, consecutiveLowDays, diaryId } = await request.json();

    if (!diaryContent) {
      return errorResponse('日记内容不能为空');
    }

    const result = await analyzeEmotion(diaryContent, moodScore, isPeriod, consecutiveLowDays);

    if (diaryId) {
      const diary = await prisma.diary.findUnique({
        where: { id: diaryId },
        select: { userId: true },
      });

      if (!diary) {
        return errorResponse('日记不存在', 404);
      }

      if (diary.userId !== authUser.userId) {
        return errorResponse('无权更新该日记', 403);
      }

      await prisma.diary.update({
        where: { id: diaryId },
        data: {
          aiComfortText: result.comfortText,
          emotionLevel: result.emotionLevel,
          emotionType: result.emotionType,
          notifyPartner: result.notifyPartner,
        },
      });
    }

    // 如果需要通知伴侣且用户已绑定，创建通知
    if (result.notifyPartner) {
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
          await prisma.notification.create({
            data: {
              userId: partnerId,
              senderId: authUser.userId,
              type: 'emotion_alert',
              title: '歪宝情绪提醒',
              content: result.boyfriendMessage || '歪宝今天好像有点不开心，快去关心一下吧',
              read: false,
            },
          });
        }
      }
    }

    return successResponse(result);
  } catch (error) {
    console.error('AI analyze error:', error);
    return errorResponse('情绪分析失败', 500);
  }
}
