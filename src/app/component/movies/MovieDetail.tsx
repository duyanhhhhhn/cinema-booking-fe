"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PlayCircleOutline,
  ConfirmationNumber,
  Star,
  EventAvailable,
  Schedule,
  Language,
  Person,
  LocalOffer,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";

import { IMovieShowtimeGroup, IShowtimeItem, MoviePublic } from "@/types/data/movie-public";
import { MovieReview } from "@/types/data/movie-review";
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

  const movieIdNum = useMemo(() => {
    const vFromParams = Number(id);
    const vFromProp = Number(movieId);
    const v =
      Number.isFinite(vFromParams) && vFromParams > 0
        ? Math.floor(vFromParams)
        : Number.isFinite(vFromProp) && vFromProp > 0
        ? Math.floor(vFromProp)
        : 0;
    return v;
  }, [id, movieId]);

  const routeMoviePath = useMemo(() => {
    return movieIdNum > 0 ? `/movies/${movieIdNum}` : "/movies";
  }, [movieIdNum]);

  const IMAGE_BASE = useMemo(
    () => (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, ""),
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

  const buildReturnUrl = useMemo(() => {
    return () => {
      if (typeof window === "undefined") return `${pathname || routeMoviePath}#review`;
      const p = window.location.pathname || pathname || routeMoviePath;
      const s = window.location.search || "";
      return `${p}${s}#review`;
    };
  }, [pathname, routeMoviePath]);

  const goLogin = useMemo(() => {
    return () => {
      const next = buildReturnUrl();
      try {
        sessionStorage.setItem("RETURN_AFTER_LOGIN", next);
      } catch {}
      router.push(`/login?next=${encodeURIComponent(next)}`);
    };
  }, [router, buildReturnUrl]);

  const toDateSafe = useMemo(() => {
    return (iso?: string | null) => {
      if (!iso) return null;
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    };
  }, []);

  const formatDMY = useMemo(() => {
    return (iso?: string | null) => {
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

  const dataMovieCinemaShowtimes = useQuery<IMovieShowtimeGroup[]>({
    ...MoviePublic.getMovieByCinema(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const movie = dataMovieDetail.data?.data;
  const reviews = dataMovieReviews.data?.data;
  const reviews_rating = dataMovieCountRating.data?.data;

  // ====== PHIM LIÊN QUAN: HIỂN THỊ 6 + SCROLL DỌC ======
  const RELATED_LIMIT = 6;

  const relatedQuery = useQuery({
    queryKey: ["MOVIES_PUBLIC_GENRES", String(movie?.genre ?? ""), movieIdNum],
    enabled: movieIdNum > 0 && !!movie?.genre,
    queryFn: async () => {
      const api = (MoviePublic as any)?.api;
      if (!api?.get) return { data: [] };
      const res = await api.get({
        url: "/public/movies/related",
        params: { genre: movie?.genre, movieId: movieIdNum, limit: RELATED_LIMIT },
      });
      return res?.data;
    },
  });

  const relatedMovies = useMemo(() => {
    const raw: any = relatedQuery.data;
    const list: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return list.filter((x) => Number(x?.id) !== movieIdNum).slice(0, RELATED_LIMIT);
  }, [relatedQuery.data, movieIdNum]);

  const cinemasRaw = useMemo(() => dataMovieCinemaShowtimes.data ?? [], [dataMovieCinemaShowtimes.data]);

  const cinemas = useMemo(() => {
    return cinemasRaw
      .map((c) => {
        const list = (((c as any)?.showtimes ?? (c as any)?.showtime ?? []) as IShowtimeItem[]) || [];
        const showtimes = [...list].sort((a, b) => (a?.startTime || "").localeCompare(b?.startTime || ""));
        return { ...c, showtimes };
      })
      .sort((a, b) => (a.cinemaName ?? "").localeCompare(b.cinemaName ?? ""));
  }, [cinemasRaw]);

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
      for (const st of (((c as any).showtimes as IShowtimeItem[]) ?? [])) {
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

  const dateTabs = useMemo(() => Array.from({ length: 7 }, (_, i) => addDaysKey(weekBase, i)), [addDaysKey, weekBase]);

  useEffect(() => {
    const firstWithShowtime = dateTabs.find((k) => hasShowtimeByDate(k));
    const next = firstWithShowtime ?? dateTabs[0] ?? "";
    setSelectedDate((prev) => (prev && dateTabs.includes(prev) ? prev : next));
  }, [dateTabs, hasShowtimeByDate]);

  const scheduleRows = useMemo(() => {
    return cinemas
      .map((c) => {
        const showtimes = (((c as any).showtimes as IShowtimeItem[]) ?? []).filter((st) => dateKey(st.startTime) === selectedDate);
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
      const en = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d).toLowerCase();
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

  const cast_list = useMemo(() => {
    return (movie?.cast ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [movie?.cast]);

  const Glass =
    "rounded-2xl border border-white/10 bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl";

  return (
    <main className="relative min-h-screen bg-[#0B0C0F] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1100px_560px_at_25%_-10%,rgba(225,29,46,0.14),transparent_60%),radial-gradient(900px_520px_at_85%_20%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(1000px_560px_at_30%_110%,rgba(153,27,27,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#17181D]/40 via-[#0B0C0F]/60 to-[#0B0C0F]" />
      <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[1px]" />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: `url("${resolveUrl(movie?.bannerUrl, "/poster/poster.jpg")}")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0F]/70 via-[#0B0C0F]/50 to-[#0B0C0F]/80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_30%,rgba(225,29,46,0.10),transparent_55%),radial-gradient(900px_420px_at_80%_35%,rgba(255,255,255,0.06),transparent_60%)]" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-28">
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_26px_70px_rgba(0,0,0,0.65)]">
              <img
                alt={`${movie?.title} Poster`}
                src={resolveUrl(movie?.posterUrl, "/poster/poster.jpg")}
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
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl">{movie?.title}</h1>

            <p className="max-w-2xl text-sm text-white/75 md:text-base">{movie?.description}</p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm backdrop-blur-md">
                <Star className="text-yellow-400" fontSize="small" />
                <span className="font-extrabold text-white">{reviews_rating?.avgRating ?? 0}</span>
                <span className="text-white/60">/ 5</span>
              </div>

              <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
                {movie?.durationMinutes} phút
              </div>

              {movie?.genre ? (
                <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/80 backdrop-blur-md">
                  {movie?.genre}
                </div>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={movie?.trailerUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#E11D2E] px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(225,29,46,0.25)] transition hover:brightness-110 active:brightness-95"
              >
                <PlayCircleOutline className="text-lg" />
                <span>Xem Trailer</span>
              </a>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(0,0,0,0.45)] transition hover:border-red-400/30 hover:bg-red-500/10"
              >
                <ConfirmationNumber className="text-lg" />
                <span>Đặt Vé Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-1 space-y-10">
              {/* ==== (GIỮ NGUYÊN CÁC SECTION BÊN TRÁI CỦA BẠN) ==== */}
              {/* Thông Tin Phim */}
              <section className={Glass}>
                <div className="p-5 md:p-6 lg:p-7">
                  <h2 className="mb-5 text-xl font-extrabold md:text-2xl">Thông Tin Phim</h2>

                  <div className="grid gap-4 text-sm text-white/85 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <EventAvailable className="mt-0.5 text-white/70" fontSize="small" />
                      <span>
                        Khởi chiếu:{" "}
                        <span className="font-extrabold text-white">{formatDMY(movie?.releaseDate as any)}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Person className="mt-0.5 text-white/70" fontSize="small" />
                      <span>
                        Đạo diễn: <span className="font-extrabold text-white">{movie?.director}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Schedule className="mt-0.5 text-white/70" fontSize="small" />
                      <span>
                        Thời lượng:{" "}
                        <span className="font-extrabold text-white">{movie?.durationMinutes} phút</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Star className="mt-0.5 text-yellow-400" fontSize="small" />
                      <span>
                        Đánh giá:{" "}
                        <span className="font-extrabold text-white">{reviews_rating?.avgRating ?? 0}/5</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <Language className="mt-0.5 text-white/70" fontSize="small" />
                      <span>
                        Ngôn ngữ: <span className="font-extrabold text-white">{movie?.language}</span>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <LocalOffer className="mt-0.5 text-white/70" fontSize="small" />
                      <span>
                        Phân loại: <span className="font-extrabold text-white">C18</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-white/60">Diễn viên</h3>
                    <ul className="flex flex-wrap gap-2 text-sm">
                      {cast_list?.map((actor) => (
                        <li
                          key={actor}
                          className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-white/90 backdrop-blur-md"
                        >
                          {actor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-white/60">Nội Dung Phim</h3>
                    <p className="text-sm leading-relaxed text-white/75">{movie?.description}</p>
                  </div>
                </div>
              </section>

              {/* Lịch Chiếu */}
              <section className={Glass}>
                <div className="p-5 md:p-6 lg:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold md:text-2xl">Lịch Chiếu</h2>
                      <p className="mt-1 text-xs text-white/55 md:text-sm">Chọn ngày để xem suất chiếu theo rạp.</p>
                    </div>

                    {dataMovieCinemaShowtimes.isFetching ? (
                      <span className="text-xs font-semibold text-white/55">Đang tải...</span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-extrabold tracking-wide text-white/70 uppercase">Chọn ngày</div>

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
                              "min-w-[76px] rounded-xl border px-4 py-3 text-center transition",
                              active
                                ? "border-red-400/30 bg-red-500/15 text-white shadow-[0_16px_40px_rgba(225,29,46,0.16)]"
                                : "border-white/10 bg-black/25 text-white/85 hover:border-red-400/20 hover:bg-red-500/10",
                              has ? "" : "opacity-40 hover:bg-black/25 hover:border-white/10",
                            ].join(" ")}
                          >
                            <div className={["text-[12px] font-extrabold", active ? "text-white/90" : "text-white/55"].join(" ")}>
                              {weekdayBadge(k)}
                            </div>
                            <div className="mt-0.5 text-xl font-extrabold tabular-nums">{dayOfMonth(k)}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {dataMovieCinemaShowtimes.isError ? (
                    <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Không tải được danh sách rạp & suất chiếu. Vui lòng thử lại.
                    </div>
                  ) : null}

                  {!dataMovieCinemaShowtimes.isLoading && cinemas.length === 0 ? (
                    <p className="mt-5 text-sm text-white/55">Chưa có rạp hoặc suất chiếu cho phim này.</p>
                  ) : scheduleRows.length === 0 && !dataMovieCinemaShowtimes.isLoading ? (
                    <div className="mt-6 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-white/65">
                      Không có suất chiếu cho ngày đã chọn.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {(dataMovieCinemaShowtimes.isLoading
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
                            className="rounded-2xl border border-white/10 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                          >
                            <div className="p-4 md:p-5">
                              <div className="flex items-start gap-4">
                                <div className="h-16 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                                  <img
                                    src={resolveUrl(posterUrl, "/poster/poster.jpg")}
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
                                  <div className="text-base font-extrabold text-white">{cinemaName}</div>
                                  {address ? <div className="mt-1 text-xs text-white/55 md:text-sm">{address}</div> : null}
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {dataMovieCinemaShowtimes.isLoading ? (
                                  <>
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                    <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                  </>
                                ) : (
                                  showtimes
                                    .slice()
                                    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                                    .map((st) => (
                                      <button
                                        key={st.id}
                                        className="group inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-4 py-2.5 text-sm font-extrabold text-white transition hover:border-red-400/25 hover:bg-red-500/10"
                                      >
                                        <span className="tabular-nums">{formatHM(st.startTime)}</span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white/80 group-hover:border-red-400/20 group-hover:bg-red-500/10">
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

              {/* Đánh giá */}
              <section className={Glass} id="review">
                <div className="p-5 md:p-6 lg:p-7">
                  <h2 className="mb-5 text-xl font-extrabold md:text-2xl">Đánh giá</h2>

                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm backdrop-blur-md">
                      <Star className="text-yellow-400" fontSize="small" />
                      <span className="font-extrabold text-white">{reviews_rating?.avgRating ?? 0}</span>
                      <span className="text-white/60">/ 5</span>
                    </div>

                    <span className="text-sm text-white/60">{reviews?.length ?? 0} đánh giá</span>
                  </div>

                  <div className="mb-6 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white/80">Rating</span>

                        <div className="relative">
                          <select
                            value={ratingInput}
                            onChange={(e) => setRatingInput(Number(e.target.value))}
                            className="appearance-none rounded-xl border border-white/10 bg-black/25 pl-3 pr-20 py-2 text-sm text-white outline-none"
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
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/85 hover:bg-white/10"
                        >
                          Xóa
                        </button>

                        <button
                          type="button"
                          disabled={createCommentMutation.isPending}
                          onClick={onSubmitReview}
                          className="rounded-xl bg-[#E11D2E] px-4 py-2 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(225,29,46,0.18)] hover:brightness-110 disabled:opacity-60"
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
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
                    />

                    {needLogin ? (
                      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3">
                        <p className="text-sm font-extrabold text-red-200">Bạn cần đăng nhập để thực hiện chức năng đánh giá.</p>
                        <button
                          type="button"
                          onClick={goLogin}
                          className="w-fit rounded-lg bg-[#E11D2E] px-4 py-2 text-sm font-extrabold text-white hover:brightness-110"
                        >
                          Đăng nhập
                        </button>
                      </div>
                    ) : null}

                    {formError ? <p className="mt-3 text-sm font-extrabold text-red-300">{formError}</p> : null}
                  </div>

                  {(reviews?.length ?? 0) === 0 ? (
                    <p className="text-sm text-white/55">Chưa có đánh giá nào cho phim này.</p>
                  ) : (
                    <ul className="space-y-4">
                      {reviews.map((review: any) => (
                        <li key={review.id} className="rounded-xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-white">Người dùng #{review.userId}</span>

                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                              <Star fontSize="small" className="text-yellow-400" />
                              <span className="font-extrabold">{review.rating}</span>
                              <span className="text-white/60">/5</span>
                            </div>
                          </div>

                          <p className="text-sm text-white/80">{review.comment}</p>

                          <p className="mt-2 text-xs text-white/45">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>

            <aside className="w-full space-y-5 lg:w-80 xl:w-96">
              <section className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-7 text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-white/80">Đặt Vé Nhanh</p>
                  <p className="mt-1 text-[13px] text-white/70">Chọn suất chiếu phù hợp và đặt vé chỉ với vài bước.</p>

                  <button className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#E11D2E] px-4 py-3 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(225,29,46,0.22)] transition hover:brightness-110 active:brightness-95">
                    Đặt Vé Ngay
                  </button>
                </div>
              </section>

              <section className={`${Glass} p-4`}>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-base font-extrabold md:text-lg">Phim Liên Quan</h2>
                  {relatedQuery.isFetching ? <span className="text-xs font-semibold text-white/55">Đang tải...</span> : null}
                </div>

                {relatedQuery.isError ? (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    Không tải được phim liên quan.
                  </div>
                ) : relatedQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2">
                        <div className="h-16 w-12 rounded-lg border border-white/10 bg-black/30" />
                        <div className="flex-1">
                          <div className="h-4 w-2/3 rounded bg-white/10" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
                          <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedMovies.length === 0 ? (
                  <p className="text-sm text-white/55">Chưa có phim liên quan.</p>
                ) : (
                  // QUAN TRỌNG: wrapper phải có height cố định + overflow-y-auto
                  <div
                    className={[
                      "space-y-3 pr-2",
                      "h-[380px] overflow-y-auto overscroll-contain",
                      "touch-pan-y",
                      "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]",
                      "[&::-webkit-scrollbar]:w-[8px]",
                      "[&::-webkit-scrollbar-track]:bg-transparent",
                      "[&::-webkit-scrollbar-thumb]:rounded-full",
                      "[&::-webkit-scrollbar-thumb]:bg-[rgba(255,255,255,0.16)]",
                      "[&::-webkit-scrollbar-thumb:hover]:bg-[rgba(255,255,255,0.22)]",
                    ].join(" ")}
                  >
                    {relatedMovies.map((item: any) => {
                      const nextId = Number(item?.id);
                      const safeId = Number.isFinite(nextId) && nextId > 0 ? Math.floor(nextId) : 0;

                      const title = String(item?.title ?? "");
                      const genre = String(item?.genre ?? "");
                      const duration = Number(item?.durationMinutes) || 0;
                      const poster = item?.posterUrl ?? null;

                      return (
                        <button
                          key={safeId || title}
                          type="button"
                          onClick={() => {
                            if (!safeId) return;
                            router.push(`/movies/${safeId}`);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-2 text-left shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-red-400/20 hover:bg-red-500/10"
                        >
                          <div className="h-16 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                            <img
                              src={resolveUrl(poster as any, "/poster/poster.jpg")}
                              alt={title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                if (img.dataset.fallback === "1") return;
                                img.dataset.fallback = "1";
                                img.src = "/poster/poster.jpg";
                              }}
                            />
                          </div>

                          <div className="flex flex-1 flex-col">
                            <p className="line-clamp-2 text-sm font-extrabold text-white">{title}</p>
                            <p className="mt-0.5 text-[11px] text-white/55">
                              {genre}
                              {duration > 0 ? ` • ${duration} phút` : ""}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
