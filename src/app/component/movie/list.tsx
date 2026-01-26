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

type TabKey = "NOW_SHOWING" | "COMING_SOON";

export default function CinemaList() {
  const router = useRouter();
  const { searchQuery, updateQuery } = useRouteQuery();

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  const params = useMemo(() => {
    const pageRaw = Number(searchQuery.get("page") ?? 1);
    const perPageRaw = Number(searchQuery.get("perPage") ?? 12);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const perPage =
      Number.isFinite(perPageRaw) && perPageRaw > 0 ? Math.floor(perPageRaw) : 12;

    const title = (searchQuery.get("title") ?? "").trim();
    const genre = (searchQuery.get("genre") ?? "").trim();

    return { page, perPage, title, genre };
  }, [searchQuery]);

  const [titleInput, setTitleInput] = useState(params.title);
  const [genreInput, setGenreInput] = useState(params.genre);

  const activeTab: TabKey = useMemo(() => {
    const raw = (searchQuery.get("status") ?? "").trim();
    return raw === "COMING_SOON" ? "COMING_SOON" : "NOW_SHOWING";
  }, [searchQuery]);

  const dataMovie = useQuery({
    ...MoviePublic.objects.paginateQueryFactory({
      ...params,
      status: activeTab,
    } as any),
  });

  const totalItems = dataMovie.data?.meta?.total ?? 0;
  const itemsPerPage = params.perPage;

  const totalPages = useMemo(() => {
    const perPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 12;
    const total = Number(totalItems) || 0;
    return Math.max(1, Math.ceil(total / perPage));
  }, [totalItems, itemsPerPage]);

  const currentPage = useMemo(() => {
    return Math.min(Math.max(params.page, 1), totalPages);
  }, [params.page, totalPages]);

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
    /\/+$/,
    ""
  );

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (!raw) return "/poster/placeholder.jpg";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${IMAGE_BASE}${raw}`;
    return `${IMAGE_BASE}/${raw}`;
  };

  const viGenre = (g?: string | null) => {
    if (!g) return "";
    const map: Record<string, string> = {
      ACTION: "Hành động",
      COMEDY: "Hài",
      ROMANCE: "Lãng mạn",
      DRAMA: "Tâm lý",
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
    return map[g] ?? g;
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

  const setTab = (tab: TabKey) => {
    updateQuery({
      page: "1",
      status: tab === "COMING_SOON" ? "COMING_SOON" : "NOW_SHOWING",
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0B0C0F] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1100px_560px_at_25%_-10%,rgba(225,29,46,0.14),transparent_60%),radial-gradient(900px_520px_at_85%_20%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(1000px_560px_at_30%_110%,rgba(153,27,27,0.10),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#17181D]/45 via-[#0B0C0F]/70 to-[#0B0C0F]" />
      <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[2px]" />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500/25 border-t-red-400" />
            <p className="text-sm font-extrabold text-white/85">Đang tải chi tiết phim...</p>
          </div>
        </div>
      )}

      {loadingPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-[5px] border-red-500/20 border-t-red-400" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Danh sách Phim</h1>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.40)] backdrop-blur-xl">
              <span className="text-white/55">⌕</span>
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilter(titleInput, genreInput);
                }}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
              />
            </div>

            <div className="flex w-full items-center justify-between gap-3 md:w-auto">
              <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.40)] backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setTab("NOW_SHOWING")}
                  className={[
                    "rounded-xl px-5 py-2 text-sm font-extrabold transition",
                    activeTab === "NOW_SHOWING"
                      ? "bg-[#E11D2E] text-white shadow-[0_16px_40px_rgba(225,29,46,0.45)]"
                      : "text-white/65 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  Đang chiếu
                </button>

                <button
                  type="button"
                  onClick={() => setTab("COMING_SOON")}
                  className={[
                    "rounded-xl px-5 py-2 text-sm font-extrabold transition",
                    activeTab === "COMING_SOON"
                      ? "bg-[#7F1D1D]/70 text-white shadow-[0_12px_28px_rgba(127,29,29,0.25)]"
                      : "text-white/65 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  Sắp chiếu
                </button>
              </div>

              <select
                value={genreInput}
                onChange={(e) => {
                  const g = e.target.value;
                  setGenreInput(g);
                  applyFilter(titleInput, g);
                }}
                className="w-full md:w-[220px] rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none shadow-[0_16px_40px_rgba(0,0,0,0.40)] backdrop-blur-xl"
              >
                <option value="">Tất cả thể loại</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {viGenre(g)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {(dataMovie.data?.data ?? []).map((m: any) => (
            <button
              key={m.id}
              type="button"
              className="group text-left"
              onClick={() => {
                setLoading(true);
                setTimeout(() => router.push(`/movies/${m.id}`), MIN_LOADING_TIME);
              }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl transition group-hover:border-white/20 group-hover:bg-black/30">
                <div className="overflow-hidden">
                  <img
                    src={resolvePosterUrl(m.posterUrl)}
                    alt={m.title}
                    className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.dataset.fallback === "1") return;
                      img.dataset.fallback = "1";
                      img.src = "/poster/placeholder.jpg";
                    }}
                  />
                </div>
              </div>

              <div className="mt-3">
                <div className="line-clamp-2 text-[14px] font-extrabold leading-snug text-white sm:text-[15px]">
                  {m.title}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {viGenre(m.genre)} | {m.durationMinutes} phút
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ width: "100%" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => {
                if (value === currentPage) return;
                setLoadingPage(true);
                updateQuery({ page: value.toString() });
                window.setTimeout(() => setLoadingPage(false), MIN_LOADING_PAGE_TIME);
              }}
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPagination-ul": { justifyContent: "center", gap: "10px" },
                "& .MuiPaginationItem-root": {
                  minWidth: 44,
                  height: 44,
                  borderRadius: "14px",
                  fontSize: "16px",
                  fontWeight: 900,
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.88)",
                  backgroundColor: "rgba(0,0,0,0.25)",
                  backdropFilter: "blur(12px)",
                  transition: "all 180ms ease",
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "rgba(225,29,46,0.10)",
                  borderColor: "rgba(225,29,46,0.30)",
                  transform: "translateY(-1px)",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#E11D2E",
                  color: "#FFFFFF",
                  borderColor: "rgba(225,29,46,0.55)",
                  boxShadow: "0 14px 30px rgba(225,29,46,0.28)",
                },
                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "#C81B2A",
                },
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị <b>{startItem}-{endItem}</b> trên <b>{totalItems}</b>
            </Typography>
          </Stack>
        </div>
      </div>
    </div>
  );
}
