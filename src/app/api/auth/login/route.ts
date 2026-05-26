import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('请填写邮箱和密码');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse('邮箱或密码错误');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return errorResponse('邮箱或密码错误');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar,
        birthday: user.birthday,
        gender: user.gender,
        loveNickname: user.loveNickname,
        comfortStyle: user.comfortStyle,
        dislikeStyle: user.dislikeStyle,
        mbti: user.mbti,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('登录失败，请稍后重试', 500);
  }
}
