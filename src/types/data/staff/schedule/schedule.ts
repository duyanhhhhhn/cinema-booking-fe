import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";
import IWorkShift from "../workshift";
import { IUser } from "../../user";

export enum ScheduleStatus {
    ASSIGNED = "ASSIGNED",
    UNASSIGNED = "UNASSIGNED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export interface IStaffSchedule extends IUser {
    roleName: string;
}

export default interface ISchedule {
    id: number;
    staff_id: number;
    shift_id: number;
    workdate: string;
    shift: IWorkShift[];
    staff: IStaffSchedule;
    status: ScheduleStatus;
}

export interface ScheduleFormData {
    staff_id: number;
    shift_id: number;
    workdate: string;
    status: ScheduleStatus;
}
export const initialScheduleData: ScheduleFormData = {
    staff_id: 0,
    shift_id: 0,
    workdate: "",
    status: ScheduleStatus.UNASSIGNED,
}
const modelConfig = {
    path: '/staff/schedules',
    modal: 'ScheduleList'
}
export class Schedule extends Model {
    static queryKeys = {
        paginate: 'SCHEDULES_PAGINATE_QUERY',
        findOne: 'SCHEDULES_FIND_ONE_QUERY',
        getThisWeek: 'SCHEDULES_GET_THIS_WEEK_QUERY'
    }
    static objects = ObjectsFactory.factory<ISchedule>(modelConfig, this.queryKeys)
    static getSchedules(page: number, pageSize: number) {
        return {
            queryKey: [this.queryKeys.paginate, page, pageSize],
            queryFn: () => {
                return this.api
                    .get<IPaginateResponse<ISchedule>>({
                        url: '/staff/schedules',
                        params: {
                            page: page,
                            pageSize: pageSize
                        }
                    })
                    .then((res) => res.data);
            }
        }
    }
    static getThisWeekSchedules() {
        return {
            queryKey: [this.queryKeys.getThisWeek],
            queryFn: () => {
                return this.api
                    .get<ISchedule[]>({
                        url: '/staff/schedules/week',
                    })
                    .then((res) => res.data);
            }
        }
    }
    static assign(payload: FormData) {
        return this.api.post<IResponse<ISchedule>>({
            url: '/staff/schedules',
            data: payload,
        });
    }
    static edit(id: number, payload: FormData) {
        return this.api.put<IResponse<ISchedule>>({
            url: `/staff/schedules/${id}`,
            data: payload,
        });
    }
    static delete(id: number) {
        return this.api.delete<IResponse<ISchedule>>({
            url: `/staff/schedules/${id}`
        })
    }
}
Schedule.setup();
export function useCreateScheduleMutation() {
    return useMutation<IResponse<ISchedule>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Schedule.assign(payload).then((r) => r.data);
        },
    });
}
export function useEditScheduleMutation(id: number) {
    return useMutation<IResponse<ISchedule>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Schedule.edit(id, payload).then((r) => r.data);
        },
    });
}
export function useDeleteScheduleMutation() {
    return useMutation<IResponse<ISchedule>, IHttpError, number>({
        mutationFn: (id) => {
            return Schedule.delete(id).then((r) => r.data)
        }
    })
}