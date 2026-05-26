import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const diary = await prisma.diary.findUnique({
      where: { id: params.id },
    });

    if (!diary) {
      return errorResponse('日记不存在', 404);
    }

    if (diary.userId !== authUser.userId) {
      return errorResponse('无权访问该日记', 403);
    }

    return successResponse(diary);
  } catch (error) {
    console.error('Diary get error:', error);
    return errorResponse('获取日记失败', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const diary = await prisma.diary.findUnique({
      where: { id: params.id },
    });

    if (!diary) {
      return errorResponse('日记不存在', 404);
    }

    if (diary.userId !== authUser.userId) {
      return errorResponse('无权删除该日记', 403);
    }

    await prisma.diary.delete({
      where: { id: params.id },
    });

    return successResponse({ message: '日记已删除' });
  } catch (error) {
    console.error('Diary delete error:', error);
    return errorResponse('删除日记失败', 500);
  }
}
