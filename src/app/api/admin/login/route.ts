import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSession,
  validAdminCredentials,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = String(body.username ?? '').trim();
    const password = String(body.password ?? '');

    if (!validAdminCredentials(username, password)) {
      return NextResponse.json(
        { success: false, error: 'Нэвтрэх нэр эсвэл нууц үг буруу байна.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, createAdminSession(), adminCookieOptions);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Нэвтрэх үед алдаа гарлаа.' },
      { status: 500 }
    );
  }
}
