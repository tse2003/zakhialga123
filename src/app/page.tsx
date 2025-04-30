import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center items-center pt-40">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex justify-center">
            <h2 className="text-3xl font-bold">Захиалга өгөх</h2>
          </div>
          <h1 className="font-bold">Бүтээгдэхүүн сонгох:</h1>
          <select defaultValue="Бүтээгдэхүүн сонгох" className="select w-full">
            <option disabled={true}>Бүтээгдэхүүн сонгох</option>
            <option>WINIX TS-200s (₮1.250.000-₮1.080.000)</option>
            <option>Цорготой ус цэвэршүүлэгч(₮230.000-₮165.000)</option>
          </select>
          <h1 className="font-bold">Утасны дугаар:</h1>
          <input type="text" placeholder="Бичих" className="input input-md w-full" />
          <h1 className="font-bold">Хаяг:</h1>
          <input type="text" placeholder="Бичих" className="input input-md w-full" />
          <button className="btn btn-active btn-primary">Захиалах</button>
        </div>
      </div>
    </div>
  );
}
