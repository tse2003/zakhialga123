import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { cleanText, parseDate, validatePhone } from '@/lib/customer-data';
import { createFilterSchedules } from '@/lib/filter-schedule';
import connectToDatabase from '@/lib/mongodb';
import Counter from '@/models/Counter';
import Customer from '@/models/Customer';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(2500)
      .lean();

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    return errorResponse(error, 'Айлын бүртгэл авч чадсангүй.');
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
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
    const counter = await Counter.findByIdAndUpdate(
      'customer',
      { $inc: { sequence: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const customerCode = `AQ-${String(counter.sequence).padStart(4, '0')}`;
    const customer = await Customer.create({
      customerCode,
      name,
      phone,
      alternatePhone,
      district: cleanText(body.district),
      khoroo: cleanText(body.khoroo),
      address,
      purifierModel:
        cleanText(body.purifierModel) ||
        'AQUABLUE 4 шатлалт цорготой ус цэвэршүүлэгч',
      installedAt,
      active: body.active !== false,
      notes: cleanText(body.notes),
      filterSchedules: createFilterSchedules(installedAt),
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Айлын бүртгэл үүсгэж чадсангүй.');
  }
}

