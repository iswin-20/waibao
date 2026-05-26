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

    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return errorResponse('待办不存在', 404);
    }

    if (todo.userId !== authUser.userId) {
      return errorResponse('无权修改该待办', 403);
    }

    const body = await request.json();
    const { title, description, dueDate, priority, completed, category, repeatType } = body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (repeatType !== undefined) updateData.repeatType = repeatType;

    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }

    const updated = await prisma.todo.update({
      where: { id: params.id },
      data: updateData,
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Todo update error:', error);
    return errorResponse('更新待办失败', 500);
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

    const todo = await prisma.todo.findUnique({
      where: { id: params.id },
    });

    if (!todo) {
      return errorResponse('待办不存在', 404);
    }

    if (todo.userId !== authUser.userId) {
      return errorResponse('无权删除该待办', 403);
    }

    await prisma.todo.delete({
      where: { id: params.id },
    });

    return successResponse({ message: '待办已删除' });
  } catch (error) {
    console.error('Todo delete error:', error);
    return errorResponse('删除待办失败', 500);
  }
}
