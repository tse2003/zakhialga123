'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

type PriceOption = {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  description?: string;
  recommended?: boolean;
  items?: string[];
};

type Product = {
  _id?: string;
  id?: number;
  name: string;
  image: string;
  badge: string;
  options: PriceOption[];
};

type SiteSettings = {
  homeBadge: string;
  homeTitle: string;
  homeSubtitle: string;
};

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'WINIX TS-200s',
    image: '/ts200s.png',
    badge: 'ХЯМДРАЛ',
    options: [
      {
        id: 'winix-ts200s',
        name: 'WINIX TS-200s',
        oldPrice: '1.250.000₮',
        price: '1.080.000₮',
      },
    ],
  },
  {
    id: 2,
    name: 'Цорготой ус цэвэршүүлэгч',
    image: '/us.png',
    badge: '2 СОНГОЛТТОЙ',
    options: [
      {
        id: 'basic-package',
        name: 'Үндсэн багц',
        oldPrice: '230.000₮',
        price: '125.000₮',
        description: 'AQUABLUE 4 шатлалт ус цэвэршүүлэгч',
        items: [
          '4 ширхэг усны шүүлтүүр',
          'Зэвэрдэггүй ган цорго',
          'Холбох хэрэгсэл',
          'Хүргэлт, суурилуулалт үнэгүй',
        ],
      },
      {
        id: 'annual-package',
        name: 'Бүтэн жилийн багц',
        oldPrice: '₮316.500',
        price: '210.000₮',
        description: 'Нэг жилийн хэрэглээнд зориулсан иж бүрэн багц',
        recommended: true,
        items: [
          '8 ширхэг усны шүүлтүүр',
          'Зэвэрдэггүй ган цорго',
          'Шүүлтүүр солих хяналтын карт',
          'Холбох хэрэгсэл',
          'Хүргэлт, суурилуулалт үнэгүй',
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'WINIX TS-200',
    image: '/winixts200.jpg',
    badge: 'ХЯМДРАЛ',
    options: [
      {
        id: 'winix-ts200',
        name: 'WINIX TS-200',
        oldPrice: '1.350.000₮',
        price: '₮1.190.000',
      },
    ],
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [settings, setSettings] = useState<SiteSettings>({
    homeBadge: 'Цэвэр ус • Эрүүл хэрэглээ',
    homeTitle: 'ЗАХИАЛГА ӨГӨХ',
    homeSubtitle: 'Өөрт тохирох бүтээгдэхүүн болон үнийн багцаа сонгоорой.',
  });
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [utas, setUtas] = useState('');
  const [khayg, setKhayg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productKey = (product: Product) => product._id ?? String(product.id);
  const selectedProduct = products.find(
    (product) => productKey(product) === openDialogId
  );

  const selectedOption =
    selectedProduct?.options.find(
      (option) => option.id === selectedOptionId
    ) ?? selectedProduct?.options[0];

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((response) => response.json()),
      fetch('/api/settings').then((response) => response.json()),
    ])
      .then(([productData, settingsData]) => {
        if (productData.success && productData.products?.length) {
          setProducts(productData.products);
        }
        if (settingsData.success && settingsData.settings) {
          setSettings(settingsData.settings);
        }
      })
      .catch((error) => console.error('Database data error:', error));
  }, []);

  useEffect(() => {
    document.body.style.overflow = openDialogId ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [openDialogId]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        setOpenDialogId(null);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting]);

  const openDialog = (product: Product) => {
    setOpenDialogId(productKey(product));

    const defaultOption =
      product.options.find((option) => option.recommended) ??
      product.options[0];

    setSelectedOptionId(defaultOption.id);
    setUtas('');
    setKhayg('');
  };

  const closeDialog = () => {
    if (isSubmitting) return;

    setOpenDialogId(null);
    setSelectedOptionId('');
    setUtas('');
    setKhayg('');
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedProduct || !selectedOption) {
      toast.error('Бүтээгдэхүүн эсвэл багц сонгогдоогүй байна.');
      return;
    }

    if (!utas.trim() || !khayg.trim()) {
      toast.error('Утас болон хаягаа бүрэн бөглөнө үү.');
      return;
    }

    if (!/^[0-9+\-\s]{8,15}$/.test(utas.trim())) {
      toast.error('Утасны дугаараа зөв оруулна уу.');
      return;
    }

    const orderName = `${selectedProduct.name} - ${selectedOption.name} (${selectedOption.price})`;

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: orderName,
          optionName: selectedOption.name,
          price: selectedOption.price,
          phone: utas.trim(),
          address: khayg.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Захиалга илгээхэд алдаа гарлаа.'
        );
      }

      toast.success('Захиалга амжилттай илгээгдлээ!');

      setOpenDialogId(null);
      setSelectedOptionId('');
      setUtas('');
      setKhayg('');
    } catch (error) {
      console.error('Order error:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Алдаа гарлаа. Дахин оролдоно уу.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            padding: '14px 18px',
            fontWeight: 600,
          },
        }}
      />

      {/* Background */}
      <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-72 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm">
            {settings.homeBadge}
          </span>

          <h1 className="bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            {settings.homeTitle}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            {settings.homeSubtitle}
          </p>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const firstOption = product.options[0];
            const hasMultipleOptions = product.options.length > 1;

            return (
              <article
                key={productKey(product)}
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_15px_50px_rgba(14,116,144,0.10)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(14,116,144,0.20)]"
              >
                <span className="absolute left-7 top-7 z-10 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-extrabold tracking-wide text-white shadow-lg shadow-sky-200">
                  {product.badge}
                </span>

                {/* Image */}
                <div className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-b from-sky-50 to-white sm:h-[330px]">
                  <div className="absolute bottom-5 h-10 w-3/5 rounded-full bg-sky-900/10 blur-xl" />

                  <Image
                    src={product.image}
                    alt={product.name}
                    width={650}
                    height={650}
                    priority={productKey(product) === productKey(products[0])}
                    className="relative z-[1] h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Information */}
                <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
                  <h2 className="min-h-[56px] text-xl font-extrabold leading-7 text-slate-900">
                    {product.name}
                  </h2>

                  {hasMultipleOptions ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {product.options.map((option) => (
                        <div
                          key={option.id}
                          className={`rounded-xl border p-3 ${
                            option.recommended
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-sky-100 bg-sky-50'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-500">
                            {option.name}
                          </p>

                          <p className="mt-1 text-lg font-black text-sky-700">
                            {option.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                      {firstOption.oldPrice && (
                        <span className="text-sm font-medium text-slate-400 line-through">
                          {firstOption.oldPrice}
                        </span>
                      )}

                      <span className="text-2xl font-black text-sky-700">
                        {firstOption.price}
                      </span>
                    </div>
                  )}

                  <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  <button
                    type="button"
                    onClick={() => openDialog(product)}
                    className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-sky-200 transition duration-300 hover:from-sky-700 hover:to-blue-700 hover:shadow-xl active:scale-[0.98]"
                  >
                    {hasMultipleOptions
                      ? 'Багц сонгон захиалах'
                      : 'Захиалах'}

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Order dialog */}
      {selectedProduct && selectedOption && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`product-dialog-${selectedProduct.id}`}
          onClick={closeDialog}
        >
          <div
            className="relative my-6 max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeDialog}
              disabled={isSubmitting}
              aria-label="Цонх хаах"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl text-slate-600 shadow-md transition hover:bg-white hover:text-red-500 disabled:opacity-50"
            >
              ×
            </button>

            {/* Modal image */}
            <div className="relative flex h-[230px] items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-cyan-50">
              <div className="absolute h-44 w-44 rounded-full bg-cyan-200/40 blur-3xl" />

              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                width={550}
                height={550}
                className="relative z-10 h-full w-full object-contain p-7"
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6 text-center">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-sky-600">
                  Захиалгын мэдээлэл
                </p>

                <h2
                  id={`product-dialog-${selectedProduct.id}`}
                  className="text-2xl font-black text-slate-900"
                >
                  {selectedProduct.name}
                </h2>
              </div>

              {/* Price options */}
              {selectedProduct.options.length > 1 && (
                <div className="mb-6">
                  <p className="mb-3 text-sm font-bold text-slate-700">
                    Багцаа сонгоно уу
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedProduct.options.map((option) => {
                      const isSelected =
                        selectedOption.id === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setSelectedOptionId(option.id)
                          }
                          disabled={isSubmitting}
                          className={`relative rounded-2xl border-2 p-4 text-left transition ${
                            isSelected
                              ? 'border-sky-600 bg-sky-50 shadow-lg shadow-sky-100'
                              : 'border-slate-200 bg-white hover:border-sky-300'
                          }`}
                        >
                          {option.recommended && (
                            <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[9px] font-black text-white">
                              ЭРЭЛТТЭЙ
                            </span>
                          )}

                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                isSelected
                                  ? 'border-sky-600 bg-sky-600'
                                  : 'border-slate-300'
                              }`}
                            >
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </span>

                            <div>
                              <p className="font-black text-slate-900">
                                {option.name}
                              </p>

                              {option.oldPrice && (
                                <p className="mt-2 text-xs text-slate-400 line-through">
                                  {option.oldPrice}
                                </p>
                              )}

                              <p className="text-xl font-black text-sky-700">
                                {option.price}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected option */}
              <div className="mb-6 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-sky-600">
                      СОНГОСОН БАГЦ
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                      {selectedOption.name}
                    </p>
                  </div>

                  <p className="shrink-0 text-2xl font-black text-sky-700">
                    {selectedOption.price}
                  </p>
                </div>

                {selectedOption.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedOption.description}
                  </p>
                )}

                {selectedOption.items &&
                  selectedOption.items.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {selectedOption.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm font-semibold text-slate-700"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
                            ✓
                          </span>

                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor={`utas-${selectedProduct.id}`}
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Утасны дугаар
                  </label>

                  <input
                    id={`utas-${selectedProduct.id}`}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={utas}
                    onChange={(event) => setUtas(event.target.value)}
                    placeholder="Жишээ: 99112233"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`khayg-${selectedProduct.id}`}
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Хүргэлтийн хаяг
                  </label>

                  <textarea
                    id={`khayg-${selectedProduct.id}`}
                    value={khayg}
                    onChange={(event) => setKhayg(event.target.value)}
                    placeholder="Дүүрэг, хороо, байр, тоот"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Цуцлах
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}

                    {isSubmitting
                      ? 'Илгээж байна...'
                      : `${selectedOption.price}-өөр захиалах`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
