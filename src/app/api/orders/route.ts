import { NextRequest, NextResponse } from "next/server";
import { customerId, sameOrigin } from "@/lib/customer-auth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Filter from "@/models/Filter";
import { errorResponse } from "@/lib/api";
import { createOrderAndNotify } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { error: "Хүсэлт зөвшөөрөгдөөгүй." },
        { status: 403 },
      );
    const accountId = await customerId(request);
    if (!accountId)
      return NextResponse.json(
        { error: "Захиалга өгөхийн өмнө Миний бүртгэл хэсэгт нэвтэрнэ үү." },
        { status: 401 },
      );
    const body = await request.json();
    await connectToDatabase();
    let verifiedPrice = "";
    let verifiedName = "";
    let verifiedOption = "";
    const quantity = Number(body.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100)
      return NextResponse.json({ error: "Тоо ширхэг буруу." }, { status: 400 });
    if (body.filterId) {
      const filter = await Filter.findOne({ _id: body.filterId, active: true });
      if (filter) {
        verifiedPrice = filter.price;
        verifiedName = `№${filter.stage} ${filter.name} × ${quantity} ширхэг`;
        verifiedOption = filter.englishName;
      }
    } else {
      const product = await Product.findOne({
        name: String(body.productName),
        active: true,
      });
      const option = product?.options.find(
        (item: { name: string }) => item.name === String(body.optionName),
      );
      if (option) {
        verifiedPrice = option.price;
        verifiedName = product.name;
        verifiedOption = option.name;
      }
    }
    const amount = Number(verifiedPrice.replace(/[₮,\s]/g, "")) * quantity;
    if (!verifiedName || !Number.isSafeInteger(amount) || amount <= 0)
      return NextResponse.json(
        { error: "Бүтээгдэхүүний үнэ баталгаажсангүй." },
        { status: 400 },
      );
    const productName = verifiedName;
    const optionName = verifiedOption;
    const price = `${amount.toLocaleString("en-US")}₮`;
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();

    if (!productName || !phone || !address) {
      return NextResponse.json(
        {
          success: false,
          error: "Бүтээгдэхүүн, утас, хаягаа бүрэн оруулна уу.",
        },
        { status: 400 },
      );
    }
    if (!/^[0-9+\-\s]{8,15}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Утасны дугаар буруу байна." },
        { status: 400 },
      );
    }

    const key = request.headers.get("x-idempotency-key");
    if (!key || key.length > 100)
      return NextResponse.json(
        { error: "Захиалгын хүсэлтийн түлхүүр буруу." },
        { status: 400 },
      );
    const requestKey = `${accountId}:${key}`;
    const existing = await Order.findOne({ requestKey, accountId });
    if (existing)
      return NextResponse.json({ success: true, orderId: existing._id });
    const order = await createOrderAndNotify({
      requestKey,
      accountId,
      amount,
      productName,
      optionName,
      price,
      phone,
      address,
      source: "website",
    });
    return NextResponse.json(
      { success: true, orderId: order._id },
      { status: 201 },
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      const accountId = await customerId(request);
      const key = request.headers.get("x-idempotency-key");
      if (accountId && key) {
        const existing = await Order.findOne({
          requestKey: `${accountId}:${key}`,
          accountId,
        });
        if (existing)
          return NextResponse.json({ success: true, orderId: existing._id });
      }
    }
    return errorResponse(error, "Захиалга бүртгэж чадсангүй.");
  }
}
