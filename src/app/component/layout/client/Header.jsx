"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="bg-[#E6EEF5] text-white sticky top-0 z-50 transition-all duration-500">
      <div className=" px-4 w-full">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center text-black"
            sx={{ height: "55px" }}
          >
            <Image
              src="/logo/logo1.png"
              alt="CineMax Logo"
              width={132}
              height={55}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Trang chủ
            </Link>
            <Link
              href="/movies"
              className="text-black hover:text-[#337AB7] whitespace-nowrap"
            >
              Phim
            </Link>
            <Link
              href="/cinemas"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Rạp chiếu
            </Link>
            <Link
              href="/my-tickets"
              className="text-black hover:text-[#337AB7] transition-colors whitespace-nowrap"
            >
              Vé của tôi
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-full transition-colors whitespace-nowrap cursor-pointer"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
