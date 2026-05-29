import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      data: { message: '已退出登录' },
    });

    clearTokenCookie(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: '退出登录失败' },
      { status: 500 }
    );
  }
}
