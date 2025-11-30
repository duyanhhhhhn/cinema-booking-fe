/* eslint-disable @next/next/no-img-element */
import { Facebook, Instagram, YouTube } from "@mui/icons-material";
import { Link } from "@mui/material";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800 mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="flex items-center text-black">
                <img
                  src="/logo/logo_cinema.png"
                  alt="CineMax Logo"
                  className="h-24 sm:h-28 md:h-32 lg:h-50 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Trải nghiệm điện ảnh đỉnh cao trong tầm tay bạn.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  Liên hệ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm transition"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              Kết nối với chúng tôi
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition"
              >
                <Facebook className="w-5 h-5 text-gray-300" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition"
              >
                <Instagram className="w-5 h-5 text-gray-300" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-600 transition"
              >
                <YouTube className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Group 2 - Cinema Booking
          </p>
        </div>
      </div>
    </footer>
  );
}
