import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const wish = await prisma.wish.findUnique({
      where: { id: params.id },
    });

    if (!wish) {
      return errorResponse('心愿不存在', 404);
    }

    // 允许本人或认领者修改
    if (wish.userId !== authUser.userId && wish.claimedById !== authUser.userId) {
      return errorResponse('无权修改该心愿', 403);
    }

    const body = await request.json();
    const { title, description, imageUrl, category, priority, progress, status } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (progress !== undefined) updateData.progress = progress;
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.wish.update({
      where: { id: params.id },
      data: updateData,
      include: {
        claimedBy: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Wish update error:', error);
    return errorResponse('更新心愿失败', 500);
  }
}

export const PUT = PATCH;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const wish = await prisma.wish.findUnique({
      where: { id: params.id },
    });

    if (!wish) {
      return errorResponse('心愿不存在', 404);
    }

    if (wish.userId !== authUser.userId) {
      return errorResponse('无权删除该心愿', 403);
    }

    await prisma.wish.delete({
      where: { id: params.id },
    });

    return successResponse({ message: '心愿已删除' });
  } catch (error) {
    console.error('Wish delete error:', error);
    return errorResponse('删除心愿失败', 500);
  }
}
