/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IPost, Post } from "@/types/data/post/post";
import { CreditCard, LocationOn, Phone } from "@mui/icons-material";
import { Banner } from "@/types/data/home/banner";
import MovieStatus from "./MovieComponent/MovieStatus";

type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED" | string;

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const data1 = useQuery(Post.getPosts());
  const posts = data1?.data?.data || [];
  const dataBanner = useQuery({
    ...Banner.objects.paginateQueryFactory()
  })
  const banners = dataBanner?.data?.data || [];
  const fullslide = [];
  const [index, setIndex] = useState(0)
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL + "/media";
  const urlPost = process.env.NEXT_PUBLIC_IMAGE_URL + "/media/post/";
  const total = banners.length;


  const next = () => setIndex((prev) => (prev + 1) % total);
  const prev = () => setIndex((prev) => (prev - 1 + total) % total);

  fullslide.push(
    <div key={"slide"} className="relative w-full overflow-hidden">

      {/* SLIDES */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div key={i} className="relative w-full flex-shrink-0">
            <img
              src={`${urlImage}${banner.imageUrl}`}
              className="w-full h-[500px] object-cover"
              alt=""
            />

            {/* TEXT */}
            <div className="absolute bottom-10 left-10 text-white max-w-xl">
              <h1 className="text-4xl font-bold mb-2">
                Phim Bom Tấn Của Tuần
              </h1>
              <p className="mb-4">
                Trải nghiệm những thước phim hành động mãn nhãn
              </p>
              <a href={`${banner.linkUrl}`} className="bg-red-600 px-6 py-3 rounded-lg font-bold">
                Đặt Vé Ngay
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* PREV */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2
                   bg-black/50 p-3 rounded-full text-white z-10
                   hover:bg-black/70 transition"
      >
        ❮
      </button>

      {/* NEXT */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2
                   bg-black/50 p-3 rounded-full text-white z-10
                   hover:bg-black/70 transition"
      >
        ❯
      </button>

      {/* INDICATORS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition
              ${i === index ? "bg-red-500" : "bg-white/50"}
            `}
          />
        ))}
      </div>
    </div>
  );
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
              <div className="grid md:grid-cols-3 gap-6">
                {
                  posts.map((post: IPost) => (
                    <div key={"news-section" + post?.id} className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group">
                      <a href={`/news/${post?.id}`}
                        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                        style={{
                          backgroundImage:
                            `url(${urlPost}${post.coverUrl})`
                        }}>
                      </a>
                      <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                        <div>
                          <span className="inline-block bg-[#FFC107] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                            {post?.category}
                          </span>
                          <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
                            {post?.title}
                          </p>
                          <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                            {post?.excerpt}
                          </p>
                        </div>
                        <a className="text-white text-sm font-bold hover:underline"
                          href={`/news/${post?.id}`}>
                          Xem chi tiết
                        </a>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </main>

          <div className="py-16 sm:py-24 px-4 sm:px-10 w-full">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center">Tại Sao Chọn Cinema?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <Phone className="text-3xl" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Đặt Vé Nhanh Chóng</h3>
                  <p className="text-[#E0E0E0]/70">Chỉ với vài thao tác đơn giản, bạn đã có thể đặt vé xem phim yêu thích.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <LocationOn className="text-3xl" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Nhiều Rạp Chiếu</h3>
                  <p className="text-[#E0E0E0]/70">Hệ thống rạp chiếu phủ khắp toàn quốc với chất lượng hàng đầu.</p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <CreditCard className="text-3xl" />
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
