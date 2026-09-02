import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import Filter from '@/models/Filter';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await ensureSeedData();
    const filters = await Filter.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    return errorResponse(error, 'Фильтерийн жагсаалт авч чадсангүй.');
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await ensureSeedData();
    const filter = await Filter.create(await request.json());
    return NextResponse.json({ success: true, filter }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Фильтер нэмж чадсангүй.');
  }
}
