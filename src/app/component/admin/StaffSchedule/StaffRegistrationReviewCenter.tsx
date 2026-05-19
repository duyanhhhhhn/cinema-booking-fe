"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  FactCheckRounded,
  Groups2Rounded,
  ManageHistoryRounded,
  PersonSearchRounded,
  CheckCircleOutlineRounded,
  HighlightOffRounded,
  HourglassEmptyRounded,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import {
  Schedule,
  ScheduleStatus,
  type IStaffScheduleItem,
} from "@/types/data/staff/schedule/schedule";

import ManagerScheduleTabs from "./ManagerScheduleTabs";
import {
  getManagerCinemaId,
  resolveManagerCinemaName,
} from "./managerCinemaUtils";
import {
  formatDateLong,
  formatShiftRange,
  formatWeekRange,
  getErrorMessage,
  getPositionLabel,
  getStatusMeta,
  getWeekDays,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

function SummaryTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${staffScheduleSurface} px-4 py-4 bg-white`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          {label}
        </div>
        <div className="flex h-10 w-10 items-center justify-center border border-red-100 bg-red-50 text-red-600">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
      <div className="mt-2 text-[12px] text-slate-500 leading-relaxed">{helper}</div>
    </div>
  );
}

function WeekSwitcher({
  weekLabel,
  onPrev,
  onCurrent,
  onNext,
}: {
  weekLabel: string;
  onPrev: () => void;
  onCurrent: () => void;
  onNext: () => void;
}) {
  return (
    <div className={`${staffScheduleSurface} p-4 bg-white`}>
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        <CalendarMonthRounded sx={{ fontSize: 16 }} />
        Điều hướng tuần
      </div>
      <div className="mt-2 text-base font-black text-slate-900">{weekLabel}</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="h-10 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 rounded-none"
        >
          Tuần trước
        </button>
        <button
          type="button"
          onClick={onCurrent}
          className="h-10 border border-red-600 bg-red-600 px-3 text-sm font-bold text-white transition hover:bg-red-700 rounded-none"
        >
          Tuần này
        </button>
        <button
          type="button"
          onClick={onNext}
          className="h-10 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 rounded-none"
        >
          Tuần sau
        </button>
      </div>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function RegistrationCard({
  item,
  pendingAction,
  onApprove,
  onReject,
}: {
  item: IStaffScheduleItem;
  pendingAction?: string | null;
  onApprove: (_item: IStaffScheduleItem) => void;
  onReject: (_item: IStaffScheduleItem) => void;
}) {
  const meta = getStatusMeta(item.status);
  const canReview = item.status === ScheduleStatus.ASSIGNED;

  return (
    <article className={`${staffScheduleSurface} p-4 bg-white border border-slate-200 h-[150px] flex flex-col justify-between flex-shrink-0 transition hover:border-slate-400`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-none ${meta.lightBadgeClass}`}>
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-black uppercase text-slate-700 rounded-none">
            <ManageHistoryRounded sx={{ fontSize: 12 }} />
            Staff tự đăng ký
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          <AccessTimeRounded sx={{ fontSize: 13 }} />
          <span>Nộp: {formatDateTime(item.createdAt)}</span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3 items-center py-1">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nhân viên</div>
          <div className="text-sm font-black text-slate-900 truncate mt-0.5">{item.staff.fullName}</div>
          <div className="text-xs text-slate-500 truncate">{getPositionLabel(item.staff.position || item.staff.roleName)}</div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ngày làm</div>
          <div className="text-xs font-bold text-slate-800 truncate mt-1">{formatDateLong(item.workDate)}</div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ca & Khung giờ</div>
          <div className="text-sm font-black text-slate-900 truncate mt-0.5">{item.shift.name}</div>
          <div className="text-xs text-red-600 font-bold truncate">{formatShiftRange(item.shift)}</div>
        </div>
      </div>

      <div className="border-t border-slate-50 pt-2 flex justify-end">
        {canReview ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pendingAction === `approve-${item.id}`}
              onClick={() => onApprove(item)}
              className="h-8 w-24 border border-emerald-600 bg-emerald-600 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 rounded-none"
            >
              {pendingAction === `approve-${item.id}` ? "Duyệt..." : "Đồng ý"}
            </button>
            <button
              type="button"
              disabled={pendingAction === `reject-${item.id}`}
              onClick={() => onReject(item)}
              className="h-8 w-24 border border-rose-600 bg-white text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-400 rounded-none"
            >
              {pendingAction === `reject-${item.id}` ? "Chờ..." : "Từ chối"}
            </button>
          </div>
        ) : item.status === ScheduleStatus.CONFIRMED ? (
          <div className="border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5 rounded-none justify-center min-w-[100px]">
            <CheckCircleOutlineRounded sx={{ fontSize: 14 }} /> Đã duyệt
          </div>
        ) : (
          <div className="border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 flex items-center gap-1.5 rounded-none justify-center min-w-[100px]">
            <HighlightOffRounded sx={{ fontSize: 14 }} /> Đã từ chối
          </div>
        )}
      </div>
    </article>
  );
}

