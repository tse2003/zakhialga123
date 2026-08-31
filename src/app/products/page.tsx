'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaBolt,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaChild,
  FaFire,
  FaGift,
  FaLeaf,
  FaShieldAlt,
  FaSnowflake,
} from 'react-icons/fa';

type ProductModel = {
  id: string;
  name: string;
  type: string;
  oldPrice: string;
  price: string;
  description: string;
  recommended?: boolean;
  images: string[];
};

const productModels: ProductModel[] = [
  {
    id: 'ts-200s',
    name: 'WINIX TS-200S',
    type: 'Намхан загвар',
    oldPrice: '1,250,000₮',
    price: '1,080,000₮',
    description:
      'Ширээ болон тавцан дээр байрлуулахад тохиромжтой авсаархан загвар.',
    recommended: true,
    images: [
      '/winix/0.png',
      '/winix/1.png',
      '/winix/2.png',
      '/winix/3.png',
      '/winix/4.png',
      '/winix/5.png',
      '/winix/6.png',
      '/winix/7.png',
      '/winix/8.png',
    ],
  },
  {
    id: 'ts-200',
    name: 'WINIX TS-200',
    type: 'Өндөр загвар',
    oldPrice: '980,000₮',
    price: '750,000₮',
    description:
      'Шалан дээр байрлуулах зориулалттай, зай бага эзлэх өндөр загвар.',
    images: ['/winixts200.jpg'],
  },
];

const features = [
  'Эко эрчим хүчний хэмнэлтийн горим нь цахилгааны хэрэглээг 30% бууруулна.',
  'Хэрэглэхэд хялбар, ойлгомжтой удирдлагатай.',
  'Хүүхэд гэмтэхээс сэргийлсэн халуун усны хамгаалалтын түгжээтэй.',
  'Халуун болон хүйтэн ус гаргах функцтэй.',
  'Зэвэрдэггүй ган усны савтай.',
  'Цорго болон усны тосгуурыг салган авч, хялбар цэвэрлэх боломжтой.',
  'Олон улсын чанарын стандартын гэрчилгээтэй 4 үе шаттай шүүлтүүртэй.',
];

