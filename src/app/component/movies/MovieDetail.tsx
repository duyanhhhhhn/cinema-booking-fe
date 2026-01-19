"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlayCircleOutline, ConfirmationNumber } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";

import { MoviePublic } from "@/types/data/movie-public";
import { MovieReview } from "@/types/data/movie-review";
import { useParams } from "next/navigation";

export default function MovieDetail() {
  const [tabValue, setTabValue] = useState<number>(0);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);
  const {id} = useParams()

  const [reviewPage, setReviewPage] = useState(1);

  const glassCard =
    "rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl";
  const glassCardSoft =
    "rounded-2xl border border-white/5 bg-black/40 shadow-[0_14px_35px_rgba(0,0,0,0.85)] backdrop-blur-lg";
  // Fetch movie details
  const dataMovieDetail = useQuery({
    ...MoviePublic.getMovieById(Number(id)),
  })
  console.log("dataMovieDetail",dataMovieDetail?.data);
  const movie = dataMovieDetail.data?.data;

  // Fetch movie reviews
  const dataMovieReviews = useQuery({
    ...MovieReview.getAllReviewByMovieId(Number(id)),
  });
  console.log("dataMovieReviews",dataMovieReviews?.data);
  const reviews = dataMovieReviews.data?.data;
  
  // Fetch movie count summary rating
  const dataMovieCountRating = useQuery({
    ...MovieReview.getCountRatingByMovieId(Number(id)),
  });
  console.log("dataMovieCountRating",dataMovieCountRating?.data);
  const reviews_rating = dataMovieCountRating.data?.data;

  console.log("reviews status:", dataMovieReviews.status, dataMovieReviews.fetchStatus, dataMovieReviews.error);
  console.log("rating status:", dataMovieCountRating.status, dataMovieCountRating.fetchStatus, dataMovieCountRating.error);


  // Cast to array by string
  const cast_list =
  (movie?.cast ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  
  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "").replace(/\/+$/, "");

  const resolveUrl = (raw?: string | null, fallback?: string) => {
    const v = typeof raw === "string" ? raw.trim() : "";
    if (!v) return fallback ?? "";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (!IMAGE_BASE) return v.startsWith("/") ? v : `/${v}`;
    return v.startsWith("/") ? `${IMAGE_BASE}${v}` : `${IMAGE_BASE}/${v}`;
  };

  return (
    <main className="">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${movie?.bannerUrl}")` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-red-950/40 backdrop-blur-md" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-32">
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/70">
              <img
                alt={`${movie?.title} Poster`}
                src={movie?.posterUrl ?? "/poster/placeholder.jpg"}
                className="h-[380px] w-[260px] object-cover md:h-[440px] md:w-[300px]"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.dataset.fallback === "1") return;
                  img.dataset.fallback = "1";
                  img.src = "/poster/poster.jpg";
                }}
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:gap-6">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {movie?.title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-200 md:text-base">{movie?.description}</p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm shadow backdrop-blur-md">
                <span className="material-symbols-outlined text-base align-middle text-yellow-400">star</span>
                <span className="font-semibold">{reviews_rating?.avgRating}</span>
                <span className="text-xs text-slate-300">/ 5</span>
              </div>

              <div className="rounded-full border border-red-400/70 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300 backdrop-blur-md">
                {reviews_rating?.avgRating}
              </div>

              <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-slate-200 backdrop-blur-md">
                {movie?.durationMinutes} phút
              </div>
            </div>
              <ul className="flex flex-wrap gap-2">
                {movie?.genre && (
                  <li
                    className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-100 backdrop-blur-md"
                  >
                    {movie?.genre}
                  </li>
                )}
              </ul>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={movie?.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-red-500/40 transition hover:bg-red-400"
              >
                <PlayCircleOutline className="material-symbols-outlined text-lg" />
                <span>Xem Trailer</span>
              </a>

              <button className="inline-flex items-center gap-2 rounded-full border border-red-400/60 bg-transparent px-5 py-2.5 text-sm font-semibold text-red-300 shadow-sm transition hover:bg-red-500/10">
                <ConfirmationNumber className="material-symbols-outlined text-lg" />
                <span>Đặt Vé Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-1 space-y-10">
              <section className={`${glassCard} p-5 md:p-6 lg:p-7`}>
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">Thông Tin Phim</h2>

                <div className="grid gap-4 text-sm text-slate-100 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <span>
                      Khởi chiếu: <span className="font-semibold text-red-300">{movie?.releaseDate}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Đạo diễn: <span className="font-semibold text-red-300">{movie?.director}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Thời lượng: <span className="font-semibold text-red-300">{movie?.durationMinutes} phút</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Đánh giá: <span className="font-semibold text-red-300">{reviews_rating?.avgRating}/5</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Ngôn ngữ: <span className="font-semibold text-red-300">{movie?.language}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Phân loại: <span className="font-semibold text-red-300">18+</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Diễn viên</h3>
                  <ul className="flex flex-wrap gap-2 text-sm">
                    {cast_list?.map((actor) => (
                      <li
                        key={actor}
                        className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100 backdrop-blur-md"
                      >
                        {actor}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Nội Dung Phim</h3>
                  <p className="text-sm leading-relaxed text-slate-200">{movie?.description}</p>
                </div>
              </section>

              <section className={`${glassCard} p-5 md:p-6 lg:p-7`}>
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">Lịch Chiếu</h2>

                <div className="space-y-4">
                  <div className={`${glassCardSoft} p-4 md:p-5`}>
                    <h4 className="text-sm font-semibold md:text-base">CGV Vincom Center</h4>
                    <p className="mt-1 text-xs text-slate-300 md:text-sm">191 Bà Triệu, Hai Bà Trưng, Hà Nội</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["10:00", "13:30", "16:45", "19:00", "21:30"].map((time) => (
                        <button
                          key={time}
                          className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur-md transition hover:border-red-400 hover:bg-red-500 hover:text-slate-950"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`${glassCardSoft} p-4 md:p-5`}>
                    <h4 className="text-sm font-semibold md:text-base">Lotte Cinema Landmark</h4>
                    <p className="mt-1 text-xs text-slate-300 md:text-sm">5B Nguyễn Du, Hai Bà Trưng, Hà Nội</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["11:15", "14:00", "17:15", "20:30"].map((time) => (
                        <button
                          key={time}
                          className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur-md transition hover:border-red-400 hover:bg-red-500 hover:text-slate-950"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
                      {/* ====== REVIEW SECTION ====== */}
<section className={`${glassCard} p-5 md:p-6 lg:p-7`}>
  <h2 className="mb-5 text-xl font-semibold md:text-2xl">
    Đánh giá & Bình luận
  </h2>

          {/* Summary */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-4 py-2 text-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-yellow-400">star</span>
              <span className="font-semibold text-slate-100">
                {reviews_rating?.avgRating ?? 0}
              </span>
              <span className="text-slate-300">/ 5</span>
            </div>

            <span className="text-sm text-slate-300">
              {reviews_rating?.avgRating} đánh giá
            </span>
          </div>

          {/* Review list */}
          {(reviews?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-400">
              Chưa có đánh giá nào cho phim này.
            </p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md"
                >
                  {/* Header */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-100">
                      Người dùng #{review.userId}
                    </span>

                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span>{review.rating}</span>
                      <span className="text-slate-300">/5</span>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-200">
                    {review.comment}
                  </p>

                  {/* Date */}
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

            </div>

            <aside className="w-full space-y-5 lg:w-80 xl:w-96">
              <section className="rounded-2xl border border-red-400/50 bg-gradient-to-br from-red-500/80 via-rose-500/80 to-red-600/80 p-[1px] shadow-[0_18px_45px_rgba(248,113,113,0.65)]">
                <div className="rounded-2xl bg-black/60 px-5 py-6 text-center backdrop-blur-2xl">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-200">Đặt Vé Nhanh</p>
                  <p className="mt-1 text-[13px] text-slate-300">
                    Chọn suất chiếu phù hợp và đặt vé chỉ với vài bước.
                  </p>

                  <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-red-500/40 transition hover:bg-red-400">
                    <span>Đặt Vé Ngay</span>
                  </button>

                  <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200/70 bg-transparent px-4 py-2.5 text-xs font-medium text-red-100 transition hover:bg-red-500/10">
                    <span>Chọn Suất Chiếu Khác</span>
                  </button>
                </div>
              </section>
              <section className={`${glassCard} p-4`}>
                <h2 className="mb-4 text-base font-semibold md:text-lg">Phim Hot</h2>

                <div className="space-y-3">
                  {[
                    { id: 2, title: "Doctor Strange in the Multiverse", genre: "Hành động, Khoa học viễn tưởng", rating: 4.5, poster: movie?.posterUrl },
                    { id: 3, title: "Spider-Man: No Way Home", genre: "Hành động, Phiêu lưu", rating: 4.7, poster: movie?.posterUrl },
                    { id: 4, title: "Guardians of the Galaxy Vol. 4", genre: "Hài hước, Viễn tưởng", rating: 4.6, poster: movie?.posterUrl },
                  ].map((item) => (
                    <button
                      key={item?.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/40 p-2 text-left shadow-[0_10px_28px_rgba(0,0,0,0.75)] backdrop-blur-lg transition hover:border-red-400/60 hover:bg-red-900/40"
                    >
                      <div className="h-16 w-12 overflow-hidden rounded-lg bg-slate-700">
                        <img src={item?.poster} alt={item?.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-semibold text-slate-50">{item?.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-300">{item?.genre}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-400">
                          <span className="material-symbols-outlined text-sm">star</span>
                          <span>{item?.rating}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
