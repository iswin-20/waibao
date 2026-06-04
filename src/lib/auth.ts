import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'waibao-dev-secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

function shouldUseSecureCookie(request?: NextRequest): boolean {
  if (process.env.COOKIE_SECURE === 'true') return true;
  if (process.env.COOKIE_SECURE === 'false') return false;

  const forwardedProto = request?.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (forwardedProto) return forwardedProto === 'https';

  return request?.nextUrl.protocol === 'https:';
}

// ===== JWT Token =====
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ===== 密码哈希 =====
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== API 认证中间件 =====
export function getAuthUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) return payload;
  }

  // 也检查 cookie
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: '未登录或登录已过期' },
    { status: 401 }
  );
}

// ===== 获取 cookie 中的 token (用于服务端组件) =====
export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('token')?.value || null;
}

export function setTokenCookie(response: NextResponse, token: string, request?: NextRequest) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export function clearTokenCookie(response: NextResponse, request?: NextRequest) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