const highlights = [
  {
    icon: FaBolt,
    title: '30% хэмнэлт',
    description: 'Эко эрчим хүчний горим',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: FaFire,
    title: 'Халуун ус',
    description: 'Хамгаалалтын түгжээтэй',
    color: 'from-rose-500 to-red-500',
  },
  {
    icon: FaSnowflake,
    title: 'Хүйтэн ус',
    description: 'Хүссэн үедээ цэвэр ус',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: FaShieldAlt,
    title: '4 шатлалт',
    description: 'Цэвэршүүлэх систем',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function ProductPage() {
  const [selectedModelId, setSelectedModelId] =
    useState<string>('ts-200s');

  const [mainImageIndex, setMainImageIndex] = useState(0);

  const selectedModel =
    productModels.find((model) => model.id === selectedModelId) ??
    productModels[0];

  const images = selectedModel.images;

  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setMainImageIndex(0);
  };

  const handleImageChange = (index: number) => {
    setMainImageIndex(index);
  };

  const prevImage = () => {
    setMainImageIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    );
  };

  const nextImage = () => {
    setMainImageIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-10 sm:py-14 lg:py-16">
      {/* Background */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="transition hover:text-sky-700">
            Нүүр хуудас
          </Link>

          <span>/</span>

          <span className="text-sky-700">{selectedModel.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product gallery */}
          <section>
            <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/90 p-4 shadow-[0_25px_70px_rgba(14,116,144,0.15)] backdrop-blur sm:p-6">
              <div className="absolute left-7 top-7 z-20 rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-xs font-black tracking-wide text-white shadow-lg shadow-rose-200">
                ХЯМДРАЛ
              </div>

              {/* Main image */}
              <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-[25px] bg-gradient-to-br from-stone-100 via-white to-sky-50 sm:h-[540px]">
                <div className="absolute bottom-10 h-10 w-2/5 rounded-full bg-slate-900/10 blur-2xl" />

                <Image
                  key={`${selectedModel.id}-${mainImageIndex}`}
                  src={images[mainImageIndex]}
                  alt={`${selectedModel.name} бүтээгдэхүүний зураг`}
                  width={900}
                  height={900}
                  priority
                  className={`relative z-10 h-full w-full object-contain transition duration-500 ${
                    selectedModel.id === 'ts-200'
                      ? 'p-3 sm:p-5'
                      : 'p-5 sm:p-8'
                  }`}
                />

                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Өмнөх зураг"
                      className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-sky-600 hover:text-white"
                    >
                      <FaChevronLeft size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Дараагийн зураг"
                      className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-sky-600 hover:text-white"
                    >
                      <FaChevronRight size={16} />
                    </button>

                    <div className="absolute bottom-4 right-4 z-20 rounded-full bg-slate-950/65 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                      {mainImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => handleImageChange(index)}
                      aria-label={`${index + 1}-р зургийг харах`}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1 transition sm:h-24 sm:w-24 ${
                        mainImageIndex === index
                          ? 'scale-[1.03] border-sky-500 shadow-md shadow-sky-200'
                          : 'border-slate-100 opacity-70 hover:border-sky-300 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${selectedModel.name} зураг ${index + 1}`}
                        fill
                        sizes="96px"
                        className="object-contain p-1.5"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Single tall model thumbnail */}
              {images.length === 1 && (
                <div className="mt-5 flex items-center justify-center">
                  <div className="flex items-center gap-3 rounded-2xl bg-sky-50 px-5 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />

                    <p className="text-sm font-bold text-sky-700">
                      {selectedModel.type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Product details */}
          <section className="flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-sky-700">
                Ус цэвэршүүлэгч
              </span>

              <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Бэлэн байгаа
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {selectedModel.name}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              {selectedModel.description}
            </p>

            {/* Model choices */}
            <div className="mt-7">
              <div className="mb-3">
                <h2 className="text-lg font-black text-slate-900">
                  Загвараа сонгоно уу
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Намхан болон өндөр загвараас сонгоорой.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {productModels.map((model) => {
                  const isSelected = selectedModel.id === model.id;

                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => selectModel(model.id)}
                      className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition duration-300 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50 shadow-lg shadow-sky-100'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                      }`}
                    >
                      {/* {model.recommended && (
                        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2.5 py-1 text-[9px] font-black text-white">
                          ОНЦЛОХ
                        </span>
                      )} */}

                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-sky-600 bg-sky-600'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>

                        <div>
                          <p className="pr-14 font-black text-slate-900">
                            {model.name}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {model.type}
                          </p>

                          <p className="mt-3 text-xs text-slate-400 line-through">
                            {model.oldPrice}
                          </p>

                          <p className="text-xl font-black text-sky-700">
                            {model.price}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected price */}
            <div className="mt-5 overflow-hidden rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_15px_45px_rgba(14,116,144,0.10)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Үндсэн үнэ
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-400 line-through">
                    {selectedModel.oldPrice}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-sky-700">
                    Хямдарсан үнэ
                  </p>

                  <p className="mt-1 text-3xl font-black text-sky-700 sm:text-4xl">
                    {selectedModel.price}
                  </p>
                </div>
              </div>

              {/* <div className="my-5 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200">
                  <FaGift size={22} />
                </span>

                <div>
                  <p className="font-black text-slate-900">
                    Урамшуулалт бэлэгтэй
                  </p>

                  <p className="mt-0.5 text-sm text-slate-600">
                    Бэлгийн дэлгэрэнгүй мэдээллийг захиалга өгөхдөө
                    лавлана уу.
                  </p>
                </div>
              </div> */}
            </div>

            {/* Highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}
                    >
                      <Icon size={17} />
                    </div>

                    <p className="font-black text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Order */}
            <Link
              href={{
                pathname: '/',
                query: {
                  product: selectedModel.name,
                  model: selectedModel.type,
                  price: selectedModel.price,
                },
              }}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-4 text-lg font-black text-white shadow-xl shadow-sky-200 transition duration-300 hover:-translate-y-1 hover:from-sky-700 hover:to-blue-700 hover:shadow-2xl"
            >
              {selectedModel.price}-өөр захиалах
              <FaChevronRight size={15} />
            </Link>
          </section>
        </div>

        {/* Features */}
        <section className="mt-12 overflow-hidden rounded-[32px] border border-white bg-white/85 p-6 shadow-[0_20px_60px_rgba(14,116,144,0.10)] backdrop-blur sm:p-8 lg:mt-16 lg:p-10">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200">
              <FaLeaf size={20} />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-sky-600">
                Бүтээгдэхүүний мэдээлэл
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                Үндсэн давуу талууд
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature}
                className={`flex gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50/50 ${
                  index === features.length - 1
                    ? 'md:col-span-2'
                    : ''
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <FaCheck size={12} />
                </span>

                <p className="text-sm font-semibold leading-6 text-slate-700 sm:text-base">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 p-5 text-white">
            <FaChild className="mt-1 shrink-0" size={22} />

            <div>
              <p className="font-black">
                Хүүхдийн аюулгүй байдлыг хамгаална
              </p>

              <p className="mt-1 text-sm leading-6 text-sky-50">
                Халуун усны хамгаалалтын түгжээ нь санамсаргүй
                хэрэглээнээс сэргийлэхэд тусална.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}