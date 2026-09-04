import Image from 'next/image';

const BidePage = () => {
  const image = '/bide.jpg';

  return (
    <div className="py-10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left side: Single Image */}
          <div className="w-full">
            <Image
              src={image}
              alt="DS-800 бидэ суултуур"
              width={794}
              height={609}
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Right side: Product details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900">DS-800 БИДЭ СУУЛТУУР</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-sm font-semibold leading-7">
                - Энгийн угаалт <br/>
                - Эмэгтэй угаалт <br/>
                - Усан клизм <br/>
                - Сэнсээр хатаах халуу бүлээн устай <br/>
                - Суултуур нь мэдрэгчтэй учир хүн суухад хална <br/>
                - Усны температурыг хянах <br/>
                - Эрчим хүч хэмнэх <br/>
                - Цоргоо цэвэрлэх горимтой <br/>
                - Хүүхдийн горимтой <br/>
                💧Усны даралтаа нэмж хасна <br/>
                💧Цоргоны байрлал урагш хойш болгох гэх мэт олон үйлдэлтэй
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold">ҮНЭ:</h3>
                <p className="text-lg font-semibold">
                  - Үндсэн үнэ: 980,000₮<br />
                  - Хямдарсан үнэ: 750,000₮
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidePage;
