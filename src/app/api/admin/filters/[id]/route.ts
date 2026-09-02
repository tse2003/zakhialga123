import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import Filter from '@/models/Filter';

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
    const filter = await Filter.findByIdAndUpdate(id, await request.json(), {
      new: true,
      runValidators: true,
    });
    if (!filter) {
      return NextResponse.json({ success: false, error: 'Фильтер олдсонгүй.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, filter });
  } catch (error) {
    return errorResponse(error, 'Фильтер шинэчилж чадсангүй.');
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
    const filter = await Filter.findByIdAndDelete(id);
    if (!filter) {
      return NextResponse.json({ success: false, error: 'Фильтер олдсонгүй.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Фильтер устгаж чадсангүй.');
  }
}
