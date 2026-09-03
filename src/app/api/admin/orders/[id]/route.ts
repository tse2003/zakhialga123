import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

import { errorResponse, requireAdmin } from '@/lib/api';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = requireAdmin(request);

  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();

    const { id } = await params;
    const { status } = await request.json();

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Захиалгын ID буруу байна.',
        },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Захиалга олдсонгүй.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return errorResponse(
      error,
      'Захиалгын төлөв шинэчилж чадсангүй.'
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  const unauthorized = requireAdmin(request);

  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Захиалгын ID буруу байна.',
        },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        {
          success: false,
          error: 'Захиалга олдсонгүй.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Захиалга амжилттай устгагдлаа.',
    });
  } catch (error) {
    return errorResponse(
      error,
      'Захиалга устгаж чадсангүй.'
    );
  }
}
