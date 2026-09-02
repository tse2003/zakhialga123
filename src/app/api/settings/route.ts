import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import SiteSettings from '@/models/SiteSettings';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSeedData();
    const settings = await SiteSettings.findOne({ key: 'main' }).lean();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return errorResponse(error, 'Сайтын тохиргоо авч чадсангүй.');
  }
}
