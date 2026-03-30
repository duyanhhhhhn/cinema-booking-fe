"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import ConcessionTable from "./concessions/ConcessionTable";
import AddConcessionModal from "./concessions/modal/AddConcessionModal";
import { Combo } from "@/types/data/concession/combo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function ConcessionManagement() {
  const [openAddConcessionModal, setOpenAddConcessionModal] = useState(false);
  const [activeType, setActiveType] = useState<"COMBO" | "SINGLE">("COMBO");
  const [searchTerm, setSearchTerm] = useState("");

  const queryParams = useMemo(() => {
    return {
      page: 1,
      size: 1000,
    };
  }, []);

  const { data: summaryData, refetch: refetchSummary } = useQuery({
    ...Combo.adminPaginateQueryFactory(queryParams),
  });

  const allItems = useMemo(() => summaryData?.data ?? [], [summaryData]);
  const comboItems = useMemo(
    () => allItems.filter((item) => item.type === "COMBO"),
    [allItems]
  );
  const singleItems = useMemo(
    () => allItems.filter((item) => item.type === "SINGLE"),
    [allItems]
  );
  const tableItems = activeType === "COMBO" ? comboItems : singleItems;

  const searchCon = useMemo(() => {
    if (!tableItems.length) return [];
    if (!searchTerm.trim()) return tableItems;

    return tableItems.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableItems, searchTerm]);

  const total = allItems.length;
  const totalCombo = comboItems.length;
  const totalSingle = singleItems.length;
  const activeTypeLabel = activeType === "COMBO" ? "combo" : "sản phẩm lẻ";
  const activeTypeDescription =
    activeType === "COMBO"
      ? "Danh sách các combo đang được quản lý."
      : "Danh sách sản phẩm lẻ dùng cho bán trực tiếp và cấu hình combo.";
  const refetchCombo = refetchSummary;

  return (
    <div className={`${plusJakartaSans.className} min-h-screen w-full bg-[#fcfcfd]`}>
      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[34px] font-extrabold tracking-[-0.03em] text-gray-900">
              Quản lý F&amp;B
            </h1>
            <p className="mt-2 text-[15px] font-medium text-gray-500">
              Quản lý đồ ăn, nước uống và combo theo cách gọn gàng, dễ thao tác
            </p>
          </div>

          <button
            onClick={() => setOpenAddConcessionModal(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff2d2f] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,45,47,0.18)] transition hover:bg-[#ef1f21]"
          >
            <AddIcon fontSize="small" />
            Thêm sản phẩm
          </button>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#ececf2] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                  Tổng sản phẩm
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
                  {total}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff1f1] p-3 text-[#ff2d2f]">
                <Inventory2OutlinedIcon fontSize="small" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Toàn bộ món lẻ và combo hiện có
            </p>
          </div>

          <div className="rounded-3xl border border-[#ececf2] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                  Combo
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
                  {totalCombo}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff1f1] p-3 text-[#ff2d2f]">
                <TrendingUpIcon fontSize="small" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Các gói bán kèm đang hoạt động
            </p>
          </div>

          <div className="rounded-3xl border border-[#ececf2] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                  Món lẻ
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
                  {totalSingle}
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff1f1] p-3 text-[#ff2d2f]">
                <PaymentsOutlinedIcon fontSize="small" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">
              Các sản phẩm bán riêng
            </p>
          </div>

          <div className="rounded-3xl border border-[#ececf2] bg-white p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gray-400">
                  Cảnh báo
                </p>
                <p className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-gray-900">
                  3
                </p>
              </div>
              <div className="rounded-2xl bg-[#fff8eb] p-3 text-[#f59e0b]">
                <WarningAmberRoundedIcon fontSize="small" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Sản phẩm cần nhập thêm</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#ececf2] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
          <div className="grid grid-cols-1 gap-4 border-b border-[#f1f2f6] px-5 py-5 md:grid-cols-2">
            {[
              {
                key: "COMBO" as const,
                title: "Combo",
                count: totalCombo,
                description: "Xem và quản lý toàn bộ combo đang bán hoặc tạm ẩn.",
                icon: TrendingUpIcon,
              },
              {
                key: "SINGLE" as const,
                title: "Sản phẩm lẻ",
                count: totalSingle,
                description: "Xem sản phẩm lẻ để bán trực tiếp hoặc ghép vào combo.",
                icon: PaymentsOutlinedIcon,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeType === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveType(item.key);
                    setSearchTerm("");
                  }}
                  className={`rounded-[24px] border p-5 text-left transition ${
                    active
                      ? "border-[#ffb3b4] bg-[#fff5f5] shadow-[0_12px_28px_rgba(255,45,47,0.10)]"
                      : "border-[#ececf2] bg-white hover:border-[#ffd5d6] hover:bg-[#fffafa]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#de5c5d]">
                        Chế độ hiển thị
                      </p>
                      <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-gray-900">
                        {item.title}
                      </h3>
                    </div>
                    <div
                      className={`rounded-2xl p-3 ${
                        active ? "bg-white text-[#ff2d2f]" : "bg-[#fff1f1] text-[#ff6b6d]"
                      }`}
                    >
                      <Icon fontSize="small" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-extrabold tracking-[-0.03em] text-gray-900">
                        {item.count}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        active
                          ? "bg-[#ff2d2f] text-white"
                          : "bg-[#f4f5f7] text-gray-600"
                      }`}
                    >
                      {active ? "Đang xem" : "Chọn xem"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 border-b border-[#f1f2f6] px-5 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-extrabold tracking-[-0.02em] text-gray-900">
                Danh sách {activeTypeLabel}
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                {activeTypeDescription} Hiển thị {searchCon.length} mục.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[300px]">
                <SearchIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fontSize="small"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Tìm ${activeType === "COMBO" ? "combo" : "sản phẩm lẻ"}...`}
                  className="h-11 w-full rounded-2xl border border-[#e9eaf0] bg-white pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#ff8a8b] focus:ring-4 focus:ring-[#fff1f1]"
                />
              </div>
            </div>
          </div>

          <div className="px-5 py-5">
            <ConcessionTable
              key={activeType}
              combo={searchCon}
              refetchCombo={refetchCombo}
            />
          </div>
        </section>
      </main>

      <AddConcessionModal
        open={openAddConcessionModal}
        onClose={() => setOpenAddConcessionModal(false)}
        refetchCombo={refetchCombo}
      />
    </div>
  );
}
