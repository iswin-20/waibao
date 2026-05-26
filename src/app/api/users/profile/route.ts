import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { nickname, avatar, birthday, gender, loveNickname, comfortStyle, dislikeStyle, mbti } =
      await request.json();

    const updateData: Record<string, unknown> = {};

    if (nickname !== undefined) updateData.nickname = nickname;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (loveNickname !== undefined) updateData.loveNickname = loveNickname;
    if (comfortStyle !== undefined) updateData.comfortStyle = comfortStyle;
    if (dislikeStyle !== undefined) updateData.dislikeStyle = dislikeStyle;
    if (mbti !== undefined) updateData.mbti = mbti;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('没有要更新的字段');
    }

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    });

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
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return errorResponse('更新资料失败', 500);
  }
}

export const PUT = PATCH;
