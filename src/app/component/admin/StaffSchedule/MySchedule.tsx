"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import {
  Schedule,
  ScheduleStatus,
  type IStaffRegistrationWindow,
  type IStaffScheduleItem,
  type IStaffSwapRequestItem,
  SwapRequestStatus,
} from "@/types/data/staff/schedule/schedule";

import StaffScheduleThisWeek from "./StaffScheduleThisWeek";
import {
  formatDateLong,
  formatShiftRange,
  formatWeekRange,
  fromIsoDate,
  getErrorMessage,
  getInitials,
  getPositionLabel,
  getStatusMeta,
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

const surfaceClass = "border border-slate-200 bg-white";
const secondaryButtonClass =
  "border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
const tableGridStyle = {
  gridTemplateColumns: "240px repeat(7, minmax(148px, 1fr))",
} as const;
const STAFF_REQUEST_MIN_WEEK_OFFSET = 1;
const STAFF_REQUEST_MAX_WEEK_OFFSET = 1;

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={`${surfaceClass} px-4 py-4`}>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function ShiftCard({
  item,
  compact = false,
  showStaff = false,
  highlight = false,
  now,
}: {
  item: IStaffScheduleItem;
  compact?: boolean;
  showStaff?: boolean;
  highlight?: boolean;
  now: Date;
}) {
  const meta = getStatusMeta(item.status);
  const isLive = isShiftActiveAt(item.workDate, item.shift, now);

  return (
    <div
      className={`border px-3 py-2 text-left ${
        isLive
          ? "border-red-300 bg-red-50 shadow-[0_0_0_1px_rgba(220,38,38,0.12)]"
          : meta.lightCardClass
      } ${highlight ? "border-red-300 shadow-[inset_0_0_0_1px_rgba(220,38,38,0.12)]" : ""} ${
        isLive && highlight ? "bg-red-50" : ""
      }`}
    >
      {showStaff ? (
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              {item.staff.fullName}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {getPositionLabel(item.staff.position || item.staff.roleName)}
            </div>
          </div>
          {highlight ? (
            <span className="inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Tôi
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={`${compact ? "text-[11px]" : "text-sm"} font-bold text-slate-900`}>
        {item.shift.name}
      </div>
      <div className="mt-1 text-xs text-slate-600">{formatShiftRange(item.shift)}</div>
      {isLive ? (
        <div className="mt-2 inline-flex items-center border border-red-600 bg-red-600 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
          Đang trong ca
        </div>
      ) : null}
      <span
        className={`mt-2 inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
      >
        {meta.label}
      </span>
    </div>
  );
}

function StaffTabs({ mode }: { mode: StaffSelfScheduleMode }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/admin/staff-schedules/my/request"
        className={`inline-flex items-center border px-4 py-2.5 text-sm font-bold ${
          mode === "request"
            ? "border-red-600 bg-red-600 text-white"
            : "border-slate-300 bg-white text-slate-700"
        }`}
      >
        Đăng ký
      </Link>
      <Link
        href="/admin/staff-schedules/my"
        className={`inline-flex items-center border px-4 py-2.5 text-sm font-bold ${
          mode === "view"
            ? "border-red-600 bg-red-600 text-white"
            : "border-slate-300 bg-white text-slate-700"
        }`}
      >
        Lịch làm
      </Link>
      <Link
        href="/admin/staff-schedules/my/swaps"
        className="inline-flex items-center border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
      >
        Nhờ làm thay
      </Link>
    </div>
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
    <section className={surfaceClass}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="text-sm font-semibold text-slate-700">Bảng tuần</div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1280px]">
          <div
            className="grid border-b border-slate-200 bg-slate-50"
            style={tableGridStyle}
          >
            <div className="border-r border-slate-200 px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                  className={`border-l border-slate-200 px-3 py-4 text-left transition ${
                    isSelected
                      ? "bg-red-50"
                      : isToday
                      ? "bg-red-50/70"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                      isToday ? "text-red-600" : "text-slate-500"
                    }`}
                  >
                    {day.weekdayShort}
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {day.dayLabel}/{day.monthLabel}
                  </div>
                  {isToday ? (
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">
                      Hôm nay
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="grid" style={tableGridStyle}>
            <div className="flex flex-col justify-between border-r border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
                  {getInitials(staffName)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{staffName}</div>
                  <div className="mt-1 text-xs text-slate-500">{staffPosition}</div>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <div>{scheduleItems.length} ca trong tuần</div>
                <div>{cancelledCount} ca đã hủy</div>
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
                  className={`min-h-[250px] border-l border-slate-200 px-3 py-3 align-top text-left transition ${
                    isSelected
                      ? "bg-red-50"
                      : isToday
                      ? "bg-red-50/40"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-2">
                    {items.length ? (
                      items.map((item) => (
                        <ShiftCard key={item.id} item={item} compact now={now} />
                      ))
                    ) : (
                      <div className="flex min-h-[214px] items-center justify-center border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
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
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isStaff = role === "STAFF";
  const isRequestMode = mode === "request";
  const currentStaffId = normalizeNumber((user as any)?.id);
  const [now, setNow] = useState(() => new Date());

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

  const requestMutation = useMutation({
    mutationFn: () =>
      Schedule.upsert({
        shiftId: effectiveSelectedShiftId,
        workDate: effectiveSelectedDate,
        status: ScheduleStatus.ASSIGNED,
      }).then((response) => response.data),
    onSuccess: (response) => {
      n.success(response.message || "Đã gửi đăng ký ca làm.");
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
      : ""
    : qCinemaSchedule.isError
    ? getErrorMessage(qCinemaSchedule.error)
    : "";

  if (loading) {
    return (
      <div
        className="border border-slate-200 bg-white px-6 py-8 text-sm font-medium text-slate-600"
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        Đang tải lịch làm...
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div
        className="border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-700"
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        Trang này chỉ dành cho tài khoản STAFF.
      </div>
    );
  }

  return (
    <div
      className="space-y-4 border border-slate-200 bg-white px-6 py-5 text-slate-900"
      style={{ fontFamily: "Roboto, sans-serif" }}
    >
      <div className="space-y-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isRequestMode ? "Đăng ký lịch" : "Lịch làm"}
            </h1>
          </div>

          <div className="border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            {activeWeekLabel}
          </div>
        </div>

        <StaffTabs mode={mode} />

        {isRequestMode ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleRequestWeekChange(STAFF_REQUEST_MIN_WEEK_OFFSET)}
              className={
                requestWeekOffset === STAFF_REQUEST_MIN_WEEK_OFFSET
                  ? "bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
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
              className="bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
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

        <div className="grid gap-3 md:grid-cols-3">
          {isRequestMode ? (
            <>
              <SummaryTile label="Đã chốt" value={String(confirmedItems.length)} />
              <SummaryTile label="Chờ duyệt" value={String(pendingItems.length)} />
              <SummaryTile label="Giờ" value={`${totalHours.toFixed(1)}h`} />
            </>
          ) : (
            <>
              <SummaryTile label="Có ca" value={String(cinemaRows.length)} />
              <SummaryTile label="Đã chốt" value={String(cinemaConfirmedCount)} />
              <SummaryTile label="Chờ duyệt" value={String(cinemaPendingCount)} />
            </>
          )}
        </div>

        {activeError ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {activeError}
          </div>
        ) : null}
      </div>

      {isRequestMode ? (
        <>
          {!isRegistrationWindowLoading && isRegistrationForceOpen ? (
            <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Admin đang mở đăng ký ngay. Bạn vẫn chỉ chọn lịch của tuần sau.
            </div>
          ) : !isRegistrationWindowLoading && !canRegisterToday ? (
            <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Chỉ đăng ký vào thứ 7 hoặc chủ nhật.
            </div>
          ) : null}

          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
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

            <aside className={`${surfaceClass} h-fit`}>
              <div className="border-b border-slate-200 px-4 py-4">
                <div className="text-sm font-semibold text-slate-700">Đăng ký ca</div>
              </div>

              <div className="space-y-5 px-4 py-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ngày làm
                  </label>
                  <input
                    type="date"
                    min={registrationStart}
                    max={registrationEnd}
                    disabled={!canRegisterToday}
                    value={effectiveSelectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="h-11 w-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <div className="text-sm font-medium text-slate-700">
                    {formatDateLong(effectiveSelectedDate)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ca làm
                  </div>
                  <div className="space-y-2">
                    {qShifts.isLoading ? (
                      <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                        Đang tải ca...
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
                            className={`w-full border px-3 py-3 text-left transition ${
                              active
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                            } ${!canRegisterToday ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <div className="text-sm font-semibold">{shift.name}</div>
                            <div
                              className={`mt-1 text-xs ${
                                active ? "text-red-100" : "text-slate-500"
                              }`}
                            >
                              {formatShiftRange(shift)}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                        Chưa có ca mẫu.
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ca đang chọn
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedShift?.name || "Chưa chọn ca"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {selectedShift ? formatShiftRange(selectedShift) : "--:-- - --:--"}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canSubmit || requestMutation.isPending}
                  onClick={() => requestMutation.mutate()}
                  className="h-11 w-full bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {requestMutation.isPending ? "Đang gửi..." : "Gửi đăng ký"}
                </button>

                <div className="border-t border-slate-200 pt-5">
                  <div className="text-sm font-semibold text-slate-700">Ngày đã chọn</div>
                  <div className="mt-3 space-y-2">
                    {selectedDayEntries.length ? (
                      selectedDayEntries.map((item) => (
                        <ShiftCard key={item.id} item={item} now={now} />
                      ))
                    ) : (
                      <div className="border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        Chưa có ca.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <section className={`${surfaceClass} overflow-hidden`}>
            <div className="grid gap-5 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_58%,#fff7ed_100%)] px-5 py-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
              <div>
                <div className="text-2xl font-black text-slate-900">Nhờ làm thay</div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700">
                    {incomingPendingCount} chờ phản hồi
                  </div>
                  <div className="border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700">
                    {outgoingPendingCount} đã gửi
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/admin/staff-schedules/my/swaps"
                  className="inline-flex h-12 w-full items-center justify-center bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Mở nhờ làm thay
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : (
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

          <aside className={`${surfaceClass} h-fit`}>
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="text-sm font-semibold text-slate-700">Ca trong ngày</div>
            </div>

            <div className="space-y-5 px-4 py-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Chọn ngày
                </label>
                <input
                  type="date"
                  value={effectiveSelectedDate}
                  onChange={(event) => handleViewDateChange(event.target.value)}
                  className="h-11 w-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-500"
                />
                <div className="text-sm font-medium text-slate-700">
                  {formatDateLong(effectiveSelectedDate)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Người làm
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {selectedCinemaDayEntries.length}
                  </div>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Ca của tôi
                  </div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">
                    {selectedOwnCinemaEntries.length}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <div className="text-sm font-semibold text-slate-700">Danh sách ca</div>
                <div className="mt-3 space-y-2">
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
                      />
                    ))
                  ) : (
                    <div className="border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                      Chưa có ca trong ngày.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
