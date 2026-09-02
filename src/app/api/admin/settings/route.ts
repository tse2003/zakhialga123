import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import SiteSettings from '@/models/SiteSettings';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await ensureSeedData();
    const settings = await SiteSettings.findOne({ key: 'main' }).lean();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return errorResponse(error, 'Сайтын тохиргоо авч чадсангүй.');
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await ensureSeedData();
    const body = await request.json();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'main' },
      { ...body, key: 'main' },
      { new: true, runValidators: true, upsert: true }
    ).lean();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return errorResponse(error, 'Сайтын тохиргоо хадгалж чадсангүй.');
  }
}
