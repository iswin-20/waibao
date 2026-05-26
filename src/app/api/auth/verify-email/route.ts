import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  let message = '邮箱验证成功！请关闭此页面，返回登录页登录。';
  let success = true;

  if (!token) {
    message = '缺少验证令牌';
    success = false;
  } else {
    try {
      const user = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      if (!user) {
        message = '验证链接无效或已过期';
        success = false;
      } else if (user.emailVerified) {
        message = '该邮箱已验证，请直接登录';
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true, verificationToken: null },
        });
      }
    } catch {
      message = '验证失败，请稍后重试';
      success = false;
    }
  }

  const icon = success ? '✅' : '❌';
  const title = success ? '验证成功' : '验证失败';
  const color = success ? '#22c55e' : '#ef4444';

  return new Response(
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title} - 歪宝小窝</title></head>
<body style="margin:0;padding:0;font-family:'PingFang SC','Microsoft YaHei',sans-serif;background:#FFF8F0;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="background:white;border-radius:20px;padding:40px;text-align:center;max-width:360px;width:90%;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
    <div style="font-size:48px;margin-bottom:16px;">${icon}</div>
    <h1 style="font-size:22px;color:#4A3728;margin:0 0 8px;">${title}</h1>
    <p style="color:#9C8B7A;font-size:14px;margin:0 0 24px;line-height:1.6;">${message}</p>
    <a href="/login" style="display:inline-block;background:linear-gradient(135deg,#FF9B9B,#FFC3A0);color:white;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:bold;">返回登录</a>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}
