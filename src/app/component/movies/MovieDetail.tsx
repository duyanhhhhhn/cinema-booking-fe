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
import { Be_Vietnam_Pro } from "next/font/google";

const beVN = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["600", "700", "800"],
});

import {
  IMovieShowtimeGroup,
  IShowtimeItem,
  MoviePublic,
} from "@/types/data/movie-public";
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
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(
    null,
  );

  const [reviewPage, setReviewPage] = useState(1);
  const reviewPerPage = 5;

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

  useEffect(() => {
    setReviewPage(1);
  }, [movieIdNum]);

  const routeMoviePath = useMemo(() => {
    return movieIdNum > 0 ? `/movies/${movieIdNum}` : "/movies";
  }, [movieIdNum]);

  const IMAGE_BASE = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
        /\/+$/,
        "",
      ),
    [],
  );

  const resolveUrl = useMemo(() => {
    return (raw?: string | null, fallback?: string) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return fallback ?? "";
      if (/^https?:\/\//i.test(v)) return v;
      const clean = v.replace(/^\/+/, "");
      const withMedia = clean.startsWith("media/") ? clean : `media/${clean}`;
      return `${IMAGE_BASE}/${withMedia}`;
    };
  }, [IMAGE_BASE]);

  const resolveCinemaUrl = useMemo(() => {
    return (raw?: string | null, fallback?: string) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return fallback ?? "";
      if (/^https?:\/\//i.test(v)) return v;
      const clean = v.replace(/^\/+/, "");
      const cinemaPath = clean.startsWith("cinema/")
        ? clean
        : `cinema/${clean}`;
      return `${IMAGE_BASE}/media/${cinemaPath}`;
    };
  }, [IMAGE_BASE]);

  const buildReturnUrl = useMemo(() => {
    return () => {
      if (typeof window === "undefined") {
        return `${pathname || routeMoviePath}#review`;
      }
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
      if (!d) {
        const matched = String(iso ?? "").match(/(\d{2}):(\d{2})/);
        return matched ? `${matched[1]}:${matched[2]}` : "";
      }
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    };
  }, [toDateSafe]);

  const dateKey = useMemo(() => {
    return (iso: string) => {
      if (!iso) return "";
      const raw = String(iso).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return "";

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    };
  }, []);

  const dataMovieDetail = useQuery({
    ...MoviePublic.getMovieById(movieIdNum),
    enabled: movieIdNum > 0,
  });

  const dataMovieReviews = useQuery({
    ...MovieReview.getAllReviewByMovieId(movieIdNum, reviewPage, reviewPerPage),
    enabled: movieIdNum > 0,
    placeholderData: (prev) => prev,
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

  const reviewsRes: any = dataMovieReviews.data;
  const reviews = (reviewsRes?.data ?? []) as any[];
  const reviewsMeta: any = reviewsRes?.meta ?? {};

  const reviewsTotal = Number(reviewsMeta?.total ?? reviews.length);
  const reviewsPerPageMeta = Number(reviewsMeta?.perPage ?? reviewPerPage);

  const serverTotalPages = Number(reviewsMeta?.totalPages ?? 0);
  const reviewsTotalPages = Math.max(
    1,
    serverTotalPages ||
      Math.ceil(reviewsTotal / (reviewsPerPageMeta || reviewPerPage)),
  );

  useEffect(() => {
    if (serverTotalPages > 0 && reviewPage > serverTotalPages) {
      setReviewPage(serverTotalPages);
    }
  }, [reviewPage, serverTotalPages]);

  const reviews_rating = dataMovieCountRating.data?.data;

  const genreViMap: Record<string, string> = {
    ACTION: "Hành động",
    COMEDY: "Hài",
    ROMANCE: "Lãng mạn",
    DRAMA: "Chính kịch",
    HORROR: "Kinh dị",
    THRILLER: "Giật gân",
    SCI_FI: "Khoa học viễn tưởng",
    FANTASY: "Giả tưởng",
    ANIMATION: "Hoạt hình",
    ADVENTURE: "Phiêu lưu",
    CRIME: "Tội phạm",
    WAR: "Chiến tranh",
    FAMILY: "Gia đình",
    MUSIC: "Âm nhạc",
    DOCUMENTARY: "Tài liệu",
    MYSTERY: "Bí ẩn",
  };

  const getGenreLabelVi = (genre?: string | null) => {
    if (!genre) return "";
    return genreViMap[String(genre).trim().toUpperCase()] ?? genre;
  };

  const genreLabel = getGenreLabelVi(movie?.genre);
  const ageRatingLabel = String(
    (movie as any)?.agerating ?? (movie as any)?.ageRating ?? "TBA",
  ).trim();

  const RELATED_LIMIT = 6;

  const movieGenre = useQuery({
    ...MoviePublic.getAllMovieGenres(String(movie?.genre ?? ""), RELATED_LIMIT),
    enabled: movieIdNum > 0 && !!movie?.genre,
  });

  const relatedMovies = useMemo(() => {
    const list = movieGenre.data ?? [];
    return list
      .filter((x: any) => Number(x?.id) !== movieIdNum)
      .slice(0, RELATED_LIMIT);
  }, [movieGenre.data, movieIdNum]);

  const cinemasRaw = useMemo(
    () => dataMovieCinemaShowtimes.data ?? [],
    [dataMovieCinemaShowtimes.data],
  );

  function parseStartSortableValue(value?: string | null) {
    if (!value) return "";

    const raw = String(value).trim();
    if (!raw) return "";

    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${hh}:${mm}:${ss}`;
    }

    const matched = raw.match(/(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (matched) {
      return `${matched[1]}:${matched[2]}:${matched[3] ?? "00"}`;
    }

    return raw;
  }

  function sortShowtimesAsc(a: IShowtimeItem, b: IShowtimeItem) {
    return parseStartSortableValue(a?.startTime).localeCompare(
      parseStartSortableValue(b?.startTime),
    );
  }

  const cinemas = useMemo(() => {
    return cinemasRaw
      .map((c) => {
        const list =
          (((c as any)?.showtimes ??
            (c as any)?.showtime ??
            []) as IShowtimeItem[]) || [];
        const showtimes = [...list].sort(sortShowtimesAsc);
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
      return MovieReview.createComment(
        uid,
        movieIdNum,
        ratingInput,
        commentInput,
      ).queryFn();
    },
    onSuccess: async () => {
      setFormError("");
      setNeedLogin(false);
      setCommentInput("");
      setRatingInput(5);
      setReviewPage(1);
      await Promise.all([
        dataMovieReviews.refetch(),
        dataMovieCountRating.refetch(),
      ]);
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
      setFormError("Đánh giá không hợp lệ.");
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

  const dateTabs = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysKey(weekBase, i)),
    [addDaysKey, weekBase],
  );

  useEffect(() => {
    const firstWithShowtime = dateTabs.find((k) => hasShowtimeByDate(k));
    const next = firstWithShowtime ?? dateTabs[0] ?? "";
    setSelectedDate((prev) => (prev && dateTabs.includes(prev) ? prev : next));
  }, [dateTabs, hasShowtimeByDate]);

  const scheduleRows = useMemo(() => {
    return cinemas
      .map((c) => {
        const showtimes = (
          ((c as any).showtimes as IShowtimeItem[]) ?? []
        ).filter((st) => dateKey(st.startTime) === selectedDate);
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

  const cast_list = useMemo(() => {
    return (movie?.cast ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [movie?.cast]);

  const Glass =
    "rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(16,17,21,0.96),rgba(11,12,15,0.98))] shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-xl";

  const pageWindow = useMemo(() => {
    const total = reviewsTotalPages;
    const current = reviewPage;
    if (total <= 1) return [] as number[];

    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, current - half);
    let end = Math.min(total, start + windowSize - 1);

    start = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [reviewsTotalPages, reviewPage]);

  const SHOWTIME_BUCKETS = [
    { key: "morning", label: "Sáng", from: 5, to: 11 },
    { key: "noon", label: "Trưa", from: 11, to: 13 },
    { key: "afternoon", label: "Chiều", from: 13, to: 18 },
    { key: "evening", label: "Tối", from: 18, to: 24 },
  ] as const;

  function getHourFromTime(value?: string | null) {
    if (!value) return -1;

    const raw = String(value).trim();
    if (!raw) return -1;

    const matched = raw.match(/(\d{2}):(\d{2})/);
    if (matched) {
      const hh = Number(matched[1]);
      return Number.isFinite(hh) ? hh : -1;
    }

    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.getHours();
    }

    return -1;
  }

  return (
    <main className={`${beVN.className} relative min-h-screen bg-[#0B0C0F] text-white`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1100px_560px_at_25%_-10%,rgba(225,29,46,0.14),transparent_60%),radial-gradient(900px_520px_at_85%_20%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(1000px_560px_at_30%_110%,rgba(153,27,27,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#17181D]/40 via-[#0B0C0F]/60 to-[#0B0C0F]" />
      <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[1px]" />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage: `url("${resolveUrl(
              movie?.bannerUrl || movie?.posterUrl,
              "/poster/poster.jpg",
            )}")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0F]/70 via-[#0B0C0F]/50 to-[#0B0C0F]/80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_30%,rgba(225,29,46,0.10),transparent_55%),radial-gradient(900px_420px_at_80%_35%,rgba(255,255,255,0.06),transparent_60%)]" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-10 pt-24 md:flex-row md:px-6 lg:px-8 lg:pb-16 lg:pt-28">
          <div className="flex justify-center md:justify-start">
            <div className="overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.68)]">
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
            <div className="space-y-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight md:text-4xl lg:text-5xl">
                {movie?.title}
              </h1>
              <p className="text-base font-semibold text-white/75">
                Rated: {ageRatingLabel}
              </p>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-white/75 md:text-base">
              {movie?.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm backdrop-blur-md">
                <Star className="text-yellow-400" fontSize="small" />
                <span className="font-black text-white">
                  {reviews_rating?.avgRating ?? 0}
                </span>
                <span className="text-white/55">/ 5</span>
              </div>

              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white/85 backdrop-blur-md">
                {movie?.durationMinutes} phút
              </div>

              {genreLabel ? (
                <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white/85 backdrop-blur-md">
                  {genreLabel}
                </div>
              ) : null}

              <div className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-100 shadow-[0_10px_30px_rgba(225,29,46,0.12)]">
                {ageRatingLabel}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={movie?.trailerUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[16px] bg-[#FF1F3D] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,31,61,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ff314d] active:brightness-95"
              >
                <PlayCircleOutline className="text-lg" />
                <span>Xem Trailer</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-1 space-y-10">
              <section className={Glass}>
                <div className="p-5 md:p-6 lg:p-7">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/40">
                        Movie details
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight md:text-[30px]">
                        Thông Tin Phim
                      </h2>
                    </div>

                    <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/55 md:inline-flex">
                      Chi tiết
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      {
                        icon: <EventAvailable fontSize="small" className="text-white/70" />,
                        label: "Khởi chiếu",
                        value: formatDMY(movie?.releaseDate as any),
                      },
                      {
                        icon: <Person fontSize="small" className="text-white/70" />,
                        label: "Đạo diễn",
                        value: movie?.director,
                      },
                      {
                        icon: <Schedule fontSize="small" className="text-white/70" />,
                        label: "Thời lượng",
                        value: `${movie?.durationMinutes} phút`,
                      },
                      {
                        icon: <Star fontSize="small" className="text-yellow-400" />,
                        label: "Đánh giá",
                        value: `${reviews_rating?.avgRating ?? 0}/5`,
                      },
                      {
                        icon: <Language fontSize="small" className="text-white/70" />,
                        label: "Ngôn ngữ",
                        value: movie?.language,
                      },
                      {
                        icon: <LocalOffer fontSize="small" className="text-white/70" />,
                        label: "Phân loại",
                        value: ageRatingLabel,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.25)]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-black/35">
                            {item.icon}
                          </div>

                          <div className="min-w-0">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                              {item.label}
                            </div>
                            <div className="mt-1 text-[15px] font-black text-white">
                              {item.value || "Đang cập nhật"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                      Diễn viên
                    </h3>
                    <ul className="flex flex-wrap gap-2.5 text-sm">
                      {cast_list?.map((actor) => (
                        <li
                          key={actor}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-white/90 backdrop-blur-md transition hover:bg-white/[0.07]"
                        >
                          {actor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 rounded-[22px] bg-black/25 p-5 ring-1 ring-white/[0.05]">
                    <h3 className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                      Nội Dung Phim
                    </h3>
                    <p className="text-sm leading-7 text-white/75">
                      {movie?.description}
                    </p>
                  </div>
                </div>
              </section>

              <section className={Glass}>
                <div className="p-5 md:p-6 lg:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black tracking-tight md:text-2xl">
                        Lịch Chiếu
                      </h2>
                      <p className="mt-1 text-xs text-white/50 md:text-sm">
                        Chọn ngày để xem suất chiếu theo rạp.
                      </p>
                    </div>

                    {dataMovieCinemaShowtimes.isFetching ? (
                      <span className="text-xs font-semibold text-white/55">
                        Đang tải...
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-white/55">
                      Chọn ngày
                    </div>

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
                              "min-w-[76px] rounded-[18px] border px-4 py-3 text-center transition cursor-pointer",
                              active
                                ? "border-red-400/20 bg-[linear-gradient(180deg,rgba(255,31,61,0.18),rgba(255,31,61,0.08))] text-white shadow-[0_18px_45px_rgba(255,31,61,0.14)]"
                                : "border-white/8 bg-black/25 text-white/85 hover:border-white/14 hover:bg-white/[0.04]",
                              has
                                ? ""
                                : "opacity-40 hover:bg-black/25 hover:border-white/10",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "text-[12px] font-black",
                                active ? "text-white/90" : "text-white/55",
                              ].join(" ")}
                            >
                              {weekdayBadge(k)}
                            </div>
                            <div className="mt-0.5 text-xl font-black tabular-nums">
                              {dayOfMonth(k)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {dataMovieCinemaShowtimes.isError ? (
                    <div className="mt-5 rounded-[18px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      Không tải được danh sách rạp & suất chiếu. Vui lòng thử lại.
                    </div>
                  ) : null}

                  {!dataMovieCinemaShowtimes.isLoading &&
                  cinemas.length === 0 ? (
                    <p className="mt-5 text-sm text-white/55">
                      Chưa có rạp hoặc suất chiếu cho phim này.
                    </p>
                  ) : scheduleRows.length === 0 &&
                    !dataMovieCinemaShowtimes.isLoading ? (
                    <div className="mt-6 rounded-[18px] border border-white/8 bg-black/20 px-4 py-4 text-sm text-white/65">
                      Không có suất chiếu cho ngày đã chọn.
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {(dataMovieCinemaShowtimes.isLoading
                        ? Array.from({ length: 2 }).map((_, i) => ({
                            cinema: {
                              cinemaId: i,
                              cinemaName: "Đang tải...",
                              address: "",
                              posterUrl: null,
                              cinemaImageUrl: null,
                            } as any,
                            showtimes: [] as IShowtimeItem[],
                          }))
                        : scheduleRows
                      ).map((row: any) => {
                        const c = row.cinema as IMovieShowtimeGroup;

                        const cinemaId =
                          (c as any)?.cinemaId ?? (c as any)?.id ?? "";
                        const cinemaName =
                          (c as any)?.cinemaName ?? (c as any)?.name ?? "";
                        const address = (c as any)?.address ?? "";

                        const cinemaImageUrl =
                          (c as any)?.cinemaImageUrl ??
                          (c as any)?.cinema_image_url ??
                          (c as any)?.imageUrl ??
                          (c as any)?.image_url ??
                          null;

                        const showtimes = (
                          (row.showtimes ?? []) as IShowtimeItem[]
                        )
                          .slice()
                          .sort(sortShowtimesAsc);

                        return (
                          <div
                            key={cinemaId || cinemaName}
                            className="overflow-hidden rounded-[24px] border border-white/8 bg-black/25 shadow-[0_16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                          >
                            <div className="p-4 md:p-5">
                              <div className="flex items-start gap-4">
                                <div className="h-16 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                                  <img
                                    src={resolveCinemaUrl(
                                      cinemaImageUrl,
                                      "/poster/poster.jpg",
                                    )}
                                    alt={cinemaName}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      const img =
                                        e.currentTarget as HTMLImageElement;
                                      if (img.dataset.fallback === "1") return;
                                      img.dataset.fallback = "1";
                                      img.src = "/poster/poster.jpg";
                                    }}
                                  />
                                </div>

                                <div className="flex-1">
                                  <div className="text-base font-black text-white">
                                    {cinemaName}
                                  </div>
                                  {address ? (
                                    <div className="mt-1 text-xs text-white/55 md:text-sm">
                                      {address}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="mt-4 border-t border-white/8 pt-4">
                                {dataMovieCinemaShowtimes.isLoading ? (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-[76px_1fr] gap-3">
                                      <div className="h-10 rounded-xl border border-white/10 bg-black/25" />
                                      <div className="flex flex-wrap gap-2">
                                        <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                        <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                        <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-[76px_1fr] gap-3">
                                      <div className="h-10 rounded-xl border border-white/10 bg-black/25" />
                                      <div className="flex flex-wrap gap-2">
                                        <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                        <div className="h-10 w-28 rounded-xl border border-white/10 bg-black/25" />
                                      </div>
                                    </div>
                                  </div>
                                ) : showtimes.length === 0 ? (
                                  <div className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/50">
                                    Chưa có suất chiếu trong ngày này.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {SHOWTIME_BUCKETS.map((group) => {
                                      const items = showtimes.filter((st) => {
                                        const hour = getHourFromTime(
                                          st.startTime,
                                        );
                                        return (
                                          hour >= group.from && hour < group.to
                                        );
                                      });

                                      if (items.length === 0) return null;

                                      return (
                                        <div
                                          key={group.key}
                                          className="grid grid-cols-1 gap-2 md:grid-cols-[88px_1fr]"
                                        >
                                          <div className="flex items-start md:pt-2">
                                            <div className="inline-flex min-w-[72px] items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/70">
                                              {group.label}
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                            {items.map((st) => {
                                              const isSelected =
                                                selectedShowtimeId === st.id;

                                              return (
                                                <button
                                                  key={st.id}
                                                  type="button"
                                                  onClick={() =>
                                                    setSelectedShowtimeId(st.id)
                                                  }
                                                  className={`group inline-flex cursor-pointer items-center gap-2 rounded-[16px] border px-4 py-2.5 text-sm font-black text-white transition ${
                                                    isSelected
                                                      ? "border-red-500 bg-red-500/20 ring-2 ring-red-400/45"
                                                      : "border-white/8 bg-black/25 hover:border-red-400/20 hover:bg-red-500/10"
                                                  }`}
                                                >
                                                  <span className="tabular-nums">
                                                    {formatHM(st.startTime)}
                                                  </span>
                                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white/80 transition group-hover:border-red-400/20 group-hover:bg-red-500/10">
                                                    {st.type}
                                                  </span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
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

              <section className={Glass} id="review">
                <div className="p-5 md:p-6 lg:p-7">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.32em] text-white/40">
                        Community reviews
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight md:text-[30px]">
                        Đánh giá
                      </h2>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2.5 text-sm backdrop-blur-md">
                        <Star className="text-yellow-400" fontSize="small" />
                        <span className="font-black text-white">
                          {reviews_rating?.avgRating ?? 0}
                        </span>
                        <span className="text-white/55">/ 5</span>
                      </div>

                      <span className="text-sm font-semibold text-white/50">
                        {reviewsTotal} đánh giá
                      </span>
                    </div>
                  </div>

                  <div className="mb-7 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white/85">
                          Rating
                        </span>

                        <div className="relative">
                          <select
                            value={ratingInput}
                            onChange={(e) =>
                              setRatingInput(Number(e.target.value))
                            }
                            className="appearance-none rounded-[14px] border border-white/10 bg-black/30 pl-3 pr-20 py-2.5 text-sm text-white outline-none"
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

                      <div className="lg:ml-auto flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCommentInput("");
                            setRatingInput(5);
                            setFormError("");
                            setNeedLogin(false);
                          }}
                          className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/90 transition hover:bg-white/[0.08]"
                        >
                          Xóa
                        </button>

                        <button
                          type="button"
                          disabled={createCommentMutation.isPending}
                          onClick={onSubmitReview}
                          className="rounded-[14px] bg-[#FF1F3D] px-5 py-2.5 text-sm font-black text-white shadow-[0_18px_45px_rgba(255,31,61,0.22)] transition hover:-translate-y-0.5 hover:bg-[#ff314d] disabled:opacity-60"
                        >
                          {createCommentMutation.isPending ? "Đang gửi..." : "Gửi"}
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      rows={4}
                      placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                      className="mt-4 w-full rounded-[18px] border border-white/10 bg-black/30 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-white/40"
                    />

                    {needLogin ? (
                      <div className="mt-4 flex flex-col gap-3 rounded-[18px] border border-red-400/25 bg-red-500/10 px-4 py-4">
                        <p className="text-sm font-black text-red-200">
                          Bạn cần đăng nhập để thực hiện chức năng đánh giá.
                        </p>
                        <button
                          type="button"
                          onClick={goLogin}
                          className="w-fit rounded-[14px] bg-[#FF1F3D] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#ff314d]"
                        >
                          Đăng nhập
                        </button>
                      </div>
                    ) : null}

                    {formError ? (
                      <p className="mt-3 text-sm font-black text-red-300">
                        {formError}
                      </p>
                    ) : null}
                  </div>

                  {dataMovieReviews.isLoading ? (
                    <p className="text-sm text-white/55">Đang tải đánh giá...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-white/55">
                      Chưa có đánh giá nào cho phim này.
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-4">
                        {reviews.map((review: any) => (
                          <li
                            key={review.id}
                            className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                          >
                            <div className="mb-3 flex items-start justify-between gap-4">
                              <div>
                                <span className="text-[15px] font-black text-white">
                                  {review.full_name}
                                </span>
                                <p className="mt-1 text-xs text-white/40">
                                  {review.createdAt
                                    ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                                    : ""}
                                </p>
                              </div>

                              <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-xs text-yellow-400">
                                <Star fontSize="small" className="text-yellow-400" />
                                <span className="font-black">{review.rating}</span>
                                <span className="text-white/55">/5</span>
                              </div>
                            </div>

                            <p className="text-sm leading-7 text-white/78">
                              {review.comment}
                            </p>
                          </li>
                        ))}
                      </ul>

                      {reviewsTotalPages > 1 ? (
                        <div className="mt-6 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setReviewPage((p) => Math.max(1, p - 1))
                            }
                            disabled={
                              reviewPage <= 1 || dataMovieReviews.isFetching
                            }
                            className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/[0.08] disabled:opacity-50"
                          >
                            Trước
                          </button>

                          <div className="flex items-center gap-2">
                            {pageWindow[0] > 1 ? (
                              <button
                                type="button"
                                onClick={() => setReviewPage(1)}
                                disabled={dataMovieReviews.isFetching}
                                className="rounded-[12px] border border-white/10 bg-black/25 px-3 py-2 text-sm font-black text-white/80 hover:bg-white/5 disabled:opacity-50"
                              >
                                1
                              </button>
                            ) : null}

                            {pageWindow[0] > 2 ? (
                              <span className="px-1 text-white/45">…</span>
                            ) : null}

                            {pageWindow.map((p) => {
                              const active = p === reviewPage;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setReviewPage(p)}
                                  disabled={dataMovieReviews.isFetching}
                                  className={[
                                    "rounded-[12px] border px-3 py-2 text-sm font-black",
                                    active
                                      ? "border-red-400/25 bg-red-500/15 text-white shadow-[0_12px_30px_rgba(255,31,61,0.12)]"
                                      : "border-white/10 bg-black/25 text-white/80 hover:bg-white/5",
                                    dataMovieReviews.isFetching ? "opacity-50" : "",
                                  ].join(" ")}
                                >
                                  {p}
                                </button>
                              );
                            })}

                            {pageWindow[pageWindow.length - 1] <
                            reviewsTotalPages - 1 ? (
                              <span className="px-1 text-white/45">…</span>
                            ) : null}

                            {pageWindow[pageWindow.length - 1] <
                            reviewsTotalPages ? (
                              <button
                                type="button"
                                onClick={() => setReviewPage(reviewsTotalPages)}
                                disabled={dataMovieReviews.isFetching}
                                className="rounded-[12px] border border-white/10 bg-black/25 px-3 py-2 text-sm font-black text-white/80 hover:bg-white/5 disabled:opacity-50"
                              >
                                {reviewsTotalPages}
                              </button>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setReviewPage((p) =>
                                Math.min(reviewsTotalPages, p + 1),
                              )
                            }
                            disabled={
                              reviewPage >= reviewsTotalPages ||
                              dataMovieReviews.isFetching
                            }
                            className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-white/85 transition hover:bg-white/[0.08] disabled:opacity-50"
                          >
                            Sau
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </section>
            </div>

            <aside className="w-full space-y-5 lg:w-80 xl:w-96">
              <section className="relative overflow-hidden rounded-[30px]">
                <div className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute -inset-12 rounded-[42px] bg-[radial-gradient(540px_280px_at_50%_30%,rgba(255,31,61,0.65),transparent_65%)] blur-3xl" />
                  <div className="absolute -inset-12 rounded-[42px] bg-[radial-gradient(760px_360px_at_50%_120%,rgba(255,31,61,0.28),transparent_74%)] blur-3xl" />
                </div>

                <div className="rounded-[30px] bg-[linear-gradient(135deg,rgba(255,31,61,1),rgba(255,31,61,0.72),rgba(255,74,99,1))] p-[2px] shadow-[0_0_0_1px_rgba(255,31,61,0.45),0_0_85px_rgba(255,31,61,0.34)]">
                  <div className="relative rounded-[28px] bg-[linear-gradient(180deg,rgba(120,9,28,0.95),rgba(62,5,15,0.96))] px-7 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
                    <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(520px_260px_at_50%_0%,rgba(255,255,255,0.08),transparent_62%)]" />

                    <p className="relative text-[13px] font-black uppercase tracking-[0.38em] text-white [text-shadow:0_0_20px_rgba(255,31,61,0.58)]">
                      ĐẶT VÉ NHANH
                    </p>

                    <p className="relative mx-auto mt-3 max-w-[42ch] text-[14px] font-semibold leading-relaxed text-white/88">
                      Chọn suất chiếu phù hợp và đặt vé chỉ với vài bước.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (selectedShowtimeId != null) {
                          router.push(`/booking/${selectedShowtimeId}`);
                        }
                      }}
                      disabled={selectedShowtimeId == null}
                      className="relative mt-6 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,#ffffff,#ffd9df)] px-5 py-4 text-[15px] font-black text-[#A4001C] shadow-[0_24px_65px_rgba(255,31,61,0.38),inset_0_2px_0_rgba(255,255,255,0.65)] transition hover:-translate-y-0.5 hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
                    >
                      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_55%)]" />
                      <span className="relative inline-flex items-center gap-2">
                        <ConfirmationNumber fontSize="small" />
                        Đặt Vé Ngay
                      </span>
                    </button>
                  </div>
                </div>
              </section>

              <section className={`${Glass} p-4`}>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <h2 className="text-base font-black md:text-lg">
                    Phim Liên Quan
                  </h2>

                  {movieGenre.isPending ||
                  movieGenre.isLoading ||
                  movieGenre.isRefetching ? (
                    <span className="text-xs font-semibold text-white/55">
                      Đang tải...
                    </span>
                  ) : null}
                </div>

                {movieGenre.isError ? (
                  <div className="rounded-[18px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    Không tải được phim liên quan.
                  </div>
                ) : movieGenre.isPending || movieGenre.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex w-full items-center gap-3 rounded-[18px] border border-white/8 bg-black/25 p-2"
                      >
                        <div className="h-16 w-12 rounded-lg border border-white/10 bg-black/30" />
                        <div className="flex-1">
                          <div className="h-4 w-2/3 rounded bg-white/10" />
                          <div className="mt-2 h-3 w-1/2 rounded bg-white/10" />
                          <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (relatedMovies ?? []).length === 0 ? (
                  <p className="text-sm text-white/55">Chưa có phim liên quan.</p>
                ) : (
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
                    {(relatedMovies ?? []).map((item: any) => {
                      const nextId = Number(item?.id);
                      const safeId =
                        Number.isFinite(nextId) && nextId > 0
                          ? Math.floor(nextId)
                          : 0;

                      const title = String(item?.title ?? "");
                      const genreName = String(item?.genre ?? "");
                      const duration = Number(item?.durationMinutes) || 0;

                      const poster =
                        item?.posterUrl ?? item?.poster_url ?? null;

                      return (
                        <button
                          key={safeId || title}
                          type="button"
                          onClick={() => {
                            if (!safeId) return;
                            router.push(`/movies/${safeId}`);
                          }}
                          className="flex w-full items-center gap-3 rounded-[18px] border border-white/8 bg-black/25 p-2 text-left shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-red-400/20 hover:bg-red-500/10"
                        >
                          <div className="h-16 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                            <img
                              src={resolveUrl(poster)}
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
                            <p className="line-clamp-2 text-sm font-black text-white">
                              {title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-white/55">
                              {genreName}
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
