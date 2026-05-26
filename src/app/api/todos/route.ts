import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const completed = searchParams.get('completed');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = { userId: authUser.userId };

    if (completed === 'true') where.completed = true;
    else if (completed === 'false') where.completed = false;

    if (category) where.category = category;
    if (priority) where.priority = priority;

    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: [
          { completed: 'asc' },
          { priority: 'asc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.todo.count({ where }),
    ]);

    return successResponse({
      todos,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Todos list error:', error);
    return errorResponse('获取待办列表失败', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) return unauthorizedResponse();

    const { title, description, dueDate, priority, category, repeatType } = await request.json();

    if (!title) {
      return errorResponse('标题不能为空');
    }

    const todo = await prisma.todo.create({
      data: {
        userId: authUser.userId,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        category: category || null,
        repeatType: repeatType || 'none',
      },
    });

    return successResponse(todo, 201);
  } catch (error) {
    console.error('Todo create error:', error);
    return errorResponse('创建待办失败', 500);
  }
}
