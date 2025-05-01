import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const utas = formData.get('utas')?.toString();
  const khayg = formData.get('khayg')?.toString();
  const product = formData.get('product')?.toString();

  if (!utas || !khayg || !product) {
    return NextResponse.json({ success: false, error: 'Incomplete data' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'naagii0329@gmail.com', // 🔁 өөрийн хүлээн авах Gmail
    subject: `Захиалга: ${product}`,
    text: `Бүтээгдэхүүн: ${product}\nУтас: ${utas}\nХаяг: ${khayg}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 500 });
  }
}
