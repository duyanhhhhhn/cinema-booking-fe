"use client";
import React, { useMemo, useState } from "react";
import { Search } from "@mui/icons-material";
import { useDebounce } from "use-debounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import UserTable from "./table/UserTable";
import CustomPagination from "../table/CustomPagination";
import { useGetUsersQuery } from "./user";
import { IUser } from "./type";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [debouncedSearch] = useDebounce(searchTerm, 400);

  const queryParams = useMemo(
    () => ({
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 10,
      search: debouncedSearch,
    }),
    [searchParams, debouncedSearch],
  );

  const queryConfig = useGetUsersQuery(
    queryParams.page,
    queryParams.perPage,
    queryParams.search,
  );
  const { data: usersData, refetch: refetchUsers } = useQuery(queryConfig);

  const users: IUser[] = useMemo(
    () => (Array.isArray(usersData?.data) ? usersData.data.flat() : []),
    [usersData?.data],
  );

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
            Quản lý Người Dùng
          </h1>
          <p className="text-zinc-600 mt-1">
            Quản lý trạng thái tài khoản người dùng
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg">
          <label className="flex h-12">
            <div className="flex w-full rounded-lg shadow-sm">
              <div className="flex items-center px-3 border border-r-0 rounded-l-lg bg-white">
                <Search fontSize="small" />
              </div>
              <input
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  updateQueryParams({ page: 1, search: value || null });
                }}
                placeholder="Tìm kiếm người dùng..."
                className="flex-1 px-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#ec131e]"
              />
            </div>
          </label>
        </div>

        <UserTable
          users={users}
          refetchUsers={refetchUsers}
          currentPage={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
        />

        <CustomPagination
          itemsPerPage={usersData?.meta?.perPage || 0}
          totalItems={usersData?.meta?.total || 0}
        />
      </div>
    </div>
  );
}
