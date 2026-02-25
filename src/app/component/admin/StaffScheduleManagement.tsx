"use client"

import { Schedule } from "@/types/data/staff/schedule";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react"

export default function () {
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
        <>
        </>
    )
}