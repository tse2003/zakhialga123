'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import {
  faBars,
  faChevronDown,
  faPhone,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  {
    name: 'Захиалга өгөх',
    href: '/',
  },
  {
    name: 'WINIX',
    href: '/products',
  },
  {
    name: 'Цорготой ус цэвэршүүлэгч',
    href: '/tsorgo',
  },
  {
    name: 'Филтер',
    href: '/filter',
  },
  // {
  //   name: 'DS-800 Бидэ',
  //   href: '/bide',
  // },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [settings, setSettings] = useState({
    logo: '/logo2.png',
    phoneNumbers: ['7676-7576', '9007-7576', '9176-7576'],
    facebookUrl: 'https://www.facebook.com/ustsewershuulegch/',
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsContactOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    fetch('/api/settings')
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.settings) setSettings(data.settings);
      })
      .catch((error) => console.error('Header settings error:', error));
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/90 shadow-[0_4px_30px_rgba(14,116,144,0.08)] backdrop-blur-xl">
        <nav className="mx-auto flex min-h-[84px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Нүүр хуудас"
          >
            <Image
              src={settings.logo}
              alt="AQUABLUE лого"
              width={125}
              height={80}
              priority
              className="h-auto w-[100px] object-contain transition duration-300 hover:scale-105 sm:w-[120px]"
            />
          </Link>

          {/* Desktop menu */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-1 rounded-2xl bg-slate-50/80 p-1.5">
              {menuItems.map((item) => {
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block whitespace-nowrap rounded-xl px-3 py-3 text-sm font-bold transition duration-200 xl:px-4 ${
                        active
                          ? 'bg-white text-sky-700 shadow-sm ring-1 ring-sky-100'
                          : 'text-slate-600 hover:bg-white hover:text-sky-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right section */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Contact dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsContactOpen(!isContactOpen)}
                className="hidden items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200/70 transition duration-300 hover:-translate-y-0.5 hover:from-sky-700 hover:to-blue-700 hover:shadow-xl sm:flex"
                aria-expanded={isContactOpen}
                aria-haspopup="true"
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className="h-4 w-4"
                />

                Холбоо барих

                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isContactOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isContactOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setIsContactOpen(false)}
                    aria-label="Холбоо барих цэс хаах"
                  />

                  <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[300px] overflow-hidden rounded-3xl border border-sky-100 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-wider text-sky-600">
                        Захиалгын утас
                      </p>

                      <div className="mt-3 space-y-2">
                        {settings.phoneNumbers.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace('-', '')}`}
                            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 font-bold text-slate-700 shadow-sm transition hover:text-sky-700 hover:shadow-md"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="h-3.5 w-3.5"
                              />
                            </span>

                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>

                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-[#1877F2] px-4 py-3.5 font-bold text-white transition hover:bg-[#0f68d8]"
                    >
                      <FontAwesomeIcon
                        icon={faFacebook}
                        className="h-5 w-5"
                      />

                      Facebook хуудас
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Mobile contact button */}
            <a
              href={`tel:${(settings.phoneNumbers[0] ?? '').replace(/\D/g, '')}`}
              aria-label="Утасдах"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition hover:bg-sky-100 sm:hidden"
            >
              <FontAwesomeIcon
                icon={faPhone}
                className="h-4 w-4"
              />
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 lg:hidden"
              aria-label={
                isMobileMenuOpen ? 'Цэс хаах' : 'Цэс нээх'
              }
              aria-expanded={isMobileMenuOpen}
            >
              <FontAwesomeIcon
                icon={isMobileMenuOpen ? faXmark : faBars}
                className="h-5 w-5"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 top-[84px] z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`max-h-[calc(100vh-84px)] overflow-y-auto rounded-b-[30px] bg-white px-4 pb-7 pt-4 shadow-2xl transition-transform duration-300 ${
            isMobileMenuOpen
              ? 'translate-y-0'
              : '-translate-y-5'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-4 font-bold transition ${
                      active
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    {item.name}

                    <span
                      className={`text-lg ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile contact */}
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
            <p className="mb-3 text-sm font-extrabold text-sky-700">
              Холбоо барих
            </p>

            <div className="grid grid-cols-1 gap-2 min-[390px]:grid-cols-3">
              {settings.phoneNumbers.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace('-', '')}`}
                  className="rounded-xl bg-white px-2 py-3 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:text-sky-700"
                >
                  {phone}
                </a>
              ))}
            </div>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-3.5 font-bold text-white"
            >
              <FontAwesomeIcon
                icon={faFacebook}
                className="h-5 w-5"
              />

              Facebook хуудас
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
