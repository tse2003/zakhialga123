import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { ensureSeedData } from '@/lib/seed';
import Product from '@/models/Product';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await ensureSeedData();
    const products = await Product.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return errorResponse(error, 'Бүтээгдэхүүний жагсаалт авч чадсангүй.');
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await ensureSeedData();
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Бүтээгдэхүүн нэмж чадсангүй.');
  }
}