export default function StaffRegistrationReviewCenter() {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER";

  const [weekOffset, setWeekOffset] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"pending" | "approved" | "rejected">("pending");
  const deferredKeyword = useDeferredValue(searchKeyword.trim().toLowerCase());

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = formatWeekRange(weekDays);
  const startDate = weekDays[0]?.iso ?? "";
  const endDate = weekDays[6]?.iso ?? "";
  const effectiveCinemaId = useMemo(() => getManagerCinemaId(user), [user]);

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && isManager,
  });

  const cinemas: ICinema[] = useMemo(() => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []), [qCinemas.data]);
  const selectedCinemaName = useMemo(() => resolveManagerCinemaName(user, cinemas, "Chưa xác định chi nhánh"), [cinemas, user]);

  const qRegistrations = useQuery({
    ...Schedule.getCinemaSchedule({ startDate, endDate, cinemaId: effectiveCinemaId }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const registrations = useMemo(() => {
    const items = Array.isArray(qRegistrations.data?.data) ? qRegistrations.data.data : [];
    return [...items].filter((item) => item.requestedByRole === "STAFF");
  }, [qRegistrations.data]);

  const filteredRegistrations = useMemo(() => {
    if (!deferredKeyword) return registrations;
    return registrations.filter((item) => {
      const haystack = [item.staff.fullName, item.staff.position, item.shift.name, item.workDate].join(" ").toLowerCase();
      return haystack.includes(deferredKeyword);
    });
  }, [deferredKeyword, registrations]);

  const slideDisplayedItems = useMemo(() => {
    return filteredRegistrations.filter((item) => {
      if (subTab === "pending") return item.status === ScheduleStatus.ASSIGNED;
      if (subTab === "approved") return item.status === ScheduleStatus.CONFIRMED;
      return item.status === ScheduleStatus.CANCELLED;
    });
  }, [filteredRegistrations, subTab]);

  const counts = useMemo(() => ({
    pending: registrations.filter(i => i.status === ScheduleStatus.ASSIGNED).length,
    approved: registrations.filter(i => i.status === ScheduleStatus.CONFIRMED).length,
    rejected: registrations.filter(i => i.status === ScheduleStatus.CANCELLED).length,
    total: registrations.length,
    staff: new Set(registrations.map(i => i.staff.id)).size
  }), [registrations]);

  const reviewMutation = useMutation({
    mutationFn: ({ item, status }: { item: IStaffScheduleItem, status: ScheduleStatus }) =>
      Schedule.upsert({ staffId: Number(item.staff.id), shiftId: Number(item.shift.id), workDate: item.workDate, status }).then(r => r.data),
    onMutate: ({ item, status }) => {
      const token = `${status === ScheduleStatus.CONFIRMED ? "approve" : "reject"}-${item.id}`;
      setPendingAction(token);
    },
    onSuccess: () => {
      n.success("Thao tác thành công.");
      queryClient.invalidateQueries({ queryKey: [Schedule.queryKeys.cinemaSchedule] });
    },
    onError: (e) => n.error(getErrorMessage(e)),
    onSettled: () => setPendingAction(null),
  });

  if (loading) return <div className={`${staffScheduleSurface} px-6 py-10 text-sm font-semibold rounded-none`}>Đang tải lịch nhân viên đăng ký...</div>;
  if (!isManager) return <div className="rounded-none border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800">Truy cập bị từ chối.</div>;

  return (
    // Đã gỡ bỏ class khóa chiều cao 'max-h-screen flex flex-col' để tránh lỗi bóp nghẹt vùng chứa dữ liệu
    <div className="space-y-4 text-slate-900 w-full">
      <ConfirmDialog />

      {/* HEADER PANELS */}
      <div className="space-y-4">
        <section className={`${staffScheduleSurface} overflow-hidden bg-white`}>
          <div className="grid gap-6 border-b border-slate-200 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Quản lý nhân sự</div>
              <h1 className="text-[32px] font-black tracking-[-0.04em] text-slate-900">Duyệt lịch đăng ký</h1>
            </div>
            <div className="border border-slate-200 bg-white px-4 py-4 rounded-none">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Chi nhánh</div>
              <div className="mt-1 text-lg font-black text-slate-900 truncate">{selectedCinemaName}</div>
            </div>
          </div>
          <ManagerScheduleTabs activeHref="/admin/staff-schedules/registrations" role={role} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <SummaryTile label="Tổng đơn" value={String(counts.total)} helper="Đăng ký trong tuần" icon={<FactCheckRounded fontSize="small" />} />
            <SummaryTile label="Đang chờ" value={String(counts.pending)} helper="Cần manager xử lý" icon={<ManageHistoryRounded fontSize="small" />} />
            <SummaryTile label="Chấp thuận" value={String(counts.approved)} helper="Lịch đã chốt" icon={<Groups2Rounded fontSize="small" />} />
            <SummaryTile label="Nhân sự" value={String(counts.staff)} helper="Staff tham gia đăng ký" icon={<PersonSearchRounded fontSize="small" />} />
          </div>
          <WeekSwitcher weekLabel={weekLabel} onPrev={() => setWeekOffset(p => p - 1)} onCurrent={() => setWeekOffset(0)} onNext={() => setWeekOffset(p => p + 1)} />
        </section>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      {/* Đã gỡ bỏ class flex-1 min-h-0 bám dính để nhường toàn quyền hiển thị độc lập cho vùng cuộn cố định */}
      <section className={`${staffScheduleSurface} bg-white p-5 space-y-4`}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-end border-b border-slate-100 pb-4">
          <div className="flex border border-slate-200 p-1 bg-slate-50/50 w-full sm:w-fit">
            <button onClick={() => setSubTab("pending")} className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition ${subTab === "pending" ? "bg-white border border-slate-200 text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              <HourglassEmptyRounded sx={{ fontSize: 14 }} /> Chờ duyệt ({counts.pending})
            </button>
            <button onClick={() => setSubTab("approved")} className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition ${subTab === "approved" ? "bg-white border border-slate-200 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              <CheckCircleOutlineRounded sx={{ fontSize: 14 }} /> Đã duyệt ({counts.approved})
            </button>
            <button onClick={() => setSubTab("rejected")} className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition ${subTab === "rejected" ? "bg-white border border-slate-200 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              <HighlightOffRounded sx={{ fontSize: 14 }} /> Từ chối ({counts.rejected})
            </button>
          </div>
          <div>
            <input value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} placeholder="Tìm tên, vị trí hoặc ca..." className="h-10 w-full border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-red-600 rounded-none" />
          </div>
        </div>

        {/* KHÓA CỨNG CHIỀU CAO CHÍNH XÁC 474PX: Hiển thị khít khao đúng 3 items (150px*3 + 12px*2 gap của space-y-3). Ca thứ 4 xuất hiện sẽ kích hoạt Slidebar dọc ngay lập tức, cam kết không ép dòng */}
        <div className="overflow-y-auto pr-2 space-y-3 w-full scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent flex-shrink-0"
          style={{ height: "474px", minHeight: "474px" }}>
          {filteredRegistrations.length === 0 ? (
            <div className="border border-dashed border-slate-200 py-12 text-center text-slate-400">Danh sách trống.</div>
          ) : slideDisplayedItems.length ? (
            slideDisplayedItems.map((item) => (
              <RegistrationCard key={item.id} item={item} pendingAction={pendingAction}
                onApprove={t => reviewMutation.mutate({ item: t, status: ScheduleStatus.CONFIRMED })}
                onReject={t => reviewMutation.mutate({ item: t, status: ScheduleStatus.CANCELLED })}
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-200 py-12 text-center text-slate-400">Không tìm thấy đơn phù hợp trong mục này.</div>
          )}
        </div>
      </section>

      {/* Global CSS Custom Scrollbar */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 0px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}