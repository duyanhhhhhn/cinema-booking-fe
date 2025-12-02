"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircleOutline,
  ConfirmationNumber
} from "@mui/icons-material";

interface MovieDetailProps {
  movieId: string;
}

export default function MovieDetail({ movieId }: MovieDetailProps) {
  const [tabValue, setTabValue] = useState<number>(0);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);

  // Sample data - replace with API call
  const movie = {
    id: movieId || 1,
    title: "Avengers: Secret Wars",
    description:
      "Cuộc chiến cuối cùng của vũ trụ Marvel với những siêu anh hùng yêu thích. Đây là bộ phim epic nhất từ trước đến nay với nhiều tình tiết bất ngờ và hiệu ứng đặc biệt đỉnh cao.",
    fullDescription:
      "Trong phần cuối của loạt phim Avengers, các siêu anh hùng phải đoàn kết để chống lại kẻ thù mạnh nhất từ trước đến nay. Với sự tham gia của tất cả các nhân vật yêu thích từ Marvel Cinematic Universe, Avengers: Secret Wars hứa hẹn sẽ là một trải nghiệm điện ảnh không thể bỏ lỡ.",
    poster: "/poster/poster.jpg",
    trailer: "https://www.youtube.com/embed/example",
    rating: 4.8,
    duration: 180,
    format: "IMAX",
    genre: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    director: "Kevin Feige",
    cast: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Scarlett Johansson",
      "Mark Ruffalo",
    ],
    releaseDate: "2024-01-15",
    language: "Tiếng Anh - Phụ đề Việt",
    ageRating: "C18",
    reviews: [
      {
        user: "Nguyễn Văn A",
        rating: 5,
        comment: "Phim tuyệt vời! Hiệu ứng đỉnh cao.",
        date: "2024-01-20",
      },
      {
        user: "Trần Thị B",
        rating: 4,
        comment: "Câu chuyện hay nhưng hơi dài.",
        date: "2024-01-19",
      },
    ],
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
    {/* HERO */}
    <section className="relative overflow-hidden">
      {/* background poster */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${movie.poster}")` }}
      />
      {/* overlay làm mờ + tối */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/40 backdrop-blur-sm" />

      {/* content hero */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-32">
        {/* poster bên trái */}
        <div className="flex justify-center md:justify-start">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
            <img
              alt={`${movie.title} Poster`}
              src={movie.poster}
              className="h-[380px] w-[260px] object-cover md:h-[440px] md:w-[300px]"
            />
          </div>
        </div>

        {/* info bên phải */}
        <div className="flex flex-1 flex-col gap-4 md:gap-6">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {movie.title}
          </h1>

          <p className="max-w-2xl text-sm text-slate-200 md:text-base">
            {movie.description}
          </p>

          {/* meta: rating, độ tuổi, thời lượng */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* rating */}
            <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm shadow">
              <span className="material-symbols-outlined text-base align-middle text-yellow-400">
                star
              </span>
              <span className="font-semibold">{movie.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-300">/ 5</span>
            </div>

            {/* độ tuổi */}
            <div className="rounded-full border border-emerald-400/70 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              {movie.ageRating}
            </div>

            {/* thời lượng */}
            <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-slate-200">
              {movie.duration} phút
            </div>
          </div>

          {/* thể loại */}
          <ul className="flex flex-wrap gap-2">
            {movie.genre.map((x) => (
              <li
                key={x}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-100"
              >
                {x}
              </li>
            ))}
          </ul>

          {/* actions */}
          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href={movie.trailer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              <PlayCircleOutline className="material-symbols-outlined text-lg" />
              <span>Xem Trailer</span>
            </a>

            <button className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-transparent px-5 py-2.5 text-sm font-semibold text-emerald-300 shadow-sm transition hover:bg-emerald-500/10">
              <ConfirmationNumber className="material-symbols-outlined text-lg" />
              <span>Đặt Vé Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* BODY */}
    <section className="bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Cột chính */}
          <div className="flex-1 space-y-10">
            {/* Thông tin phim */}
            <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-black/40 md:p-6 lg:p-7">
              <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                Thông Tin Phim
              </h2>

              {/* grid info */}
              <div className="grid gap-4 text-sm text-slate-100 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    calendar_today
                  </span>
                  <span>
                    Khởi chiếu:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.releaseDate}
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    person
                  </span>
                  <span>
                    Đạo diễn:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.director}
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    schedule
                  </span>
                  <span>
                    Thời lượng:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.duration} phút
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    star_half
                  </span>
                  <span>
                    Đánh giá:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.rating}/5
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    translate
                  </span>
                  <span>
                    Ngôn ngữ:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.language}
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 text-base text-emerald-400">
                    badge
                  </span>
                  <span>
                    Phân loại:{" "}
                    <span className="font-semibold text-emerald-300">
                      {movie.ageRating}
                    </span>
                  </span>
                </div>
              </div>

              {/* diễn viên */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Diễn viên
                </h3>
                <ul className="flex flex-wrap gap-2 text-sm">
                  {movie.cast.map((actor) => (
                    <li
                      key={actor}
                      className="rounded-full bg-slate-800/80 px-3 py-1 text-slate-100"
                    >
                      {actor}
                    </li>
                  ))}
                </ul>
              </div>

              {/* nội dung phim */}
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Nội Dung Phim
                </h3>
                <p className="text-sm leading-relaxed text-slate-200">
                  {movie.fullDescription}
                </p>
              </div>
            </section>

            {/* Lịch chiếu */}
            <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-black/40 md:p-6 lg:p-7">
              <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                Lịch Chiếu
              </h2>

              {/* chọn ngày */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Chọn ngày
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {[
                    { label: "T2", day: "15" },
                    { label: "T3", day: "16" },
                    { label: "T4", day: "17" },
                    { label: "T5", day: "18" },
                    { label: "T6", day: "19" },
                    { label: "T7", day: "20" },
                    { label: "CN", day: "21" },
                  ].map((d, index) => (
                    <button
                      key={d.label + d.day}
                      className={
                        "flex w-14 flex-col items-center rounded-xl border px-2 py-2 text-xs font-medium transition hover:border-emerald-400 hover:bg-emerald-500/10 " +
                        (index === 0
                          ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                          : "border-slate-700 text-slate-300")
                      }
                    >
                      <span className="text-[11px] uppercase tracking-wide">
                        {d.label}
                      </span>
                      <span className="text-base">{d.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* danh sách rạp */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/5 bg-slate-900/90 p-4 md:p-5">
                  <h4 className="text-sm font-semibold md:text-base">
                    CGV Vincom Center
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 md:text-sm">
                    191 Bà Triệu, Hai Bà Trưng, Hà Nội
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["10:00", "13:30", "16:45", "19:00", "21:30"].map(
                      (time) => (
                        <button
                          key={time}
                          className="rounded-full bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-emerald-500 hover:text-slate-950"
                        >
                          {time}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/90 p-4 md:p-5">
                  <h4 className="text-sm font-semibold md:text-base">
                    Lotte Cinema Landmark
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 md:text-sm">
                    5B Nguyễn Du, Hai Bà Trưng, Hà Nội
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["11:15", "14:00", "17:15", "20:30"].map((time) => (
                      <button
                        key={time}
                        className="rounded-full bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-emerald-500 hover:text-slate-950"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Đánh giá */}
            <section className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-black/40 md:p-6 lg:p-7">
              <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                Đánh Giá
              </h2>

              <div className="space-y-4">
                {movie.reviews.map((review) => {
                  const initial = review.user.charAt(0).toUpperCase();

                  return (
                    <div
                      key={review.user + review.date}
                      className="flex gap-4 rounded-2xl border border-white/5 bg-slate-900/80 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300">
                        {initial}
                      </div>

                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {review.user}
                            </p>
                            <div className="mt-1 flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const filled = index < review.rating;
                                return (
                                  <span
                                    key={index}
                                    className={
                                      "material-symbols-outlined text-sm " +
                                      (filled
                                        ? "text-yellow-400"
                                        : "text-slate-500")
                                    }
                                  >
                                    star
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400">
                            {review.date}
                          </p>
                        </div>

                        <p className="text-sm text-slate-200">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  </main>

  );
}
