import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { customerId } from "@/lib/customer-auth";
import Order from "@/models/Order";
import { errorResponse } from "@/lib/api";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const accountId = await customerId(request);
    if (!accountId) return NextResponse.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Захиалга олдсонгүй." }, { status: 404 });
    const order = await Order.findOne({ _id: id, accountId })
      .select("productName optionName price paymentStatus status qrImage bankLinks")
      .lean();
    if (!order) return NextResponse.json({ error: "Захиалга олдсонгүй." }, { status: 404 });
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return errorResponse(error, "Төлбөрийн мэдээлэл уншиж чадсангүй.");
  }
}
