import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import {
  CUSTOMER_COOKIE,
  hashPassword,
  checkPassword,
  tokenHash,
  customerId,
  sameOrigin,
} from "@/lib/customer-auth";
import connectToDatabase from "@/lib/mongodb";
import AuthAttempt from "@/models/AuthAttempt";
import { createHash } from "node:crypto";
import Account from "@/models/Account";
import AccountSession from "@/models/AccountSession";
import { errorResponse } from "@/lib/api";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const id = await customerId(request);
    const account = id
      ? await Account.findById(id).select("name phone").lean()
      : null;
    return NextResponse.json({ success: true, account });
  } catch (error) {
    return errorResponse(error, "Бүртгэл уншиж чадсангүй.");
  }
}
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Хүсэлт зөвшөөрөгдөөгүй." },
      { status: 403 },
    );
  try {
    const { action } = await context.params;
    await connectToDatabase();
    if (action === "logout") {
      const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
      if (token)
        await AccountSession.deleteOne({ tokenHash: tokenHash(token) });
      const response = NextResponse.json({ success: true });
      response.cookies.set(CUSTOMER_COOKIE, "", { maxAge: 0, path: "/" });
      return response;
    }
    if (!["register", "login"].includes(action))
      return NextResponse.json({ error: "Олдсонгүй." }, { status: 404 });
    const body = await request.json();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    if (
      !/^\d{8}$/.test(phone) ||
      password.length < 8 ||
      password.length > 128 ||
      (action === "register" && (!name || name.length > 100))
    )
      return NextResponse.json(
        {
          error:
            "8 оронтой утас, 8–128 тэмдэгттэй нууц үг, нэрээ зөв оруулна уу.",
        },
        { status: 400 },
      );
    const window = Math.floor(Date.now() / 900000);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    for (const identity of [phone, ip]) {
      const key = createHash("sha256")
        .update(`${identity}:${window}`)
        .digest("hex");
      let attempt;
      try {
        attempt = await AuthAttempt.findOneAndUpdate(
          { key },
          {
            $inc: { count: 1 },
            $setOnInsert: { expiresAt: new Date((window + 2) * 900000) },
          },
          { upsert: true, new: true },
        );
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        attempt = await AuthAttempt.findOneAndUpdate(
          { key },
          { $inc: { count: 1 } },
          { new: true },
        );
      }
      if (!attempt || attempt.count > 20)
        return NextResponse.json(
          { error: "Олон удаа оролдлоо. 15 минутын дараа дахин оролдоно уу." },
          { status: 429 },
        );
    }
    let account;
    if (action === "register") {
      if (await Account.exists({ phone }))
        return NextResponse.json(
          { error: "Энэ дугаар бүртгэлтэй байна." },
          { status: 409 },
        );
      account = await Account.create({
        name,
        phone,
        passwordHash: hashPassword(password),
      });
    } else {
      account = await Account.findOne({ phone }).select("+passwordHash");
      if (!account || !checkPassword(password, account.passwordHash))
        return NextResponse.json(
          { error: "Утас эсвэл нууц үг буруу." },
          { status: 401 },
        );
    }
    const token = randomBytes(32).toString("hex");
    const maxAge = 60 * 60 * 24 * 7;
    await AccountSession.create({
      tokenHash: tokenHash(token),
      accountId: account._id,
      expiresAt: new Date(Date.now() + maxAge * 1000),
    });
    const response = NextResponse.json({ success: true });
    response.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return response;
  } catch (error) {
    return errorResponse(error, "Нэвтрэх үйлдэл амжилтгүй.");
  }
}
