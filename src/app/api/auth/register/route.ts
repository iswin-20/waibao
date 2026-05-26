import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, role } = await request.json();

    if (!email || !password || !nickname) {
      return errorResponse('请填写必填信息');
    }

    if (password.length < 6) {
      return errorResponse('密码至少6位');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('该邮箱已注册');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        role: role || 'waibao',
        emailVerified: false,
        verificationToken: crypto.randomBytes(32).toString('hex'),
      },
    });

    // 异步发送验证邮件，不阻塞注册
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(email, user.verificationToken!);
    } catch (e) {
      console.error('验证邮件发送失败（不影响注册）:', e);
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
        createdAt: user.createdAt.toISOString(),
      },
      token,
    }, 201);

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('注册失败，请稍后重试', 500);
  }
}
