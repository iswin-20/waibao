import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setTokenCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const validRoles = new Set(['waibao', 'partner']);

function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, role } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const trimmedNickname = String(nickname || '').trim();
    const normalizedRole = validRoles.has(role) ? role : 'waibao';

    if (!normalizedEmail || !password || !trimmedNickname) {
      return errorResponse('请填写必填信息');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse('请输入正确的邮箱');
    }

    if (password.length < 6) {
      return errorResponse('密码至少6位');
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return errorResponse('该邮箱已注册');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        nickname: trimmedNickname,
        role: normalizedRole,
        emailVerified: false,
        verificationToken: crypto.randomBytes(32).toString('hex'),
      },
    });

    // 异步发送验证邮件，不阻塞注册
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(normalizedEmail, user.verificationToken!);
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

    setTokenCookie(response, token);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('注册失败，请稍后重试', 500);
  }
}
