import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// POST: Захиалгыг Gmail рүү илгээх
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const utas = formData.get("utas")?.toString();
    const khayg = formData.get("khayg")?.toString();
    const product =
      formData.get("product")?.toString() || "WINIX ус цэвэршүүлэгч";

    if (!utas || !khayg) {
      return NextResponse.json(
        {
          success: false,
          error: "Утас болон хаягаа бүрэн оруулна уу.",
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "naagii0329@gmail.com",
      subject: `Шинэ WINIX захиалга`,
      text: `
ШИНЭ ЗАХИАЛГА

Бүтээгдэхүүн: ${product}
Утас: ${utas}
Хаяг: ${khayg}

Огноо: ${new Date().toLocaleString("mn-MN")}
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Захиалга амжилттай илгээгдлээ.",
    });
  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Захиалга илгээхэд алдаа гарлаа.",
      },
      { status: 500 }
    );
  }
}