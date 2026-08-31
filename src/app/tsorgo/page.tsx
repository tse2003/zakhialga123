'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaCheck,
  FaChevronRight,
  FaFaucet,
  FaGift,
  FaShieldAlt,
  FaTint,
  FaTools,
  FaTruck,
} from 'react-icons/fa';

type PackageOption = {
  id: string;
  name: string;
  shortName: string;
  oldPrice?: string;
  price: string;
  image: string;
  badge: string;
  description: string;
  items: string[];
};

const packageOptions: PackageOption[] = [
  {
    id: 'basic',
    name: 'AQUABLUE үндсэн багц',
    shortName: 'Үндсэн багц',
    oldPrice: '230,000₮',
    price: '125,000₮',
    image: '/tsorgo2.jpg',
    badge: 'ХЯМДРАЛ',
    description:
      'AQUABLUE Солонгос ус цэвэршүүлэгч нь крантны усан дахь байгалийн эрдэс бодисыг хадгалж, шугам хоолойноос үүсэлтэй эвгүй үнэр, амт, зэв болон бусад бохирдлыг шүүнэ.',
    items: [
      '4 үе шаттай ус цэвэршүүлэх шүүлтүүр',
      'Зэвэрдэггүй ган цорго',
      'Суурилуулах холбох хэрэгсэл',
      'Хүргэлт, суурилуулалт үнэгүй',
    ],
  },
  {
    id: 'annual',
    name: 'AQUABLUE бүтэн жилийн багц',
    shortName: 'Бүтэн жилийн багц',
    price: '210,000₮',
    image: '/tsorgo-year.png',
    badge: 'ХАМГИЙН ЭРЭЛТТЭЙ',
    description:
      'Нэг жилийн турш цэвэр, шүүсэн ус хэрэглэхэд шаардлагатай шүүлтүүр, цорго, холбох хэрэгсэл болон хяналтын картыг багтаасан иж бүрэн багц.',
    items: [
      '8 ширхэг усны шүүлтүүр',
      'Зэвэрдэггүй ган цорго',
      'Шүүлтүүр солих хяналтын карт',
      'Суурилуулах холбох хэрэгсэл',
      'Хүргэлт, суурилуулалт үнэгүй',
    ],
  },
];

const benefits = [
  {
    icon: FaTint,
    title: 'Цэвэр тунгалаг ус',
    description: 'Эвгүй үнэр, амт болон бохирдлыг шүүнэ.',
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: FaShieldAlt,
    title: '4 үе шат',
    description: 'Найдвартай цэвэршүүлэх системтэй.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FaTools,
    title: 'Үнэгүй суурилуулалт',
    description: 'Мэргэжлийн ажилтан суурилуулна.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: FaTruck,
    title: 'Үнэгүй хүргэлт',
    description: 'Захиалгыг хүргэж өгнө.',
    color: 'from-amber-400 to-orange-500',
  },
];

