import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const item = await prisma.wardrobeItem.findUnique({
      where: { id: params.id },
    });

    if (!item) return errorResponse('衣服不存在', 404);
    if (item.userId !== authUser.userId) return errorResponse('无权删除该衣服', 403);

    await prisma.wardrobeItem.delete({
      where: { id: params.id },
    });

    return successResponse({ message: '衣服已删除' });
  } catch (error) {
    console.error('Wardrobe delete error:', error);
    return errorResponse('删除衣服失败', 500);
  }
}
