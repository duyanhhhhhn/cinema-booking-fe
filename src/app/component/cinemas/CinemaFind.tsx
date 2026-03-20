"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import TheatersRoundedIcon from "@mui/icons-material/TheatersRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Be_Vietnam_Pro } from "next/font/google";

import { ICinema } from "../../../types/data/cinema/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700", "800"],
});

type CinemaResponse = {
  data: ICinema[];
  meta: { total: number; page: number; perPage: number };
};

export default function CinemaFind() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(4);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  const { data, isLoading, error } = useQuery<CinemaResponse, Error>({
    queryKey: ["cinemas", page, perPage, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/public/cinemas`, {
        params: {
          page,
          perPage,
          search: debouncedSearch,
        },
      });
      return res.data as CinemaResponse;
    },
    staleTime: 5000,
  });

  const cinemas = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / perPage);

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `${IMAGE_URL}/${imageUrl}?t=${Date.now()}`;
  };

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (page > 4) pages.push("...");
      for (let i = Math.max(3, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return Array.from(new Set(pages));
  }, [page, totalPages]);

  return (
    <section className={`${beVietnam.className} w-full bg-[#121212]`}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 text-slate-50 md:px-8 md:py-14">
        <header className="relative overflow-hidden rounded-[28px] border border-[#2a2a2a] bg-[linear-gradient(135deg,#171717_0%,#1a1a1a_55%,#161616_100%)] px-6 py-7 shadow-[0_24px_60px_rgba(0,0,0,0.55)] md:px-8 md:py-8">
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#2f2f2f] bg-[#141414] text-[#e5e7eb] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
              <TheatersRoundedIcon sx={{ fontSize: 28 }} />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.30em] text-[#9a9a9a]">
                Hệ thống rạp
              </p>
              <h1 className="mt-2 text-[30px] font-black tracking-tight text-white md:text-[38px]">
                Tìm Rạp Chiếu Phim
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
                Khám phá các rạp chiếu phim gần bạn, xem thông tin chi tiết và tìm địa điểm phù hợp để đặt vé nhanh hơn.
              </p>
            </div>
          </div>
        </header>

        <div className="relative">
          <SearchRoundedIcon
            sx={{ fontSize: 20 }}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8f8f8f]"
          />
          <input
            type="text"
            placeholder="Tìm rạp theo tên hoặc địa chỉ..."
            className="h-14 w-full rounded-[18px] border border-[#2a2a2a] bg-[#171717] pl-12 pr-4 text-sm font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-[#727272] focus:border-[#3a3a3a] focus:bg-[#1b1b1b]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {isLoading && (
          <div className="rounded-[24px] border border-[#2a2a2a] bg-[#171717] px-6 py-10 text-center text-sm font-medium text-slate-400">
            Đang tải danh sách rạp...
          </div>
        )}

        {error && (
          <div className="rounded-[24px] border border-[#3a2a2c] bg-[#171717] px-6 py-10 text-center text-sm font-medium text-slate-300">
            Không thể tải danh sách rạp
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-7 md:grid-cols-2">
            {cinemas.map((cinema) => {
              const imageSrc = getFullImageUrl(cinema.imageUrl);

              return (
                <article
                  key={cinema.id}
                  className="group overflow-hidden rounded-[24px] border border-[#2a2a2a] bg-[#171717] shadow-[0_22px_50px_rgba(0,0,0,0.48)] transition-all duration-300 hover:-translate-y-1 hover:border-[#3a3a3a] hover:shadow-[0_28px_70px_rgba(0,0,0,0.62)]"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-[#111111]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={cinema.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#191919_0%,#111111_100%)] text-[#6f6f6f]">
                        <TheatersRoundedIcon sx={{ fontSize: 52 }} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {!cinema.isActive && (
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#4b3f2f] bg-[#1f1a15]/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#e7d3a7] backdrop-blur-sm">
                        <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                        Ngưng hoạt động
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="text-[22px] font-extrabold tracking-tight text-white">
                        {cinema.name}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm text-slate-300">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#2f2f2f] bg-[#141414] text-[#d4d4d4]">
                          <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                        </div>
                        <p className="leading-6">{cinema.address}</p>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#2a2a2a] bg-[#141414] text-[#d4d4d4]">
                          <LocalPhoneOutlinedIcon sx={{ fontSize: 18 }} />
                        </div>
                        <p>{cinema.phone}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && !error && cinemas.length === 0 && (
          <div className="rounded-[24px] border border-[#2a2a2a] bg-[#171717] px-6 py-12 text-center">
            <p className="text-base font-semibold text-slate-300">
              Không có rạp nào được tìm thấy
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử lại với từ khóa khác hoặc địa chỉ khác.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#2a2a2a] bg-[#171717] px-4 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-[#3a3a3a] hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 15 }} />
              Trước
            </button>

            {visiblePages.map((num, idx) =>
              typeof num === "string" ? (
                <span
                  key={idx}
                  className="inline-flex h-11 items-center px-2 text-sm font-semibold text-slate-500"
                >
                  {num}
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setPage(num)}
                  className={`inline-flex h-11 min-w-[44px] items-center justify-center rounded-[14px] border px-4 text-sm font-bold transition-all duration-200 ${
                    page === num
                      ? "border-[#5b1d22] bg-[#b91c1c] text-white shadow-[0_12px_28px_rgba(185,28,28,0.28)]"
                      : "border-[#2a2a2a] bg-[#171717] text-slate-200 hover:border-[#3a3a3a] hover:bg-[#1b1b1b]"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-[#2a2a2a] bg-[#171717] px-4 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-[#3a3a3a] hover:bg-[#1b1b1b] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Sau
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 15 }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
