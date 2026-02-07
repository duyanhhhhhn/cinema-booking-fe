"use client";
import React, { useMemo, useState } from "react";
import { Search, Add } from "@mui/icons-material";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import StaffTable from "./table/StaffTable";
import CustomPagination from "../table/CustomPagination";
import AddStaffPopup from "./modal/AddStaffPopup";
import EditStaffPopup from "./modal/EditStaffPopup";
import { useGetStaffsQuery } from "./user"; // từ user.ts
import { IStaff } from "./type";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema";

export default function StaffManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy danh sách rạp (lấy nhiều để map)
  const cinemaQuery = useGetCinemaForAdminQuery(1, 1000);
  const { data: cinemaData } = useQuery(cinemaQuery);

  const cinemaMap = useMemo(() => {
    const map = new Map<string, string>();

    cinemaData?.data?.forEach((cinema) => {
      map.set(String(cinema.id).trim(), cinema.name);
    });

    return map;
  }, [cinemaData]);

  // State search + debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  // Popup state
  const [openAdd, setOpenAdd] = useState(false);
  const [editStaff, setEditStaff] = useState<IStaff | null>(null);

  // Query params từ URL
  const queryParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 10,
      search: debouncedSearch,
      cinemaId: searchParams.get("cinemaId")
        ? Number(searchParams.get("cinemaId"))
        : undefined,
    };
  }, [searchParams, debouncedSearch]);

  // Cấu hình query React Query
  const queryConfig = useGetStaffsQuery(
    queryParams.page,
    queryParams.perPage,
    queryParams.search,
  );

  const { data: staffData, refetch } = useQuery(queryConfig);

  const staffs: IStaff[] = useMemo(
    () => (Array.isArray(staffData?.data) ? staffData.data.flat() : []),
    [staffData?.data],
  );

  // Cập nhật query param URL
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
        <div>
          <h1 className="text-4xl font-black tracking-tight">Quản lý Staff</h1>
          <p className="text-zinc-600 mt-1">Quản lý trạng thái nhân viên</p>
        </div>

        {/* Search + Add */}
        <div className="flex gap-4 items-center max-w-xl">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateQueryParams({ page: 1, search: e.target.value || null });
            }}
            placeholder="Tìm kiếm nhân viên..."
            className="flex-1 px-3 h-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ec131e]"
          />
          <button
            onClick={() => setOpenAdd(true)}
            className="px-4 py-2 bg-[#ec131e] text-white rounded-lg font-bold"
          >
            Thêm Staff
          </button>
        </div>

        {/* Staff Table */}
        <StaffTable
          staffs={staffs}
          refetch={refetch}
          onEdit={setEditStaff}
          cinemaMap={cinemaMap}
        />

        {/* Pagination */}
        <CustomPagination
          itemsPerPage={staffData?.meta?.perPage || 10}
          totalItems={staffData?.meta?.total || 0}
        />

        {/* Popup thêm staff */}
        <AddStaffPopup
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={() => {
            refetch();
            setOpenAdd(false);
          }}
        />

        {/* Popup chỉnh sửa staff */}
        {editStaff && (
          <EditStaffPopup
            open={!!editStaff}
            staff={editStaff}
            onClose={() => setEditStaff(null)}
            onSuccess={() => {
              refetch();
              setEditStaff(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
