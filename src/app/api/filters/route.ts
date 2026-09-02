import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import Filter from '@/models/Filter';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureSeedData();
    const filters = await Filter.find({ active: true }).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, filters });
  } catch (error) {
    return errorResponse(error, 'Фильтерийн мэдээлэл авч чадсангүй.');
  }
}