export default function TsorgoPage() {
  const [selectedPackageId, setSelectedPackageId] =
    useState<string>('annual');

  const selectedPackage =
    packageOptions.find(
      (packageItem) => packageItem.id === selectedPackageId
    ) ?? packageOptions[1];

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-10 sm:py-14 lg:py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <Link href="/" className="transition hover:text-sky-700">
            Нүүр хуудас
          </Link>

          <span>/</span>

          <span className="text-sky-700">
            Цорготой ус цэвэршүүлэгч
          </span>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Product image */}
          <section className="lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/90 p-4 shadow-[0_25px_70px_rgba(14,116,144,0.15)] backdrop-blur sm:p-6">
              <span
                className={`absolute left-7 top-7 z-20 rounded-full px-4 py-2 text-xs font-black tracking-wide text-white shadow-lg ${
                  selectedPackage.id === 'annual'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-200'
                    : 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-200'
                }`}
              >
                {selectedPackage.badge}
              </span>

              <div className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-[25px] bg-gradient-to-br from-sky-50 via-white to-cyan-50 sm:min-h-[650px]">
                <Image
                  key={selectedPackage.image}
                  src={selectedPackage.image}
                  alt={selectedPackage.name}
                  width={1200}
                  height={1600}
                  priority
                  className="h-auto max-h-[720px] w-full object-contain"
                />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-sky-50 p-4">
                <div>
                  <p className="text-xs font-bold text-sky-600">
                    СОНГОСОН БАГЦ
                  </p>

                  <p className="mt-1 font-black text-slate-900">
                    {selectedPackage.shortName}
                  </p>
                </div>

                <p className="shrink-0 text-2xl font-black text-sky-700">
                  {selectedPackage.price}
                </p>
              </div>
            </div>
          </section>

          {/* Product information */}
          <section>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-sky-100 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-sky-700">
                БНСУ-ын AQUABLUE
              </span>

              <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Бэлэн байгаа
              </span>
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              AQUABLUE цорготой ус цэвэршүүлэгч
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600">
              {selectedPackage.description}
            </p>

            {/* Package selection */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Багцаа сонгоно уу
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Өөрийн хэрэглээнд тохирох үнийн сонголтыг сонгоорой.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {packageOptions.map((packageItem) => {
                  const isSelected =
                    selectedPackage.id === packageItem.id;

                  return (
                    <button
                      key={packageItem.id}
                      type="button"
                      onClick={() =>
                        setSelectedPackageId(packageItem.id)
                      }
                      className={`relative overflow-hidden rounded-[24px] border-2 p-5 text-left transition duration-300 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50 shadow-xl shadow-sky-100'
                          : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-lg'
                      }`}
                    >
                      {packageItem.id === 'annual' && (
                        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-[9px] font-black text-white shadow">
                          ЭРЭЛТТЭЙ
                        </span>
                      )}

                      <span
                        className={`mb-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? 'border-sky-600 bg-sky-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </span>

                      <p className="pr-14 text-base font-black text-slate-900">
                        {packageItem.shortName}
                      </p>

                      {packageItem.oldPrice && (
                        <p className="mt-4 text-sm font-semibold text-slate-400 line-through">
                          {packageItem.oldPrice}
                        </p>
                      )}

                      <p
                        className={`text-2xl font-black text-sky-700 ${
                          packageItem.oldPrice ? '' : 'mt-4'
                        }`}
                      >
                        {packageItem.price}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected package details */}
            <div className="mt-6 overflow-hidden rounded-[28px] border border-sky-100 bg-white p-6 shadow-[0_15px_45px_rgba(14,116,144,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-sky-600">
                    Таны сонгосон багц
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    {selectedPackage.shortName}
                  </h2>
                </div>

                <div className="text-right">
                  {selectedPackage.oldPrice && (
                    <p className="text-sm font-semibold text-slate-400 line-through">
                      {selectedPackage.oldPrice}
                    </p>
                  )}

                  <p className="text-3xl font-black text-sky-700">
                    {selectedPackage.price}
                  </p>
                </div>
              </div>

              <div className="my-5 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

              <ul className="space-y-3">
                {selectedPackage.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-700"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <FaCheck size={11} />
                    </span>

                    {item}
                  </li>
                ))}
              </ul>

              {selectedPackage.id === 'annual' && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200">
                    <FaGift size={19} />
                  </span>

                  <div>
                    <p className="font-black text-slate-900">
                      Бүтэн жилийн хэрэглээ
                    </p>

                    <p className="mt-0.5 text-sm text-slate-600">
                      Нэг жилийн шүүлтүүрийн хэрэгцээг нэг дор
                      шийднэ.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order button */}
            <Link
              href={{
                pathname: '/',
                query: {
                  product: 'AQUABLUE цорготой ус цэвэршүүлэгч',
                  package: selectedPackage.shortName,
                  price: selectedPackage.price,
                },
              }}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-4 text-lg font-black text-white shadow-xl shadow-sky-200 transition duration-300 hover:-translate-y-1 hover:from-sky-700 hover:to-blue-800 hover:shadow-2xl"
            >
              {selectedPackage.price}-өөр захиалах
              <FaChevronRight size={15} />
            </Link>

            <p className="mt-3 text-center text-xs font-semibold text-slate-500">
              Хүргэлт болон суурилуулалт үнэгүй
            </p>
          </section>
        </div>

        {/* Benefits */}
        <section className="mt-14 lg:mt-20">
          <div className="mb-8 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-200">
              <FaFaucet size={20} />
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
              AQUABLUE-ийн давуу тал
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-[24px] border border-white bg-white/85 p-5 shadow-[0_15px_40px_rgba(14,116,144,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${benefit.color} text-white shadow-md`}
                  >
                    <Icon size={19} />
                  </span>

                  <h3 className="mt-4 font-black text-slate-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}