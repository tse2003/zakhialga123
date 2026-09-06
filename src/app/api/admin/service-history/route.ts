import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import ServiceHistory from '@/models/ServiceHistory';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const services = await ServiceHistory.find()
      .sort({ replacedAt: -1, createdAt: -1 })
      .limit(2000)
      .lean();

    return NextResponse.json({ success: true, services });
  } catch (error) {
    return errorResponse(error, 'Үйлчилгээний түүх авч чадсангүй.');
  }
}

