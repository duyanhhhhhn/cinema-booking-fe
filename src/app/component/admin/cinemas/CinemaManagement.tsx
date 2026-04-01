"use client";
import React, { useMemo, useState } from "react";
import {
  Search,
  Add,
  StorefrontRounded,
  CheckCircleRounded,
  PauseCircleRounded,
} from "@mui/icons-material";
import { useDebounce } from "use-debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import CinemaTable from "./CinemaTable";
import CustomPagination from "../table/CustomPagination";
import AddCinemaPopup from "./modal/AddCinemaPopup";
import { ICinema } from "@/types/data/cinema";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema";
import { useQuery } from "@tanstack/react-query";
import EditCinemaPopup from "./modal/EditCinemaPopup";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

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
  const cinemaList = useMemo(() => cinemasData?.data ?? [], [cinemasData]);

  // Filter theo trạng thái
  const filteredCinemas = useMemo(() => {
    if (statusFilter === "all") return cinemaList;
    if (statusFilter === "active")
      return cinemaList.filter((c) => c.isActive);
    if (statusFilter === "inactive")
      return cinemaList.filter((c) => !c.isActive);
    return cinemaList;
  }, [cinemaList, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: cinemaList.length,
      active: cinemaList.filter((c) => c.isActive).length,
      inactive: cinemaList.filter((c) => !c.isActive).length,
      showing: filteredCinemas.length,
    };
  }, [cinemaList, filteredCinemas]);

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
    <div
      className={`${roboto.className} w-full bg-white p-4 text-zinc-900 sm:p-6 xl:p-8`}
    >
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        toastOptions={{
          duration: 3200,
          className:
            "!rounded-[20px] !border !border-[#ffd9d9] !bg-white !text-[#111827] !shadow-[0_20px_60px_rgba(255,45,47,0.14)]",
          style: {
            padding: "16px",
          },
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0dede] bg-[#fff8f8] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#d44343]">
                Hệ thống rạp
              </div>
              <h1 className="mt-3 text-[30px] font-black leading-tight tracking-[-0.04em] text-zinc-900 sm:text-[38px]">
                Quản lý Rạp Chiếu
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] font-medium leading-7 text-zinc-500 sm:text-[15px]">
                Theo dõi trạng thái hoạt động, cập nhật thông tin và quản lý toàn bộ rạp chiếu trong hệ thống admin.
              </p>
            </div>

            <button
              onClick={() => setOpenAddCinemaModal(true)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[16px] border border-[#ff5b5b] bg-[linear-gradient(180deg,#ff4141_0%,#ff2d2d_100%)] px-6 text-[15px] font-black text-white shadow-[0_14px_30px_rgba(255,59,59,0.28)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(255,59,59,0.34)]"
            >
              <Add fontSize="small" sx={{ fontSize: 20 }} />
              <span>Thêm Rạp Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Tổng rạp",
                value: stats.total,
                icon: <StorefrontRounded fontSize="small" />,
              },
              {
                label: "Đang hoạt động",
                value: stats.active,
                icon: <CheckCircleRounded fontSize="small" />,
              },
              {
                label: "Tạm ngưng",
                value: stats.inactive,
                icon: <PauseCircleRounded fontSize="small" />,
              },
              {
                label: "Đang hiển thị",
                value: stats.showing,
                icon: <Search fontSize="small" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[26px] border border-[#e8ebf2] bg-white p-5 text-zinc-900 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {item.label}
                    </div>
                    <div className="mt-3 text-[34px] font-black leading-none tracking-[-0.04em]">
                      {item.value}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-[#f1e2e2] bg-[#fff6f6] text-[#e05454] shadow-sm">
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[26px] border border-[#e8ebf2] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex-1">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Tìm kiếm rạp
                </div>
                <label className="flex h-14 w-full items-center overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white shadow-sm transition focus-within:border-[#ef9a9a] focus-within:shadow-[0_0_0_4px_rgba(236,19,30,0.06)]">
                  <div className="flex h-full items-center justify-center px-4 text-zinc-400">
                    <Search fontSize="small" />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      updateQueryParams({
                        page: 1,
                        search: value || null,
                      });
                    }}
                    placeholder="Tìm kiếm rạp theo tên..."
                    className="h-full w-full bg-transparent pr-4 text-base font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </label>
              </div>

              <div className="xl:max-w-[420px] xl:min-w-[360px]">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Lọc theo trạng thái
                </div>
                <div className="flex flex-wrap gap-2">
                  {["all", "active", "inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-black transition ${
                        statusFilter === status
                          ? "border border-[#efb0b0] bg-[#fff4f4] text-[#d44343] shadow-[0_8px_22px_rgba(212,67,67,0.10)]"
                          : "border border-zinc-200 bg-white text-zinc-600 hover:border-[#efb0b0] hover:bg-[#fff8f8]"
                      }`}
                    >
                      {status === "all"
                        ? "Tất cả"
                        : status === "active"
                          ? "Hoạt động"
                          : "Ngưng hoạt động"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] border border-[#e8ebf2] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="mb-4 flex flex-col gap-1">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Danh sách rạp chiếu
              </div>
              <div className="text-[22px] font-black tracking-[-0.03em] text-zinc-900">
                {statusFilter === "all"
                  ? "Toàn bộ rạp trong hệ thống"
                  : statusFilter === "active"
                    ? "Rạp đang hoạt động"
                    : "Rạp đang tạm ngưng"}
              </div>
              <div className="text-sm font-medium text-zinc-500">
                Hiển thị {filteredCinemas.length} rạp trong trang hiện tại.
              </div>
            </div>

          <CinemaTable
            cinemas={filteredCinemas}
            refetchCinemas={refetchCinemas}
            onEditCinema={(cinema) => {
              setSelectedCinema(cinema);
              setOpenEditCinemaModal(true);
            }}
          />
          </div>

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
