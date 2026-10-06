import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { customerId, sameOrigin } from "@/lib/customer-auth";
import Order from "@/models/Order";
import { qpay, paymentConfigured } from "@/lib/qpay";
import { errorResponse } from "@/lib/api";
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Хүсэлт зөвшөөрөгдөөгүй." },
      { status: 403 },
    );
  try {
    const accountId = await customerId(request);
    if (!accountId)
      return NextResponse.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Олдсонгүй." }, { status: 404 });
    const order = await Order.findOne({ _id: id, accountId });
    if (!order)
      return NextResponse.json({ error: "Олдсонгүй." }, { status: 404 });
    if (order.paymentStatus === "paid")
      return NextResponse.json({ success: true, paid: true });
    if (order.status === "cancelled")
      return NextResponse.json(
        { error: "Цуцлагдсан захиалга." },
        { status: 409 },
      );
    if (order.invoiceId) return NextResponse.json({ success: true });
    if (!paymentConfigured())
      return NextResponse.json(
        {
          error:
            "QR төлбөр хараахан идэвхжээгүй. Үйлчилгээний ажилтантай холбогдоно уу.",
        },
        { status: 503 },
      );
    if (!Number.isSafeInteger(order.amount) || order.amount <= 0)
      return NextResponse.json(
        { error: "Энэ захиалгын үнийг баталгаажуулах шаардлагатай." },
        { status: 409 },
      );
    const locked = await Order.findOneAndUpdate(
      {
        _id: id,
        accountId,
        invoiceState: { $exists: false },
        status: { $ne: "cancelled" },
      },
      { $set: { invoiceState: "creating" } },
    );
    if (!locked)
      return NextResponse.json(
        {
          error:
            "Нэхэмжлэх үүсгэж байна. Дахин давхар үүсгэхгүй, захиалгаа шинэчилж шалгана уу.",
        },
        { status: 409 },
      );
    const callback = new URL(
      "/api/payments/qpay/callback",
      process.env.APP_URL,
    );
    callback.searchParams.set("order", id);
    callback.searchParams.set("secret", process.env.QPAY_CALLBACK_SECRET!);
    try {
      const invoice = await qpay("/v2/invoice", {
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: id,
        invoice_receiver_code: accountId,
        invoice_description: `Захиалга ${id}`,
        amount: order.amount,
        callback_url: callback.toString(),
      });
      if (!invoice.invoice_id || !invoice.qr_image)
        throw new Error("Invalid invoice response");
      await Order.updateOne(
        { _id: id },
        {
          $set: {
            invoiceId: invoice.invoice_id,
            qrImage: invoice.qr_image,
            bankLinks: invoice.urls || [],
            invoiceState: "ready",
          },
        },
      );
      return NextResponse.json({ success: true });
    } catch (error) {
      await Order.updateOne(
        { _id: id },
        { $set: { invoiceState: "needs_review" } },
      );
      throw error;
    }
  } catch (error) {
    return errorResponse(
      error,
      "QR үүсгэж чадсангүй. Үйлчилгээний ажилтантай холбогдоно уу.",
    );
  }
}
