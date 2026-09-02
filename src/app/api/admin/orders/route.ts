import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return errorResponse(error, 'Захиалгын жагсаалт авч чадсангүй.');
  }
}
