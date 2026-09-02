import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн олдсонгүй.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return errorResponse(error, 'Бүтээгдэхүүн шинэчилж чадсангүй.');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Бүтээгдэхүүн олдсонгүй.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Бүтээгдэхүүн устгаж чадсангүй.');
  }
}
