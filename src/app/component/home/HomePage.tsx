"use client";

import { useAuth } from "@/contexts/AuthContext";
import MovieStatus from "./MovieComponent/MovieStatus";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const news = [];
  for (let i = 1; i <= 3; i++) {
    news.push(
      <div
        key={"news-section" + i}
        className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group"
      >
        <a
          href={`/news/${i}`}
          className="w-full bg-center bg-no-repeat aspect-video bg-cover"
          data-alt="Three friends smiling and eating popcorn in a cinema."
          style={{
            backgroundImage:
              'url("https://tse2.mm.bing.net/th/id/OIP.Z6maLuRYdANn3IbUITwWjgHaLH?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3")',
          }}
        />
        <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
          <div>
            <span className="inline-block bg-[#FFC107] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
              KHUYẾN MÃI
            </span>
            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
              Thứ Ba Vui Vẻ - Đồng giá vé 2D
            </p>
            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
              Giảm giá vé đặc biệt chỉ trong hôm nay cho tất cả các suất chiếu phim 2D.
            </p>
          </div>
          <a className="text-primary text-sm font-bold hover:underline" href="#">
            Xem chi tiết
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-dark relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden"
        style={{ backgroundColor: "#121212" }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <main className="flex flex-1 justify-center py-5 sm:py-8">
            <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-4 sm:px-10">
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden mb-8 shadow-lg shadow-black/20">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  data-alt="A brightly lit cinema hall with red seats, viewed from the back."
                  style={{
                    backgroundImage:
                      'url("https://wallpapers.com/images/hd/cinema-theater-screen-red-interior-mdii641t9soyox58.jpg")',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10">
                  <h1 className="text-white text-3xl md:text-5xl font-bold mb-2">Phim Bom Tấn Của Tuần</h1>
                  <p className="text-[#E0E0E0] md:text-lg max-w-xl mb-4">
                    Trải nghiệm những thước phim hành động mãn nhãn và kỹ xảo đỉnh cao trên màn ảnh rộng.
                  </p>
                  <button className="flex min-w-[84px] max-w-[480px] bg-red-600 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors">
                    <span className="truncate">Đặt Vé Ngay</span>
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button className="size-2 rounded-full bg-white" />
                  <button className="size-2 rounded-full bg-white/50" />
                  <button className="size-2 rounded-full bg-white/50" />
                </div>
              </div>

              <MovieStatus />

              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-10">
                Tin Tức &amp; Ưu Đãi
              </h2>
              <div className="grid md:grid-cols-3 gap-6">{news}</div>
            </div>
          </main>

          <div className="py-16 sm:py-24 px-4 sm:px-10 w-full">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center">Tại Sao Chọn Cinema?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Đặt Vé Nhanh Chóng</h3>
                  <p className="text-[#E0E0E0]/70">Chỉ với vài thao tác đơn giản, bạn đã có thể đặt vé xem phim yêu thích.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">place</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Nhiều Rạp Chiếu</h3>
                  <p className="text-[#E0E0E0]/70">Hệ thống rạp chiếu phủ khắp toàn quốc với chất lượng hàng đầu.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Thanh Toán An Toàn</h3>
                  <p className="text-[#E0E0E0]/70">Đa dạng phương thức thanh toán với bảo mật tuyệt đối.</p>
                </div>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-[#1E1E1E]">
              <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-10 flex flex-col items-center text-center gap-6">
                <h2 className="text-white text-3xl md:text-4xl font-bold">Sẵn Sàng Trải Nghiệm?</h2>
                <p className="text-[#E0E0E0]/70 text-lg">Đăng ký ngay để nhận ưu đãi đặc biệt và điểm thành viên.</p>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal tracking-[0.015em] bg-red-700 hover:bg-red-600 transition-colors">
                  <span className="truncate">Đăng Ký Ngay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
