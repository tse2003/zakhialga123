import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
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
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-primary m-1">Холбоо барих</label>
          <div tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-64 space-y-2">
            <p className="font-semibold">📞 Утас: 7676-7576, 9007-7576, 9176-7576</p>
            <a
              href="https://www.facebook.com/ustsewershuulegch/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <FontAwesomeIcon icon={faFacebook} className="w-4 h-4 text-blue-600" />
              Facebook хуудас
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
