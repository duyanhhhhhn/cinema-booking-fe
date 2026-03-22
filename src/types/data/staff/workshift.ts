import { ScheduleStatus } from "./schedule/schedule"

export default interface IWorkShiftSmall {
    id: number,
    name: String,
    startTime: String,
    endTime: String,
    status: ScheduleStatus
}

export interface IWorkShift extends IWorkShiftSmall {
    WorkDate: String,
}
