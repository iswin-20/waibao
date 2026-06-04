import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setTokenCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

const validRoles = new Set(['waibao', 'partner']);

function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname, role, emailCode } = await request.json();
    const normalizedEmail = normalizeEmail(email);
    const trimmedNickname = String(nickname || '').trim();
    const normalizedRole = validRoles.has(role) ? role : 'waibao';
    const normalizedCode = String(emailCode || '').trim();

    if (!normalizedEmail || !password || !trimmedNickname) {
      return errorResponse('请填写必填信息');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse('请输入正确的邮箱');
    }

    if (password.length < 6) {
      return errorResponse('密码至少6位');
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      return errorResponse('请输入 6 位邮箱验证码');
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return errorResponse('该邮箱已注册');
    }

    const verification = await prisma.registerVerificationCode.findFirst({
      where: {
        email: normalizedEmail,
        code: normalizedCode,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!verification) {
      return errorResponse('验证码错误或已过期');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      await tx.registerVerificationCode.update({
        where: { id: verification.id },
        data: { consumedAt: new Date() },
      });

      return tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          nickname: trimmedNickname,
          role: normalizedRole,
          emailVerified: true,
          verificationToken: null,
        },
      });
    });

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
    }, 201);

    setTokenCookie(response, token, request);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('注册失败，请稍后重试', 500);
  }
}
