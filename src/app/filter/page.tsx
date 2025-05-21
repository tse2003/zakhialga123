import Image from "next/image";

const Filter = () => {
  return (
    <div>
      <h1 className="font-bold text-center text-5xl p-5">ФИЛТЕРҮҮД</h1>

      {/* FILTER - 1 */}
      <div className="p-4 flex justify-center">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-[750px] overflow-hidden">
          {/* Зураг хэсэг */}
          <div className="relative w-full md:w-1/2 aspect-[4/3]">
            <Image
              src="/filter/1.png"
              alt="Filter"
              fill
              className="object-contain bg-white"
            />
          </div>

          {/* Текст хэсэг */}
          <div className="flex flex-col justify-center md:w-1/2 text-left p-4">
            <h2 className="text-xl font-semibold mb-2">№1 ТУНАДАСТ ШҮҮР</h2>
            <p className="text-sm mb-3 leading-relaxed">
              Гэрийн ус цэвэрлэгчийн урьдчилсан цэвэрлэгээний шүүлтүүрийн хувьд зэв, тоос шороо, 
              элс болон бусад хог хаягдал зэрэг хамгийн жижиг бохидлыг хүртэл шүүнэ. <br />
              Энэ нь эхний шатнаас ус цэвэршүүлэх нөлөөг дээд зэргээр нэмэгдүүлж 
              дараагийн шатны ашиглалтын хугацааг нэг дахин уртасгах үүрэгтэй.
            </p>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">
                Солих хугацаа:
              </p>
              <p className="text-sm mb-3 leading-relaxed">3 сар</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">Үнэ:</p>
              <p className="text-sm mb-3 leading-relaxed">22.000₮</p>
            </div>
            <p className="text-sm mb-3 leading-relaxed">
              Усны чанар, усны температур, усны даралт зэрэг орчноос хамаарч солигдох хугацаа өөр байж болно.
            </p>
          </div>
        </div>
      </div>


      {/* FILTER - 2 */}
      <div className="p-4 flex justify-center">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-[750px] overflow-hidden">
          {/* Зураг хэсэг */}
          <div className="relative w-full md:w-1/2 aspect-[4/3]">
            <Image
              src="/filter/2.png"
              alt="Filter"
              fill
              className="object-contain bg-white"
            />
          </div>

          {/* Текст хэсэг */}
          <div className="flex flex-col justify-center md:w-1/2 text-left p-4">
            <h2 className="text-xl font-semibold mb-2">№2 НҮҮРСЭН ШҮҮР</h2>
            <p className="text-sm mb-3 leading-relaxed">
              Pre Carbon шүүлтүүр хамгийн сүүлийн үеийн технологиор боловсруулсан полипропилен материалыг ашигладаг шүүлтүүр юм. <br />
              WAQUA нь байгалиын ашигт малтмал бөгөөд байгалийн чанартай устай ойролцоо усыг үүсгэж чаддаг.
            </p>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">
                Солих хугацаа:
              </p>
              <p className="text-sm mb-3 leading-relaxed">6 сар</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">Үнэ:</p>
              <p className="text-sm mb-3 leading-relaxed">27.000₮</p>
            </div>
            <p className="text-sm mb-3 leading-relaxed">
              Усны чанар, усны температур, усны даралт зэрэг орчноос хамаарч солигдох хугацаа өөр байж болно.
            </p>
          </div>
        </div>
      </div>


      {/* FILTER - 3 */}
      <div className="p-4 flex justify-center">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-[750px] overflow-hidden">
          {/* Зураг хэсэг */}
          <div className="relative w-full md:w-1/2 aspect-[4/3]">
            <Image
              src="/filter/3.png"
              alt="Filter"
              fill
              className="object-contain bg-white"
            />
          </div>

          {/* Текст хэсэг */}
          <div className="flex flex-col justify-center md:w-1/2 text-left p-4">
            <h2 className="text-xl font-semibold mb-2">№3 UF МЕМБРАН ШҮҮР</h2>
            <p className="text-sm mb-3 leading-relaxed">
              Усан дахь нянгийн бохирдлыг шүүж хүний эрүүл мэндэл нэн шаардлагатай эрдэс бодисыг нэмэгдүүлнэ. <br />
            </p>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">
                Солих хугацаа:
              </p>
              <p className="text-sm mb-3 leading-relaxed">9 сар</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">Үнэ:</p>
              <p className="text-sm mb-3 leading-relaxed">42.000₮</p>
            </div>
            <p className="text-sm mb-3 leading-relaxed">
              Усны чанар, усны температур, усны даралт зэрэг орчноос хамаарч солигдох хугацаа өөр байж болно.
            </p>
          </div>
        </div>
      </div>


      {/* FILTER - 3 */}
      <div className="p-4 flex justify-center">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md w-full max-w-[750px] overflow-hidden">
          {/* Зураг хэсэг */}
          <div className="relative w-full md:w-1/2 aspect-[4/3]">
            <Image
              src="/filter/4.png"
              alt="Filter"
              fill
              className="object-contain bg-white"
            />
          </div>

          {/* Текст хэсэг */}
          <div className="flex flex-col justify-center md:w-1/2 text-left p-4">
            <h2 className="text-xl font-semibold mb-2">№4 ИДЭВХЖҮҮЛСЭН НҮҮРСЭН ШҮҮР</h2>
            <p className="text-sm mb-3 leading-relaxed">
              Идэвхжүүлсэн гүүхс /кокс гэх мэт материал/ шингээх аргыг ашигладаг. <br />
              Нүүрстөрөгчийн шүүлтүүр нь усанд агуулагдах үлдэгдэл хлор пестицид, хорт хавдар үүсгэгч
              зэрэг органик нэгдлүүд болон эвгүй үнэрийг шингээж, шүүж, байгальд ойрхон үүсгэдэг.
            </p>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">
                Солих хугацаа:
              </p>
              <p className="text-sm mb-3 leading-relaxed">12 сар</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-bold mb-3 leading-relaxed">Үнэ:</p>
              <p className="text-sm mb-3 leading-relaxed">32.000₮</p>
            </div>
            <p className="text-sm mb-3 leading-relaxed">
              Усны чанар, усны температур, усны даралт зэрэг орчноос хамаарч солигдох хугацаа өөр байж болно.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Filter;
