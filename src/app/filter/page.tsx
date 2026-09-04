'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type FilterType = {
  _id?: string;
  id?: number;
  stage: string;
  name: string;
  englishName: string;
  image: string;
  description: string;
  duration: string;
  price: string;
  accent: 'rose' | 'green' | 'blue' | 'orange';
};

type OrderReceipt = {
  orderCode: string;
  productName: string;
  optionName: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  phone: string;
  address: string;
};

const fallbackFilters: FilterType[] = [
  {
    id: 1,
    stage: '01',
    name: 'ТУНАДАСТ ШҮҮР',
    englishName: 'SEDIMENT FILTER',
    image: '/filter/1.png',
    description:
      'Усанд агуулагдах зэв, элс, шороо, тунадас болон бусад механик бохирдлыг шүүнэ. Дараагийн шатны шүүлтүүрүүдийг хамгаалж, ашиглалтын хугацааг уртасгана.',
    duration: '3 сар',
    price: '25,000₮',
    accent: 'rose',
  },
  {
    id: 2,
    stage: '02',
    name: 'НҮҮРСЭН ШҮҮР',
    englishName: 'PRE CARBON FILTER',
    image: '/filter/4.png',
    description:
      'Усан дахь үлдэгдэл хлор, органик нэгдэл, эвгүй үнэр болон амтыг бууруулж, дараагийн шатны нарийн шүүлтүүрийн ажиллагааг хамгаална.',
    duration: '6 сар',
    price: '30,000₮',
    accent: 'green',
  },
  {
    id: 3,
    stage: '03',
    name: 'UF МЕМБРАН ШҮҮР',
    englishName: 'NANO MEMBRANE FILTER',
    image: '/filter/2.png',
    description:
      'Усанд агуулагдах нян, бичил биет болон нарийн ширхэгтэй бохирдлыг шүүн, хүний биед хэрэгтэй байгалийн эрдэс бодисыг хадгална.',
    duration: '9 сар',
    price: '45,000₮',
    accent: 'blue',
  },
  {
    id: 4,
    stage: '04',
    name: 'ИДЭВХЖҮҮЛСЭН НҮҮРСЭН ШҮҮР',
    englishName: 'POST CARBON FILTER',
    image: '/filter/3.png',
    description:
      'Цэвэршүүлэлтийн сүүлийн шатанд үлдэгдэл хлор, эвгүй үнэр болон амтыг бууруулж, усны амт чанарыг сайжруулна.',
    duration: '12 сар',
    price: '35,000₮',
    accent: 'orange',
  },
];

const accentStyles = {
  rose: {
    badge: 'bg-rose-500',
    light: 'bg-rose-50',
    text: 'text-rose-600',
    button: 'from-rose-500 to-pink-600',
    shadow: 'shadow-rose-200/60',
  },
  green: {
    badge: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    button: 'from-emerald-500 to-green-600',
    shadow: 'shadow-emerald-200/60',
  },
  blue: {
    badge: 'bg-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    button: 'from-blue-600 to-indigo-700',
    shadow: 'shadow-blue-200/60',
  },
  orange: {
    badge: 'bg-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    button: 'from-orange-500 to-amber-600',
    shadow: 'shadow-orange-200/60',
  },
};

