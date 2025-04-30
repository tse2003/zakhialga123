import Image from "next/image";

export default function Header() {
  return (
    <div className="navbar bg-base-100 shadow-sm px-6 py-2">
      {/* Зүүн тал - Logo */}
      <div className="navbar-start flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={180}
          height={180}
          className="mr-2"
        />
      </div>

      {/* Төв - Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-semibold text-xl">
          <li><a>Захиалга өгөх</a></li>
          <li><a>WINIX TS-200s</a></li>
          <li><a>Цорготой ус цэвэршүүлэгч</a></li>
        </ul>
      </div>

      {/* Баруун тал - Button */}
      <div className="navbar-end">
        <a className="btn btn-primary">Холбоо барих</a>
      </div>
    </div>
  );
}
