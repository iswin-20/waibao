import { NextRequest } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    let email: string | null = null;

    // 优先从请求体获取邮箱
    const body = await request.json().catch(() => ({}));
    email = body.email || null;

    // 如果请求体没有邮箱，尝试从 token 获取用户
    if (!email) {
      const authUser = getAuthUser(request);
      if (!authUser) return unauthorizedResponse();
      email = authUser.email;
    }

    if (!email) {
      return errorResponse('请提供邮箱地址');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse('该邮箱未注册');
    }

    if (user.emailVerified) {
      return successResponse({ message: '该邮箱已验证，无需重新发送' });
    }

    // 生成新的验证 token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // 尝试发送验证邮件
    try {
      await sendVerificationEmail(email, verificationToken);
      return successResponse({ message: '验证邮件已发送，请查收' });
    } catch (emailError: any) {
      const errorMsg = emailError?.message || '未知错误';
      console.error('Resend verification email failed:', errorMsg);
      return errorResponse(`邮件发送失败: ${errorMsg}`, 500);
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return errorResponse('操作失败，请稍后重试', 500);
  }
}
