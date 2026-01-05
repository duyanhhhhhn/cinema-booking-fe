"use client";
import React, { useMemo, useState } from "react";
import { Search, Add, ArrowDropDown } from "@mui/icons-material";
import { Movie } from "@/types/data/movie/movie";
import MovieTable from "./movies/MovieTable";
import CustomPagination from "./table/CustomPagination";
import AddMoviePopup from "./movies/modal/AddMoviePopup";
import { useQuery } from "@tanstack/react-query";
import { useRouteQuery } from "@/hooks/useRouteQuery";

export default function MovieManagement() {
  const [page, setPage] = useState(1);
  const [openAddMovieModal, setopenAddMovieModal] = useState(false);
  const totalPages = 10; // Giả sử có 10 trang
  const { searchQuery } = useRouteQuery();

  const queryParams = useMemo(() => {
    return {
      page: searchQuery.get("page") || 1,
      perPage: searchQuery.get("perPage") || 10,
    };
  }, [searchQuery]);
   const handlePageChange = (value: number) => {
     setPage(value);
   };
  const { data: moviesData,refetch: refetchMovies } = useQuery({
    ...Movie.objects.paginateQueryFactory(queryParams),
  });
  

  return (
    <div className=" w-full p-8 font-sans text-zinc-900">
      <div className=" flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900">
              Quản lý Phim
            </h1>
            <p className="text-zinc-600 text-base font-normal">
              Thêm, sửa, xóa và quản lý tất cả các phim trong hệ thống.
            </p>
          </div>
        </div>

        {/* --- Toolbar & Filters (Giữ nguyên Tailwind cho layout linh hoạt) --- */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 max-w-lg">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                  <div className="text-zinc-500 flex bg-white items-center justify-center pl-4 rounded-l-lg border border-zinc-300 border-r-0">
                    <Search fontSize="small" />
                  </div>
                  <input
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ec131e] border border-zinc-300 border-l-0 bg-white h-full placeholder:text-zinc-500 px-4 pl-2 text-base font-normal"
                    placeholder="Tìm kiếm phim theo tên..."
                  />
                </div>
              </label>
            </div>

            <button onClick={() => setopenAddMovieModal(true)} className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm">
              <Add fontSize="small" />
              <span className="truncate">Thêm Phim Mới</span>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-zinc-200 px-4 hover:bg-zinc-300 transition-colors">
              <p className="text-zinc-800 text-sm font-medium">Tất cả</p>
            </button>
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-zinc-300 px-4 hover:bg-zinc-200 transition-colors">
              <p className="text-zinc-600 text-sm font-medium">Đang chiếu</p>
            </button>
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-zinc-300 px-4 hover:bg-zinc-200 transition-colors">
              <p className="text-zinc-600 text-sm font-medium">Sắp chiếu</p>
            </button>
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-zinc-300 px-4 hover:bg-zinc-200 transition-colors">
              <p className="text-zinc-600 text-sm font-medium">Ngừng chiếu</p>
            </button>
            <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-transparent border border-zinc-300 pl-4 pr-3 hover:bg-zinc-200 transition-colors">
              <p className="text-zinc-600 text-sm font-medium">Thể loại</p>
              <ArrowDropDown className="text-zinc-600" fontSize="small" />
            </button>
          </div>
        </div>

        {/* --- Main Content Area: Table & Pagination --- */}
        <div className="flex flex-col gap-4">
          {/* Component Bảng */}
          <MovieTable
            movies={moviesData?.data || []}
            onEdit={() => {}}
            refetchMovies={refetchMovies}
           
          />

          {/* Component Phân Trang */}
          <CustomPagination
            count={totalPages}
            page={page}
            onChange={() => handlePageChange(page)}
          />
        </div>
        <AddMoviePopup open={openAddMovieModal} onClose={() => setopenAddMovieModal(false)} refetchMovies={refetchMovies} />
       
      </div>
    </div>
  );
};

