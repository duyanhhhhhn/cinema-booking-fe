"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePublic } from "@/types/data/movie-public";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import { useRouter } from "next/navigation";
import { Pagination, Stack, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import UpcomingRoundedIcon from "@mui/icons-material/UpcomingRounded";
import MovieFilterRoundedIcon from "@mui/icons-material/MovieFilterRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import { Be_Vietnam_Pro } from "next/font/google";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700", "800"],
});

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

  const didResetRef = useRef(false);

  useEffect(() => {
    if (didResetRef.current) return;
    didResetRef.current = true;

    updateQuery({
      page: "1",
      perPage: "15",
      title: null,
      genre: null,
      status: "NOW_SHOWING",
    });
  }, [updateQuery]);

  const params = useMemo(() => {
    const pageRaw = Number(searchQuery.get("page") ?? 1);
    const perPageRaw = Number(searchQuery.get("perPage"));

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

  const activeTab: TabKey = useMemo(() => {
    const raw = (searchQuery.get("status") ?? "").trim();
    return raw === "COMING_SOON" ? "COMING_SOON" : "NOW_SHOWING";
  }, [searchQuery]);

  const [titleInput, setTitleInput] = useState("");
  const [genreInput, setGenreInput] = useState("");

  useEffect(() => {
    setTitleInput(params.title);
    setGenreInput(params.genre);
  }, [params.title, params.genre]);

  const apiParams = useMemo(() => {
    return {
      ...params,
      status: activeTab,
      title: params.title.trim() ? params.title.trim() : undefined,
      genre: params.genre.trim() ? params.genre.trim() : undefined,
    };
  }, [params, activeTab]);

  const dataMovie = useQuery({
    ...MoviePublic.objects.paginateQueryFactory(apiParams as any),
  });

  const movies = (dataMovie.data?.data ?? []) as any[];
  const totalItems =
    (dataMovie.data as any)?.meta?.total ??
    (Array.isArray(movies) ? movies.length : 0);

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

  const viStatus = (status?: string | null) => {
    if (status === "NOW_SHOWING") return "Đang chiếu";
    if (status === "COMING_SOON") return "Sắp chiếu";
    if (status === "ENDED") return "Đã kết thúc";
    return "Chưa rõ";
  };

  const formatAgeRating = (value?: string | null) => {
    const raw = (value ?? "").trim();
    if (!raw) return "TBA";
    if (/^\d+$/.test(raw)) return `${raw}+`;
    return raw.toUpperCase();
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
    <div className={`${beVietnam.className} relative min-h-screen w-full overflow-x-hidden bg-[#121212] text-white`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_15%_-5%,rgba(255,255,255,0.03),transparent_58%),radial-gradient(900px_500px_at_100%_10%,rgba(255,255,255,0.02),transparent_55%)]" />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500/20 border-t-red-500" />
            <p className="text-sm font-extrabold text-white/85">
              Đang tải chi tiết phim...
            </p>
          </div>
        </div>
      )}

      {loadingPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-[5px] border-red-500/20 border-t-red-500" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-9">
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Danh sách Phim
            </h1>
            <p className="mt-2 text-sm font-medium text-white/45">
              Khám phá các phim đang chiếu và sắp chiếu với giao diện trực quan hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_auto_260px]">
            <div className="flex w-full items-center gap-3 rounded-[22px] bg-[#191919] px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.30)] ring-1 ring-white/[0.05]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#111111] text-white/55">
                <SearchRoundedIcon sx={{ fontSize: 20 }} />
              </div>

              <input
                value={titleInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setTitleInput(v);

                  if (v.trim() === "" && params.title !== "") {
                    applyFilter("", genreInput);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilter(titleInput, genreInput);
                }}
                placeholder="Tìm kiếm theo tên phim..."
                className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/30 outline-none"
              />

              <button
                type="button"
                onClick={() => applyFilter(titleInput, genreInput)}
                className="shrink-0 rounded-[16px] bg-[#ff1f3d] px-6 py-3 text-sm font-black text-white shadow-[0_14px_32px_rgba(255,31,61,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ff314d]"
              >
                Tìm
              </button>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 rounded-[22px] bg-[#191919] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.30)] ring-1 ring-white/[0.05] xl:w-[380px]">
              <button
                type="button"
                onClick={() => setTab("NOW_SHOWING")}
                className={[
                  "inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-black transition-all duration-200",
                  activeTab === "NOW_SHOWING"
                    ? "bg-[#ff1f3d] text-white shadow-[0_14px_30px_rgba(255,31,61,0.30)]"
                    : "bg-transparent text-white/55 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <PlayCircleRoundedIcon sx={{ fontSize: 18 }} />
                Đang chiếu
              </button>

              <button
                type="button"
                onClick={() => setTab("COMING_SOON")}
                className={[
                  "inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[16px] px-4 text-sm font-black transition-all duration-200",
                  activeTab === "COMING_SOON"
                    ? "bg-[#ff1f3d] text-white shadow-[0_14px_30px_rgba(255,31,61,0.30)]"
                    : "bg-transparent text-white/55 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <UpcomingRoundedIcon sx={{ fontSize: 18 }} />
                Sắp chiếu
              </button>
            </div>

            <div className="relative">
              <MovieFilterRoundedIcon
                sx={{ fontSize: 19 }}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45"
              />
              <select
                value={genreInput}
                onChange={(e) => {
                  const g = e.target.value;
                  setGenreInput(g);
                  applyFilter(titleInput, g);
                }}
                className="h-full min-h-[64px] w-full appearance-none rounded-[22px] bg-[#191919] pl-12 pr-5 text-[15px] font-semibold text-white outline-none shadow-[0_20px_40px_rgba(0,0,0,0.30)] ring-1 ring-white/[0.05]"
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

        {dataMovie.isLoading ? (
          <div className="py-16 text-center text-sm text-white/70">
            Đang tải dữ liệu...
          </div>
        ) : movies.length === 0 ? (
          <div className="rounded-[28px] bg-[#171717] py-16 text-center shadow-[0_18px_35px_rgba(0,0,0,0.25)]">
            <div className="text-lg font-extrabold text-white">
              Không có phim phù hợp
            </div>
            <div className="mt-2 text-sm text-white/60">
              Hãy thử đổi bộ lọc hoặc xoá từ khoá tìm kiếm.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-6">
            {movies.map((m: any) => (
              <button
                key={m.id}
                type="button"
                className="group h-full text-left"
                onClick={() => {
                  setLoading(true);
                  setTimeout(
                    () => router.push(`/movies/${m.id}`),
                    MIN_LOADING_TIME,
                  );
                }}
              >
                <div
                  className="
                    h-full overflow-hidden rounded-[24px] bg-[#171717]
                    shadow-[0_22px_55px_rgba(0,0,0,0.38)]
                    transition-all duration-300
                    group-hover:-translate-y-1.5
                    group-hover:bg-[#1b1b1b]
                    group-hover:shadow-[0_30px_75px_rgba(0,0,0,0.55)]
                  "
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={resolvePosterUrl(m.posterUrl)}
                      alt={m.title}
                      className="aspect-[0.74] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.dataset.fallback === "1") return;
                        img.dataset.fallback = "1";
                        img.src = "/poster/placeholder.jpg";
                      }}
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] shadow-[0_8px_20px_rgba(0,0,0,0.22)]",
                          m.status === "NOW_SHOWING"
                            ? "bg-[#ff1f3d] text-white"
                            : m.status === "COMING_SOON"
                              ? "bg-[#ff5b1f] text-white"
                              : "bg-[#3A3F47] text-white",
                        ].join(" ")}
                      >
                        {viStatus(m.status)}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-5 sm:px-5">
                    <div className="min-h-[54px] line-clamp-2 text-[17px] font-black leading-snug text-white sm:text-[18px]">
                      {m.title}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm font-medium text-white/52">
                      <TheatersRoundedIcon sx={{ fontSize: 16 }} />
                      <span className="line-clamp-1">{viGenre(m.genre)}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <span
                        className="
                          inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px]
                          bg-[#101010] px-3 text-xs font-black text-white/90
                        "
                      >
                        <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                        <span className="leading-none">{m.durationMinutes} phút</span>
                      </span>

                      <span
                        className="
                          inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px]
                          bg-[#101010] px-3 text-xs font-black text-white/90
                        "
                      >
                        <LocalOfferRoundedIcon sx={{ fontSize: 16 }} />
                        <span className="leading-none">{formatAgeRating(m.agerating)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ width: "100%" }}
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
                  MIN_LOADING_PAGE_TIME,
                );
              }}
              shape="rounded"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPagination-ul": {
                  justifyContent: "center",
                  gap: "12px",
                },
                "& .MuiPaginationItem-root": {
                  minWidth: 48,
                  height: 48,
                  borderRadius: "16px",
                  fontSize: "15px",
                  fontWeight: 900,
                  border: "none",
                  color: "rgba(255,255,255,0.88)",
                  backgroundColor: "#191919",
                  transition: "all 180ms ease",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "#222222",
                  transform: "translateY(-1px)",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#ff1f3d",
                  color: "#FFFFFF",
                  boxShadow: "0 14px 30px rgba(255,31,61,0.34)",
                },
                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "#ff314d",
                },
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" sx={{ mt: 1.8 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.55)", fontWeight: 600 }}
            >
              Hiển thị{" "}
              <b>
                {startItem}-{endItem}
              </b>{" "}
              trên <b>{totalItems}</b>
            </Typography>
          </Stack>
        </div>
      </div>
    </div>
  );
}
