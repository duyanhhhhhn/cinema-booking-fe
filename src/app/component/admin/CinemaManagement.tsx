"use client";
import React, { useMemo, useState } from "react";
import { Search, Add, ArrowDropDown } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import CinemaTable from "./cinemas/CinemaTable";
import CustomPagination from "./table/CustomPagination";
import AddCinemaPopup from "./cinemas/modal/AddCinemaPopup";
import { ICinema } from "@/types/data/cinema";
import { Cinema } from "@/types/data/cinema/cinema";

// kiểu dữ liệu trả về từ API
interface CinemaResponse {
  data: ICinema[];
  meta: {
    total: number;
    perPage: number;
  };
}

export default function CinemaManagement() {
  const [openAddCinemaModal, setOpenAddCinemaModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { searchQuery } = useRouteQuery();
  

  const queryParams = useMemo(() => {
    return {
      page: Number(searchQuery.get("page")) || 1,
      perPage: Number(searchQuery.get("perPage")) || 10,
    };
  }, [searchQuery]);

  const { data: cinemasData, refetch: refetchCinemas } = useQuery<CinemaResponse, Error>(
    Cinema.getCinemaForAdmin(queryParams) as any
  );

  const filteredCinemas = useMemo(() => {
    if (!cinemasData?.data) return [];
    
    if (statusFilter === "all") return cinemasData.data;
    if (statusFilter === "active") return cinemasData.data.filter(cinema => cinema.isActive);
    if (statusFilter === "inactive") return cinemasData.data.filter(cinema => !cinema.isActive);
    
    return cinemasData.data;
  }, [cinemasData?.data, statusFilter]);

  return (
    <div className="w-full p-8 font-sans text-zinc-900">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900">
              Quản lý Rạp Chiếu
            </h1>
            <p className="text-zinc-600 text-base font-normal">
              Thêm, sửa, xóa và quản lý tất cả các rạp chiếu trong hệ thống.
            </p>
          </div>
        </div>

        {/* Toolbar & Filters */}
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
                    placeholder="Tìm kiếm rạp theo tên..."
                  />
                </div>
              </label>
            </div>

            <button
              onClick={() => setOpenAddCinemaModal(true)}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm"
            >
              <Add fontSize="small" />
              <span className="truncate">Thêm Rạp Mới</span>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setStatusFilter("all")}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors ${
                statusFilter === "all" 
                  ? "bg-zinc-200 hover:bg-zinc-300" 
                  : "bg-transparent border border-zinc-300 hover:bg-zinc-200"
              }`}
            >
              <p className="text-zinc-800 text-sm font-medium">Tất cả</p>
            </button>
            <button 
              onClick={() => setStatusFilter("active")}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors ${
                statusFilter === "active" 
                  ? "bg-green-200 hover:bg-green-300" 
                  : "bg-transparent border border-zinc-300 hover:bg-zinc-200"
              }`}
            >
              <p className="text-zinc-600 text-sm font-medium">Hoạt động</p>
            </button>
            <button 
              onClick={() => setStatusFilter("inactive")}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors ${
                statusFilter === "inactive" 
                  ? "bg-red-200 hover:bg-red-300" 
                  : "bg-transparent border border-zinc-300 hover:bg-zinc-200"
              }`}
            >
              <p className="text-zinc-600 text-sm font-medium">Ngưng hoạt động</p>
            </button>
          </div>
        </div>

        {/* Main Content Area: Table & Pagination */}
        <div className="flex flex-col gap-4">
          <CinemaTable
            cinemas={filteredCinemas}
            refetchCinemas={refetchCinemas}
          />

          <CustomPagination
            itemsPerPage={cinemasData?.meta?.perPage || 0}
            totalItems={cinemasData?.meta?.total || 0}
          />
        </div>

        {/* Add Cinema Popup */}
        <AddCinemaPopup
          open={openAddCinemaModal}
          onClose={() => setOpenAddCinemaModal(false)}
          refetchCinemas={refetchCinemas}
        />
      </div>
    </div>
  );
}
