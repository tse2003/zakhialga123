# Төгс Цэнгэг Ус — захиалгын систем

AQUABLUE болон WINIX ус цэвэршүүлэгч, шүүлтүүрийн мэдээлэл, захиалга болон удирдлагын самбарыг нэг дор ажиллуулах Next.js төсөл.

## Үндсэн боломжууд

- Бүтээгдэхүүн, үнийн сонголт болон шүүлтүүрийн каталог
- Утас, хүргэлтийн хаягтай захиалгын форм
- MongoDB-д захиалга хадгалах, Gmail-ээр мэдэгдэл илгээх
- Бүтээгдэхүүн, шүүлтүүр, захиалга, сайтын тохиргооны admin panel
- Захиалгын төлөв болон захиалгын код

## Локал орчинд ажиллуулах

Node.js 20 эсвэл түүнээс шинэ хувилбар ашиглана.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Дараа нь [http://localhost:3000](http://localhost:3000) хаягаар нээнэ. Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin).

## Орчны хувьсагч

`.env.local` файлд дараах утгуудыг тохируулна:

```dotenv
MONGODB_URI=mongodb+srv://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
AUTH_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
```

- `ADMIN_PASSWORD`-д урт, давтагдашгүй нууц үг ашиглана.
- `AUTH_SECRET`-д санамсаргүй урт утга ашиглана.
- Gmail ашиглах бол энгийн нууц үг биш App Password тохируулна.
- Бодит нууц мэдээллийг GitHub-д commit хийж болохгүй.

## Шалгалтын командууд

```bash
npm run lint
npm run typecheck
npm run build
npm run check
```

`npm run check` нь lint, production build болон TypeScript-ийг дарааллаар шалгана.

## Байршуулах

Төсөл нь API route, MongoDB болон Nodemailer ашигладаг тул Node.js сервер эсвэл serverless functions дэмждэг hosting шаардлагатай. Зөвхөн статик GitHub Pages дээр backend хэсэг ажиллахгүй.

Production hosting дээр `.env.local` файл хуулахын оронд дээрх хувьсагчдыг тухайн hosting-ийн Environment Variables/Secrets хэсэгт тохируулна.
