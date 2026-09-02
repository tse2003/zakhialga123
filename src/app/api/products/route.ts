import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import Product from '@/models/Product';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await ensureSeedData();
    const category = request.nextUrl.searchParams.get('category');
    const query: Record<string, unknown> = { active: true };
    if (category) query.category = category;

    const products = await Product.find(query).sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return errorResponse(error, 'Бүтээгдэхүүний мэдээлэл авч чадсангүй.');
  }
}
