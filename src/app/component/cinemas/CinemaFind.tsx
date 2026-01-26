"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import axios from "axios";
import { ICinema } from "../../../types/data/cinema/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

type CinemaResponse = {
  data: ICinema[];
  meta: { total: number; page: number; perPage: number };
};

export default function CinemaFind() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [perPage, setperPage] = useState(4);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // ===== Fetch cinemas =====
  const { data, isLoading, error } = useQuery<CinemaResponse, Error>({
    queryKey: ["cinemas", page, perPage, debouncedSearch],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/public/cinemas`, {
        params: { page, perPage, title: debouncedSearch },
      });
      return res.data as CinemaResponse;
    },
    staleTime: 5000, // giữ dữ liệu 5 giây trước khi refetch
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
      for (let i = Math.max(3, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages - 1, totalPages);
    }
    return Array.from(new Set(pages));
  }, [page, totalPages]);

  return (
    <section className="w-full bg-[#000000FF]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 text-slate-50 md:px-8 md:py-14">
        {/* HEADER */}
        <header className="space-y-2 rounded-2xl border border-[#412C3080] bg-gradient-to-r from-[#412C3080] to-[#412C3080] px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <h1 className="text-2xl font-semibold md:text-3xl">Tìm Rạp Chiếu Phim</h1>
          <p className="text-sm text-slate-300 md:text-base">
            Khám phá các rạp chiếu phim gần bạn và xem lịch chiếu mới nhất.
          </p>
        </header>

        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm rạp theo tên hoặc địa chỉ..."
            className="h-12 w-full rounded-xl border border-[#412C3080] bg-[#412C3080]/95 px-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#fb6c6c]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // reset page khi search
            }}
          />
        </div>

        {/* LOADING */}
        {isLoading && <p className="text-center text-slate-400">Đang tải danh sách rạp...</p>}

        {/* ERROR */}
        {error && <p className="text-center text-red-400">Không thể tải danh sách rạp 😢</p>}

        {/* CINEMA LIST */}
        <div className="grid gap-6 md:grid-cols-2">
          {cinemas.map((cinema) => (
            <article
              key={cinema.id}
              className="overflow-hidden rounded-2xl border border-[#412C3080] bg-gradient-to-b from-[#412C3080] to-[#412C3080] shadow-[0_20px_45px_rgba(0,0,0,0.75)]"
            >
              <div className="h-48 w-full bg-black">
                <img src={getFullImageUrl(cinema.imageUrl)} alt={cinema.name} className="h-full w-full object-cover" />
              </div>
              <div className="space-y-2 px-5 pb-5 pt-4">
                <h3 className="text-lg font-semibold">{cinema.name}</h3>
                <p className="text-xs text-slate-300">{cinema.address}</p>
                <p className="text-xs text-slate-400">{cinema.phone}</p>
                {!cinema.isActive && (
                  <span className="inline-block rounded-full border border-amber-400/60 bg-[#3b2a14] px-2.5 py-1 text-[11px] font-medium text-amber-200">
                    Ngưng hoạt động
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* EMPTY */}
        {!isLoading && cinemas.length === 0 && (
          <p className="text-center text-slate-400">Không có rạp nào được tìm thấy</p>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center flex-wrap gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded bg-[#412C3080] px-3 py-1 text-slate-200 disabled:opacity-50"
            >
              Trước
            </button>

            {visiblePages.map((num, idx) =>
              typeof num === "string" ? (
                <span key={idx} className="px-3 py-1 text-slate-400">{num}</span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setPage(num)}
                  className={`rounded px-3 py-1 ${
                    page === num ? "bg-[#fb6c6c] text-white" : "bg-[#412C3080] text-slate-200 hover:bg-[#5b2c2c]"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded bg-[#412C3080] px-3 py-1 text-slate-200 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
