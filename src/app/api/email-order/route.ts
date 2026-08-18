import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const utas = formData.get('utas')?.toString().trim();
    const khayg = formData.get('khayg')?.toString().trim();
    const product = formData.get('product')?.toString().trim();

    if (!utas || !khayg || !product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Мэдээлэл дутуу байна.',
        },
        {
          status: 400,
        }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('EMAIL_USER эсвэл EMAIL_PASS тохируулаагүй байна.');

      return NextResponse.json(
        {
          success: false,
          error: 'Email тохиргоо хийгдээгүй байна.',
        },
        {
          status: 500,
        }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      to: 'naagii0329@gmail.com',

      subject: `Шинэ захиалга - ${product}`,

      text: `
ШИНЭ ЗАХИАЛГА

Бүтээгдэхүүн: ${product}

Утас: ${utas}

Хаяг: ${khayg}

Огноо: ${new Date().toLocaleString('mn-MN', {
        timeZone: 'Asia/Ulaanbaatar',
      })}
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Захиалга амжилттай илгээгдлээ.',
    });
  } catch (error) {
    console.error('Email error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Имэйл илгээхэд алдаа гарлаа.',
      },
      {
        status: 500,
      }
    );
  }
}