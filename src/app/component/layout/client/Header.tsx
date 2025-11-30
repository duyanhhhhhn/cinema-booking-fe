"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#E6EEF5] text-white sticky top-0 z-50 transition-all duration-500 shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center text-black">
            <Image
              src="/logo/logo1.png"
              alt="CineMax Logo"
              width={132}
              height={55}
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Trang chủ
            </Link>

            <Link
              href="/movies"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Phim
            </Link>

            <Link
              href="/booking"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Đặt vé
            </Link>

            <Link
              href="/my-tickets"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Vé của tôi
            </Link>

            <Link
              href="/news"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Tin tức
            </Link>

            <Link
              href="/profile"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Hồ sơ
            </Link>

           
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-full transition-colors whitespace-nowrap"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 border border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white rounded-full transition-colors whitespace-nowrap"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
