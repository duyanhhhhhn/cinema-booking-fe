import { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { useMutation } from "@tanstack/react-query";

import type { IStaffShiftTemplate } from "../workshift";

export const ScheduleStatus = {
  ASSIGNED: "ASSIGNED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type ScheduleStatus =
  (typeof ScheduleStatus)[keyof typeof ScheduleStatus];

export interface IStaffScheduleStaff {
  id: number;
  avatar?: string | null;
  avatarUrl?: string | null;
  cinemaId?: number | string | null;
  fullName: string;
  phone?: string | null;
  position?: string | null;
  roleName?: string | null;
}

export interface IStaffScheduleItem {
  id: number;
  workDate: string;
  status: ScheduleStatus;
  staff: IStaffScheduleStaff;
  shift: IStaffShiftTemplate;
}

export interface ScheduleFormData {
  staffId?: number | null;
  shiftId: number;
  workDate: string;
  status?: ScheduleStatus | null;
}

export interface ScheduleQueryFilters {
  startDate?: string | null;
  endDate?: string | null;
  status?: ScheduleStatus | "" | null;
  staffId?: number | null;
  cinemaId?: number | null;
}

export const initialScheduleData: ScheduleFormData = {
  staffId: null,
  shiftId: 0,
  workDate: "",
  status: ScheduleStatus.CONFIRMED,
};

const modelConfig = {
  path: "/staff",
};

function toQueryParams(filters: ScheduleQueryFilters = {}) {
  return {
    ...(filters.startDate ? { startDate: filters.startDate } : {}),
    ...(filters.endDate ? { endDate: filters.endDate } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.staffId ? { staffId: filters.staffId } : {}),
    ...(filters.cinemaId ? { cinemaId: filters.cinemaId } : {}),
  };
}

function normalizePayload(payload: ScheduleFormData) {
  return {
    ...(payload.staffId ? { staffId: Number(payload.staffId) } : {}),
    shiftId: Number(payload.shiftId),
    workDate: payload.workDate,
    ...(payload.status ? { status: payload.status } : {}),
  };
}

export default interface ISchedule extends IStaffScheduleItem {}

export class Schedule extends Model {
  static queryKeys = {
    shifts: "STAFF_SCHEDULE_SHIFTS_QUERY",
    mySchedule: "STAFF_SCHEDULE_MY_QUERY",
    cinemaSchedule: "STAFF_SCHEDULE_CINEMA_QUERY",
    upsert: "STAFF_SCHEDULE_UPSERT_MUTATION",
  };

  static getShiftTemplates() {
    return {
      queryKey: [this.queryKeys.shifts],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffShiftTemplate[]>>({
            url: "/staff/shifts",
          })
          .then((res) => res.data),
    };
  }

  static getAllShift() {
    return this.getShiftTemplates();
  }

  static getMySchedule(filters: ScheduleQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.mySchedule,
        filters.startDate ?? null,
        filters.endDate ?? null,
        filters.status ?? null,
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffScheduleItem[]>>({
            url: "/staff/schedule/my",
            params: toQueryParams(filters),
          })
          .then((res) => res.data),
    };
  }

  static getCinemaSchedule(filters: ScheduleQueryFilters = {}) {
    return {
      queryKey: [
        this.queryKeys.cinemaSchedule,
        filters.startDate ?? null,
        filters.endDate ?? null,
        filters.status ?? null,
        filters.staffId ?? null,
        filters.cinemaId ?? null,
      ],
      queryFn: () =>
        this.api
          .get<IResponse<IStaffScheduleItem[]>>({
            url: "/staff/schedule/cinema",
            params: toQueryParams(filters),
          })
          .then((res) => res.data),
    };
  }

  static upsert(payload: ScheduleFormData) {
    return this.api.post<IResponse<IStaffScheduleItem>>({
      url: "/staff/schedule",
      data: normalizePayload(payload),
    });
  }
}

Schedule.setup(modelConfig);

export function useUpsertScheduleMutation() {
  return useMutation<IResponse<IStaffScheduleItem>, IHttpError, ScheduleFormData>({
    mutationFn: (payload: ScheduleFormData) => {
      return Schedule.upsert(payload).then((res) => res.data);
    },
  });
}

export function useCreateScheduleMutation() {
  return useUpsertScheduleMutation();
}
