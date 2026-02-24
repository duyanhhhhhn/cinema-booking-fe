"use client";

import React, { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import { useGetStaffsQuery } from "./user";
import { IStaff } from "./type";

import StaffTable from "./table/StaffTable";
import CustomPagination from "../table/CustomPagination";
import AddStaffPopup from "./modal/AddStaffPopup";
import EditStaffPopup from "./modal/EditStaffPopup";

export default function StaffManagement() {
  // ❌ Không dùng isAdmin/isManagement/isStaff từ useAuth
  const { user } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ⚠ STAFF không được truy cập
  if (user?.role === "STAFF") {
    return (
      <div className="p-8 text-red-600 font-bold">
        Bạn không có quyền truy cập trang này
      </div>
    );
  }

  // ✅ Kiểm tra quyền trực tiếp
  const userIsAdmin = user?.role === "ADMIN";
  const userIsManager = String(user?.role) === "MANAGER";

  // Lấy danh sách cinema (dùng cho map hiển thị tên rạp)
  const cinemaQueryConfig = useGetCinemaForAdminQuery(1, 1000);
  const { data: cinemaData } = useQuery(cinemaQueryConfig);

  const cinemaMap = useMemo(() => {
    if (!cinemaData?.data) return new Map<string, string>();
    return new Map(
      cinemaData.data.map((cinema) => [String(cinema.id), cinema.name]),
    );
  }, [cinemaData]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const [openAdd, setOpenAdd] = useState(false);
  const [editStaff, setEditStaff] = useState<IStaff | null>(null);

  // Lấy query params từ URL
  const queryParams = useMemo(() => {
    return {
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 10,
      search: debouncedSearch,
    };
  }, [searchParams, debouncedSearch]);

  // 🔥 Lấy danh sách staff từ API
  // Chỉ gọi API nếu user là ADMIN hoặc MANAGER
  const queryConfig = useGetStaffsQuery(
    queryParams.page,
    queryParams.perPage,
    queryParams.search,
  );

  const { data: staffData, refetch } = useQuery({
    ...queryConfig,
    enabled: !!user && (userIsAdmin || userIsManager), // 🔹 sửa chỗ này
  });

  // 🔹 Lọc dữ liệu FE nếu backend chưa filter
  const staffs: IStaff[] = useMemo(() => {
    let data = Array.isArray(staffData?.data) ? staffData.data.flat() : [];

    // MANAGER chỉ thấy STAFF
    if (!userIsAdmin && user) {
      data = data.filter((s) => s.cinemaId == String(user?.id));
    }
    console.log("Fetched staffs:", data);
    return data;
  }, [staffData?.data, userIsAdmin, user]);

  // Cập nhật query params trên URL
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
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Quản lý Nhân sự
          </h1>
          <p className="text-zinc-600 mt-1">
            {userIsAdmin
              ? "Quản lý Manager & Staff"
              : "Quản lý Staff của rạp bạn"}
          </p>
        </div>

        <div className="flex gap-4 items-center max-w-xl">
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateQueryParams({ page: 1 });
            }}
            placeholder="Tìm kiếm..."
            className="flex-1 px-3 h-12 border rounded-lg"
          />

          {/* 🔹 ADMIN add Manager/Staff, MANAGER chỉ add Staff */}
          <button
            onClick={() => setOpenAdd(true)}
            className="px-4 py-2 bg-[#ec131e] text-white rounded-lg font-bold"
          >
            {userIsAdmin ? "Thêm Manager / Staff" : "Thêm Staff"}
          </button>
        </div>

        <StaffTable
          staffs={staffs}
          refetch={refetch}
          onEdit={setEditStaff}
          cinemaMap={cinemaMap}
        />

        <CustomPagination
          itemsPerPage={staffData?.meta?.perPage || 10}
          totalItems={staffData?.meta?.total || 0}
        />

        <AddStaffPopup
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSuccess={() => {
            refetch();
            setOpenAdd(false);
          }}
        />

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
