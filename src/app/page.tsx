'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

const products = [
  {
    id: 1,
    name: 'WINIX TS-200s',
    price: '₮1.250.000 - ₮1.080.000',
    image: '/winix.png',
  },
  {
    id: 2,
    name: 'Цорготой ус цэвэршүүлэгч',
    price: '₮230.000 - ₮165.000',
    image: '/tsorgo.jpg',
  },
  {
    id: 3,
    name: 'DS-800 бидэ суултуур',
    price: '₮980.000 - ₮750.000',
    image: '/bide.png',
  },
];

export default function Home() {
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  const [utas, setUtas] = useState('');
  const [khayg, setKhayg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = (id: number) => {
    setOpenDialogId(id);
    setUtas('');
    setKhayg('');
  };

  const closeDialog = () => {
    if (isSubmitting) return;

    setOpenDialogId(null);
    setUtas('');
    setKhayg('');
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    productId: number
  ) => {
    event.preventDefault();

    const product = products.find((item) => item.id === productId);

    if (!product) {
      toast.error('Бүтээгдэхүүн олдсонгүй.');
      return;
    }

    if (!utas.trim() || !khayg.trim()) {
      toast.error('Утас болон хаягаа бүрэн бөглөнө үү.');
      return;
    }

    const formData = new FormData();

    formData.append('utas', utas.trim());
    formData.append('khayg', khayg.trim());
    formData.append('product', product.name);

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/email-order', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Захиалга илгээхэд алдаа гарлаа.'
        );
      }

      toast.success('Захиалга амжилттай илгээгдлээ!');

      setOpenDialogId(null);
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
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <h1 className="font-bold text-center text-4xl md:text-5xl p-5">
        ЗАХИАЛГА ӨГӨХ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 px-5 md:px-10">
        {products.map((product) => (
          <div
            key={product.id}
            className="card bg-white shadow-md p-6 rounded-xl"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={250}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />

            <h2 className="text-xl font-bold mb-2">
              {product.name}
            </h2>

            <p className="mb-4 text-gray-600 font-semibold">
              {product.price}
            </p>

            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => openDialog(product.id)}
            >
              Захиалах
            </button>

            {openDialogId === product.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={250}
                    className="rounded-xl w-full h-[220px] object-cover mb-4"
                  />

                  <h2 className="text-xl font-bold text-center mb-5">
                    {product.name}
                  </h2>

                  <form
                    onSubmit={(event) =>
                      handleSubmit(event, product.id)
                    }
                  >
                    <label className="block font-semibold mb-1">
                      Утасны дугаар:
                    </label>

                    <input
                      type="tel"
                      value={utas}
                      onChange={(event) =>
                        setUtas(event.target.value)
                      }
                      placeholder="Жишээ: 99112233"
                      className="input input-bordered w-full mb-4"
                      disabled={isSubmitting}
                      required
                    />

                    <label className="block font-semibold mb-1">
                      Хаяг:
                    </label>

                    <input
                      type="text"
                      value={khayg}
                      onChange={(event) =>
                        setKhayg(event.target.value)
                      }
                      placeholder="Хүргэлтийн хаягаа бичнэ үү"
                      className="input input-bordered w-full mb-5"
                      disabled={isSubmitting}
                      required
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeDialog}
                        className="btn btn-outline"
                        disabled={isSubmitting}
                      >
                        Цуцлах
                      </button>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? 'Илгээж байна...'
                          : 'Илгээх'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}