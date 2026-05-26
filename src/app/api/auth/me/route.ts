import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    include: {
      coupleAsUserA: {
        include: { userB: { select: { id: true, nickname: true, avatar: true } } },
      },
      coupleAsUserB: {
        include: { userA: { select: { id: true, nickname: true, avatar: true } } },
      },
    },
  });

  if (!user) return unauthorizedResponse();

  const coupleAsUserA = user.coupleAsUserA;
  const coupleAsUserB = user.coupleAsUserB;
  const couple = coupleAsUserA || coupleAsUserB;
  const partner = coupleAsUserA ? coupleAsUserA.userB : coupleAsUserB?.userA;

  return successResponse({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar,
    birthday: user.birthday,
    gender: user.gender,
    role: user.role,
    loveNickname: user.loveNickname,
    comfortStyle: user.comfortStyle,
    dislikeStyle: user.dislikeStyle,
    mbti: user.mbti,
    couple: couple ? {
      id: couple.id,
      userAId: couple.userAId,
      userBId: couple.userBId,
      bindCode: couple.bindCode,
      loveStartDate: couple.loveStartDate,
      status: couple.status,
      partner,
    } : null,
    createdAt: user.createdAt.toISOString(),
  });
}
