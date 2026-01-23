"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePublic } from "@/types/data/movie-public";
import { useRouter } from "next/navigation";

export default function MovieStatus() {
  const router = useRouter();
  const [tab, setTab] = useState<"dangChieu" | "sapChieu">("dangChieu");

  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

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

  const getMovieByStatus = useQuery({
    ...MoviePublic.getAllMovieStatusCard(),
  });
  console.log("getMovieByStatus", getMovieByStatus?.data);
  const movie = getMovieByStatus?.data;

  const isLoading = getMovieByStatus.isLoading;
  const isError = getMovieByStatus.isError;

  const normalizeStatus = (s?: any) =>
    String(s ?? "")
      .trim()
      .toUpperCase()
      .replace(/-/g, "_");

  const allMovies = useMemo(() => {
    const dataRaw = (movie as any)?.data;
    return Array.isArray(dataRaw) ? dataRaw : [];
  }, [movie]);

  const nowShowingAll = useMemo(
    () => allMovies.filter((m: any) => normalizeStatus(m?.status) === "NOW_SHOWING"),
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

  const scrollToDir = (dir: "left" | "right") => {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card='1']");
    const step = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: dir === "left" ? -step * 2 : step * 2, behavior: "smooth" });
  };

  const onTabChange = (next: "dangChieu" | "sapChieu") => {
    setTab(next);
    requestAnimationFrame(() => {
      viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    });
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
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Phim Đang Chiếu</p>
          </a>{" "}
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
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Phim Sắp Chiếu</p>
          </a>
        </div>
      </div>

      {isLoading && <div className="text-white/70 py-6">Loading movies...</div>}
      {isError && <div className="text-white/70 py-6">Failed to load movies</div>}

      {!isLoading && !isError && (
        <div className="relative">
          <div className="absolute -top-2 right-0 z-10 hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToDir("left")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollToDir("right")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div
            ref={viewportRef}
            className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
          >
            <style>{`.hide-scrollbar::-webkit-scrollbar{ display:none; }`}</style>

            {listForTab.map((m: any, idx: number) => (
              <div
                key={m?.id ?? `${m?.title ?? "movie"}-${idx}`}
                data-card={idx === 0 ? "1" : "0"}
                className="w-[220px] sm:w-[240px] flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
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
                  className="block cursor-pointer"
                >
                  <div className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-2xl overflow-hidden relative shadow-lg shadow-black/30 transform hover:scale-[1.02] transition-transform duration-300 ring-1 ring-white/10 bg-[#1E1E1E]">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      data-alt={m?.title}
                      style={{ backgroundImage: `url("${resolvePosterUrl(m?.posterUrl ?? null)}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <button className="w-full text-center bg-red-600 text-white font-bold py-2 rounded-md text-sm opacity-0 hover:opacity-100 translate-y-4 hover:translate-y-0 transition-all duration-300">
                        Mua Vé
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-white text-base font-semibold leading-normal line-clamp-1">{m?.title}</p>
                    <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                      {m?.genre ?? "Chưa rõ thể loại"}
                      {typeof m?.durationMinutes === "number" ? ` • ${m.durationMinutes} phút` : ""}
                    </p>

                    <div className="mt-2">
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
            ))}
          </div>

          {listForTab.length === 0 && <div className="text-white/60 py-4">Chưa có phim cho mục này.</div>}

          {listForTab.length > 0 && (
            <div className="mt-5 flex items-center justify-end gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => scrollToDir("left")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollToDir("right")}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
