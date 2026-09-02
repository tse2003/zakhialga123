import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  return NextResponse.json({ success: true, authenticated: true });
}
