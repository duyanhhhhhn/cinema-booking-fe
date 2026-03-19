"use client"

import ISchedule, { Schedule } from "@/types/data/staff/schedule/schedule";
import { Add, Search } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react"
import StaffScheduleTable from "./StaffSchedule/StaffScheduleTable";
import StaffScheduleThisWeek from "./StaffSchedule/StaffScheduleThisWeek";

export default function () {
    const [openAddVoucherModal, setopenVoucherModal] = useState(false);
    const queryParams = useMemo(() => {
        return {
            page: 1,
            size: 10
        }
    }, [])
    const { data, refetch: refetchSchedule } = useQuery(Schedule.getThisWeekSchedules());
    const schedule = data;
    console.log(schedule);
    return (
        <div>
            <StaffScheduleThisWeek schedule={schedule} refetchSchedule={refetchSchedule} />
        </div>
    )
}