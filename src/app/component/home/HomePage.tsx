"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoviePublic } from "@/types/data/movie-public";
import { useRouter } from "next/navigation";

type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED" | string;

type IMovieCard = {
  id?: number;
  title: string;
  genre?: string | null;
  posterUrl?: string | null;
  durationMinutes?: number | null;
  status?: MovieStatus | null;
};

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"dangChieu" | "sapChieu">("dangChieu");

  const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

  const resolvePosterUrl = (posterUrl?: string | null) => {
    if (!posterUrl || !posterUrl.trim()) return "/poster/placeholder.jpg";
    const raw = posterUrl.trim();
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${IMAGE_BASE}${raw}`;
    return `${IMAGE_BASE}/${raw}`;
  };

  const renderStatus = (status?: MovieStatus | null) => {
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

  const statusPillClass = (status?: MovieStatus | null) => {
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

  const allMovies: IMovieCard[] = useMemo(() => {
    const dataRaw = (movie as any)?.data;
    if (Array.isArray(dataRaw)) return dataRaw as unknown as IMovieCard[];
    return [];
  }, [movie]);

  const { nowShowingAll, comingSoonAll } = useMemo(() => {
    const ns = allMovies.filter((m: any) => normalizeStatus(m?.status) === "NOW_SHOWING");
    const cs = allMovies.filter((m: any) => {
      const st = normalizeStatus(m?.status);
      return st === "COMING_SOON" || st === "UPCOMING";
    });
    return { nowShowingAll: ns, comingSoonAll: cs };
  }, [allMovies]);

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

  const news = [];
  for (let i = 1; i <= 3; i++) {
    news.push(
      <div
        key={"news-section" + i}
        className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group"
      >
        <a
          href={`/news/${i}`}
          className="w-full bg-center bg-no-repeat aspect-video bg-cover"
          data-alt="Three friends smiling and eating popcorn in a cinema."
          style={{
            backgroundImage:
              'url("https://tse2.mm.bing.net/th/id/OIP.Z6maLuRYdANn3IbUITwWjgHaLH?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3")',
          }}
        />
        <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
          <div>
            <span className="inline-block bg-[#FFC107] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
              KHUYẾN MÃI
            </span>
            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
              Thứ Ba Vui Vẻ - Đồng giá vé 2D
            </p>
            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
              Giảm giá vé đặc biệt chỉ trong hôm nay cho tất cả các suất chiếu phim 2D.
            </p>
          </div>
          <a className="text-primary text-sm font-bold hover:underline" href="#">
            Xem chi tiết
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-dark relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden"
        style={{ backgroundColor: "#121212" }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <main className="flex flex-1 justify-center py-5 sm:py-8">
            <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-4 sm:px-10">
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden mb-8 shadow-lg shadow-black/20">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  data-alt="A brightly lit cinema hall with red seats, viewed from the back."
                  style={{
                    backgroundImage:
                      'url("https://wallpapers.com/images/hd/cinema-theater-screen-red-interior-mdii641t9soyox58.jpg")',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10">
                  <h1 className="text-white text-3xl md:text-5xl font-bold mb-2">Phim Bom Tấn Của Tuần</h1>
                  <p className="text-[#E0E0E0] md:text-lg max-w-xl mb-4">
                    Trải nghiệm những thước phim hành động mãn nhãn và kỹ xảo đỉnh cao trên màn ảnh rộng.
                  </p>
                  <button className="flex min-w-[84px] max-w-[480px] bg-red-600 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-700 transition-colors">
                    <span className="truncate">Đặt Vé Ngay</span>
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button className="size-2 rounded-full bg-white" />
                  <button className="size-2 rounded-full bg-white/50" />
                  <button className="size-2 rounded-full bg-white/50" />
                </div>
              </div>

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
                <>
                  <div className="relative">
                    <div className="absolute -top-2 right-0 z-10 hidden sm:flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => scrollToDir("left")}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M15 18l-6-6 6-6"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToDir("right")}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    <div
                      ref={viewportRef}
                      className="hide-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollSnapType: "x mandatory",
                      }}
                    >
                      <style>{`
                        .hide-scrollbar::-webkit-scrollbar{ display:none; }
                      `}</style>

                      {listForTab.map((m, idx) => (
                        <div
                          key={(m as any)?.id ?? `${m.title}-${idx}`}
                          data-card={idx === 0 ? "1" : "0"}
                          className="w-[220px] sm:w-[240px] flex-shrink-0"
                          style={{ scrollSnapAlign: "start" }}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              const id = (m as any)?.id;
                              if (!id) return;
                              router.push(`/movies/${id}`);
                            }}
                            onKeyDown={(e) => {
                              if (e.key !== "Enter" && e.key !== " ") return;
                              const id = (m as any)?.id;
                              if (!id) return;
                              router.push(`/movies/${id}`);
                            }}
                            className="block cursor-pointer"
                          >
                            <div className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-2xl overflow-hidden relative shadow-lg shadow-black/30 transform hover:scale-[1.02] transition-transform duration-300 ring-1 ring-white/10 bg-[#1E1E1E]">
                              <div
                                className="absolute inset-0 bg-cover bg-center"
                                data-alt={m.title}
                                style={{
                                  backgroundImage: `url("${resolvePosterUrl(m.posterUrl ?? null)}")`,
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                <button className="w-full text-center bg-red-600 text-white font-bold py-2 rounded-md text-sm opacity-0 hover:opacity-100 translate-y-4 hover:translate-y-0 transition-all duration-300">
                                  Mua Vé
                                </button>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-white text-base font-semibold leading-normal line-clamp-1">{m.title}</p>
                              <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                                {m.genre ?? "Chưa rõ thể loại"}
                                {typeof m.durationMinutes === "number" ? ` • ${m.durationMinutes} phút` : ""}
                              </p>

                              <div className="mt-2">
                                <span
                                  className={[
                                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold tracking-wide",
                                    statusPillClass(m.status ?? null),
                                  ].join(" ")}
                                >
                                  {renderStatus(m.status ?? null)}
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
                            <path
                              d="M15 18l-6-6 6-6"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToDir("right")}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/35 text-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:bg-black/55 hover:border-white/20 active:scale-[0.98]"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M9 6l6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-10">
                Tin Tức &amp; Ưu Đãi
              </h2>
              <div className="grid md:grid-cols-3 gap-6">{news}</div>
            </div>
          </main>

          <div className="py-16 sm:py-24 px-4 sm:px-10 w-full">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
              <h2 className="text-white text-3xl md:text-4xl font-bold text-center">Tại Sao Chọn Cinema?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Đặt Vé Nhanh Chóng</h3>
                  <p className="text-[#E0E0E0]/70">
                    Chỉ với vài thao tác đơn giản, bạn đã có thể đặt vé xem phim yêu thích.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">place</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Nhiều Rạp Chiếu</h3>
                  <p className="text-[#E0E0E0]/70">
                    Hệ thống rạp chiếu phủ khắp toàn quốc với chất lượng hàng đầu.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex items-center justify-center size-16 bg-red-500/10 rounded-full text-red-400">
                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">Thanh Toán An Toàn</h3>
                  <p className="text-[#E0E0E0]/70">Đa dạng phương thức thanh toán với bảo mật tuyệt đối.</p>
                </div>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-[#1E1E1E]">
              <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-10 flex flex-col items-center text-center gap-6">
                <h2 className="text-white text-3xl md:text-4xl font-bold">Sẵn Sàng Trải Nghiệm?</h2>
                <p className="text-[#E0E0E0]/70 text-lg">Đăng ký ngay để nhận ưu đãi đặc biệt và điểm thành viên.</p>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal tracking-[0.015em] bg-red-700 hover:bg-red-600 transition-colors">
                  <span className="truncate">Đăng Ký Ngay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
