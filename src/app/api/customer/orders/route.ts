import { NextRequest, NextResponse } from "next/server";
import { customerId } from "@/lib/customer-auth";
import Order from "@/models/Order";
import { errorResponse } from "@/lib/api";
export async function GET(request: NextRequest) {
  try {
    const accountId = await customerId(request);
    if (!accountId)
      return NextResponse.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
    const orders = await Order.find({ accountId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select(
        "productName optionName price amount paymentStatus status createdAt qrImage bankLinks invoiceState",
      )
      .lean();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return errorResponse(error, "Захиалга уншиж чадсангүй.");
  }
}
