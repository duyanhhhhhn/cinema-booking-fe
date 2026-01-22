"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cinema } from "../../../types/data/cinema";
import { ICinema } from "../../../types/data/cinema/types";
import { IPaginateResponse } from "../../../types/core/api";
import { useDebounce } from "use-debounce";

export default function CinemaFind() {
  const page = 1;
  const perPage = 10;

  // State search
  const [searchTerm, setSearchTerm] = useState("");
  // Debounce 300ms: giảm số lần filter khi gõ nhiều chữ
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // useQuery chuẩn, spread helper
  const { data, isLoading, error } = useQuery({
    ...Cinema.getAllCinemas({ page, perPage }),
  });

  const cinemas: ICinema[] = data?.data ?? [];

  // Filter theo debouncedSearch
  const filteredCinemas = useMemo(() => {
    if (!debouncedSearch) return cinemas;
    const lowerSearch = debouncedSearch.toLowerCase();
    return cinemas.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.address.toLowerCase().includes(lowerSearch)
    );
  }, [debouncedSearch, cinemas]);

  return (
    <section className="w-full bg-[#000000FF]">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 text-slate-50 md:px-8 md:py-14">
        {/* HEADER */}
        <header className="space-y-2 rounded-2xl border border-[#412C3080] bg-gradient-to-r from-[#412C3080] to-[#412C3080] px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Tìm Rạp Chiếu Phim
          </h1>
          <p className="text-sm text-slate-300 md:text-base">
            Khám phá các rạp chiếu phim gần bạn và xem lịch chiếu mới nhất.
          </p>
        </header>

        {/* Search */}
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input
            type="text"
            placeholder="Tìm rạp theo tên hoặc địa chỉ..."
            className="h-12 w-full rounded-xl border border-[#412C3080] bg-[#412C3080]/95 pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 backdrop-blur-sm focus:border-[#fb6c6c] focus:bg-[#26141c]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading */}
        {isLoading && <p className="text-center text-slate-400">Đang tải danh sách rạp...</p>}

        {/* Error */}
        {error && <p className="text-center text-red-400">Không thể tải danh sách rạp 😢</p>}

        {/* Danh sách rạp */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCinemas.map((cinema) => (
            <article
              key={cinema.id}
              className="overflow-hidden rounded-2xl border border-[#412C3080] bg-gradient-to-b from-[#412C3080] to-[#412C3080] text-slate-50 shadow-[0_20px_45px_rgba(0,0,0,0.75)]"
            >
              {/* Ảnh */}
              <div className="h-48 w-full overflow-hidden bg-black">
                <img src={cinema.imageUrl} alt={cinema.name} className="h-full w-full object-cover" />
              </div>

              {/* Nội dung */}
              <div className="space-y-2 px-5 pb-5 pt-4">
                <h3 className="text-lg font-semibold">{cinema.name}</h3>
                <p className="text-xs text-slate-300">{cinema.address}</p>
                <p className="text-xs text-slate-400">{cinema.phone}</p>

                {!cinema.isActive && (
                  <span className="inline-block rounded-full border border-amber-400/60 bg-[#3b2a14] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-200">
                    Tạm dừng
                  </span>
                )}

                <button className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff4337] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff4337]/60 transition hover:bg-[#ff5b4d]">
                  Xem Lịch Chiếu
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty */}
        {!isLoading && filteredCinemas.length === 0 && (
          <p className="text-center text-slate-400">Không có rạp nào được tìm thấy</p>
        )}
      </div>
    </section>
  );
}
