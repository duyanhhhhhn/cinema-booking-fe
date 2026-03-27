
export default interface IWorkShiftSmall {
    id: number,
    name: String,
    startTime: String,
    endTime: String,
}

export interface IWorkShift extends IWorkShiftSmall {
    WorkDate: String
}
