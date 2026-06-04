import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, successResponse } from '@/lib/api-response';
import { sendRegisterCodeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) return errorResponse('请输入邮箱');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return errorResponse('请输入正确的邮箱');
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return errorResponse('该邮箱已注册');

    const latest = await prisma.registerVerificationCode.findFirst({
      where: {
        email: normalizedEmail,
        consumedAt: null,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) return errorResponse('验证码发送太频繁，请稍后再试');

    const code = generateCode();
    const record = await prisma.registerVerificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await sendRegisterCodeEmail(normalizedEmail, code);
    } catch (error) {
      await prisma.registerVerificationCode.delete({ where: { id: record.id } });
      console.error('Register code email error:', error);
      return errorResponse('验证码邮件发送失败，请检查 SMTP 配置', 500);
    }

    return successResponse({
      email: normalizedEmail,
      expiresInSeconds: 600,
      message: '验证码已发送',
    });
  } catch (error) {
    console.error('Register code error:', error);
    return errorResponse('验证码发送失败', 500);
  }
}
