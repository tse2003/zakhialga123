'use client'
import React, { useState } from 'react';

const ProductPage = () => {
  // Array of image sources
  const images = [
    './winix/0.png',
    './winix/1.png',
    './winix/2.png',
    './winix/3.png',
    './winix/4.png',
    './winix/5.png',
    './winix/6.png',
    './winix/7.png',
    './winix/8.png',
  ];

  // State to manage the current displayed image
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Function to handle image change by index
  const handleImageChange = (index: number) => {
    setMainImageIndex(index);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  // Function to go to the next image
  const nextImage = () => {
    setMainImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="py-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left side: Product images */}
          <div className="space-y-6">
            {/* Main image */}
            <div className="relative w-full h-96">
              <img
                src={images[mainImageIndex]}
                alt="Product"
                className="object-cover w-full h-full rounded-lg shadow-lg"
              />
            </div>

            {/* Navigation buttons for images */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={prevImage}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl text-gray-700 hover:bg-gray-300"
              >
                &lt;
              </button>

              <button
                onClick={nextImage}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl text-gray-700 hover:bg-gray-300"
              >
                &gt;
              </button>
            </div>

            {/* Thumbnails */}
            {/* <div className="grid grid-cols-3 gap-4 mt-4">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg shadow-md cursor-pointer"
                  onClick={() => handleImageChange(index)}
                />
              ))}
            </div> */}
          </div>

          {/* Right side: Product details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900">WINIX TS-200S</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg"> 
                <p className="text-sm font-semibold">
                    - Эко эрчим хүчний хэмнэлийн горим нь цахилгааныг 30% бууруулна <br />
                    - Хэрэглэхэд хялбар <br />
                    - Хүүхэд гэмтэхээс сэргийлсэн халуун усны түгжээ <br />
                    - Халуун, хүйтэн ус гаргах функц <br />
                    - Зэвэрдэггүй ган усны савтай <br />
                    - Хялбархан салган авч цэвэрлэх боломжтой цорго болон усны тосгуур <br />
                    - Олон улсын чанар стандартын гэрчилгээтэй 4н шатлалт цэвэршүүлэх шүүлтүүр
                </p>
            </div>

            {/* Product features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-lg font-semibold">
                    - Эко эрчим хүчний хэмнэлийн горим нь цахилгааныг 30% бууруулна <br />
                    - Хэрэглэхэд хялбар <br />
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">ҮНЭ:</h3>
                <p className="text-lg font-semibold">
                    - Үндсэн үнэ: 1,250,000₮<br />
                    - Хямдарсан үнэ: 1,080,000₮ 
                </p>
              </div>
            </div>

            
            {/* <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800">Product Dimensions</h3>
              <p className="text-gray-600">Width: 220mm | Height: 480mm | Depth: 467mm</p>
            </div> */}

            {/* Purchase Button */}
            {/* <div className="flex gap-4">
              <button className="btn btn-primary w-full md:w-auto">Add to Cart</button>
              <button className="btn btn-outline w-full md:w-auto">Buy Now</button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
