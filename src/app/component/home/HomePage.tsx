"use client";

import { useAuth } from "@/contexts/AuthContext";
import { use, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/data/post/post";
import { CreditCard, LocationOn, Phone } from "@mui/icons-material";
import { Banner } from "@/types/data/home/banner";
import MovieStatus from "./MovieComponent/MovieStatus";

type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED" | string;

type IMovieCard = {
  id: number;
  title: string;
  genre?: string | null;
  posterUrl?: string | null;
  status?: MovieStatus | null;
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"dangChieu" | "sapChieu">("dangChieu");

  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl || !posterUrl.trim()) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${IMAGE_BASE}${raw}`;
    return `${IMAGE_BASE}/${raw}`;
  };

  const renderStatus = (status?: MovieStatus | null) => {
    switch (status) {
      case "NOW_SHOWING":
        return "Đang chiếu";
      case "COMING_SOON":
        return "Sắp chiếu";
      case "ENDED":
        return "Ngừng chiếu";
      default:
        return "Khác";
    }
  };

  const statusPillClass = (status?: MovieStatus | null) => {
    if (status === "NOW_SHOWING") {
      return "bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] ring-1 ring-red-400/40";
    }
    if (status === "COMING_SOON") {
      return "bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.40)] ring-1 ring-amber-300/40";
    }
    return "bg-white/10 text-white/90 ring-1 ring-white/10";
  }; 

  const data1 = useQuery(Post.getPosts());
  const posts = data1?.data?.data || [];
  const data2 = useQuery(Banner.getBanner("HOME", 3));
  const banners = data2?.data?.data || [];
  console.log("data2:", data2);
  console.log("Banners on HomePage:", banners);
  const slides = [];
  const fullslide = [];
  const old = [];
  old.push(
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
  )
  for (let i = 0; i < 3; i++) {
    slides.push(
      <div key={"slide" + i} className="hidden duration-700 ease-in-out" data-carousel-item=""
        style={{ background: `url("${banners[i]?.imageUrl}")` }}>
        <img
          src={banners[i]?.imageUrl}
          className="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
          alt="..."
        />
      </div>
    )
  }
  fullslide.push(
    <div key={"fullslide"} id="default-carousel" className="relative w-full" data-carousel="slide">
      {/* Carousel wrapper */}
      <div className="relative h-56 overflow-hidden rounded-base md:h-96">
        {slides}
        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
          <button
            type="button"
            className="w-3 h-3 rounded-base"
            aria-current="true"
            aria-label="Slide 1"
            data-carousel-slide-to={0}
          />
          <button
            type="button"
            className="w-3 h-3 rounded-base"
            aria-current="false"
            aria-label="Slide 2"
            data-carousel-slide-to={1}
          />
          <button
            type="button"
            className="w-3 h-3 rounded-base"
            aria-current="false"
            aria-label="Slide 3"
            data-carousel-slide-to={2}
          />
          <button
            type="button"
            className="w-3 h-3 rounded-base"
            aria-current="false"
            aria-label="Slide 4"
            data-carousel-slide-to={3}
          />
        </div>
        {/* Slider controls */}
        <button
          type="button"
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-prev=""
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-5 h-5 text-white rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m15 19-7-7 7-7"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button
          type="button"
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          data-carousel-next=""
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-base bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-5 h-5 text-white rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m9 5 7 7-7 7"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
    </div>
  );
  const news = [];
  for (let i = 0; i <= 2; i++) {
    news.push(
      <div key={"news-section" + i} className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group">
        <a href={`/news/${i}`}
          className="w-full bg-center bg-no-repeat aspect-video bg-cover"
          style={{
            backgroundImage:
              `url(${posts[i]?.coverUrl})`
          }}>
        </a>
        <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
          <div>
            <span className="inline-block bg-[#FFC107] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
              {posts[i]?.category}
            </span>
            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
              {posts[i]?.title}
            </p>
            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
              {posts[i]?.excerpt}
            </p>
          </div>
          <a className="text-white text-sm font-bold hover:underline"
            href={`/news/${posts[i]?.id}`}>
            Xem chi tiết
          </a>
        </div>
      </div>
    )
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
              {fullslide}

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
                    <Phone className="text-3xl"/>
                  </div>
                  <h3 className="text-white text-xl font-bold">Đặt Vé Nhanh Chóng</h3>
                  <p className="text-[#E0E0E0]/70">Chỉ với vài thao tác đơn giản, bạn đã có thể đặt vé xem phim yêu thích.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <LocationOn className="text-3xl"/>
                  </div>
                  <h3 className="text-white text-xl font-bold">Nhiều Rạp Chiếu</h3>
                  <p className="text-[#E0E0E0]/70">Hệ thống rạp chiếu phủ khắp toàn quốc với chất lượng hàng đầu.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <CreditCard className="text-3xl"/>
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
