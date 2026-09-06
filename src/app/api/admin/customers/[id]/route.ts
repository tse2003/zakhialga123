import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { cleanText, parseDate, validatePhone } from '@/lib/customer-data';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const name = cleanText(body.name);
    const phone = cleanText(body.phone);
    const alternatePhone = cleanText(body.alternatePhone);
    const address = cleanText(body.address);
    const installedAt = parseDate(body.installedAt);

    if (!name || !phone || !address || !installedAt) {
      return NextResponse.json(
        { success: false, error: 'Нэр, утас, хаяг, суурилуулсан огноог бүрэн оруулна уу.' },
        { status: 400 }
      );
    }

    if (!validatePhone(phone) || !validatePhone(alternatePhone, false)) {
      return NextResponse.json(
        { success: false, error: 'Утасны дугаарын формат буруу байна.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const customer = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        alternatePhone,
        district: cleanText(body.district),
        khoroo: cleanText(body.khoroo),
        address,
        purifierModel: cleanText(body.purifierModel),
        installedAt,
        active: body.active !== false,
        notes: cleanText(body.notes),
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Айлын бүртгэл олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return errorResponse(error, 'Айлын бүртгэл шинэчилж чадсангүй.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await connectToDatabase();
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Айлын бүртгэл олдсонгүй.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Айлын бүртгэл устгаж чадсангүй.');
  }
}

