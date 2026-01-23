"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePublic } from "@/types/data/movie-public";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import { useRouter } from "next/navigation";
import { Pagination, Stack, Typography } from "@mui/material";

const GENRES = [
  "ACTION",
  "COMEDY",
  "ROMANCE",
  "DRAMA",
  "HORROR",
  "THRILLER",
  "SCI_FI",
  "FANTASY",
  "ANIMATION",
  "ADVENTURE",
  "CRIME",
  "WAR",
  "FAMILY",
  "MUSIC",
  "DOCUMENTARY",
  "MYSTERY",
] as const;

export default function CinemaList() {
  const router = useRouter();
  const { searchQuery, updateQuery } = useRouteQuery();
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  // ===== keep old params logic, just add title + genre from query =====
  const params = useMemo(() => {
    const pageRaw = Number(searchQuery.get("page") ?? 1);
    const perPageRaw = Number(searchQuery.get("perPage") ?? 12);

    const page =
      Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const perPage =
      Number.isFinite(perPageRaw) && perPageRaw > 0
        ? Math.floor(perPageRaw)
        : 12;

    const title = (searchQuery.get("title") ?? "").trim();
    const genre = (searchQuery.get("genre") ?? "").trim();

    return { page, perPage, title, genre };
  }, [searchQuery]);

  // ===== local inputs for filter UI (simple) =====
  const [titleInput, setTitleInput] = useState(params.title);
  const [genreInput, setGenreInput] = useState(params.genre);

  const dataMovie = useQuery({
    ...MoviePublic.objects.paginateQueryFactory(params),
  });

  const totalItems = dataMovie.data?.meta?.total ?? 0;
  const itemsPerPage = params.perPage;

  const totalPages = useMemo(() => {
    const perPage =
      Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 12;
    const total = Number(totalItems) || 0;
    return Math.max(1, Math.ceil(total / perPage));
  }, [totalItems, itemsPerPage]);

  const currentPage = useMemo(() => {
    return Math.min(Math.max(params.page, 1), totalPages);
  }, [params.page, totalPages]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem =
    totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const IMAGE_BASE = (
    process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080"
  ).replace(/\/+$/, "");

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

  const MIN_LOADING_TIME = 350;
  const MIN_LOADING_PAGE_TIME = 700;

  const applyFilter = (nextTitle: string, nextGenre: string) => {
    updateQuery({
      page: "1",
      title: nextTitle.trim() ? nextTitle.trim() : null,
      genre: nextGenre.trim() ? nextGenre.trim() : null,
    });
  };

  const resetFilter = () => {
    setTitleInput("");
    setGenreInput("");
    updateQuery({ page: "1", title: null, genre: null });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#000000D3]">
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500/30 border-t-red-500" />
            <p className="text-sm font-semibold text-red-200">
              Đang tải chi tiết phim...
            </p>
          </div>
        </div>
      )}

      {loadingPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="h-16 w-16 animate-spin rounded-full border-[5px] border-red-500/25 border-t-red-500" />
        </div>
      )}

      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-6 sm:px-8 md:px-16 lg:px-24 xl:px-40">
          <div className="layout-content-container flex w-full max-w-[1320px] flex-1 flex-col">
            <main className="flex flex-col gap-6 py-6 md:py-10">
              {/* Title */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-2 sm:px-4">
                <p className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                  Danh sách Phim
                </p>
              </div>

              {/* Filter (same width as grid: px-2 sm:px-4) */}
              <div className="px-2 sm:px-4">
                <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyFilter(titleInput, genreInput);
                      }}
                      placeholder="Tìm theo tên phim..."
                      className="w-full flex-1 rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-500/30"
                    />

                    <select
                      value={genreInput}
                      onChange={(e) => {
                        const g = e.target.value;
                        setGenreInput(g);
                        applyFilter(titleInput, g);
                      }}
                      className="w-full sm:w-[260px] rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-white outline-none focus:border-red-400/60 focus:ring-2 focus:ring-red-500/30"
                    >
                      <option value="">Tất cả thể loại</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => applyFilter(titleInput, genreInput)}
                        className="w-full sm:w-auto rounded-2xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-700"
                      >
                        Tìm
                      </button>

                      <button
                        type="button"
                        onClick={resetFilter}
                        className="w-full sm:w-auto rounded-2xl border border-white/14 bg-white/5 px-5 py-3 text-sm font-extrabold text-white/85 hover:bg-white/10"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* optional: show current applied filter (very light) */}
                  <div className="mt-3 text-xs font-semibold text-white/55">
                    Đang lọc:{" "}
                    <span className="text-white/80">
                      {params.title ? `"${params.title}"` : "tất cả tiêu đề"}
                    </span>{" "}
                    •{" "}
                    <span className="text-white/80">
                      {params.genre ? params.genre : "tất cả thể loại"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center gap-7 px-2 sm:px-4">
                {dataMovie.data?.data?.map((m: any) => (
                  <div key={m.id} className="w-full max-w-[300px]">
                    {m?.id && (
                      <div
                        role="button"
                        tabIndex={0}
                        className="block cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20"
                        onClick={() => {
                          setLoading(true);
                          setTimeout(() => {
                            router.push(`/movies/${m.id}`);
                          }, MIN_LOADING_TIME);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setLoading(true);
                            setTimeout(() => {
                              router.push(`/movies/${m.id}`);
                            }, MIN_LOADING_TIME);
                          }
                        }}
                      >
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
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-2 sm:px-4">
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ pt: 3, pb: 1, width: "100%" }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, value) => {
                      if (value === currentPage) return;
                      setLoadingPage(true);
                      updateQuery({ page: value.toString() });
                      window.setTimeout(
                        () => setLoadingPage(false),
                        MIN_LOADING_PAGE_TIME
                      );
                    }}
                    shape="rounded"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                      "& .MuiPagination-ul": {
                        justifyContent: "center",
                        gap: "10px",
                      },
                      "& .MuiPaginationItem-root": {
                        minWidth: 44,
                        height: 44,
                        borderRadius: "14px",
                        fontSize: "16px",
                        fontWeight: 800,
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "rgba(255,255,255,0.88)",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        backdropFilter: "blur(10px)",
                        transition: "all 180ms ease",
                      },
                      "& .MuiPaginationItem-root:hover": {
                        backgroundColor: "rgba(255,255,255,0.12)",
                        borderColor: "rgba(255,255,255,0.22)",
                        transform: "translateY(-1px)",
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#ec131e",
                        color: "white",
                        borderColor: "rgba(236,19,30,0.55)",
                        boxShadow: "0 10px 26px rgba(236,19,30,0.35)",
                      },
                      "& .MuiPaginationItem-root.Mui-selected:hover": {
                        backgroundColor: "#c91019",
                      },
                      "& .MuiPaginationItem-previousNext, & .MuiPaginationItem-firstLast":
                        { fontWeight: 900 },
                    }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị <b>{startItem}-{endItem}</b> trên <b>{totalItems}</b>
                  </Typography>
                </Stack>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
