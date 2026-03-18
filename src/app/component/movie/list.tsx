"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0A0B0D] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_620px_at_18%_-10%,rgba(225,29,46,0.14),transparent_58%),radial-gradient(1000px_560px_at_90%_18%,rgba(255,255,255,0.04),transparent_52%),radial-gradient(900px_540px_at_50%_120%,rgba(127,29,29,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#121419]/50 via-[#0A0B0D]/72 to-[#08090B]" />

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 animate-spin border-4 border-red-500/25 border-t-red-400" />
            <p className="text-sm font-extrabold text-white/85">
              Đang tải chi tiết phim...
            </p>
          </div>
        </div>
      )}

      {loadingPage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="h-16 w-16 animate-spin border-[5px] border-red-500/20 border-t-red-400" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Danh sách Phim
          </h1>

          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_auto_260px]">
            <div className="flex w-full items-center gap-3 border border-white/10 bg-[#0E1014] px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
              <span className="text-base text-white/45">⌕</span>
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
                className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/35 outline-none"
              />

              <button
                type="button"
                onClick={() => applyFilter(titleInput, genreInput)}
                className="shrink-0 border border-[#F1263D]/25 bg-gradient-to-b from-[#F1263D] to-[#D7142A] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(225,29,46,0.28)] transition hover:from-[#ff3148] hover:to-[#da1830]"
              >
                Tìm
              </button>
            </div>

            <div className="grid w-full grid-cols-2 overflow-hidden border border-white/10 bg-[#0E1014] shadow-[0_18px_45px_rgba(0,0,0,0.35)] xl:w-[360px]">
              <button
                type="button"
                onClick={() => setTab("NOW_SHOWING")}
                className={[
                  "min-h-[58px] w-full text-center text-sm font-black transition-all duration-200",
                  activeTab === "NOW_SHOWING"
                    ? "bg-gradient-to-b from-[#F1263D] to-[#D7142A] text-white"
                    : "bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                Đang chiếu
              </button>

              <button
                type="button"
                onClick={() => setTab("COMING_SOON")}
                className={[
                  "min-h-[58px] w-full border-l border-white/10 text-center text-sm font-black transition-all duration-200",
                  activeTab === "COMING_SOON"
                    ? "bg-gradient-to-b from-[#7A2A2E] to-[#5E1D21] text-white"
                    : "bg-transparent text-white/60 hover:bg-white/[0.04] hover:text-white",
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
              className="w-full border border-white/10 bg-[#0E1014] px-5 py-4 text-[15px] font-semibold text-white outline-none shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
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

        {dataMovie.isLoading ? (
          <div className="py-16 text-center text-sm text-white/70">
            Đang tải dữ liệu...
          </div>
        ) : movies.length === 0 ? (
          <div className="py-16 text-center">
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
                    h-full overflow-hidden border border-white/10 bg-[#0F1115]
                    shadow-[0_22px_55px_rgba(0,0,0,0.42)]
                    transition-all duration-300
                    group-hover:-translate-y-1
                    group-hover:border-white/18
                    group-hover:bg-[#12141A]
                    group-hover:shadow-[0_28px_70px_rgba(0,0,0,0.56)]
                  "
                >
                  <div className="relative overflow-hidden border-b border-white/8">
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

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

                    <div className="absolute left-0 top-0">
                      <span
                        className={[
                          "inline-flex px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em]",
                          m.status === "NOW_SHOWING"
                            ? "bg-[#E11D2E] text-white"
                            : m.status === "COMING_SOON"
                              ? "bg-[#8B5E1A] text-white"
                              : "bg-[#3A3F47] text-white",
                        ].join(" ")}
                      >
                        {viStatus(m.status)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-[#101216] to-[#0B0C0F] px-4 pb-4 pt-5 sm:px-5">
                    <div className="min-h-[54px] line-clamp-2 text-[16px] font-black leading-snug text-white sm:text-[17px]">
                      {m.title}
                    </div>

                    <div className="mt-2 text-sm font-medium text-white/55">
                      {viGenre(m.genre)}
                    </div>

                    <div className="mt-3 border border-white/8 bg-[#141821] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white/82">
                      {viStatus(m.status)}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <span
                        className="
                          inline-flex items-center justify-center border border-[#34527B]/50
                          bg-gradient-to-r from-[#172233] to-[#23324A]
                          px-3 py-2.5 text-xs font-black text-[#EAF2FF]
                          shadow-[0_10px_24px_rgba(23,34,51,0.34)]
                        "
                      >
                        {m.durationMinutes} phút
                      </span>

                      <span
                        className="
                          inline-flex items-center justify-center border border-[#6C7B39]/45
                          bg-gradient-to-r from-[#202714] to-[#38461D]
                          px-3 py-2.5 text-xs font-black text-[#F2FFD9]
                          shadow-[0_10px_24px_rgba(56,70,29,0.24)]
                        "
                      >
                        {formatAgeRating(m.agerating)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-9">
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
                  gap: "10px",
                },
                "& .MuiPaginationItem-root": {
                  minWidth: 46,
                  height: 46,
                  borderRadius: "0px",
                  fontSize: "15px",
                  fontWeight: 900,
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.9)",
                  backgroundColor: "rgba(255,255,255,0.03)",
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

          <Stack direction="row" justifyContent="center" sx={{ mt: 1.5 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.58)", fontWeight: 500 }}
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
