import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export const runtime = 'nodejs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await connectToDatabase();
    const { id } = await params;
    const { status } = await request.json();
    const order = await Order.findByIdAndUpdate(id, { status }, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Захиалга олдсонгүй.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return errorResponse(error, 'Захиалгын төлөв шинэчилж чадсангүй.');
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
    await Order.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Захиалга устгаж чадсангүй.');
  }
}
