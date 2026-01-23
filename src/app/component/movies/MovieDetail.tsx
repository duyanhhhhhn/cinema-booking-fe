"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlayCircleOutline, ConfirmationNumber, Star } from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";

import { IMovieShowtimeGroup, IShowtimeItem, MoviePublic } from "@/types/data/movie-public";
import { MovieReview } from "@/types/data/movie-review";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface MovieDetailProps {
  movieId: string;
}

export default function MovieDetail({ movieId }: MovieDetailProps) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [userId, setUserId] = useState<number | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [needLogin, setNeedLogin] = useState(false);
  const [formError, setFormError] = useState<string>("");

  const glassCard =
    "rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl";
  const glassCardSoft =
    "rounded-2xl border border-white/5 bg-black/40 shadow-[0_14px_35px_rgba(0,0,0,0.85)] backdrop-blur-lg";

  const movieIdNum = useMemo(() => {
    const v = Number(id);
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }, [id]);

  const IMAGE_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_IMAGE_URL ?? "").replace(/\/+$/, ""),
    []
  );

  const resolveUrl = useMemo(() => {
    return (raw?: string | null, fallback?: string) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return fallback ?? "";
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      if (!IMAGE_BASE) return v.startsWith("/") ? v : `/${v}`;
      return v.startsWith("/") ? `${IMAGE_BASE}${v}` : `${IMAGE_BASE}/${v}`;
    };
  }, [IMAGE_BASE]);

  const goLogin = useMemo(() => {
    return () => {
      const next = pathname || `/movies/${id}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
    };
  }, [pathname, router, id]);

  const toDateSafe = useMemo(() => {
    return (iso?: string) => {
      if (!iso) return null;
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    };
  }, []);

  const formatWeekday = useMemo(() => {
    return (iso: string) => {
      const d = toDateSafe(iso);
      if (!d) return "";
      return new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(d);
    };
  }, [toDateSafe]);

  const formatDateDMY = useMemo(() => {
    return (iso: string) => {
      const d = toDateSafe(iso);
      if (!d) return "";
      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    };
  }, [toDateSafe]);

  const formatHM = useMemo(() => {
    return (iso: string) => {
      const d = toDateSafe(iso);
      if (!d) return "";
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    };
  }, [toDateSafe]);

  const dateKey = useMemo(() => {
    return (iso: string) => (iso ? iso.slice(0, 10) : "");
  }, []);

  const dataMovieDetail = useQuery({
    ...MoviePublic.getMovieById(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const dataMovieReviews = useQuery({
    ...MovieReview.getAllReviewByMovieId(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const dataMovieCountRating = useQuery({
    ...MovieReview.getCountRatingByMovieId(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const dataMovieCinemasShowtimes = useQuery<IMovieShowtimeGroup[]>({
    ...MoviePublic.getMovieByCinema(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const movie = dataMovieDetail.data?.data;
  const reviews = dataMovieReviews.data?.data;
  const reviews_rating = dataMovieCountRating.data?.data;

  const cinemasRaw = useMemo(
    () => dataMovieCinemasShowtimes.data ?? [],
    [dataMovieCinemasShowtimes.data]
  );

  const cinemas = useMemo(() => {
    return cinemasRaw
      .map((c) => {
        const list =
          (((c as any)?.showtimes ?? (c as any)?.showtime ?? []) as IShowtimeItem[]) || [];
        const showtimes = [...list].sort((a, b) =>
          (a?.startTime || "").localeCompare(b?.startTime || "")
        );
        return { ...c, showtimes };
      })
      .sort((a, b) => (a.cinemaName ?? "").localeCompare(b.cinemaName ?? ""));
  }, [cinemasRaw]);

  const cast_list = useMemo(() => {
    return (movie?.cast ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [movie?.cast]);

  useEffect(() => {
    const uid = Number((user as any)?.id);
    setUserId(Number.isFinite(uid) && uid > 0 ? Math.floor(uid) : null);
  }, [user]);

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const uid = userId;
      if (!uid) {
        const e: any = new Error("NEED_LOGIN");
        e.code = "NEED_LOGIN";
        throw e;
      }
      return MovieReview.createComment(uid, movieIdNum, ratingInput, commentInput).queryFn();
    },
    onSuccess: async () => {
      setFormError("");
      setNeedLogin(false);
      setCommentInput("");
      setRatingInput(5);
      await Promise.all([dataMovieReviews.refetch(), dataMovieCountRating.refetch()]);
    },
    onError: (err: any) => {
      if (err?.message === "NEED_LOGIN" || err?.code === "NEED_LOGIN") {
        setNeedLogin(true);
        setFormError("");
        return;
      }
      setFormError(err?.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    },
  });

  const onSubmitReview = () => {
    setFormError("");
    const c = commentInput.trim();
    if (!c) {
      setFormError("Vui lòng nhập nội dung bình luận.");
      return;
    }
    if (!Number.isFinite(ratingInput) || ratingInput < 1 || ratingInput > 5) {
      setFormError("Rating không hợp lệ.");
      return;
    }
    createCommentMutation.mutate();
  };

  const availableDateKeys = useMemo(() => {
    const set = new Set<string>();
    for (const c of cinemas) {
      for (const st of ((c as any).showtimes as IShowtimeItem[]) ?? []) {
        const k = dateKey(st.startTime);
        if (k) set.add(k);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [cinemas, dateKey]);

  const hasShowtimeByDate = useMemo(() => {
    const set = new Set<string>(availableDateKeys);
    return (key: string) => set.has(key);
  }, [availableDateKeys]);

  const [selectedDate, setSelectedDate] = useState<string>("");

  const startOfWeekMonday = useMemo(() => {
    return (d: Date) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      const day = x.getDay();
      const diffToMonday = (day + 6) % 7;
      x.setDate(x.getDate() - diffToMonday);
      return x;
    };
  }, []);

  const addDaysKey = useMemo(() => {
    return (d: Date, days: number) => {
      const x = new Date(d);
      x.setDate(x.getDate() + days);
      const y = x.getFullYear();
      const m = String(x.getMonth() + 1).padStart(2, "0");
      const dd = String(x.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
  }, []);

  const weekBase = useMemo(() => {
    const baseKey = selectedDate || availableDateKeys[0] || "";
    if (baseKey) {
      const d = new Date(`${baseKey}T00:00:00`);
      if (!Number.isNaN(d.getTime())) return startOfWeekMonday(d);
    }
    return startOfWeekMonday(new Date());
  }, [availableDateKeys, selectedDate, startOfWeekMonday]);

  const dateTabs = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDaysKey(weekBase, i));
  }, [addDaysKey, weekBase]);

  useEffect(() => {
    const firstWithShowtime = dateTabs.find((k) => hasShowtimeByDate(k));
    const next = firstWithShowtime ?? dateTabs[0] ?? "";
    setSelectedDate((prev) => (prev && dateTabs.includes(prev) ? prev : next));
  }, [dateTabs, hasShowtimeByDate]);

  const scheduleRows = useMemo(() => {
    return cinemas
      .map((c) => {
        const showtimes = (((c as any).showtimes as IShowtimeItem[]) ?? []).filter(
          (st) => dateKey(st.startTime) === selectedDate
        );
        return { cinema: c, showtimes };
      })
      .filter((x) => x.showtimes.length > 0);
  }, [cinemas, dateKey, selectedDate]);

  const weekdayBadge = useMemo(() => {
    const map: Record<string, string> = {
      monday: "T2",
      tuesday: "T3",
      wednesday: "T4",
      thursday: "T5",
      friday: "T6",
      saturday: "T7",
      sunday: "CN",
    };
    return (key: string) => {
      const d = new Date(`${key}T00:00:00`);
      if (Number.isNaN(d.getTime())) return "";
      const en = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        .format(d)
        .toLowerCase();
      return map[en] ?? "";
    };
  }, []);

  const dayOfMonth = useMemo(() => {
    return (key: string) => {
      const d = new Date(`${key}T00:00:00`);
      if (Number.isNaN(d.getTime())) return "";
      return String(d.getDate()).padStart(2, "0");
    };
  }, []);

  return (
    <main className="">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${resolveUrl(movie?.bannerUrl, "/banner/placeholder.jpg")}")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-red-950/40 backdrop-blur-md" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-32">
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/70">
              <img
                alt={`${movie?.title} Poster`}
                src={resolveUrl(movie?.posterUrl, "/poster/placeholder.jpg")}
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
            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">{movie?.title}</h1>
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
                <li className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-100 backdrop-blur-md">
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
                      Thời lượng:{" "}
                      <span className="font-semibold text-red-300">{movie?.durationMinutes} phút</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span>
                      Đánh giá:{" "}
                      <span className="font-semibold text-red-300">{reviews_rating?.avgRating}/5</span>
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

              <section className="rounded-2xl border border-cyan-200/10 bg-gradient-to-br from-[#081B27]/80 via-[#06131F]/80 to-[#040B14]/90 shadow-[0_18px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="p-5 md:p-6 lg:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold md:text-2xl text-slate-50">Lịch Chiếu</h2>
                      <p className="mt-1 text-xs text-slate-300 md:text-sm">Chọn ngày để xem suất chiếu theo rạp.</p>
                    </div>

                    {dataMovieCinemasShowtimes.isFetching ? (
                      <span className="text-xs font-semibold text-slate-300">Đang tải...</span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-extrabold tracking-wide text-slate-200 uppercase">Chọn ngày</div>

                    <div className="mt-3 flex flex-wrap gap-3">
                      {dateTabs.map((k) => {
                        const active = k === selectedDate;
                        const has = hasShowtimeByDate(k);

                        return (
                          <button
                            key={k}
                            type="button"
                            onClick={() => setSelectedDate(k)}
                            className={[
                              "min-w-[72px] rounded-2xl border px-4 py-3 text-center transition",
                              active
                                ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-50 shadow-[0_12px_30px_rgba(34,211,238,0.15)]"
                                : "border-white/10 bg-black/30 text-slate-200 hover:border-cyan-300/25 hover:bg-cyan-500/10",
                              has ? "" : "opacity-40 hover:bg-black/30 hover:border-white/10",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "text-[12px] font-extrabold",
                                active ? "text-cyan-50" : "text-slate-300",
                              ].join(" ")}
                            >
                              {weekdayBadge(k)}
                            </div>
                            <div className="mt-0.5 text-xl font-extrabold tabular-nums">{dayOfMonth(k)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {dataMovieCinemasShowtimes.isError ? (
                    <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Không tải được danh sách rạp & suất chiếu. Vui lòng thử lại.
                    </div>
                  ) : null}

                  {!dataMovieCinemasShowtimes.isLoading && cinemas.length === 0 ? (
                    <p className="mt-5 text-sm text-slate-400">Chưa có rạp hoặc suất chiếu cho phim này.</p>
                  ) : scheduleRows.length === 0 && !dataMovieCinemasShowtimes.isLoading ? (
                    <div className="mt-6 rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-slate-300">
                      Không có suất chiếu cho ngày đã chọn.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {(dataMovieCinemasShowtimes.isLoading
                        ? Array.from({ length: 2 }).map((_, i) => ({
                            cinema: { cinemaId: i, cinemaName: "Đang tải...", address: "", posterUrl: null } as any,
                            showtimes: [] as IShowtimeItem[],
                          }))
                        : scheduleRows
                      ).map((row: any) => {
                        const c = row.cinema as IMovieShowtimeGroup;
                        const cinemaId = (c as any)?.cinemaId;
                        const cinemaName = (c as any)?.cinemaName ?? "";
                        const address = (c as any)?.address ?? "";
                        const posterUrl = (c as any)?.posterUrl ?? null;
                        const showtimes = (row.showtimes ?? []) as IShowtimeItem[];

                        return (
                          <div
                            key={cinemaId}
                            className="rounded-2xl border border-cyan-200/10 bg-[#061521]/60 shadow-[0_14px_35px_rgba(0,0,0,0.85)] backdrop-blur-lg"
                          >
                            <div className="p-4 md:p-5">
                              <div className="flex items-start gap-4">
                                <div className="h-16 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                  <img
                                    src={resolveUrl(posterUrl, "/poster/placeholder.jpg")}
                                    alt={cinemaName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const img = e.currentTarget as HTMLImageElement;
                                      if (img.dataset.fallback === "1") return;
                                      img.dataset.fallback = "1";
                                      img.src = "/poster/poster.jpg";
                                    }}
                                  />
                                </div>

                                <div className="flex-1">
                                  <div className="text-base font-extrabold text-slate-50">{cinemaName}</div>
                                  {address ? (
                                    <div className="mt-1 text-xs text-slate-300 md:text-sm">{address}</div>
                                  ) : null}
                                  <div className="mt-3 text-xs font-extrabold tracking-wide text-slate-200 uppercase">
                                    Suất chiếu
                                  </div>
                                  <div className="mt-2 text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                    {formatWeekday(`${selectedDate}T00:00:00`)} •{" "}
                                    {formatDateDMY(`${selectedDate}T00:00:00`)}
                                  </div>
                                </div>

                                {Number.isFinite(Number((c as any)?.durationMinutes)) ? (
                                  <div className="rounded-full border border-cyan-200/10 bg-black/30 px-3 py-1 text-xs text-slate-200">
                                    {(c as any)?.durationMinutes} phút
                                  </div>
                                ) : null}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {dataMovieCinemasShowtimes.isLoading ? (
                                  <>
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/30" />
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/30" />
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/30" />
                                  </>
                                ) : (
                                  showtimes
                                    .slice()
                                    .sort((a, b) =>
                                      (a.startTime || "").localeCompare(b.startTime || "")
                                    )
                                    .map((st) => (
                                      <button
                                        key={st.id}
                                        className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm font-extrabold text-slate-50 transition hover:border-cyan-300/40 hover:bg-cyan-500/15"
                                      >
                                        <span className="tabular-nums">{formatHM(st.startTime)}</span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-200 group-hover:border-cyan-200/20 group-hover:bg-cyan-500/10">
                                          {st.type}
                                        </span>
                                      </button>
                                    ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section className={`${glassCard} p-5 md:p-6 lg:p-7`}>
                <h2 className="mb-5 text-xl font-semibold md:text-2xl">Đánh giá & Bình luận</h2>

                <div className="mb-6 flex items-center gap-4">
                  <div className="flex items-center gap-1 rounded-full bg-black/40 px-4 py-2 text-sm backdrop-blur-md">
                    <span className="material-symbols-outlined text-yellow-400">star</span>
                    <span className="font-semibold text-slate-100">{reviews_rating?.avgRating ?? 0}</span>
                    <span className="text-slate-300">/ 5</span>
                  </div>

                  <span className="text-sm text-slate-300">{reviews?.length ?? 0} đánh giá</span>
                </div>

                <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">Rating</span>

                      <div className="relative">
                        <select
                          value={ratingInput}
                          onChange={(e) => setRatingInput(Number(e.target.value))}
                          className="appearance-none rounded-xl border border-white/10 bg-black/30 pl-3 pr-20 py-2 text-sm text-white outline-none"
                        >
                          {[5, 4, 3, 2, 1].map((v) => (
                            <option key={v} value={v}>
                              {v} / 5
                            </option>
                          ))}
                        </select>

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                          ▾
                        </span>

                        <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2">
                          <Star fontSize="small" className="text-yellow-400" />
                        </span>
                      </div>
                    </div>

                    <div className="sm:ml-auto flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCommentInput("");
                          setRatingInput(5);
                          setFormError("");
                          setNeedLogin(false);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/10"
                      >
                        Xóa
                      </button>

                      <button
                        type="button"
                        disabled={createCommentMutation.isPending}
                        onClick={onSubmitReview}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-red-400 disabled:opacity-60"
                      >
                        {createCommentMutation.isPending ? "Đang gửi..." : "Gửi"}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  />

                  {needLogin ? (
                    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                      <p className="text-sm font-semibold text-red-200">
                        Bạn cần đăng nhập để thực hiện chức năng đánh giá.
                      </p>
                      <button
                        type="button"
                        onClick={goLogin}
                        className="w-fit rounded-lg bg-red-500 px-4 py-2 text-sm font-extrabold text-slate-950 hover:bg-red-400"
                      >
                        Đăng nhập
                      </button>
                    </div>
                  ) : null}

                  {formError ? <p className="mt-3 text-sm font-semibold text-red-300">{formError}</p> : null}
                </div>

                {(reviews?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-400">Chưa có đánh giá nào cho phim này.</p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((review: any) => (
                      <li
                        key={review.id}
                        className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-100">Người dùng #{review.userId}</span>

                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span>{review.rating}</span>
                            <span className="text-slate-300">/5</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-200">{review.comment}</p>

                        <p className="mt-2 text-xs text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <aside className="w-full space-y-5 lg:w-80 xl:w-96">
              <section className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-[#0B2B3B]/70 via-[#06212E]/75 to-[#04141D]/85 p-[1px] shadow-[0_18px_45px_rgba(0,0,0,0.8)]">
                <div className="rounded-2xl bg-[#061521]/70 px-5 py-6 text-center backdrop-blur-2xl">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-cyan-100/90">Đặt Vé Nhanh</p>
                  <p className="mt-1 text-[13px] text-slate-300">Chọn suất chiếu phù hợp và đặt vé chỉ với vài bước.</p>

                  <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500/80 px-4 py-2.5 text-sm font-extrabold text-[#04141D] shadow-md shadow-cyan-500/20 transition hover:bg-cyan-400">
                    <span>Đặt Vé Ngay</span>
                  </button>

                  <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-200/30 bg-transparent px-4 py-2.5 text-xs font-extrabold text-cyan-50/90 transition hover:bg-cyan-500/10">
                    <span>Chọn Suất Chiếu Khác</span>
                  </button>
                </div>
              </section>

              <section className={`${glassCard} p-4`}>
                <h2 className="mb-4 text-base font-semibold md:text-lg">Phim Hot</h2>

                <div className="space-y-3">
                  {[
                    {
                      id: 2,
                      title: "Doctor Strange in the Multiverse",
                      genre: "Hành động, Khoa học viễn tưởng",
                      rating: 4.5,
                      poster: movie?.posterUrl,
                    },
                    {
                      id: 3,
                      title: "Spider-Man: No Way Home",
                      genre: "Hành động, Phiêu lưu",
                      rating: 4.7,
                      poster: movie?.posterUrl,
                    },
                    {
                      id: 4,
                      title: "Guardians of the Galaxy Vol. 4",
                      genre: "Hài hước, Viễn tưởng",
                      rating: 4.6,
                      poster: movie?.posterUrl,
                    },
                  ].map((item) => (
                    <button
                      key={item?.id}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-black/40 p-2 text-left shadow-[0_10px_28px_rgba(0,0,0,0.75)] backdrop-blur-lg transition hover:border-cyan-300/20 hover:bg-cyan-500/10"
                    >
                      <div className="h-16 w-12 overflow-hidden rounded-lg bg-slate-700">
                        <img
                          src={resolveUrl(item?.poster as any, "/poster/placeholder.jpg")}
                          alt={item?.title}
                          className="h-full w-full object-cover"
                        />
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
