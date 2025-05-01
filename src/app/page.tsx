'use client';
import { useState } from 'react';
import Image from 'next/image';

const products = [
  {
    id: 1,
    name: 'WINIX TS-200s',
    price: '₮1.250.000-₮1.080.000',
    image: '/winix.png',
  },
  {
    id: 2,
    name: 'Цорготой ус цэвэршүүлэгч',
    price: '₮230.000-₮165.000',
    image: '/tsorgo.jpg',
  },
  {
    id: 3,
    name: 'DS-800 бидэ суултуур',
    price: '₮980.000-₮750.000',
    image: '/bide.png',
  },
];

export default function Home() {
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  const openDialog = (id: number) => setOpenDialogId(id);
  const closeDialog = () => setOpenDialogId(null);

  const handleSubmit = async (id: number) => {
    const phoneInput = document.querySelector<HTMLInputElement>(`#phone-${id}`);
    const addressInput = document.querySelector<HTMLInputElement>(`#address-${id}`);
    const productName = products.find((p) => p.id === id)?.name || 'Бүтээгдэхүүн';

    const utas = phoneInput?.value.trim() || '';
    const khayg = addressInput?.value.trim() || '';

    if (!utas || !khayg) {
      alert('Утас болон хаягаа бүрэн бөглөнө үү.');
      return;
    }

    const formData = new FormData();
    formData.append('utas', utas);
    formData.append('khayg', khayg);
    formData.append('product', productName);

    let route = '';
    if (id === 1) route = '/api/winix';
    else if (id === 2) route = '/api/tsorgo';
    else if (id === 3) route = '/api/bide';

    try {
      const saveRes = await fetch(route, {
        method: 'POST',
        body: formData,
      });

      if (!saveRes.ok) throw new Error('Захиалга хадгалахад алдаа гарлаа.');

      const emailRes = await fetch('/api/email-order', {
        method: 'POST',
        body: formData,
      });

      if (!emailRes.ok) throw new Error('Имэйл илгээхэд алдаа гарлаа.');

      alert('Захиалга амжилттай илгээгдлээ!');
      closeDialog();
    } catch (error) {
      console.error(error);
      alert('Алдаа гарлаа. Дахин оролдоно уу.');
    }
  };

  return (
    <div>
      <h1 className="font-bold text-center text-5xl p-5">ЗАХИАЛГА ӨГӨХ</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 pr-10 pl-10">
        {products.map((product) => (
          <div key={product.id} className="card bg-base-100 shadow-md p-6">
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={250}
              className="rounded-lg w-full h-[250px] object-cover mb-4"
            />
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="mb-4 text-gray-600">{product.price}</p>
            <button className="btn btn-primary w-full" onClick={() => openDialog(product.id)}>
              Захиалах
            </button>

            {openDialogId === product.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md border relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={250}
                    className="rounded-xl w-full h-[250px] object-cover mb-4"
                  />
                  <h2 className="text-lg font-bold text-center mb-2">
                    {product.name} - Захиалгын маягт
                  </h2>

                  <label className="font-semibold">Утасны дугаар:</label>
                  <input
                    id={`phone-${product.id}`}
                    type="text"
                    placeholder="Бичих"
                    className="input input-bordered w-full mb-3"
                  />

                  <label className="font-semibold">Хаяг:</label>
                  <input
                    id={`address-${product.id}`}
                    type="text"
                    placeholder="Бичих"
                    className="input input-bordered w-full mb-4"
                  />

                  <div className="flex justify-end gap-2">
                    <button onClick={closeDialog} className="btn btn-outline">
                      Цуцлах
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSubmit(product.id)}>
                      Илгээх
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