export default function FilterPage() {
  const [filters, setFilters] = useState<FilterType[]>(fallbackFilters);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [utas, setUtas] = useState('');
  const [khayg, setKhayg] = useState('');
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] =
    useState<OrderReceipt | null>(null);
  const requestKeyRef = useRef('');

  const getPriceNumber = (price: string) =>
    Number(price.replace(/[^0-9]/g, '')) || 0;

  const formatPrice = (price: number) =>
    `${price.toLocaleString('mn-MN')}₮`;

  useEffect(() => {
    fetch('/api/filters')
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.filters?.length) setFilters(data.filters);
      })
      .catch((error) => console.error('Filter data error:', error));
  }, []);

  const openOrder = (filter: FilterType) => {
    setSelectedFilter(filter);
    setQuantity(1);
    setUtas('');
    setKhayg('');
    requestKeyRef.current = '';
  };

  const closeOrder = () => {
    if (loading) return;

    setSelectedFilter(null);
    setQuantity(1);
    setUtas('');
    setKhayg('');
    requestKeyRef.current = '';
  };

  useEffect(() => {
    document.body.style.overflow =
      selectedFilter || completedOrder ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [completedOrder, selectedFilter]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) {
        if (completedOrder) {
          setCompletedOrder(null);
        } else {
          setSelectedFilter(null);
          setQuantity(1);
          setUtas('');
          setKhayg('');
          requestKeyRef.current = '';
        }
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [completedOrder, loading]);

  const handleOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedFilter) return;

    const phoneDigits = utas.replace(/\D/g, '');
    const cleanUtas =
      phoneDigits.length === 11 && phoneDigits.startsWith('976')
        ? phoneDigits.slice(3)
        : phoneDigits;
    const cleanKhayg = khayg.trim();
    const unitPrice = getPriceNumber(selectedFilter.price);
    const totalPrice = formatPrice(unitPrice * quantity);

    if (!cleanUtas || !cleanKhayg) {
      toast.error('Утас болон хүргэлтийн хаягаа оруулна уу.');
      return;
    }

    if (!/^\d{8}$/.test(cleanUtas)) {
      toast.error('Утасны дугаараа зөв оруулна уу.');
      return;
    }

    setLoading(true);

    try {
      if (!requestKeyRef.current) {
        requestKeyRef.current =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': requestKeyRef.current,
        },
        body: JSON.stringify({
          productName: `№${selectedFilter.stage} ${selectedFilter.name} × ${quantity} ширхэг`,
          optionName: selectedFilter.englishName,
          price: totalPrice,
          unitPrice: selectedFilter.price,
          quantity,
          totalPrice,
          phone: cleanUtas,
          address: cleanKhayg,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error || 'Захиалга илгээхэд алдаа гарлаа.'
        );
      }

      const orderId = String(
        result.order?.orderId ?? result.orderId ?? ''
      );
      const fallbackCode = orderId
        ? `AQ-${orderId.slice(-8).toUpperCase()}`
        : `AQ-${Date.now().toString().slice(-8)}`;

      setCompletedOrder({
        orderCode: String(
          result.order?.orderCode ?? result.orderCode ?? fallbackCode
        ),
        productName: `№${selectedFilter.stage} ${selectedFilter.name}`,
        optionName: selectedFilter.englishName,
        unitPrice: selectedFilter.price,
        quantity,
        totalPrice,
        phone: cleanUtas,
        address: cleanKhayg,
      });

      toast.success(
        result.message || 'Таны захиалга амжилттай бүртгэгдлээ.'
      );

      setSelectedFilter(null);
      setQuantity(1);
      setUtas('');
      setKhayg('');
      requestKeyRef.current = '';
    } catch (error) {
      console.error('Захиалгын алдаа:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Захиалга илгээж чадсангүй. Дахин оролдоно уу.'
      );
    } finally {
      setLoading(false);
    }
  };

  const receiptText = completedOrder
    ? [
        'ТӨГС ЦЭНГЭГ УС — ЗАХИАЛГЫН БАТАЛГАА',
        `Захиалгын код: ${completedOrder.orderCode}`,
        `Бүтээгдэхүүн: ${completedOrder.productName}`,
        `Төрөл: ${completedOrder.optionName}`,
        `Нэгж үнэ: ${completedOrder.unitPrice}`,
        `Тоо ширхэг: ${completedOrder.quantity}`,
        `Нийт үнэ: ${completedOrder.totalPrice}`,
        `Утас: ${completedOrder.phone}`,
        `Хаяг: ${completedOrder.address}`,
        'Төлбөр: Хүргэлтийн үед',
        'Манай ажилтан утсаар холбогдож хүргэлтийн цагийг баталгаажуулна.',
        'Лавлах утас: 7676-7576',
      ].join('\n')
    : '';

  const copyReceipt = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      toast.success('Захиалгын мэдээллийг хууллаа.');
    } catch {
      toast.error('Хуулж чадсангүй. Screenshot хийж хадгална уу.');
    }
  };

  const shareReceipt = async () => {
    if (!completedOrder) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Захиалга ${completedOrder.orderCode}`,
          text: receiptText,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    await copyReceipt();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50 py-12 sm:py-16">
      {/* Background */}
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm">
            AQUABLUE • 4 үе шаттай систем
          </span>

          <h1 className="mt-5 bg-gradient-to-r from-sky-700 via-blue-600 to-cyan-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            УСНЫ ШҮҮЛТҮҮРҮҮД
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Шүүлтүүрээ тогтсон хугацаанд сольж, гэр бүлдээ өдөр бүр
            цэвэр, тунгалаг ус хэрэглээрэй.
          </p>
        </header>

        {/* Filter cards */}
        <div className="grid grid-cols-1 items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((filter) => {
            const colors = accentStyles[filter.accent];

            return (
              <article
                key={filter._id ?? filter.stage}
                className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-3 shadow-[0_15px_45px_rgba(14,116,144,0.10)] backdrop-blur transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(14,116,144,0.18)]"
              >
                {/* Image */}
                <div
                  className={`relative flex aspect-[4/5] w-full shrink-0 items-center justify-center overflow-hidden rounded-[22px] ${colors.light}`}
                >
                  <span
                    className={`absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full ${colors.badge} text-sm font-black text-white shadow-lg`}
                  >
                    {filter.stage}
                  </span>

                  <Image
                    src={filter.image}
                    alt={filter.englishName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                  <p
                    className={`text-xs font-black tracking-[0.12em] ${colors.text}`}
                  >
                    {filter.englishName}
                  </p>

                  <h2 className="mt-2 min-h-[56px] text-lg font-black leading-7 text-slate-900">
                    №{filter.stage} {filter.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {filter.description}
                  </p>

                  {/* Доод хэсгийг картын доор байрлуулна */}
                  <div className="mt-auto pt-5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold text-slate-500">
                          Солих хугацаа
                        </p>

                        <p
                          className={`mt-1 font-black ${colors.text}`}
                        >
                          {filter.duration}
                        </p>
                      </div>

                      <div
                        className={`rounded-xl ${colors.light} p-3`}
                      >
                        <p className="text-[11px] font-bold text-slate-500">
                          Үнэ
                        </p>

                        <p
                          className={`mt-1 font-black ${colors.text}`}
                        >
                          {filter.price}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openOrder(filter)}
                      className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${colors.button} px-5 py-3.5 font-bold text-white shadow-lg ${colors.shadow} transition hover:shadow-xl active:scale-[0.98]`}
                    >
                      Захиалах

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
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-[24px] border border-sky-100 bg-white/80 p-5 text-center shadow-sm backdrop-blur">
          <p className="text-sm leading-6 text-slate-600">
            Усны чанар, хэрэглээ, температур болон даралтаас
            шалтгаалан шүүлтүүр солих хугацаа өөр байж болно.
          </p>
        </div>
      </div>

      {/* Order modal */}
      {selectedFilter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-md"
          onClick={closeOrder}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            className="relative my-6 max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeOrder}
              disabled={loading}
              aria-label="Захиалгын цонх хаах"
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl text-slate-500 shadow-md transition hover:text-red-500 disabled:opacity-50"
            >
              ×
            </button>

            {/* Product image */}
            <div
              className={`relative flex h-[280px] items-center justify-center ${
                accentStyles[selectedFilter.accent].light
              }`}
            >
              <Image
                src={selectedFilter.image}
                alt={selectedFilter.name}
                width={500}
                height={650}
                className="h-full w-full object-contain p-5"
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6 text-center">
                <p
                  className={`text-xs font-black tracking-[0.15em] ${
                    accentStyles[selectedFilter.accent].text
                  }`}
                >
                  {selectedFilter.englishName}
                </p>

                <h2
                  id="order-title"
                  className="mt-2 text-2xl font-black text-slate-900"
                >
                  №{selectedFilter.stage} {selectedFilter.name}
                </h2>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
                    {selectedFilter.duration}
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-lg font-black ${
                      accentStyles[selectedFilter.accent].light
                    } ${accentStyles[selectedFilter.accent].text}`}
                  >
                    {selectedFilter.price}
                  </span>
                </div>
              </div>

              <form onSubmit={handleOrder} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Тоо ширхэг
                  </label>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.max(1, current - 1))
                      }
                      disabled={loading || quantity <= 1}
                      aria-label="Тоо ширхэг хасах"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">
                        {quantity}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        ширхэг
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuantity((current) => current + 1)}
                      disabled={loading}
                      aria-label="Тоо ширхэг нэмэх"
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-2xl font-black text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-600">
                      Нийт үнэ
                    </span>
                    <span className="text-xl font-black text-sky-700">
                      {formatPrice(
                        getPriceNumber(selectedFilter.price) * quantity
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="utas"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Холбоо барих утас
                  </label>

                  <input
                    id="utas"
                    name="utas"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={utas}
                    onChange={(event) => setUtas(event.target.value)}
                    placeholder="Жишээ: 99112233"
                    required
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="khayg"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Хүргэлтийн хаяг
                  </label>

                  <textarea
                    id="khayg"
                    name="khayg"
                    value={khayg}
                    onChange={(event) => setKhayg(event.target.value)}
                    placeholder="Дүүрэг, хороо, байр, тоот..."
                    required
                    disabled={loading}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeOrder}
                    disabled={loading}
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Цуцлах
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-[1.5] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-5 py-4 font-bold text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}

                    {loading
                      ? 'Илгээж байна...'
                      : 'Захиалга баталгаажуулах'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Free order confirmation */}
      {completedOrder && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-order-success-title"
        >
          <div className="my-6 w-full max-w-lg overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8 text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-black text-emerald-600 shadow-lg">
                ✓
              </div>

              <h2
                id="filter-order-success-title"
                className="mt-4 text-2xl font-black sm:text-3xl"
              >
                Захиалга амжилттай
              </h2>

              <p className="mt-2 text-sm font-semibold text-emerald-50">
                Таны шүүлтүүрийн захиалга системд бүртгэгдлээ.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">
                  Захиалгын код
                </p>

                <p className="mt-2 break-all text-2xl font-black tracking-wide text-sky-800">
                  {completedOrder.orderCode}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Лавлахдаа энэ кодыг хэлээрэй.
                </p>
              </div>

              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Шүүлтүүр</span>
                  <strong className="max-w-[65%] text-right text-slate-900">
                    {completedOrder.productName}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Нэгж үнэ</span>
                  <strong className="text-right text-slate-900">
                    {completedOrder.unitPrice}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Тоо ширхэг</span>
                  <strong className="text-right text-slate-900">
                    {completedOrder.quantity}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Нийт үнэ</span>
                  <strong className="text-right text-xl text-sky-700">
                    {completedOrder.totalPrice}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Утас</span>
                  <strong className="text-right text-slate-900">
                    {completedOrder.phone}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Хаяг</span>
                  <strong className="max-w-[65%] text-right text-slate-900">
                    {completedOrder.address}
                  </strong>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Төлбөр</span>
                  <strong className="text-right text-emerald-700">
                    Хүргэлтийн үед
                  </strong>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Манай ажилтан таны утас руу холбогдож хүргэлтийн цагийг
                баталгаажуулна. Урьдчилгаа төлбөр төлөх шаардлагагүй.
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={copyReceipt}
                  className="rounded-2xl border-2 border-sky-200 bg-sky-50 px-5 py-4 font-black text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  Мэдээлэл хуулах
                </button>

                <button
                  type="button"
                  onClick={shareReceipt}
                  className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-sky-200 transition hover:from-sky-700 hover:to-blue-700"
                >
                  Хуваалцах / хадгалах
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="mt-3 w-full rounded-2xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
