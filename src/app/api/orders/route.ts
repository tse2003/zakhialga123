import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { createOrderAndNotify } from '@/lib/orders';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const productName = String(body.productName ?? '').trim();
    const optionName = String(body.optionName ?? '').trim();
    const price = String(body.price ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const address = String(body.address ?? '').trim();

    if (!productName || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Бүтээгдэхүүн, утас, хаягаа бүрэн оруулна уу.' },
        { status: 400 }
      );
    }
    if (!/^[0-9+\-\s]{8,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Утасны дугаар буруу байна.' },
        { status: 400 }
      );
    }

    const order = await createOrderAndNotify({
      productName,
      optionName,
      price,
      phone,
      address,
      source: 'website',
    });
    return NextResponse.json({ success: true, orderId: order._id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Захиалга бүртгэж чадсангүй.');
  }
}
