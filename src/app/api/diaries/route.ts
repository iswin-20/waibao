import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

function parseStartDate(date: string): Date {
  return new Date(date);
}

function parseEndDate(date: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(`${date}T23:59:59.999`);
  }
  return new Date(date);
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: authUser.userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = parseStartDate(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = parseEndDate(endDate);
    }

    const [diaries, total] = await Promise.all([
      prisma.diary.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.diary.count({ where }),
    ]);

    return successResponse({
      diaries,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Diaries list error:', error);
    return errorResponse('获取日记列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { content, moodScore, date } = await request.json();

    if (!content) {
      return errorResponse('日记内容不能为空');
    }

    const diary = await prisma.diary.create({
      data: {
        userId: authUser.userId,
        content,
        moodScore: moodScore ?? null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return successResponse(diary, 201);
  } catch (error) {
    console.error('Diary create error:', error);
    return errorResponse('创建日记失败', 500);
  }
}
