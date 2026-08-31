import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// POST: Филтерийн захиалгыг Gmail рүү илгээх
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const utas = formData.get("utas")?.toString();
    const khayg = formData.get("khayg")?.toString();
    const product = formData.get("product")?.toString();

    if (!utas || !khayg || !product) {
      return NextResponse.json(
        {
          success: false,
          error: "Бүтээгдэхүүн, утас болон хаягаа бүрэн оруулна уу.",
        },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        {
          success: false,
          error: "Имэйлийн тохиргоо дутуу байна.",
        },
        { status: 500 }
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
      subject: `Шинэ ФИЛТЕР захиалга: ${product}`,
      text: `
ШИНЭ ФИЛТЕРИЙН ЗАХИАЛГА

Бүтээгдэхүүн: ${product}
Утас: ${utas}
Хаяг: ${khayg}

Огноо: ${new Date().toLocaleString("mn-MN", {
        timeZone: "Asia/Ulaanbaatar",
      })}
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