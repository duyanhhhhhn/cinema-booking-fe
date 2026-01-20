"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePublic } from "@/types/data/movie-public";

export default function CinemaList() {
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading, isError } = useQuery(
    MoviePublic.getAllMovieStatus({ page, perPage })
  );

  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (!raw) return "/poster/placeholder.jpg";
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
        return status ?? "";
    }
  };

  const movies = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.perPage)) : 1;

  const moviesSorted = movies
    .map((m, idx) => ({ m, idx }))
    .sort((x, y) => {
      const rank = (s?: string | null) => {
        switch (s) {
          case "NOW_SHOWING":
            return 0;
          case "COMING_SOON":
            return 1;
          case "ENDED":
            return 2;
          default:
            return 3;
        }
      };
      const d = rank(x.m.status) - rank(y.m.status);
      return d !== 0 ? d : x.idx - y.idx;
    })
    .map((x) => x.m);

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  if (isLoading) return <div className="text-white p-6">Loading...</div>;
  if (isError) return <div className="text-white p-6">Failed to load movies</div>;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#000000D3]">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-6 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          <div className="layout-content-container flex w-full max-w-[1320px] flex-1 flex-col">
            <main className="flex flex-col gap-8 py-6 md:py-10">
              <div className="flex flex-wrap items-center justify-between gap-4 px-2 sm:px-4">
                <p className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                  Danh sách Phim
                </p>
                <p className="text-white/60 text-sm font-medium">
                  Trang {meta?.page ?? page} / {totalPages}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center gap-7 px-2 sm:px-4">
                {moviesSorted.map((m) => (
                  <div key={m.id} className="w-full max-w-[300px]">
                    <a className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20">
                      <div className="w-full rounded-2xl bg-white/10 overflow-hidden">
                        <img
                          src={resolvePosterUrl(m.posterUrl)}
                          alt={m.title}
                          className="w-full aspect-[2/3] object-cover"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (img.dataset.fallback === "1") return;
                            img.dataset.fallback = "1";
                            img.src = "/poster/placeholder.jpg";
                          }}
                        />
                      </div>

                      <div className="mt-4">
                        <p className="text-white text-lg font-bold leading-snug line-clamp-1">
                          {m.title}
                        </p>

                        <p className="mt-1 text-white/60 text-sm font-normal leading-normal">
                          {m.genre} | {m.durationMinutes} phút
                        </p>

                        <p
                          className={[
                            "mt-3 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold tracking-wide",
                            "border shadow-[0_0_18px_rgba(239,68,68,0.18)]",
                            m.status === "NOW_SHOWING"
                              ? "border-red-300/80 bg-red-500/55 text-white shadow-[0_0_28px_rgba(239,68,68,0.45)]"
                              : "border-red-500/30 bg-red-500/12 text-red-100",
                          ].join(" ")}
                        >
                          {renderStatus(m.status)}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              <div className="px-2 sm:px-4">
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    type="button"
                    onClick={prevPage}
                    disabled={page <= 1}
                    className="h-11 px-5 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition disabled:opacity-40 disabled:hover:bg-white/5"
                  >
                    Trước
                  </button>

                  <span className="h-11 min-w-[96px] px-5 grid place-items-center rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-semibold">
                    {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={page >= totalPages}
                    className="h-11 px-5 rounded-xl bg-red-500 text-white font-semibold shadow-[0_10px_30px_rgba(239,68,68,0.25)] hover:bg-red-600 transition disabled:opacity-40 disabled:shadow-none disabled:hover:bg-red-500"
                  >
                    Sau
                  </button>
                </div>

                <p className="mt-3 text-center text-white/50 text-sm">
                  Tổng: {meta?.total ?? 0} phim • Mỗi trang: {meta?.perPage ?? perPage}
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
