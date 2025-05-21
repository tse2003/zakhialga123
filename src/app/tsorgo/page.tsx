'use client'
import React from 'react';
import { FaGift } from 'react-icons/fa';

const TsorgoPage = () => {
  const image = './tsorgo2.jpg'; // ✅ Only one image

  return (
    <div className="py-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left side: Single Image */}
          <div className="w-full">
            <img
              src={image}
              alt="Product"
              className="w-full h-full "
            />
          </div>

          {/* Right side: Product details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900">AQUABLUE - ЦОРГОТОЙ УС ЦЭВЭРШҮҮЛЭГЧ</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-sm font-semibold leading-7">
              AQUABLUE Солонгос ус цэвэршүүлэгч маань крантны усанд байгаа хүний биед хэрэгтэй байгалийн эрдэс бодисыг сэргээж, шугам хоолойноос үүсэлтэй эвгүй үнэр, амт, зэв, бусад бохирдлыг шүүж усыг тань цэвэр тунгалаг, эрүүл зөөлөн болгоно.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-2xl font-bold flex items-center gap-2">
                  <FaGift size={28} /> БЭЛЭГ
                </p>
              </div> */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">ҮНЭ:</h3>
                <p className="text-lg font-semibold">
                  - Үндсэн үнэ: 230,000₮<br />
                  - Хямдарсан үнэ: 125,000₮
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TsorgoPage;
