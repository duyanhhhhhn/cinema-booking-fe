"use client";

import { Add, Search } from "@mui/icons-material";
import VoucherTable from "./voucher/VoucherTable";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Voucher } from "@/types/data/voucher/voucher";
import AddVoucherModal from "./voucher/Modal/AddVoucherPopup";

export default function VoucherManagement() {
  const [openAddVoucherModal, setopenVoucherModal] = useState(false);
  const queryParams = useMemo(() => {
    return {
      page: 1,
      size: 10,
    };
  }, []);
  const { data, refetch: refetchVoucher } = useQuery({
    ...Voucher.objects.paginateQueryFactory(queryParams),
  });
  const vouchers = data?.data || [];
  return (
    <div>
      <div className=" flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900">
              Voucher Management
            </h1>
            <p className="text-zinc-600 text-base font-normal">
              Add, Edit , Delete everything on the System.
            </p>
          </div>
        </div>
        {/* --- Toolbar & Filters (Giữ nguyên Tailwind cho layout linh hoạt) --- */}
        <div className="flex flex-col gap-4 py-6">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setopenVoucherModal(true)}
              className="flex max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm"
            >
              <Add fontSize="small" />
              <span className="truncate">Add New Voucher</span>
            </button>
          </div>
        </div>
      </div>
      <VoucherTable voucher={vouchers} refetchVoucher={refetchVoucher} />
      <AddVoucherModal
        open={openAddVoucherModal}
        onClose={() => setopenVoucherModal(false)}
        refetchVoucher={refetchVoucher}
      />
    </div>
  );
}
