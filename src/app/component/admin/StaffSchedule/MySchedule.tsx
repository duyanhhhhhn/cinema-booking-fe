"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Backdrop, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import {
  Schedule,
  ScheduleStatus,
  type IStaffRegistrationWindow,
  type IStaffUrgentRequestItem,
  type IStaffScheduleItem,
  type IStaffSwapRequestItem,
  UrgentRequestStatus,
  UrgentRequestType,
  SwapRequestStatus,
} from "@/types/data/staff/schedule/schedule";

import StaffScheduleThisWeek from "./StaffScheduleThisWeek";
import {
  formatDateLong,
  formatShiftRange,
  formatWeekRange,
  fromIsoDate,
  canCreateUrgentShiftRequest,
  canWriteShiftSchedule,
  getErrorMessage,
  getInitials,
  getPositionLabel,
  getStatusMeta,
  getUrgentStatusMeta,
  getUrgentTypeLabel,
  getTotalHours,
  getWeekDays,
  groupSchedulesByCell,
  isShiftActiveAt,
  isTodayIso,
  normalizeNumber,
  sortByName,
  startOfWeek,
  toIsoDate,
  uniqueStaffFromSchedules,
} from "./staffScheduleUtils";

type StaffSelfScheduleMode = "request" | "view";

const surfaceClass = "border border-slate-200 bg-white rounded-none shadow-sm";
const secondaryButtonClass =
  "border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 rounded-none";
const tableGridStyle = {
  gridTemplateColumns: "240px repeat(7, minmax(148px, 1fr))",
} as const;
const STAFF_REQUEST_MIN_WEEK_OFFSET = 1;
const STAFF_REQUEST_MAX_WEEK_OFFSET = 1;
const EMPTY_URGENT_REQUESTS: IStaffUrgentRequestItem[] = [];

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={`${surfaceClass} px-5 py-4 bg-gradient-to-br from-white to-slate-50/50`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function ShiftCard({
  item,
  compact = false,
  showStaff = false,
  highlight = false,
  now,
  actions,
}: {
  item: IStaffScheduleItem;
  compact?: boolean;
  showStaff?: boolean;
  highlight?: boolean;
  now: Date;
  actions?: React.ReactNode;
}) {
  const meta = getStatusMeta(item.status);
  const isLive = isShiftActiveAt(item.workDate, item.shift, now);

  return (
    <div
      className={`border p-3 text-left rounded-none transition-all ${isLive
        ? "border-red-300 bg-red-50/60 shadow-sm"
        : meta.lightCardClass
        } ${highlight ? "border-red-300 shadow-[0_0_0_1px_rgba(220,38,38,0.1)]" : ""}`}
    >
      {showStaff ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              {item.staff.fullName}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {getPositionLabel(item.staff.position || item.staff.roleName)}
            </div>
          </div>
          {highlight ? (
            <span className="inline-flex items-center bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white rounded-none">
              Tôi
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={`${compact ? "text-xs" : "text-sm"} font-bold text-slate-900`}>
        {item.shift.name}
      </div>
      <div className="mt-0.5 text-xs text-slate-600">{formatShiftRange(item.shift)}</div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {isLive ? (
          <span className="inline-flex items-center bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white rounded-none">
            Đang trong ca
          </span>
        ) : null}
        <span
          className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none ${meta.lightBadgeClass}`}
        >
          {meta.label}
        </span>
      </div>
      {actions ? <div className="mt-3 flex flex-wrap gap-1.5">{actions}</div> : null}
    </div>
  );
}

// Điều hướng Tab
function StaffTabs({ mode }: { mode: StaffSelfScheduleMode }) {
  const tabs = [
    {
      href: "/admin/staff-schedules/my/request",
      label: "Đăng ký tuần sau",
      description: "Chọn ngày và ca để gửi đăng ký làm việc.",
      active: mode === "request",
    },
    {
      href: "/admin/staff-schedules/my",
      label: "Xem bảng lịch",
      description: "Theo dõi lịch của bạn và lịch chung trong rạp.",
      active: mode === "view",
    },
    {
      href: "/admin/staff-schedules/my/swaps",
      label: "Nhờ làm thay",
      description: "Gửi yêu cầu hoặc phản hồi lời nhờ đổi ca.",
      active: false,
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tabs.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block border p-5 text-left transition-all rounded-none ${item.active
            ? "border-red-600 bg-red-600 text-white shadow-[0_12px_24px_rgba(220,38,38,0.15)]"
            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow-sm"
            }`}
        >
          <div className="text-base font-black">{item.label}</div>
          <div
            className={`mt-2 text-xs leading-5 ${item.active ? "text-white/85" : "text-slate-500"
              }`}
          >
            {item.description}
          </div>
        </Link>
      ))}
    </div>
  );
}

