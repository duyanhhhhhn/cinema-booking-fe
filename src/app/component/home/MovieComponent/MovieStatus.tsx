"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MoviePublic } from "@/types/data/movie-public";
import { useAuth } from "@/contexts/AuthContext";

type MovieTab = "dangChieu" | "sapChieu";

function SliderArrowButton({
  dir,
  onClick,
  disabled,
  className = "",
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Xem phim trước" : "Xem phim tiếp theo"}
      className={[
        "group absolute top-[33%] z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full md:flex",
        "border border-white/12 bg-black/55 text-white backdrop-blur-xl",
        "shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-300",
        "hover:border-white/25 hover:bg-black/75 hover:shadow-[0_16px_36px_rgba(0,0,0,0.56)]",
        "active:scale-[0.96]",
        disabled
          ? "pointer-events-none opacity-0 scale-90"
          : "opacity-100 hover:scale-[1.06]",
        className,
      ].join(" ")}
    >
      <span
        className={`transition-transform duration-300 ${
          disabled
            ? ""
            : dir === "left"
              ? "group-hover:-translate-x-0.5"
              : "group-hover:translate-x-0.5"
        }`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {dir === "left" ? (
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>
    </button>
  );
}

export default function MovieStatus() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<MovieTab>("dangChieu");
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openConfirmBooking, setOpenConfirmBooking] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [activeDateKey, setActiveDateKey] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<any | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const IMAGE_BASE = (
    process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080"
  ).replace(/\/+$/, "");

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl || !posterUrl.trim()) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${IMAGE_BASE}${raw}`;
    return `${IMAGE_BASE}/${raw}`;
  };

  const renderStatus = (status?: string | null) => {
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

  const statusPillClass = (status?: string | null) => {
    if (status === "NOW_SHOWING") {
      return "bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.55)] ring-1 ring-red-400/40";
    }
    if (status === "COMING_SOON") {
      return "bg-amber-500 text-black shadow-[0_0_18px_rgba(245,158,11,0.40)] ring-1 ring-amber-300/40";
    }
    return "bg-white/10 text-white/90 ring-1 ring-white/10";
  };

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

  const normalizeStatus = (s?: any) =>
    String(s ?? "").trim().toUpperCase().replace(/-/g, "_");

  const getMovieByStatus = useQuery({
    ...MoviePublic.getAllMovieStatusCard(),
  });

  const movie = getMovieByStatus?.data;
  const isLoading = getMovieByStatus.isLoading;
  const isError = getMovieByStatus.isError;

  const allMovies = useMemo(() => {
    const dataRaw = (movie as any)?.data;
    return Array.isArray(dataRaw) ? dataRaw : [];
  }, [movie]);

  const nowShowingAll = useMemo(
    () =>
      allMovies.filter(
        (m: any) => normalizeStatus(m?.status) === "NOW_SHOWING"
      ),
    [allMovies]
  );

  const comingSoonAll = useMemo(
    () =>
      allMovies.filter((m: any) => {
        const st = normalizeStatus(m?.status);
        return st === "COMING_SOON" || st === "UPCOMING";
      }),
    [allMovies]
  );

  const MAX_SHOW = 15;

  const listForTab = useMemo(() => {
    const list = tab === "dangChieu" ? nowShowingAll : comingSoonAll;
    return list.slice(0, MAX_SHOW);
  }, [tab, nowShowingAll, comingSoonAll]);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = () => {
    const el = viewportRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 8);
  };

  const scrollToDir = (dir: "left" | "right") => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card='1']");
    const step = card ? card.offsetWidth + 20 : 320;

    el.scrollBy({
      left: dir === "left" ? -step * 2 : step * 2,
      behavior: "smooth",
    });

    window.setTimeout(updateScrollState, 420);
  };

  const onTabChange = (next: MovieTab) => {
    setTab(next);
    requestAnimationFrame(() => {
      viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
      window.setTimeout(updateScrollState, 220);
    });
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    updateScrollState();

    const onScroll = () => updateScrollState();
    const onResize = () => updateScrollState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [listForTab.length, tab]);

  const selectedMovieId = Number(selectedMovie?.id ?? 0);

  const qMovieShowtimes = useQuery({
    ...MoviePublic.getMovieByCinema(selectedMovieId),
    enabled: openSchedule && selectedMovieId > 0,
  });

  const rawCinemaShowtimes = useMemo(() => {
    const raw = qMovieShowtimes.data as any;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [qMovieShowtimes.data]);

  const parseDateValue = (value: any): Date | null => {
    if (!value) return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    const str = String(value).trim();
    if (!str) return null;

    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) return d;

    return null;
  };

  const formatDateKey = (value: any) => {
    const d = parseDateValue(value);
    if (!d) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDateLabel = (dateKey: string) => {
    if (!dateKey) return { day: "", month: "", weekday: "" };
    const d = new Date(`${dateKey}T00:00:00`);
    const thu = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return { day: dd, month: mm, weekday: thu };
  };

  const formatDateDisplay = (dateKey?: string) => {
    if (!dateKey) return "--/--/----";
    const [yyyy, mm, dd] = dateKey.split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const extractShowtimeTime = (show: any) => {
    const dt = parseDateValue(show?.startTime);
    if (!dt) return "--:--";
    const hh = String(dt.getHours()).padStart(2, "0");
    const mm = String(dt.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const extractShowtimeDateKey = (show: any) => {
    return formatDateKey(show?.startTime);
  };

  const extractAvailableSeats = (show: any) => {
    const candidates = [
      show?.availableSeats,
      show?.availableSeat,
      show?.emptySeats,
      show?.emptySeat,
      show?.remainingSeats,
      show?.remainingSeat,
      show?.seatAvailable,
    ];

    for (const c of candidates) {
      if (typeof c === "number" && Number.isFinite(c)) return c;
      if (
        typeof c === "string" &&
        c.trim() !== "" &&
        !Number.isNaN(Number(c))
      ) {
        return Number(c);
      }
    }
    return null;
  };

  const normalizeCinemaBlocks = useMemo(() => {
    return rawCinemaShowtimes.map((cinema: any) => {
      const showtimes = Array.isArray(cinema?.showtimes) ? cinema.showtimes : [];

      const normalizedShowtimes = showtimes
        .map((show: any) => {
          const dateKey = extractShowtimeDateKey(show);

          return {
            id: Number(show?.id ?? 0),
            dateKey,
            timeLabel: extractShowtimeTime(show),
            availableSeats: extractAvailableSeats(show),
            formatLabel: show?.type ?? "2D",
          };
        })
        .filter((x: any) => x.id > 0 && x.dateKey);

      return {
        cinemaId: Number(cinema?.cinemaId ?? 0),
        cinemaName: cinema?.cinemaName ?? "Rạp",
        address: cinema?.address ?? "",
        cinemaImageUrl: cinema?.cinemaImageUrl ?? null,
        posterUrl: cinema?.posterUrl ?? null,
        durationMinutes: cinema?.durationMinutes ?? null,
        showtimes: normalizedShowtimes,
      };
    });
  }, [rawCinemaShowtimes]);

  const availableDateKeys = useMemo(() => {
    const set = new Set<string>();
    normalizeCinemaBlocks.forEach((cinema: any) => {
      cinema.showtimes.forEach((show: any) => {
        if (show.dateKey) set.add(show.dateKey);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [normalizeCinemaBlocks]);

  useEffect(() => {
    if (!openSchedule) return;
    if (!availableDateKeys.length) {
      setActiveDateKey("");
      return;
    }
    if (!activeDateKey || !availableDateKeys.includes(activeDateKey)) {
      setActiveDateKey(availableDateKeys[0]);
    }
  }, [openSchedule, availableDateKeys, activeDateKey]);

  const cinemaBlocksByDate = useMemo(() => {
    if (!activeDateKey) return [];
    return normalizeCinemaBlocks
      .map((cinema: any) => ({
        ...cinema,
        showtimes: cinema.showtimes.filter(
          (s: any) => s.dateKey === activeDateKey
        ),
      }))
      .filter((cinema: any) => cinema.showtimes.length > 0);
  }, [normalizeCinemaBlocks, activeDateKey]);

  const openScheduleModal = (movieItem: any) => {
    setSelectedMovie(movieItem);
    setSelectedShowtime(null);
    setOpenConfirmBooking(false);
    setActiveDateKey("");
    setOpenSchedule(true);
  };

  const closeScheduleModal = () => {
    setOpenSchedule(false);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setActiveDateKey("");
  };

  const closeConfirmModal = () => {
    setOpenConfirmBooking(false);
    setSelectedShowtime(null);
  };

  const buildCurrentUrl = () => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleChooseShowtime = (payload: {
    showtimeId: number;
    cinemaName: string;
    dateKey: string;
    timeLabel: string;
  }) => {
    setSelectedShowtime(payload);
    setOpenConfirmBooking(true);
  };

  const handleFinalConfirm = () => {
    const selectedShowtimeId = selectedShowtime?.showtimeId;
    if (selectedShowtimeId == null) return;

    if (!user) {
      const redirectUrl = encodeURIComponent(buildCurrentUrl());
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    router.push(`/booking/${selectedShowtimeId}`);
  };

  const handleMoviePrimaryAction = (movieItem: any) => {
    if (!movieItem?.id) return;

    const isNowShowing = normalizeStatus(movieItem?.status) === "NOW_SHOWING";

    if (isNowShowing) {
      openScheduleModal(movieItem);
      return;
    }

    router.push(`/movies/${movieItem.id}`);
  };

  return (
    <>
      <div className="pb-3 mb-4">
        <div className="flex border-b border-white/10 gap-8">
          <a
            className={
              tab === "dangChieu"
                ? "flex flex-col items-center justify-center border-b-[3px] border-b-red-500 text-white pb-[13px] pt-4"
                : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#E0E0E0]/70 pb-[13px] pt-4 hover:text-white transition-colors"
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange("dangChieu");
            }}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              Phim Đang Chiếu
            </p>
          </a>

          <a
            className={
              tab === "sapChieu"
                ? "flex flex-col items-center justify-center border-b-[3px] border-b-red-500 text-white pb-[13px] pt-4"
                : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#E0E0E0]/70 pb-[13px] pt-4 hover:text-white transition-colors"
            }
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange("sapChieu");
            }}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
              Phim Sắp Chiếu
            </p>
          </a>
        </div>
      </div>

      {isLoading && <div className="text-white/70 py-6">Đang tải phim...</div>}
      {isError && (
        <div className="text-white/70 py-6">Không tải được danh sách phim</div>
      )}

      {!isLoading && !isError && (
        <div className="relative overflow-visible">
          {listForTab.length > 0 && (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-4 bg-gradient-to-r from-[#070b11]/65 via-[#070b11]/20 to-transparent md:block" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-4 bg-gradient-to-l from-[#070b11]/65 via-[#070b11]/20 to-transparent md:block" />

              <SliderArrowButton
                dir="left"
                onClick={() => scrollToDir("left")}
                disabled={!canScrollLeft}
                className="-left-8 lg:-left-10 xl:-left-12"
              />

              <SliderArrowButton
                dir="right"
                onClick={() => scrollToDir("right")}
                disabled={!canScrollRight}
                className="-right-8 lg:-right-10 xl:-right-12"
              />
            </>
          )}

          <div
            ref={viewportRef}
            className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2 px-8 sm:px-10 md:px-16 lg:px-20 xl:px-24"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollSnapType: "x mandatory",
            }}
          >
            <style>{`.hide-scrollbar::-webkit-scrollbar{ display:none; }`}</style>

            {listForTab.map((m: any, idx: number) => {
              const isNowShowing = normalizeStatus(m?.status) === "NOW_SHOWING";

              return (
                <div
                  key={m?.id ?? `${m?.title ?? "movie"}-${idx}`}
                  data-card={idx === 0 ? "1" : "0"}
                  className="w-[220px] sm:w-[240px] flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="block">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const id = m?.id;
                        if (!id) return;
                        router.push(`/movies/${id}`);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        const id = m?.id;
                        if (!id) return;
                        router.push(`/movies/${id}`);
                      }}
                      className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-2xl overflow-hidden relative shadow-lg shadow-black/30 transform hover:scale-[1.02] transition-transform duration-300 ring-1 ring-white/10 bg-[#1E1E1E] cursor-pointer"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        data-alt={m?.title}
                        style={{
                          backgroundImage: `url("${resolvePosterUrl(
                            m?.posterUrl ?? null
                          )}")`,
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoviePrimaryAction(m);
                          }}
                          className={`w-full text-center font-bold py-2.5 rounded-xl text-sm shadow-lg transition-all duration-300 ${
                            isNowShowing
                              ? "bg-red-600 hover:bg-red-500 text-white"
                              : "bg-white/15 hover:bg-white/25 text-white border border-white/10"
                          }`}
                        >
                          {isNowShowing ? "Mua vé" : "Xem chi tiết"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-white text-base font-semibold leading-normal line-clamp-1">
                        {m?.title}
                      </p>

                      <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                        {m?.genre ? getGenreLabelVi(m?.genre) : "Chưa rõ thể loại"}
                        {typeof m?.durationMinutes === "number"
                          ? ` • ${m.durationMinutes} phút`
                          : ""}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold tracking-wide",
                            statusPillClass(normalizeStatus(m?.status)),
                          ].join(" ")}
                        >
                          {renderStatus(normalizeStatus(m?.status))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {listForTab.length === 0 && (
            <div className="text-white/60 py-4">Chưa có phim cho mục này.</div>
          )}
        </div>
      )}

      {openSchedule && (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(42,46,56,0.35),rgba(5,7,11,0.92))]"
            onClick={closeScheduleModal}
          />

          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-[28px] border border-white/10 bg-[#11161f] shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-[#7d8aa5]">
                    Quick Booking
                  </p>
                  <p className="mt-1 text-[22px] font-extrabold text-white">
                    {selectedMovie?.title ? `Lịch chiếu - ${selectedMovie.title}` : "Lịch chiếu"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                {qMovieShowtimes.isLoading && (
                  <div className="py-14 text-center text-[#98a2b3]">
                    Đang tải lịch chiếu...
                  </div>
                )}

                {!qMovieShowtimes.isLoading && availableDateKeys.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-14 text-center">
                    <p className="text-lg font-bold text-white">
                      Chưa có lịch chiếu
                    </p>
                    <p className="mt-2 text-sm text-[#98a2b3]">
                      Phim này hiện chưa có suất chiếu khả dụng.
                    </p>
                  </div>
                )}

                {!qMovieShowtimes.isLoading && availableDateKeys.length > 0 && (
                  <>
                    <div className="mb-7">
                      <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(32,40,56,0.95),rgba(14,18,26,0.98))] px-5 py-5 sm:px-6">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.25em] text-[#7d8aa5]">
                          Cinema
                        </p>
                        <p className="mt-2 text-[28px] font-extrabold text-white">
                          {cinemaBlocksByDate.length > 0
                            ? cinemaBlocksByDate[0]?.cinemaName
                            : "Hệ thống rạp"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8 flex gap-3 overflow-x-auto pb-1">
                      {availableDateKeys.map((dateKey) => {
                        const label = formatDateLabel(dateKey);
                        const active = activeDateKey === dateKey;

                        return (
                          <button
                            key={dateKey}
                            type="button"
                            onClick={() => setActiveDateKey(dateKey)}
                            className={`min-w-[128px] rounded-2xl border px-4 py-4 text-left transition ${
                              active
                                ? "border-[#3b82f6] bg-[#132033] text-white shadow-[0_12px_30px_rgba(59,130,246,0.18)]"
                                : "border-white/10 bg-white/[0.03] text-[#d7deea] hover:border-white/20 hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-end gap-1">
                              <span className="text-[34px] font-extrabold leading-none">
                                {label.day}
                              </span>
                              <span className="pb-[4px] text-[15px] font-bold">
                                /{label.month}
                              </span>
                            </div>
                            <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#93a1b9]">
                              {label.weekday}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-7">
                      {cinemaBlocksByDate.map((cinema: any) => {
                        const formatGroups = cinema.showtimes.reduce(
                          (acc: Record<string, any[]>, item: any) => {
                            const key = item.formatLabel || "2D";
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(item);
                            return acc;
                          },
                          {}
                        );

                        return (
                          <div
                            key={cinema.cinemaId}
                            className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                          >
                            <div className="mb-4">
                              <p className="text-[22px] font-extrabold text-white">
                                {cinema.cinemaName}
                              </p>
                              {cinema.address ? (
                                <p className="mt-1 text-sm text-[#98a2b3]">
                                  {cinema.address}
                                </p>
                              ) : null}
                            </div>

                            <div className="space-y-6">
                              {Object.entries(formatGroups).map(
                                ([formatLabel, items]) => (
                                  <div key={formatLabel}>
                                    <p className="mb-4 text-[14px] font-bold uppercase tracking-[0.22em] text-[#8ea0bf]">
                                      {formatLabel}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                                      {(items as any[]).map((show) => {
                                        const availableSeats = show.availableSeats;
                                        const soldOut =
                                          typeof availableSeats === "number"
                                            ? availableSeats <= 0
                                            : false;

                                        return (
                                          <button
                                            key={show.id}
                                            type="button"
                                            disabled={soldOut}
                                            onClick={() =>
                                              handleChooseShowtime({
                                                showtimeId: show.id,
                                                cinemaName: cinema.cinemaName,
                                                dateKey: show.dateKey,
                                                timeLabel: show.timeLabel,
                                              })
                                            }
                                            className={`rounded-2xl border px-4 py-4 text-center transition ${
                                              soldOut
                                                ? "cursor-not-allowed border-white/10 bg-white/[0.04] opacity-60"
                                                : "border-white/10 bg-[#171e2a] hover:border-[#3b82f6] hover:bg-[#1b2636] hover:shadow-[0_10px_24px_rgba(59,130,246,0.12)]"
                                            }`}
                                          >
                                            <div
                                              className={`text-[20px] font-extrabold ${
                                                soldOut
                                                  ? "text-[#f87171]"
                                                  : "text-[#60a5fa]"
                                              }`}
                                            >
                                              {show.timeLabel}
                                            </div>

                                            <div className="mt-2 text-[13px] font-semibold text-[#aab4c5]">
                                              {typeof availableSeats === "number"
                                                ? `${availableSeats} ghế trống`
                                                : "Chọn suất chiếu"}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {openConfirmBooking && selectedShowtime && (
        <div className="fixed inset-0 z-[1000]">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(55,65,81,0.28),rgba(2,6,12,0.94))]"
            onClick={closeConfirmModal}
          />

          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 md:p-10">
            <div className="mx-auto mt-6 w-full max-w-[980px] overflow-hidden rounded-[30px] border border-white/10 bg-[#0f141d] shadow-[0_35px_120px_rgba(0,0,0,0.7)]">
              <div className="relative overflow-hidden border-b border-white/10">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,41,59,0.95),rgba(11,15,23,0.98))]" />
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative flex items-start justify-between px-6 py-6 sm:px-8">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#8aa0c2]">
                      Quick Booking
                    </p>
                    <h3 className="mt-2 text-[24px] font-extrabold text-white sm:text-[28px]">
                      Xác nhận suất chiếu
                    </h3>
                    <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#aab6ca]">
                      Kiểm tra lại thông tin trước khi chuyển sang bước chọn ghế.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeConfirmModal}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111926] shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                    <div
                      className="aspect-[2/3] w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${resolvePosterUrl(
                          selectedMovie?.posterUrl ?? null
                        )}")`,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,27,38,0.98),rgba(13,18,27,0.98))] p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#7f94b4]">
                            Bộ phim bạn chọn
                          </p>
                          <h4 className="mt-2 text-[26px] font-extrabold leading-tight text-white sm:text-[30px]">
                            {selectedMovie?.title ?? "Tên phim"}
                          </h4>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {selectedMovie?.genre ? (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#d6ddeb]">
                                {getGenreLabelVi(selectedMovie?.genre)}
                              </span>
                            ) : null}
                            {typeof selectedMovie?.durationMinutes === "number" ? (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#d6ddeb]">
                                {selectedMovie.durationMinutes} phút
                              </span>
                            ) : null}
                            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-[#8ec5ff]">
                              Suất chiếu nhanh
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">
                            Trạng thái
                          </p>
                          <p className="mt-1 text-sm font-bold text-emerald-300">
                            Sẵn sàng đặt ghế
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-[22px] border border-white/10 bg-[#131b27] p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7e91af]">
                          Rạp chiếu
                        </p>
                        <p className="mt-3 text-lg font-extrabold leading-snug text-white">
                          {selectedShowtime.cinemaName}
                        </p>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-[#131b27] p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7e91af]">
                          Ngày chiếu
                        </p>
                        <p className="mt-3 text-lg font-extrabold text-white">
                          {formatDateDisplay(selectedShowtime.dateKey)}
                        </p>
                      </div>

                      <div className="rounded-[22px] border border-white/10 bg-[#131b27] p-5">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7e91af]">
                          Giờ chiếu
                        </p>
                        <p className="mt-3 text-lg font-extrabold text-[#7cc2ff]">
                          {selectedShowtime.timeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-[#7cc2ff]">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M12 8v4l2.5 2.5M22 12a10 10 0 11-20 0 10 10 0 0120 0z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Bước tiếp theo là chọn ghế
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[#9ba8bb]">
                            Sau khi xác nhận, hệ thống sẽ chuyển bạn đến màn hình chọn ghế của suất chiếu này.
                          </p>
                        </div>
                      </div>
                    </div>

                    {!user && (
                      <div className="rounded-[22px] border border-amber-400/15 bg-amber-500/10 px-5 py-4">
                        <p className="text-sm font-bold text-amber-200">
                          Bạn chưa đăng nhập
                        </p>
                        <p className="mt-1 text-sm leading-6 text-amber-100/80">
                          Khi bấm tiếp tục, hệ thống sẽ chuyển đến trang đăng nhập rồi quay lại đúng bước hiện tại.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeConfirmModal}
                        className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                      >
                        Quay lại
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalConfirm}
                        className="inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#38bdf8)] px-6 py-3.5 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(37,99,235,0.42)] active:scale-[0.99]"
                      >
                        Tiếp tục đặt ghế
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}