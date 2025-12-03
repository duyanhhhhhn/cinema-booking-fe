"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleOutline, ConfirmationNumber } from "@mui/icons-material";

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
  const relatedMovies = [
    {
      id: 2,
      title: "Doctor Strange in the Multiverse",
      genre: "Hành động, Khoa học viễn tưởng",
      rating: 4.5,
      poster: movie.poster, // tạm dùng chung poster
    },
    {
      id: 3,
      title: "Spider-Man: No Way Home",
      genre: "Hành động, Phiêu lưu",
      rating: 4.7,
      poster: movie.poster,
    },
    {
      id: 4,
      title: "Guardians of the Galaxy Vol. 4",
      genre: "Hài hước, Viễn tưởng",
      rating: 4.6,
      poster: movie.poster,
    },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${movie.poster}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-red-950/40 backdrop-blur-sm" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-32">
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/70">
              <img
                alt={`${movie.title} Poster`}
                src={movie.poster}
                className="h-[380px] w-[260px] object-cover md:h-[440px] md:w-[300px]"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 md:gap-6">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {movie.title}
            </h1>

            <p className="max-w-2xl text-sm text-slate-200 md:text-base">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-sm shadow">
                <span className="material-symbols-outlined text-base align-middle text-yellow-400">
                  star
                </span>
                <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-300">/ 5</span>
              </div>

              <div className="rounded-full border border-red-400/70 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300">
                {movie.ageRating}
              </div>

              <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-slate-200">
                {movie.duration} phút
              </div>
            </div>

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

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={movie.trailer}
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

      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-1 space-y-10">
              <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-black/50 backdrop-blur-sm md:p-6 lg:p-7">
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                  Thông Tin Phim
                </h2>

                <div className="grid gap-4 text-sm text-slate-100 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      calendar_today
                    </span>
                    <span>
                      Khởi chiếu:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.releaseDate}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      person
                    </span>
                    <span>
                      Đạo diễn:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.director}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      schedule
                    </span>
                    <span>
                      Thời lượng:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.duration} phút
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      star_half
                    </span>
                    <span>
                      Đánh giá:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.rating}/5
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      translate
                    </span>
                    <span>
                      Ngôn ngữ:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.language}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-red-400">
                      badge
                    </span>
                    <span>
                      Phân loại:{" "}
                      <span className="font-semibold text-red-300">
                        {movie.ageRating}
                      </span>
                    </span>
                  </div>
                </div>

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

                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Nội Dung Phim
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {movie.fullDescription}
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-black/50 backdrop-blur-sm md:p-6 lg:p-7">
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                  Lịch Chiếu
                </h2>

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
                          "flex w-14 flex-col items-center rounded-xl border px-2 py-2 text-xs font-medium transition hover:border-red-400 hover:bg-red-500/10 " +
                          (index === 0
                            ? "border-red-400 bg-red-500/15 text-red-300"
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

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-slate-900/90 p-4 md:p-5 backdrop-blur-sm">
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
                            className="rounded-full bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-red-500 hover:text-slate-950"
                          >
                            {time}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-slate-900/90 p-4 md:p-5 backdrop-blur-sm">
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
                          className="rounded-full bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-red-500 hover:text-slate-950"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-5 shadow-lg shadow-black/50 backdrop-blur-sm md:p-6 lg:p-7">
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">
                  Đánh Giá
                </h2>

                <div className="space-y-4">
                  {movie.reviews.map((review) => {
                    const initial = review.user.charAt(0).toUpperCase();

                    return (
                      <div
                        key={review.user + review.date}
                        className="flex gap-4 rounded-2xl border border-white/5 bg-slate-900/80 p-4 backdrop-blur-sm"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-sm font-semibold text-red-300">
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

            <aside className="w-full space-y-5 lg:w-80 xl:w-96">
              <section className="rounded-2xl border border-red-400/40 bg-gradient-to-br from-red-500 to-rose-500 p-[1px] shadow-lg shadow-red-500/40">
                <div className="rounded-2xl bg-slate-950/95 px-5 py-6 text-center backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
                    Đặt Vé Nhanh
                  </p>
                  <p className="mt-1 text-[13px] text-slate-300">
                    Chọn suất chiếu phù hợp và đặt vé chỉ với vài bước.
                  </p>

                  <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-red-500/40 transition hover:bg-red-400">
                    <span className="material-symbols-outlined text-base">
                      confirmation_number
                    </span>
                    <span>Đặt Vé Ngay</span>
                  </button>

                  <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-400/60 bg-transparent px-4 py-2.5 text-xs font-medium text-red-200 transition hover:bg-red-500/10">
                    <span className="material-symbols-outlined text-base">
                      event
                    </span>
                    <span>Chọn Suất Chiếu Khác</span>
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-white/5 bg-slate-900/80 p-4 shadow-lg shadow-black/50 backdrop-blur-sm">
                <h2 className="mb-4 text-base font-semibold md:text-lg">
                  Phim Hot
                </h2>

                <div className="space-y-3">
                  {relatedMovies.map((item) => (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-3 rounded-xl bg-slate-800/80 p-2 text-left transition hover:bg-red-900/40"
                    >
                      <div className="h-16 w-12 overflow-hidden rounded-lg bg-slate-700">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-semibold text-slate-50">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          {item.genre}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-400">
                          <span className="material-symbols-outlined text-sm">
                            star
                          </span>
                          <span>{item.rating}</span>
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
