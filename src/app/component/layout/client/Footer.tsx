import { Typography } from "@mui/material";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 fixed bottom-0 left-0 right-0 z-40">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Typography
              className="text-white text-xl font-bold mb-4"
              style={{ fontFamily: 'Pacifico, serif' }}
            >
              CineMax
            </Typography>
            <p className="text-sm">Hệ thống đặt vé xem phim hàng đầu Việt Nam</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Phim</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/movies?filter=now-showing"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Phim đang chiếu
                </a>
              </li>
              <li>
                <a
                  href="/movies?filter=coming-soon"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Phim sắp chiếu
                </a>
              </li>
              <li>
                <a
                  href="/movies?filter=imax"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Phim IMAX
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/help"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-teal-400 transition-colors cursor-pointer"
                >
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kết Nối</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors cursor-pointer"
              >
                <i className="ri-youtube-line text-xl"></i>
              </a>
            </div>
          </div>
        </div>

     
      </div>
    </footer>
  );
}
