'use client'

import Image from 'next/image';

export default function Header() {
  return (
    <div className="px-4 bg-[#337AB7] border border-gray-200">
      <div className="flex items-center justify-between h-16">
        <a
          href="/"
          className="flex items-center text-black"
          sx={{height:'55px'}}
        >
          <Image src="/logo/logo1.png" alt="CineMax Logo" width={132} height={55} sx={{
          }}/>
        </a>

        <nav className="flex space-x-8 items-center">
          <a
            href="/movies"
            className="text-black hover:text-[#337AB7] transition-colors"
          >
            
            Phim
          </a>
          <a
            href="/cinemas"
            className="text-black hover:text-[#337AB7] transition-colors"
          >
            Rạp
          </a>
          <a
            href="/my-tickets"
            className="text-black hover:text-[#337AB7] transition-colors"
          >
            Vé của tôi
          </a>
          <a
            href="/profile"
            className="text-black hover:text-[#337AB7] transition-colors"
          >
            Tài khoản
          </a>
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Đăng nhập
          </a>
        </nav>
      </div>
    </div>
  );
}
