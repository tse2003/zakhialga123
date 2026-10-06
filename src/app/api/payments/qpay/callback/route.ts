import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { qpay } from "@/lib/qpay";
import { errorResponse } from "@/lib/api";
async function callback(request: NextRequest) {
  const expected = Buffer.from(process.env.QPAY_CALLBACK_SECRET || "");
  const supplied = Buffer.from(
    request.nextUrl.searchParams.get("secret") || "",
  );
  if (
    !expected.length ||
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = request.nextUrl.searchParams.get("order");
    if (!id || !mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order?.invoiceId)
      return NextResponse.json({ error: "Invoice not ready" }, { status: 503 });
    if (order.paymentStatus === "paid")
      return NextResponse.json({ success: true });
    const result = await qpay("/v2/payment/check", {
      object_type: "INVOICE",
      object_id: order.invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    });
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const unique = new Map<string, number>();
    for (const row of rows)
      if (
        row.payment_id &&
        row.payment_status === "PAID" &&
        row.payment_currency === "MNT" &&
        Number.isFinite(Number(row.payment_amount))
      )
        unique.set(row.payment_id, Number(row.payment_amount));
    const amount = [...unique.values()].reduce((sum, n) => sum + n, 0);
    if (amount >= order.amount && order.amount > 0)
      await Order.updateOne(
        { _id: id, paymentStatus: { $ne: "paid" } },
        {
          $set: {
            paymentStatus: "paid",
            paidAt: new Date(),
            
          },
        },
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Payment verification failed");
  }
}
export const GET = callback;
export const POST = callback;
