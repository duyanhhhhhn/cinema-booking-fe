"use client";

import Link from "next/link";
import React, { useDeferredValue, useMemo, useState } from "react";
import {
  ChecklistRtl,
  InfoOutlined,
  CheckCircleOutlineRounded,
  Storefront,
  ViewWeek,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import CreateWorkShiftDialog from "@/app/component/admin/StaffSchedule/CreateWorkShiftDialog";
import { User } from "@/app/component/admin/user/user";
import type { IStaff } from "@/app/component/admin/user/type";
import AssignStaffPanel from "@/app/component/admin/StaffSchedule/AssignStaffPanel";
import StaffScheduleAssignBoard from "@/app/component/admin/StaffSchedule/StaffScheduleAssignBoard";
import StaffScheduleThisWeek from "@/app/component/admin/StaffSchedule/StaffScheduleThisWeek";
import {
  buildProjectedCellLoadSummary,
  formatWeekRange,
  getErrorMessage,
  getWeekDays,
  groupSchedulesByCell,
  normalizeNumber,
  STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY,
  STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY,
  sortByName,
  summarizeCellLoad,
  toIsoDate,
} from "@/app/component/admin/StaffSchedule/staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "@/app/component/admin/StaffSchedule/staffScheduleTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import {
  Schedule,
  ScheduleStatus,
  type IStaffScheduleItem,
  type ScheduleFormData,
} from "@/types/data/staff/schedule/schedule";
import { WorkShift, type CreateWorkShiftPayload } from "@/types/data/staff/workshift";

type StaffScheduleScreenMode = "overview" | "assign";

interface StaffScheduleOption {
  id: number;
  avatarUrl?: string | null;
  cinemaId?: number | string | null;
  cinemaName?: string | null;
  fullName: string;
  position?: string | null;
  roleName?: string | null;
}

const fieldClass =
  "h-11 w-full rounded-none border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-700 outline-none transition focus:border-red-600 focus:ring-0";

function toStaffOption(item: IStaff, cinemas: ICinema[]): StaffScheduleOption {
  const cinemaId = normalizeNumber(item.cinemaId);
  const cinemaName =
    cinemas.find((cinema) => Number(cinema.id) === Number(cinemaId))?.name ?? "";

  return {
    id: Number(item.id),
    avatarUrl: item.avatarUrl ?? null,
    cinemaId,
    cinemaName,
    fullName: item.fullName,
    position: item.position ?? null,
  };
}

function toStaffOptionFromSchedule(
  item: IStaffScheduleItem,
  existing: StaffScheduleOption | undefined,
) {
  return {
    id: item.staff.id,
    avatarUrl: item.staff.avatarUrl ?? item.staff.avatar ?? existing?.avatarUrl ?? null,
    cinemaId: item.staff.cinemaId ?? existing?.cinemaId ?? null,
    cinemaName: existing?.cinemaName ?? null,
    fullName: item.staff.fullName,
    position: item.staff.position ?? existing?.position ?? item.staff.roleName ?? null,
    roleName: item.staff.roleName ?? existing?.roleName ?? null,
  };
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
    <div className="space-y-2">
      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        Tuần
      </div>
      <div className="text-sm font-bold text-slate-900">{weekLabel}</div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-none border border-red-600 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Trước
        </button>
        <button
          type="button"
          onClick={onCurrent}
          className="rounded-none border border-red-700 bg-red-700 px-3 py-2 text-sm font-black text-white hover:bg-red-800"
        >
          Nay
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-none border border-red-600 bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

function PageHeader({
  title,
  role,
  weekLabel,
  currentModeRoute,
}: {
  title: string;
  role: string;
  weekLabel: string;
  currentModeRoute: string;
}) {
  return (
    <section className="overflow-hidden rounded-none border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 px-6 py-6 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-[32px] font-black tracking-[-0.04em] text-slate-900">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-none border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700">
            {role}
          </div>
          <div className="rounded-none border border-red-600 bg-red-600 px-4 py-2 text-xs font-semibold text-white">
            {weekLabel}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/staff-schedules"
            className={`inline-flex items-center gap-2 rounded-none border px-4 py-2.5 text-sm font-bold ${
              currentModeRoute === "/admin/staff-schedules"
                ? "border-red-600 bg-red-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            <ViewWeek fontSize="small" />
            Lịch làm nhân viên
          </Link>
          <Link
            href="/admin/staff-schedules/assign"
            className={`inline-flex items-center gap-2 rounded-none border px-4 py-2.5 text-sm font-bold ${
              currentModeRoute === "/admin/staff-schedules/assign"
                ? "border-red-600 bg-red-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            <ChecklistRtl fontSize="small" />
            Phân ca nhân viên
          </Link>
        </div>
      </div>
    </section>
  );
}

type ScheduleToastVariant = "success" | "warning" | "error";

function showScheduleToast(
  variant: ScheduleToastVariant,
  title: string,
  description: string,
) {
  const styles =
    variant === "success"
      ? {
          border: "border-emerald-100",
          iconWrap: "border-emerald-200 bg-emerald-50 text-emerald-600",
          icon: <CheckCircleOutlineRounded sx={{ fontSize: 18 }} />,
        }
      : variant === "warning"
        ? {
            border: "border-amber-100",
            iconWrap: "border-amber-200 bg-amber-50 text-amber-600",
            icon: <WarningAmberRounded sx={{ fontSize: 18 }} />,
          }
        : {
            border: "border-rose-100",
            iconWrap: "border-rose-200 bg-rose-50 text-rose-600",
            icon: <InfoOutlined sx={{ fontSize: 18 }} />,
          };

  toast(
    <div className="flex items-start gap-3 bg-white px-4 py-4">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${styles.iconWrap}`}
      >
        {styles.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-5 text-slate-600">{description}</div>
      </div>
    </div>,
    {
      icon: false,
      closeButton: false,
      className: `!min-h-0 !overflow-hidden !border-l-4 ${styles.border} !bg-white !p-0 !shadow-[0_20px_48px_rgba(15,23,42,0.14)]`,
      bodyClassName: "!p-0",
      autoClose: 4200,
    },
  );
}

export default function StaffScheduleManagement({
  mode = "overview",
}: {
  mode?: StaffScheduleScreenMode;
}) {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const role = String(user?.role || "").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isAssignMode = mode === "assign";

  const [weekOffset, setWeekOffset] = useState(() => (isAssignMode ? 1 : 0));
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "">("");
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const deferredKeyword = useDeferredValue(searchKeyword.trim().toLowerCase());

  const [selectedSchedule, setSelectedSchedule] =
    useState<IStaffScheduleItem | null>(null);
  const [openCreateShiftDialog, setOpenCreateShiftDialog] = useState(false);
  const [form, setForm] = useState<ScheduleFormData>({
    staffId: null,
    shiftId: 0,
    workDate: "",
    status: ScheduleStatus.CONFIRMED,
  });

  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const weekLabel = formatWeekRange(weekDays);
  const startDate = weekDays[0]?.iso ?? "";
  const endDate = weekDays[6]?.iso ?? "";

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && (isAdmin || isManager),
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const defaultAdminCinemaId = useMemo(
    () => (isAdmin ? normalizeNumber(cinemas[0]?.id) : null),
    [cinemas, isAdmin],
  );

  const effectiveCinemaId = isManager
    ? normalizeNumber(user?.cinemaId)
    : selectedCinemaId ?? defaultAdminCinemaId;

  const selectedCinemaName = useMemo(() => {
    if (!effectiveCinemaId) return "Chưa chọn chi nhánh";
    return (
      cinemas.find((cinema) => Number(cinema.id) === Number(effectiveCinemaId))
        ?.name ?? `Chi nhánh #${effectiveCinemaId}`
    );
  }, [cinemas, effectiveCinemaId]);

  const qShifts = useQuery({
    ...Schedule.getShiftTemplates(),
    enabled: isAdmin || isManager,
  });

  const qStaffs = useQuery({
    ...User.getStaffs({
      page: 1,
      perPage: 300,
      cinemaId: effectiveCinemaId ?? undefined,
    }),
    enabled:
      Boolean(user) &&
      (isManager || (isAdmin && Boolean(effectiveCinemaId))),
  });

  const qSchedules = useQuery({
    ...Schedule.getCinemaSchedule({
      startDate,
      endDate,
      status: statusFilter || null,
      staffId: selectedStaffId,
      cinemaId: effectiveCinemaId,
    }),
    enabled:
      Boolean(user) &&
      (isManager || (isAdmin && Boolean(effectiveCinemaId))),
  });

  const shifts = useMemo(
    () => (Array.isArray(qShifts.data?.data) ? qShifts.data.data : []),
    [qShifts.data],
  );
  const schedules = useMemo(
    () => (Array.isArray(qSchedules.data?.data) ? qSchedules.data.data : []),
    [qSchedules.data],
  );
  const staffFromApi: IStaff[] = useMemo(
    () => (Array.isArray(qStaffs.data?.data) ? qStaffs.data.data.flat() : []),
    [qStaffs.data],
  );

  const baseStaffOptions = useMemo(() => {
    const mapped = staffFromApi.map((item) => toStaffOption(item, cinemas));
    return sortByName(mapped);
  }, [cinemas, staffFromApi]);

  const staffOptions = useMemo(() => {
    const map = new Map<number, StaffScheduleOption>();

    baseStaffOptions.forEach((item) => {
      map.set(item.id, item);
    });

    schedules.forEach((item) => {
      const existing = map.get(item.staff.id);
      map.set(item.staff.id, toStaffOptionFromSchedule(item, existing));
    });

    return sortByName([...map.values()]);
  }, [baseStaffOptions, schedules]);

  const effectiveSelectedStaffId = useMemo(() => {
    if (!selectedStaffId) return null;
    return staffOptions.some((item) => Number(item.id) === Number(selectedStaffId))
      ? selectedStaffId
      : null;
  }, [selectedStaffId, staffOptions]);

  const filteredRows = useMemo(() => {
    let rows = [...staffOptions];

    if (effectiveSelectedStaffId) {
      rows = rows.filter(
        (item) => Number(item.id) === Number(effectiveSelectedStaffId),
      );
    }

    if (deferredKeyword) {
      rows = rows.filter((item) => {
        const haystack = [
          item.fullName,
          item.position,
          item.roleName,
          item.cinemaName,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(deferredKeyword);
      });
    }

    return rows;
  }, [deferredKeyword, effectiveSelectedStaffId, staffOptions]);

  const schedulesByCell = useMemo(
    () => groupSchedulesByCell(schedules),
    [schedules],
  );

  const getProjectedLoadWarning = (
    staffId: number | null | undefined,
    workDate: string,
    shiftId: number,
    replaceScheduleId?: number | null,
  ) => {
    const normalizedStaffId = Number(staffId || 0);
    const normalizedShiftId = Number(shiftId || 0);
    if (!normalizedStaffId || !workDate || !normalizedShiftId) {
      return null;
    }

    const nextShift =
      shifts.find((item) => Number(item.id) === normalizedShiftId) ?? null;
    if (!nextShift) {
      return null;
    }

    const cellItems =
      schedulesByCell.get(`${normalizedStaffId}__${workDate}`) ?? [];
    const baseItems = replaceScheduleId
      ? cellItems.filter((item) => Number(item.id) !== Number(replaceScheduleId))
      : cellItems;

    const alreadyHasSameShift = baseItems.some(
      (item) =>
        item.status !== ScheduleStatus.CANCELLED &&
        Number(item.shift.id) === normalizedShiftId,
    );

    const summary = alreadyHasSameShift
      ? summarizeCellLoad(baseItems)
      : buildProjectedCellLoadSummary(baseItems, nextShift);

    if (!summary.exceedsHourLimit && !summary.exceedsShiftLimit) {
      return null;
    }

    const messages: string[] = [];
    if (summary.exceedsShiftLimit) {
      messages.push(
        `Nhân viên này sẽ có ${summary.activeCount} ca trong ngày, vượt ngưỡng ${STAFF_SCHEDULE_MAX_ACTIVE_SHIFTS_PER_DAY} ca/ngày.`,
      );
    }
    if (summary.exceedsHourLimit) {
      messages.push(
        `Tổng thời lượng dự kiến ${summary.activeHours.toFixed(1)}h, vượt ngưỡng ${STAFF_SCHEDULE_MAX_ACTIVE_HOURS_PER_DAY}h/ngày.`,
      );
    }

    return messages.join(" ");
  };

  const boardEmptyState = useMemo(() => {
    if (isAdmin && !effectiveCinemaId) {
      return { title: "Chưa chọn chi nhánh", description: "" };
    }

    if (qStaffs.isError) {
      return { title: "Không tải được nhân viên", description: "" };
    }

    if (!staffOptions.length) {
      return { title: "Không có nhân viên", description: "" };
    }

    return { title: "Không có dữ liệu", description: "" };
  }, [effectiveCinemaId, isAdmin, qStaffs.isError, staffOptions.length]);

  const upsertMutation = useMutation({
    mutationFn: (payload: ScheduleFormData) =>
      Schedule.upsert(payload).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Phân ca thành công",
        response.message || "Lịch làm đã được cập nhật vào hệ thống.",
      );
      setSelectedSchedule(null);
      setForm({
        staffId: effectiveSelectedStaffId ?? null,
        shiftId: Number(shifts[0]?.id || 0),
        workDate: "",
        status: ScheduleStatus.CONFIRMED,
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể lưu phân ca", getErrorMessage(error));
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: (payload: CreateWorkShiftPayload) =>
      WorkShift.create(payload).then((response) => response.data),
    onSuccess: (response) => {
      showScheduleToast(
        "success",
        "Tạo ca mẫu thành công",
        response.message || "Ca mẫu mới đã sẵn sàng để sử dụng khi phân công.",
      );
      setOpenCreateShiftDialog(false);
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.shifts],
      });
    },
    onError: (error) => {
      showScheduleToast("error", "Không thể tạo ca mẫu", getErrorMessage(error));
    },
  });

  const patchForm = (patch: Partial<ScheduleFormData>) => {
    const shouldResetSelection =
      Object.prototype.hasOwnProperty.call(patch, "staffId") ||
      Object.prototype.hasOwnProperty.call(patch, "shiftId") ||
      Object.prototype.hasOwnProperty.call(patch, "workDate");

    if (shouldResetSelection) {
      setSelectedSchedule(null);
    }

    setForm((prev) => ({
      ...prev,
      ...patch,
      ...(shouldResetSelection && prev.status === ScheduleStatus.CANCELLED
        ? { status: ScheduleStatus.CONFIRMED }
        : {}),
    }));
  };

  const openAssignSelection = (
    staff: StaffScheduleOption,
    workDate: string,
    schedule?: IStaffScheduleItem | null,
  ) => {
    setSelectedSchedule(schedule ?? null);
    setForm({
      staffId: staff.id,
      shiftId: Number(schedule?.shift?.id || shifts[0]?.id || 0),
      workDate,
      status:
        schedule?.status === ScheduleStatus.CANCELLED
          ? ScheduleStatus.CANCELLED
          : ScheduleStatus.CONFIRMED,
    });
  };

  const clearAssignSelection = () => {
    const today = toIsoDate(new Date());
    const preferredDay =
      weekDays.find((item) => item.iso >= today)?.iso ?? weekDays[0]?.iso ?? "";

    setSelectedSchedule(null);
    setForm({
      staffId: effectiveSelectedStaffId ?? null,
      shiftId: Number(shifts[0]?.id || 0),
      workDate: preferredDay,
      status: ScheduleStatus.CONFIRMED,
    });
  };

  const handleSubmit = () => {
    if (form.status !== ScheduleStatus.CANCELLED) {
      const warning = getProjectedLoadWarning(
        form.staffId,
        form.workDate,
        form.shiftId,
        selectedSchedule?.id ?? null,
      );

      if (warning) {
        showScheduleToast("warning", "Cảnh báo tải ca", warning);
      }
    }

    upsertMutation.mutate(form);
  };

  const handleQuickAssign = (
    staff: StaffScheduleOption,
    workDate: string,
    shiftId: number,
  ) => {
    const warning = getProjectedLoadWarning(staff.id, workDate, shiftId, null);
    if (warning) {
      showScheduleToast("warning", "Cảnh báo tải ca", warning);
    }

    setSelectedSchedule(null);
    setForm({
      staffId: staff.id,
      shiftId,
      workDate,
      status: ScheduleStatus.CONFIRMED,
    });

    upsertMutation.mutate({
      staffId: staff.id,
      shiftId,
      workDate,
      status: ScheduleStatus.CONFIRMED,
    });
  };

  const resetFilters = () => {
    setSelectedStaffId(null);
    setStatusFilter("");
    setSearchKeyword("");
  };

  const currentLoadWarning =
    form.status === ScheduleStatus.CANCELLED ||
    !form.staffId ||
    !form.workDate ||
    !form.shiftId
      ? null
      : getProjectedLoadWarning(
          form.staffId,
          form.workDate,
          form.shiftId,
          selectedSchedule?.id ?? null,
        );

  const currentModeRoute = isAssignMode
    ? "/admin/staff-schedules/assign"
    : "/admin/staff-schedules";

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải...
      </div>
    );
  }

  if (!isAdmin && !isManager) {
    return (
      <div
        className={`${staffScheduleRoboto.className} rounded-none border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800`}
      >
        Không có quyền truy cập.
      </div>
    );
  }

  const errorMessage = qSchedules.isError
    ? getErrorMessage((qSchedules as any).error)
    : qStaffs.isError
      ? getErrorMessage((qStaffs as any).error)
      : qCinemas.isError
        ? getErrorMessage((qCinemas as any).error)
        : "";

  const filters = (
    <section className={`${staffScheduleSurface} p-5`}>
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_220px_220px_280px]">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            <Storefront sx={{ fontSize: 14 }} />
            Chi nhánh
          </div>
          {isAdmin ? (
            <select
              value={effectiveCinemaId ?? ""}
              onChange={(event) => {
                setSelectedCinemaId(Number(event.target.value) || null);
                setSelectedStaffId(null);
                setSearchKeyword("");
              }}
              className={fieldClass}
            >
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-11 items-center border border-slate-300 px-3.5 text-sm font-semibold text-slate-700">
              {selectedCinemaName}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Tìm kiếm
          </label>
          <input
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder="Tìm nhân viên"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Nhân viên
          </label>
          <select
            value={effectiveSelectedStaffId ?? 0}
            onChange={(event) =>
              setSelectedStaffId(Number(event.target.value) || null)
            }
            className={fieldClass}
          >
            <option value={0}>Tất cả</option>
            {staffOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter((event.target.value as ScheduleStatus | "") || "")
            }
            className={fieldClass}
          >
            <option value="">Tất cả</option>
            <option value={ScheduleStatus.ASSIGNED}>Chờ duyệt</option>
            <option value={ScheduleStatus.CONFIRMED}>Đã chốt</option>
            <option value={ScheduleStatus.CANCELLED}>Đã huỷ</option>
          </select>
        </div>

        <WeekSwitcher
          weekLabel={weekLabel}
          onPrev={() => setWeekOffset((prev) => prev - 1)}
          onCurrent={() => setWeekOffset(0)}
          onNext={() => setWeekOffset((prev) => prev + 1)}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={resetFilters}
          className="h-11 rounded-none border border-red-600 bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
        >
          Xoá lọc
        </button>
      </div>
    </section>
  );

  if (isAssignMode) {
    return (
      <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
        <PageHeader
          title="Phân ca nhân viên"
          role={role}
          weekLabel={weekLabel}
          currentModeRoute={currentModeRoute}
        />

        {filters}

        {errorMessage ? (
          <div className={`${staffScheduleSurface} px-5 py-4 text-sm text-rose-700`}>
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className={`${staffScheduleSurface} px-5 py-4`}>
              <div className="text-lg font-black text-slate-900">
                {selectedCinemaName}
              </div>
            </div>

            <StaffScheduleAssignBoard
              weekDays={weekDays}
              rows={filteredRows}
              schedules={schedules}
              schedulesByCell={schedulesByCell}
              shifts={shifts}
              cinemas={cinemas}
              emptyTitle={boardEmptyState.title}
              emptyDescription=""
              onOpenCell={openAssignSelection}
              onQuickAssign={handleQuickAssign}
              onOpenCreateShift={() => setOpenCreateShiftDialog(true)}
              quickAssignPending={upsertMutation.isPending}
            />
          </div>

          <AssignStaffPanel
            form={form}
            onChange={patchForm}
            onSubmit={handleSubmit}
            onReset={clearAssignSelection}
            shifts={shifts}
            staffOptions={staffOptions}
            selectedSchedule={selectedSchedule}
            submitting={upsertMutation.isPending}
            warningMessage={currentLoadWarning}
          />
        </div>

        <CreateWorkShiftDialog
          open={openCreateShiftDialog}
          onClose={() => setOpenCreateShiftDialog(false)}
          onSubmit={(payload) => createShiftMutation.mutate(payload)}
          submitting={createShiftMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
      <PageHeader
        title="Lịch làm nhân viên"
        role={role}
        weekLabel={weekLabel}
        currentModeRoute={currentModeRoute}
      />

      {filters}

      {errorMessage ? (
        <div className={`${staffScheduleSurface} px-5 py-4 text-sm text-rose-700`}>
          {errorMessage}
        </div>
      ) : null}

      <div className={`${staffScheduleSurface} px-5 py-4`}>
        <div className="text-lg font-black text-slate-900">{selectedCinemaName}</div>
      </div>

      <StaffScheduleThisWeek
        weekDays={weekDays}
        rows={filteredRows}
        schedules={schedules}
        schedulesByCell={schedulesByCell}
        cinemas={cinemas}
        emptyTitle={boardEmptyState.title}
        emptyDescription=""
        interactive={false}
        hideCancelledCards
        onOpenCell={() => undefined}
      />
    </div>
  );
}
