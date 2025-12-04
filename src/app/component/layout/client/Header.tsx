/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import router from "next/router";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center text-black">
              <img
                src="/logo/logo_cinema.png"
                alt="CineMax Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a
              href="/"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Trang chủ
            </a>
            <a
              href="/movies"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Phim
            </a>
            <a
              href="/cinemas"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Rạp chiếu
            </a>
            <a
              href="/news"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Tin tức
            </a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <a
              href="/login"
              className="px-4 lg:px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
            >
              Đăng nhập
            </a>
            <a
              href="/register"
              className="px-4 lg:px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
            >
              Đăng ký
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 mt-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="flex flex-col gap-4 pb-4">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Rạp chiếu
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Tin tức
            </a>
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-800">
              <Link
                href="/login"
                className="w-full px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="w-full px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
              >
                Đăng ký
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
