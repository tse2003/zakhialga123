import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, requireAdmin } from '@/lib/api';
import { cleanText, parseDate } from '@/lib/customer-data';
import { addMonthsClamped } from '@/lib/filter-schedule';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import ServiceHistory from '@/models/ServiceHistory';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const replacedAt = parseDate(body.replacedAt);
    const filterNumbers = Array.from(
      new Set(
        (Array.isArray(body.filterNumbers) ? body.filterNumbers : [])
          .map(Number)
          .filter(
            (number: number) =>
              Number.isInteger(number) && number >= 1 && number <= 4
          )
      )
    );

    if (!replacedAt || filterNumbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Сольсон огноо болон фильтерээ сонгоно уу.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Айлын бүртгэл олдсонгүй.' },
        { status: 404 }
      );
    }

    const selectedSchedules = customer.filterSchedules.filter(
      (schedule: { filterNumber: number }) =>
        filterNumbers.includes(schedule.filterNumber)
    );

    if (selectedSchedules.length !== filterNumbers.length) {
      return NextResponse.json(
        { success: false, error: 'Фильтерийн хуваарь дутуу байна.' },
        { status: 400 }
      );
    }

    const historyFilters = selectedSchedules.map(
      (schedule: {
        filterNumber: number;
        name: string;
        intervalMonths: number;
        lastChangedAt: Date;
        nextChangeAt: Date;
      }) => ({
        filterNumber: schedule.filterNumber,
        name: schedule.name,
        previousChangedAt: schedule.lastChangedAt,
        previousDueAt: schedule.nextChangeAt,
        nextChangeAt: addMonthsClamped(replacedAt, schedule.intervalMonths),
      })
    );

    for (const schedule of selectedSchedules) {
      schedule.lastChangedAt = replacedAt;
      schedule.nextChangeAt = addMonthsClamped(
        replacedAt,
        schedule.intervalMonths
      );
    }

    await customer.save();
    const service = await ServiceHistory.create({
      customer: customer._id,
      customerCode: customer.customerCode,
      customerName: customer.name,
      phone: customer.phone,
      replacedAt,
      filters: historyFilters,
      workerName: cleanText(body.workerName),
      price: Math.max(0, Number(body.price) || 0),
      paymentStatus: body.paymentStatus === 'unpaid' ? 'unpaid' : 'paid',
      notes: cleanText(body.notes),
    });

    return NextResponse.json({ success: true, customer, service });
  } catch (error) {
    return errorResponse(error, 'Фильтер сольсон мэдээлэл хадгалж чадсангүй.');
  }
}
