import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const [records, total] = await Promise.all([
      prisma.periodRecord.findMany({
        where: { userId: authUser.userId },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.periodRecord.count({
        where: { userId: authUser.userId },
      }),
    ]);

    return successResponse({
      records,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Periods list error:', error);
    return errorResponse('获取经期记录失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { startDate, endDate, painLevel, mood, flowLevel, note } = await request.json();

    if (!startDate) {
      return errorResponse('开始日期不能为空');
    }

    const record = await prisma.periodRecord.create({
      data: {
        userId: authUser.userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        painLevel: painLevel || null,
        mood: mood || null,
        flowLevel: flowLevel || null,
        note: note || null,
      },
    });

    return successResponse(record, 201);
  } catch (error) {
    console.error('Period create error:', error);
    return errorResponse('创建经期记录失败', 500);
  }
}
