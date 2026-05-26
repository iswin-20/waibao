import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      ok: true,
      service: 'waibao-api',
      time: new Date().toISOString(),
    },
  });
}
