import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 中间件：仅做日志或重定向，不做鉴权
// 各 API 路由内部已通过 getAuthUser() 自行验证
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
