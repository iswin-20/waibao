import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function paginatedResponse(
  data: unknown[],
  total: number,
  page: number,
  pageSize: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
