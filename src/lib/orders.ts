import nodemailer from 'nodemailer';

import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import SiteSettings from '@/models/SiteSettings';

type NewOrder = {
  productName: string;
  optionName?: string;
  price?: string;
  phone: string;
  address: string;
  source?: string;
};

export async function createOrderAndNotify(input: NewOrder) {
  await connectToDatabase();

  const order = await Order.create({
    ...input,
    productName: input.productName.trim(),
    optionName: input.optionName?.trim() ?? '',
    price: input.price?.trim() ?? '',
    phone: input.phone.trim(),
    address: input.address.trim(),
  });

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    const settings = (await SiteSettings.findOne({ key: 'main' }).lean()) as
      | { orderEmail?: string }
      | null;

    const to = settings?.orderEmail || emailUser;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    try {
      await transporter.sendMail({
        from: emailUser,
        to,
        subject: `Шинэ захиалга - ${input.productName}`,
        text: [
          'ШИНЭ ЗАХИАЛГА',
          `Бүтээгдэхүүн: ${input.productName}`,
          input.optionName ? `Сонголт: ${input.optionName}` : '',
          input.price ? `Үнэ: ${input.price}` : '',
          `Утас: ${input.phone}`,
          `Хаяг: ${input.address}`,
          `Огноо: ${new Date().toLocaleString('mn-MN', {
            timeZone: 'Asia/Ulaanbaatar',
          })}`,
        ]
          .filter(Boolean)
          .join('\n'),
      });
    } catch (error) {
      console.error(
        'Захиалга хадгалагдсан боловч email илгээж чадсангүй:',
        error
      );
    }
  }

  return order;
}