function UrgentRequestCard({
  item,
  highlight = false,
}: {
  item: IStaffUrgentRequestItem;
  highlight?: boolean;
}) {
  const meta = getUrgentStatusMeta(item.status);

  return (
    <article
      id={`urgent-request-card-${item.id}`}
      className={`border p-4 rounded-none transition-all ${meta.lightCardClass} ${highlight ? "ring-2 ring-red-500/55 shadow-md" : ""
        }`}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {getUrgentTypeLabel(item.type)}
          </div>
          <div className="mt-1 text-base font-black text-slate-900">
            {item.shift.name}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {formatDateLong(item.workDate)} • {formatShiftRange(item.shift)}
          </div>
          {item.expectedArrivalTime ? (
            <div className="mt-1.5 text-xs font-semibold text-slate-700">
              Dự kiến có mặt: {String(item.expectedArrivalTime).slice(0, 5)}
            </div>
          ) : null}
          <div className="mt-2 text-sm leading-6 text-slate-700 bg-white/50 p-2.5 rounded-none border border-slate-100">{item.reason}</div>
        </div>

        <div className="flex min-w-[120px] flex-col items-start gap-2 xl:items-end">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-none ${meta.lightBadgeClass}`}
          >
            {meta.label}
          </span>
        </div>
      </div>
    </article>
  );
}

function PersonalScheduleBoard({
  weekDays,
  staffName,
  staffPosition,
  scheduleItems,
  groupedByDate,
  cancelledCount,
  selectedDate,
  onSelectDate,
  now,
}: {
  weekDays: ReturnType<typeof getWeekDays>;
  staffName: string;
  staffPosition: string;
  scheduleItems: IStaffScheduleItem[];
  groupedByDate: Map<string, IStaffScheduleItem[]>;
  cancelledCount: number;
  selectedDate: string;
  onSelectDate: (_date: string) => void;
  now: Date;
}) {
  return (
    <section className={`${surfaceClass} min-w-0 overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-5 py-3">
        <div className="text-xs font-black uppercase tracking-wider text-slate-600">Bảng lịch tuần làm việc của bạn</div>
      </div>

      <div className="w-full overflow-x-auto pb-1 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        <div className="min-w-[1200px]">
          <div
            className="grid border-b border-slate-200 bg-slate-50"
            style={tableGridStyle}
          >
            <div className="border-r border-slate-200 px-5 py-3 flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Nhân viên
            </div>
            {weekDays.map((day) => {
              const isSelected = day.iso === selectedDate;
              const isToday = isTodayIso(day.iso, now);

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => onSelectDate(day.iso)}
                  className={`border-l border-slate-200 px-4 py-3 text-left transition-all ${isSelected
                    ? "bg-red-50/45 shadow-[inset_0_-2px_0_#dc2626]"
                    : isToday
                      ? "bg-slate-100/60"
                      : "bg-transparent hover:bg-slate-100/40"
                    }`}
                >
                  <div
                    className={`text-[10px] font-black uppercase tracking-wider ${isToday || isSelected ? "text-red-600" : "text-slate-500"
                      }`}
                  >
                    {day.weekdayShort}
                  </div>
                  <div className="mt-0.5 text-sm font-black text-slate-900">
                    {day.dayLabel}/{day.monthLabel}
                  </div>
                  {isToday ? (
                    <div className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-red-600">
                      Hôm nay
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="grid bg-white" style={tableGridStyle}>
            <div className="flex flex-col justify-between border-r border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-100 text-sm font-black text-slate-700 rounded-none shadow-sm">
                  {getInitials(staffName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{staffName}</div>
                  <div className="mt-0.5 text-xs text-slate-500 font-medium">{staffPosition}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-1 text-xs font-semibold text-slate-500">
                <div className="flex justify-between"><span>Tổng ca đăng ký:</span> <span className="text-slate-850 font-bold">{scheduleItems.length} ca</span></div>
                <div className="flex justify-between text-red-500"><span>Ca đã hủy:</span> <span>{cancelledCount} ca</span></div>
              </div>
            </div>

            {weekDays.map((day) => {
              const items = groupedByDate.get(day.iso) ?? [];
              const isSelected = day.iso === selectedDate;
              const isToday = isTodayIso(day.iso, now);

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => onSelectDate(day.iso)}
                  className={`min-h-[220px] border-l border-slate-200 p-3 align-top text-left transition-all ${isSelected
                    ? "bg-red-50/10 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.08)]"
                    : isToday
                      ? "bg-slate-50/50"
                      : "bg-white hover:bg-slate-50/30"
                    }`}
                >
                  <div className="space-y-2">
                    {items.length ? (
                      items.map((item) => (
                        <ShiftCard key={item.id} item={item} compact now={now} />
                      ))
                    ) : (
                      <div className="flex min-h-[160px] items-center justify-center border border-dashed border-slate-200 bg-slate-50/30 text-xs font-medium text-slate-400 rounded-none">
                        Trống
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MySchedule({
  mode = "view",
}: {
  mode?: StaffSelfScheduleMode;
}) {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isStaff = role === "STAFF";
  const isRequestMode = mode === "request";
  const currentStaffId = normalizeNumber((user as any)?.id);
  const focusUrgentRequestId = Number(searchParams.get("focusUrgentRequest") || 0);
  const [now, setNow] = useState(() => new Date());
  const [urgentModalSchedule, setUrgentModalSchedule] =
    useState<IStaffScheduleItem | null>(null);
  const [urgentRequestType, setUrgentRequestType] = useState<UrgentRequestType>(
    UrgentRequestType.EMERGENCY_LEAVE,
  );
  const [urgentReason, setUrgentReason] = useState("");
  const [expectedArrivalTime, setExpectedArrivalTime] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  const today = new Date();
  const todayIso = toIsoDate(today);

  const defaultRequestWeekDays = useMemo(
    () => getWeekDays(STAFF_REQUEST_MIN_WEEK_OFFSET),
    [],
  );
  const [requestWeekOffset, setRequestWeekOffset] = useState(
    STAFF_REQUEST_MIN_WEEK_OFFSET,
  );
  const requestWeekDays = useMemo(
    () => getWeekDays(requestWeekOffset),
    [requestWeekOffset],
  );
  const registrationStart = requestWeekDays[0]?.iso ?? "";
  const registrationEnd = requestWeekDays[6]?.iso ?? "";

  const [viewWeekOffset, setViewWeekOffset] = useState(0);
  const viewWeekDays = useMemo(() => getWeekDays(viewWeekOffset), [viewWeekOffset]);
  const activeWeekDays = isRequestMode ? requestWeekDays : viewWeekDays;
  const activeWeekLabel = formatWeekRange(activeWeekDays);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (isRequestMode) {
      return defaultRequestWeekDays[0]?.iso ?? todayIso;
    }

    const initialWeek = getWeekDays(0);
    return initialWeek.find((item) => item.iso >= todayIso)?.iso ?? todayIso;
  });
  const [selectedShiftId, setSelectedShiftId] = useState<number>(0);

  const startDate = activeWeekDays[0]?.iso ?? "";
  const endDate = activeWeekDays[6]?.iso ?? "";

  const effectiveSelectedDate = useMemo(() => {
    if (activeWeekDays.some((day) => day.iso === selectedDate)) {
      return selectedDate;
    }

    if (!isRequestMode && viewWeekOffset === 0) {
      return todayIso;
    }

    return activeWeekDays[0]?.iso ?? todayIso;
  }, [activeWeekDays, isRequestMode, selectedDate, todayIso, viewWeekOffset]);

  const qShifts = useQuery({
    ...Schedule.getShiftTemplates(),
    enabled: isStaff && isRequestMode,
  });

  const qRegistrationWindow = useQuery({
    ...Schedule.getRegistrationWindow(),
    enabled: isStaff && isRequestMode,
  });

  const qMySchedule = useQuery({
    ...Schedule.getMySchedule({
      startDate,
      endDate,
    }),
    enabled: isStaff,
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const qCinemaSchedule = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
    }),
    enabled: isStaff && !isRequestMode,
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const qIncomingSwapRequests = useQuery({
    ...Schedule.getSwapRequests({
      box: "incoming",
    }),
    enabled: isStaff && isRequestMode,
  });

  const qOutgoingSwapRequests = useQuery({
    ...Schedule.getSwapRequests({
      box: "outgoing",
    }),
    enabled: isStaff && isRequestMode,
  });

  const qUrgentRequests = useQuery({
    ...Schedule.getUrgentRequests({
      box: "outgoing",
    }),
    enabled: isStaff,
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const shifts = useMemo(
    () => (Array.isArray(qShifts.data?.data) ? qShifts.data.data : []),
    [qShifts.data],
  );
  const registrationWindow: IStaffRegistrationWindow | null = useMemo(
    () => qRegistrationWindow.data?.data ?? null,
    [qRegistrationWindow.data],
  );
  const myScheduleItems: IStaffScheduleItem[] = useMemo(
    () => (Array.isArray(qMySchedule.data?.data) ? qMySchedule.data.data : []),
    [qMySchedule.data],
  );
  const cinemaScheduleItems: IStaffScheduleItem[] = useMemo(
    () => (Array.isArray(qCinemaSchedule.data?.data) ? qCinemaSchedule.data.data : []),
    [qCinemaSchedule.data],
  );
  const incomingSwapRequests: IStaffSwapRequestItem[] = useMemo(
    () =>
      Array.isArray(qIncomingSwapRequests.data?.data)
        ? qIncomingSwapRequests.data.data
        : [],
    [qIncomingSwapRequests.data],
  );
  const outgoingSwapRequests: IStaffSwapRequestItem[] = useMemo(
    () =>
      Array.isArray(qOutgoingSwapRequests.data?.data)
        ? qOutgoingSwapRequests.data.data
        : [],
    [qOutgoingSwapRequests.data],
  );
  const urgentRequestsData = qUrgentRequests.data?.data;
  const urgentRequests: IStaffUrgentRequestItem[] = Array.isArray(urgentRequestsData)
    ? urgentRequestsData
    : EMPTY_URGENT_REQUESTS;

  useEffect(() => {
    if (!focusUrgentRequestId || !urgentRequests.length) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`urgent-request-card-${focusUrgentRequestId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [focusUrgentRequestId, urgentRequests.length]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, IStaffScheduleItem[]>();

    myScheduleItems.forEach((item) => {
      const current = map.get(item.workDate) ?? [];
      current.push(item);
      current.sort((left, right) =>
        String(left.shift.startTime).localeCompare(String(right.shift.startTime)),
      );
      map.set(item.workDate, current);
    });

    return map;
  }, [myScheduleItems]);

  const confirmedItems = useMemo(
    () => myScheduleItems.filter((item) => item.status === ScheduleStatus.CONFIRMED),
    [myScheduleItems],
  );
  const pendingItems = useMemo(
    () => myScheduleItems.filter((item) => item.status === ScheduleStatus.ASSIGNED),
    [myScheduleItems],
  );
  const cancelledItems = useMemo(
    () => myScheduleItems.filter((item) => item.status === ScheduleStatus.CANCELLED),
    [myScheduleItems],
  );

  const cinemaRows = useMemo(() => {
    const staffs = uniqueStaffFromSchedules(cinemaScheduleItems).map((item) => ({
      id: item.id,
      avatarUrl: item.avatarUrl ?? item.avatar ?? null,
      cinemaId: item.cinemaId ?? null,
      fullName: item.fullName,
      position: item.position ?? item.roleName ?? null,
      roleName: item.roleName ?? null,
      cinemaName: null,
    }));

    return sortByName(staffs);
  }, [cinemaScheduleItems]);

  const cinemaSchedulesByCell = useMemo(
    () => groupSchedulesByCell(cinemaScheduleItems),
    [cinemaScheduleItems],
  );

  const cinemaConfirmedCount = useMemo(
    () =>
      cinemaScheduleItems.filter((item) => item.status === ScheduleStatus.CONFIRMED)
        .length,
    [cinemaScheduleItems],
  );
  const cinemaPendingCount = useMemo(
    () =>
      cinemaScheduleItems.filter((item) => item.status === ScheduleStatus.ASSIGNED).length,
    [cinemaScheduleItems],
  );

  const selectedCinemaDayEntries = useMemo(() => {
    return cinemaScheduleItems
      .filter((item) => item.workDate === effectiveSelectedDate)
      .sort((left, right) => {
        const startTimeCompare = String(left.shift.startTime).localeCompare(
          String(right.shift.startTime),
        );

        if (startTimeCompare !== 0) return startTimeCompare;
        return String(left.staff.fullName).localeCompare(
          String(right.staff.fullName),
          "vi",
        );
      });
  }, [cinemaScheduleItems, effectiveSelectedDate]);

  const selectedOwnCinemaEntries = useMemo(() => {
    if (!currentStaffId) return [];
    return selectedCinemaDayEntries.filter(
      (item) => Number(item.staff.id) === Number(currentStaffId),
    );
  }, [currentStaffId, selectedCinemaDayEntries]);

  const effectiveSelectedShiftId = Number(selectedShiftId || shifts[0]?.id || 0);
  const selectedShift =
    shifts.find((item) => Number(item.id) === effectiveSelectedShiftId) ?? null;
  const selectedDayEntries = groupedByDate.get(effectiveSelectedDate) ?? [];
  const totalHours = getTotalHours(confirmedItems, [ScheduleStatus.CONFIRMED]);

  const incomingPendingCount = useMemo(
    () =>
      incomingSwapRequests.filter(
        (item) => item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE,
      ).length,
    [incomingSwapRequests],
  );
  const outgoingPendingCount = useMemo(
    () =>
      outgoingSwapRequests.filter(
        (item) =>
          item.status === SwapRequestStatus.PENDING_STAFF_RESPONSE ||
          item.status === SwapRequestStatus.PENDING_ADMIN_APPROVAL,
      ).length,
    [outgoingSwapRequests],
  );

  // 1. ĐÃ SỬA CÚ PHÁP RÁC (XÓA BỎ parentUrl:) ĐỂ BIÊN DỊCH CHUẨN XÁC TẠI ĐÂY
  const urgentPendingCount = useMemo(
    () =>
      urgentRequests.filter(
        (item) => item.status === UrgentRequestStatus.PENDING_ADMIN_APPROVAL,
      ).length,
    [urgentRequests],
  );
  const urgentApprovedCount = useMemo(
    () =>
      urgentRequests.filter(
        (item) => item.status === UrgentRequestStatus.ADMIN_APPROVED,
      ).length,
    [urgentRequests],
  );

  const requestMutation = useMutation({
    mutationFn: () =>
      Schedule.upsert({
        shiftId: effectiveSelectedShiftId,
        workDate: effectiveSelectedDate,
        status: ScheduleStatus.ASSIGNED,
      }).then((response) => response.data),
    onSuccess: (response) => {
      n.success(response.message || "Đã gửi đăng ký ca làm, chờ manager duyệt.");
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId: number) =>
      Schedule.deleteSchedule(scheduleId).then((response) => response.data),
    onSuccess: (response) => {
      n.success(response.message || "Đã xóa lịch làm.");
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.urgentRequests],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
  });

  const createUrgentRequestMutation = useMutation({
    mutationFn: () =>
      Schedule.createUrgentRequest({
        scheduleId: Number(urgentModalSchedule?.id || 0),
        type: urgentRequestType,
        reason: urgentReason.trim(),
        expectedArrivalTime:
          urgentRequestType === UrgentRequestType.LATE_ARRIVAL
            ? expectedArrivalTime || null
            : null,
      }).then((response) => response.data),
    onSuccess: (response) => {
      n.success(response.message || "Đã gửi yêu cầu khẩn.");
      setUrgentModalSchedule(null);
      setUrgentReason("");
      setExpectedArrivalTime("");
      setUrgentRequestType(UrgentRequestType.EMERGENCY_LEAVE);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.urgentRequests],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
  });

  const displayStaff = myScheduleItems[0]?.staff;
  const staffName =
    displayStaff?.fullName || user?.fullName || user?.email || "Nhân viên";
  const staffPosition = getPositionLabel(displayStaff?.position || role);
  const isRegistrationWindowLoading = isRequestMode && qRegistrationWindow.isLoading;
  const canRegisterToday = registrationWindow?.staffCanRegisterNow ?? false;
  const isRegistrationForceOpen = Boolean(registrationWindow?.forceOpen);

  const canSubmit =
    isRequestMode &&
    canRegisterToday &&
    effectiveSelectedDate >= registrationStart &&
    effectiveSelectedDate <= registrationEnd &&
    effectiveSelectedShiftId > 0;

  const orderedUrgentRequests = useMemo(() => {
    const toTimestamp = (item: IStaffUrgentRequestItem) => {
      const value = item.updatedAt || item.createdAt || item.workDate;
      return value ? new Date(value).getTime() : 0;
    };

    return [...urgentRequests].sort((left, right) => {
      const leftFocused = Number(left.id === focusUrgentRequestId);
      const rightFocused = Number(right.id === focusUrgentRequestId);
      if (leftFocused !== rightFocused) {
        return rightFocused - leftFocused;
      }
      return toTimestamp(right) - toTimestamp(left);
    });
  }, [focusUrgentRequestId, urgentRequests]);

  const requestDeleteSchedule = (item: IStaffScheduleItem) => {
    n.confirm(
      `Xóa nhanh ca ${item.shift.name} vào ${formatDateLong(item.workDate)} khỏi lịch của bạn?`,
      {
        title: "Xóa lịch",
        confirmText: "Xóa",
        cancelText: "Quay lại",
        onConfirm: () => deleteScheduleMutation.mutate(item.id),
      },
    );
  };

  const openUrgentModal = (
    item: IStaffScheduleItem,
    type: UrgentRequestType,
  ) => {
    setUrgentModalSchedule(item);
    setUrgentRequestType(type);
    setUrgentReason("");
    setExpectedArrivalTime("");
  };

  const canQuickDeleteSchedule = (item: IStaffScheduleItem) =>
    Number(item.staff.id) === Number(currentStaffId || 0) &&
    item.status !== ScheduleStatus.CONFIRMED &&
    canWriteShiftSchedule(item.workDate, item.shift, now);

  const canCreateUrgentRequestForSchedule = (item: IStaffScheduleItem) =>
    Number(item.staff.id) === Number(currentStaffId || 0) &&
    item.status === ScheduleStatus.CONFIRMED &&
    canCreateUrgentShiftRequest(item.workDate, item.shift, now);

  const canSubmitUrgentRequest =
    urgentModalSchedule != null &&
    urgentReason.trim().length > 0 &&
    (urgentRequestType !== UrgentRequestType.LATE_ARRIVAL ||
      expectedArrivalTime.length > 0) &&
    !createUrgentRequestMutation.isPending;

  const renderScheduleActions = (item: IStaffScheduleItem) => {
    const actions: React.ReactNode[] = [];

    if (canQuickDeleteSchedule(item)) {
      actions.push(
        <button
          key={`delete-${item.id}`}
          type="button"
          disabled={deleteScheduleMutation.isPending}
          onClick={() => requestDeleteSchedule(item)}
          className="inline-flex h-8 items-center gap-1 border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 rounded-none"
        >
          Xóa nhanh
        </button>,
      );
    }

    if (canCreateUrgentRequestForSchedule(item)) {
      actions.push(
        <button
          key={`urgent-leave-${item.id}`}
          type="button"
          onClick={() => openUrgentModal(item, UrgentRequestType.EMERGENCY_LEAVE)}
          className="inline-flex h-8 items-center gap-1 border border-red-600 bg-red-600 px-2.5 text-[11px] font-bold text-white transition hover:bg-red-700 rounded-none"
        >
          Hủy khẩn
        </button>,
      );
      actions.push(
        <button
          key={`late-${item.id}`}
          type="button"
          onClick={() => openUrgentModal(item, UrgentRequestType.LATE_ARRIVAL)}
          className="inline-flex h-8 items-center gap-1 border border-slate-300 bg-white px-2.5 text-[11px] font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 rounded-none"
        >
          Xin đi muộn
        </button>,
      );
    }

    if (!actions.length) {
      return undefined;
    }

    return actions;
  };

  const handleRequestWeekChange = (nextOffset: number) => {
    const safeOffset = Math.min(
      STAFF_REQUEST_MAX_WEEK_OFFSET,
      Math.max(STAFF_REQUEST_MIN_WEEK_OFFSET, nextOffset),
    );
    const nextWeekDays = getWeekDays(safeOffset);
    const currentIndex = requestWeekDays.findIndex(
      (day) => day.iso === effectiveSelectedDate,
    );
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    setRequestWeekOffset(safeOffset);
    setSelectedDate(nextWeekDays[safeIndex]?.iso ?? nextWeekDays[0]?.iso ?? todayIso);
  };

  const handleViewDateChange = (value: string) => {
    if (!value) return;

    const baseMonday = startOfWeek(new Date());
    const targetMonday = startOfWeek(fromIsoDate(value));
    const diffInWeeks = Math.round(
      (targetMonday.getTime() - baseMonday.getTime()) / (7 * 24 * 60 * 60 * 1000),
    );

    setViewWeekOffset(diffInWeeks);
    setSelectedDate(value);
  };

  const handleViewWeekChange = (nextOffset: number) => {
    const nextWeekDays = getWeekDays(nextOffset);
    const currentIndex = viewWeekDays.findIndex(
      (day) => day.iso === effectiveSelectedDate,
    );
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    setViewWeekOffset(nextOffset);
    setSelectedDate(
      nextOffset === 0
        ? todayIso
        : nextWeekDays[safeIndex]?.iso ?? nextWeekDays[0]?.iso ?? todayIso,
    );
  };

  const activeError = isRequestMode
    ? qRegistrationWindow.isError
      ? getErrorMessage(qRegistrationWindow.error)
      : qShifts.isError
        ? getErrorMessage(qShifts.error)
        : qMySchedule.isError
          ? getErrorMessage(qMySchedule.error)
          : qIncomingSwapRequests.isError
            ? getErrorMessage(qIncomingSwapRequests.error)
            : qOutgoingSwapRequests.isError
              ? getErrorMessage(qOutgoingSwapRequests.error)
              : qUrgentRequests.isError
                ? getErrorMessage(qUrgentRequests.error)
                : ""
    : qCinemaSchedule.isError
      ? getErrorMessage(qCinemaSchedule.error)
      : qUrgentRequests.isError
        ? getErrorMessage(qUrgentRequests.error)
        : "";

  if (loading) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-8 text-sm font-medium text-slate-600 rounded-none">
        Đang tải lịch làm...
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700 rounded-none">
        Trang này chỉ dành cho tài khoản STAFF.
      </div>
    );
  }

  return (
    <div className="space-y-5 border border-slate-200 bg-slate-50/50 px-6 py-6 text-slate-900 rounded-none shadow-sm">
      <ConfirmDialog />

      {/* Header Panel */}
      <div className="space-y-4 border-b border-slate-200 pb-5">
        <div className="overflow-hidden border border-slate-200 bg-white rounded-none shadow-sm">
          <div className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between bg-gradient-to-r from-white to-slate-50/30">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Ca làm cá nhân
              </div>
              <h1 className="mt-1 text-2xl font-black text-slate-900">
                {isRequestMode ? "Đăng ký lịch làm việc" : "Lịch làm rạp phim"}
              </h1>
            </div>

            <div className="border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 rounded-none shadow-sm">
              Tuần đang xem: {activeWeekLabel}
            </div>
          </div>
        </div>

        <StaffTabs mode={mode} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          {isRequestMode ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRequestWeekChange(STAFF_REQUEST_MIN_WEEK_OFFSET)}
                className={
                  requestWeekOffset === STAFF_REQUEST_MIN_WEEK_OFFSET
                    ? "bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 rounded-none shadow-sm"
                    : secondaryButtonClass
                }
              >
                Tuần sau
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleViewWeekChange(viewWeekOffset - 1)}
                className={secondaryButtonClass}
              >
                Tuần trước
              </button>
              <button
                type="button"
                onClick={() => handleViewWeekChange(0)}
                className="bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 rounded-none shadow-sm"
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => handleViewWeekChange(viewWeekOffset + 1)}
                className={secondaryButtonClass}
              >
                Tuần sau
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 min-w-[320px] md:min-w-[450px]">
            {isRequestMode ? (
              <>
                <SummaryTile label="Đã chốt" value={String(confirmedItems.length)} />
                <SummaryTile label="Chờ duyệt" value={String(pendingItems.length)} />
                <SummaryTile label="Tổng Giờ" value={`${totalHours.toFixed(1)}h`} />
              </>
            ) : (
              <>
                <SummaryTile label="Nhân viên" value={String(cinemaRows.length)} />
                <SummaryTile label="Đã chốt" value={String(cinemaConfirmedCount)} />
                <SummaryTile label="Chờ duyệt" value={String(cinemaPendingCount)} />
              </>
            )}
          </div>
        </div>

        {activeError ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 rounded-none">
            {activeError}
          </div>
        ) : null}
      </div>

      {/* Main Board Layout & Forms */}
      {isRequestMode ? (
        <div className="space-y-6">
          {/* 1. REGISTRATION WINDOW ALERT */}
          {!isRegistrationWindowLoading && isRegistrationForceOpen ? (
            <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 rounded-none font-medium">
              Admin đang mở cổng đăng ký đặc biệt. Bạn có thể tự do đăng ký lịch của tuần sau.
            </div>
          ) : !isRegistrationWindowLoading && !canRegisterToday ? (
            <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 rounded-none font-semibold">
              Hệ thống chỉ mở đăng ký vào Thứ 7 và Chủ nhật hàng tuần.
            </div>
          ) : null}

          {/* 2. REGISTRATION FORM DETAILS ON TOP (3-COLUMN DASHBOARD) */}
          <div className="border border-slate-200 bg-white p-6 rounded-none shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-950">Đăng ký ca làm chi tiết</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Cột 1: Ngày làm */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-none border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span>Ngày làm việc</span>
                  <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-none font-black">Yêu cầu</span>
                </h3>

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-slate-500">
                    Chọn một ngày trên lịch tuần sau:
                  </label>
                  <input
                    type="date"
                    min={registrationStart}
                    max={registrationEnd}
                    disabled={!canRegisterToday}
                    value={effectiveSelectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-10 w-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 rounded-none outline-none transition focus:border-red-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <div className="text-sm font-black text-red-600 bg-red-50/60 p-3 rounded-none border border-red-100">
                    {formatDateLong(effectiveSelectedDate)}
                  </div>
                </div>
              </div>

              {/* Cột 2: Chọn khung ca */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-none border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
                  Chọn khung ca
                </h3>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {qShifts.isLoading ? (
                    <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 rounded-none">
                      Đang tải danh sách ca...
                    </div>
                  ) : shifts.length ? (
                    shifts.map((shift) => {
                      const active = Number(shift.id) === effectiveSelectedShiftId;

                      return (
                        <button
                          key={shift.id}
                          type="button"
                          disabled={!canRegisterToday}
                          onClick={() => setSelectedShiftId(Number(shift.id))}
                          className={`w-full border px-3 py-2.5 text-left transition-all rounded-none ${active
                            ? "border-red-600 bg-red-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                            } ${!canRegisterToday ? "cursor-not-allowed opacity-65" : ""}`}
                        >
                          <div className="text-xs font-bold">{shift.name}</div>
                          <div
                            className={`mt-0.5 text-[10px] ${active ? "text-red-100" : "text-slate-500"
                              }`}
                          >
                            {formatShiftRange(shift)}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 rounded-none">
                      Chưa có ca mẫu từ hệ thống.
                    </div>
                  )}
                </div>
              </div>

              {/* Cột 3: Xác nhận & Đã đăng ký */}
              <div className="space-y-4 p-4 bg-slate-50/50 rounded-none border border-slate-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-2">
                    Xác nhận đăng ký
                  </h3>

                  <div className="border border-slate-200 bg-white p-3 rounded-none shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Khung ca đang chọn
                    </div>
                    <div className="mt-1 text-sm font-black text-slate-900">
                      {selectedShift?.name || "Chưa chọn ca"}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-slate-600">
                      {selectedShift ? formatShiftRange(selectedShift) : "--:-- - --:--"}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={!canSubmit || requestMutation.isPending}
                    onClick={() => requestMutation.mutate()}
                    className="h-10 w-full bg-red-600 text-xs font-black uppercase tracking-wider text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 rounded-none shadow-sm"
                  >
                    {requestMutation.isPending ? "Đang gửi đăng ký..." : "Gửi Đăng Ký Lên Quản Lý"}
                  </button>
                </div>

                {/* Danh sách ca đã lưu trong ngày đã chọn */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-xs font-bold text-slate-700 mb-2">Đăng ký của bạn trong ngày này:</div>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto">
                    {selectedDayEntries.length ? (
                      selectedDayEntries.map((item) => (
                        <ShiftCard
                          key={item.id}
                          item={item}
                          now={now}
                          actions={renderScheduleActions(item)}
                        />
                      ))
                    ) : (
                      <div className="border border-slate-200 bg-white px-3 py-3 text-xs text-slate-400 text-center rounded-none border-dashed">
                        Chưa có ca làm nào được đăng ký trong ngày.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TABLE/BOARD BELOW (FULL WIDTH) */}
          <PersonalScheduleBoard
            weekDays={requestWeekDays}
            staffName={staffName}
            staffPosition={staffPosition}
            scheduleItems={myScheduleItems}
            groupedByDate={groupedByDate}
            cancelledCount={cancelledItems.length}
            selectedDate={effectiveSelectedDate}
            onSelectDate={setSelectedDate}
            now={now}
          />

          {/* 4. SWAP REQUEST SECTION */}
          <section className={`${surfaceClass} overflow-hidden`}>
            <div className="grid gap-5 bg-white px-6 py-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-center">
              <div>
                <div className="text-xl font-black text-slate-900">Nhờ đồng nghiệp làm thay</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <div className="border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 rounded-none">
                    {incomingPendingCount} chờ phản hồi
                  </div>
                  <div className="border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 rounded-none">
                    {outgoingPendingCount} đã gửi yêu cầu
                  </div>
                </div>
              </div>
              <div>
                <Link
                  href="/admin/staff-schedules/my/swaps"
                  className="inline-flex h-11 w-full items-center justify-center bg-red-600 px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 rounded-none shadow-sm"
                >
                  Mở tab nhờ làm thay
                </Link>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* VIEW MODE LAYOUT (XEM LỊCH) */
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <StaffScheduleThisWeek
            weekDays={viewWeekDays}
            rows={cinemaRows}
            schedules={cinemaScheduleItems}
            schedulesByCell={cinemaSchedulesByCell}
            emptyTitle="Chưa có lịch làm trong rạp"
            emptyDescription=""
            interactive={false}
            highlightStaffId={currentStaffId}
            onOpenCell={() => undefined}
          />

          <aside className={`${surfaceClass} h-fit min-w-0 p-5`}>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <div className="text-sm font-black text-slate-900">Chi tiết ca trong ngày</div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chọn ngày làm
                </label>
                <input
                  type="date"
                  value={effectiveSelectedDate}
                  onChange={(event) => handleViewDateChange(event.target.value)}
                  className="h-10 w-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 rounded-none outline-none transition focus:border-red-500"
                />
                <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-none inline-block">
                  {formatDateLong(effectiveSelectedDate)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-none border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Tổng nhân sự
                  </div>
                  <div className="mt-0.5 text-xl font-black text-slate-900">
                    {selectedCinemaDayEntries.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Ca của bạn
                  </div>
                  <div className="mt-0.5 text-xl font-black text-slate-900">
                    {selectedOwnCinemaEntries.length}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Danh sách ca trực tiếp:</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedCinemaDayEntries.length ? (
                    selectedCinemaDayEntries.map((item) => (
                      <ShiftCard
                        key={item.id}
                        item={item}
                        showStaff
                        highlight={
                          Number(currentStaffId || 0) > 0 &&
                          Number(item.staff.id) === Number(currentStaffId)
                        }
                        now={now}
                        actions={renderScheduleActions(item)}
                      />
                    ))
                  ) : (
                    <div className="border border-slate-200 bg-slate-50/50 px-3 py-4 text-xs text-slate-400 text-center rounded-none border-dashed">
                      Chưa có ca làm nào trong ngày này.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* EMERGENCY LEAVE & LATE ARRIVAL */}
      <section className={`${surfaceClass} overflow-hidden`}>
        <div className="grid gap-5 bg-white px-6 py-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center border-b border-slate-100">
          <div>
            <div className="text-xl font-black text-slate-900">Yêu cầu khẩn cấp & Xin đi muộn</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 rounded-none">
                {urgentPendingCount} chờ phê duyệt
              </div>
              <div className="border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 rounded-none">
                {urgentApprovedCount} đã xử lý
              </div>
            </div>
          </div>
          <div className="border border-red-100 bg-red-50/50 px-4 py-3 text-xs text-red-800 rounded-none">
            Chỉ những ca đã được <span className="font-bold">Chốt chính thức</span> trong hôm nay mới hiển thị tùy chọn gửi yêu cầu khẩn.
          </div>
        </div>

        <div className="space-y-3 px-6 py-5 bg-slate-50/30">
          {orderedUrgentRequests.length ? (
            orderedUrgentRequests.map((item) => (
              <UrgentRequestCard
                key={item.id}
                item={item}
                highlight={Number(item.id) === focusUrgentRequestId}
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-200 bg-white px-4 py-6 text-xs text-slate-500 text-center rounded-none">
              Chưa có yêu cầu khẩn nào được ghi nhận.
            </div>
          )}
        </div>
      </section>

      {/* MUTATION MODAL */}
      <Modal
        open={urgentModalSchedule != null}
        onClose={() => {
          if (createUrgentRequestMutation.isPending) return;
          setUrgentModalSchedule(null);
        }}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 220,
            className: "bg-slate-950/45 backdrop-blur-[2px]",
          },
        }}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-2xl border border-slate-200 bg-white shadow-2xl rounded-none overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 bg-slate-50">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Xử lý sự cố đột xuất
                </div>
                <div className="mt-1 text-xl font-black text-slate-900">
                  {urgentRequestType === UrgentRequestType.LATE_ARRIVAL
                    ? "Gửi đơn xin đi muộn"
                    : "Đăng ký hủy lịch khẩn cấp"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (createUrgentRequestMutation.isPending) return;
                  setUrgentModalSchedule(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition rounded-none shadow-sm"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setUrgentRequestType(UrgentRequestType.EMERGENCY_LEAVE)}
                  className={`border p-4 text-left transition-all rounded-none ${urgentRequestType === UrgentRequestType.EMERGENCY_LEAVE
                    ? "border-red-600 bg-red-600 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-900 hover:border-red-100 hover:bg-red-50/50"
                    }`}
                >
                  <div className="text-sm font-black">Nghỉ khẩn cấp</div>
                  <div
                    className={`mt-1 text-xs leading-5 ${urgentRequestType === UrgentRequestType.EMERGENCY_LEAVE
                      ? "text-red-100"
                      : "text-slate-500"
                      }`}
                  >
                    Nộp lý do giải trình để Admin/Quản lý phê duyệt rút tên khỏi ca làm.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgentRequestType(UrgentRequestType.LATE_ARRIVAL)}
                  className={`border p-4 text-left transition-all rounded-none ${urgentRequestType === UrgentRequestType.LATE_ARRIVAL
                    ? "border-red-600 bg-red-600 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-900 hover:border-red-100 hover:bg-red-50/50"
                    }`}
                >
                  <div className="text-sm font-black">Xin đi muộn</div>
                  <div
                    className={`mt-1 text-xs leading-5 ${urgentRequestType === UrgentRequestType.LATE_ARRIVAL
                      ? "text-red-100"
                      : "text-slate-500"
                      }`}
                  >
                    Báo trước cho quản lý biết giờ có mặt trễ để sắp xếp người hỗ trợ rạp kịp thời.
                  </div>
                </button>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-4 rounded-none">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ca trực bị ảnh hưởng
                </div>
                <div className="mt-1 text-sm font-black text-slate-900">
                  {urgentModalSchedule?.shift.name || "-"}
                </div>
                <div className="mt-0.5 text-xs text-slate-600">
                  {urgentModalSchedule
                    ? `${formatDateLong(urgentModalSchedule.workDate)} • ${formatShiftRange(
                      urgentModalSchedule.shift,
                    )}`
                    : "-"}
                </div>
              </div>

              {urgentRequestType === UrgentRequestType.LATE_ARRIVAL ? (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Giờ có mặt dự kiến (bắt buộc)
                  </label>
                  <input
                    type="time"
                    value={expectedArrivalTime}
                    onChange={(event) => setExpectedArrivalTime(event.target.value)}
                    className="h-10 w-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 rounded-none outline-none transition focus:border-red-500"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mô tả chi tiết lý do sự cố
                </label>
                <textarea
                  rows={4}
                  value={urgentReason}
                  onChange={(event) => setUrgentReason(event.target.value)}
                  placeholder={
                    urgentRequestType === UrgentRequestType.LATE_ARRIVAL
                      ? "Mô tả lý do (ví dụ: hỏng xe, tắc đường kẹt xe tại đường lớn...)"
                      : "Mô tả cụ thể sự cố cần nghỉ khẩn..."
                  }
                  className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 rounded-none outline-none transition focus:border-red-500"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (createUrgentRequestMutation.isPending) return;
                    setUrgentModalSchedule(null);
                  }}
                  className="h-10 border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 rounded-none hover:bg-slate-50 transition"
                >
                  Hủy thao tác
                </button>
                <button
                  type="button"
                  disabled={!canSubmitUrgentRequest}
                  onClick={() => createUrgentRequestMutation.mutate()}
                  className="h-10 border border-red-600 bg-red-600 px-5 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-400 rounded-none shadow-sm transition hover:bg-red-750"
                >
                  {createUrgentRequestMutation.isPending ? "Đang gửi đi..." : "Gửi báo cáo sự cố"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}