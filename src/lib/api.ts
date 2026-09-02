import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

export function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSession(token)) {
    return NextResponse.json(
      { success: false, error: 'Нэвтрэх шаардлагатай.' },
      { status: 401 }
    );
  }
  return null;
}

export function errorResponse(error: unknown, fallback: string) {
  console.error(error);
  return NextResponse.json({ success: false, error: fallback }, { status: 500 });
}
