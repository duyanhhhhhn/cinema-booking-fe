"use client";
import React, { useMemo, useState } from "react";
import { Search, Add } from "@mui/icons-material";
import { useDebounce } from "use-debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CinemaTable from "./CinemaTable";
import CustomPagination from "../table/CustomPagination";
import AddCinemaPopup from "./modal/AddCinemaPopup";
import { ICinema } from "@/types/data/cinema";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema";
import { useQuery } from "@tanstack/react-query";
import EditCinemaPopup from "./modal/EditCinemaPopup";

export default function CinemaManagement() {
  const [openAddCinemaModal, setOpenAddCinemaModal] = useState(false);
  const [openEditCinemaModal, setOpenEditCinemaModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<ICinema | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const queryParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 10,
      search: debouncedSearch,
    };
  }, [searchParams, debouncedSearch]);

  // Call API
  const queryConfig = useGetCinemaForAdminQuery(
    queryParams.page,
    queryParams.perPage,
    queryParams.search,
  );

  const { data: cinemasData, refetch: refetchCinemas } = useQuery(queryConfig);

  // Filter theo trạng thái
  const filteredCinemas = useMemo(() => {
    if (!cinemasData?.data) return [];
    if (statusFilter === "all") return cinemasData.data;
    if (statusFilter === "active")
      return cinemasData.data.filter((c) => c.isActive);
    if (statusFilter === "inactive")
      return cinemasData.data.filter((c) => !c.isActive);
    return cinemasData.data;
  }, [cinemasData?.data, statusFilter]);

  // Update URL mà không reload
  const updateQueryParams = (
    params: Record<string, string | number | null>,
  ) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) current.delete(key);
      else current.set(key, String(value));
    });
    router.replace(`${pathname}?${current.toString()}`);
  };

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
              Thêm, sửa, ngưng hoạt động và quản lý tất cả các rạp chiếu trong
              hệ thống.
            </p>
          </div>
        </div>
        {/* Toolbar & Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                  <div className="text-zinc-500 flex bg-white items-center justify-center pl-4 rounded-l-lg border border-zinc-300 border-r-0">
                    <Search fontSize="small" />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);

                      // Reset page về 1 và update search
                      updateQueryParams({
                        page: 1, // reset về 1
                        search: value || null, // nếu rỗng thì remove search
                      });
                    }}
                    placeholder="Tìm kiếm rạp theo tên..."
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden
                      rounded-r-lg text-zinc-900 focus:outline-none
                      focus:ring-2 focus:ring-[#ec131e]
                      border border-zinc-300 border-l-0 bg-white
                      h-full placeholder:text-zinc-500 px-4 pl-2
                      text-base font-normal"
                  />
                </div>
              </label>
            </div>

            {/* Thêm Rạp Mới */}
            <button
              onClick={() => setOpenAddCinemaModal(true)}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm"
            >
              <Add fontSize="small" />
              <span className="truncate">Thêm Rạp Mới</span>
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "active", "inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-colors ${
                  statusFilter === status
                    ? "bg-zinc-200 hover:bg-zinc-300"
                    : "bg-transparent border border-zinc-300 hover:bg-zinc-200"
                }`}
              >
                <p className="text-zinc-600 text-sm font-medium">
                  {status === "all"
                    ? "Tất cả"
                    : status === "active"
                      ? "Hoạt động"
                      : "Ngưng hoạt động"}
                </p>
              </button>
            ))}
          </div>
        </div>
        {/* Table & Pagination */}
        <div className="flex flex-col gap-4">
          <CinemaTable
            cinemas={filteredCinemas}
            refetchCinemas={refetchCinemas}
            onEditCinema={(cinema) => {
              setSelectedCinema(cinema);
              setOpenEditCinemaModal(true);
            }}
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
        {/* Edit Cinema Popup */}
        {selectedCinema && (
          <EditCinemaPopup
            open={openEditCinemaModal}
            onClose={() => {
              setOpenEditCinemaModal(false);
              setSelectedCinema(null);
            }}
            cinema={selectedCinema}
            refetchCinemas={refetchCinemas}
          />
        )}
      </div>
    </div>
  );
}
