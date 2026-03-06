"use client"

import { Schedule } from "@/types/data/staff/schedule/schedule";
import { Add, Search } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react"
import StaffScheduleTable from "./StaffSchedule/StaffScheduleTable";

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
            <div className=" flex flex-col gap-6">
                <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900">
                            Staff Schedule Management
                        </h1>
                        <p className="text-zinc-600 text-base font-normal">
                            Add, Edit , Delete everything on the System.
                        </p>
                    </div>
                </div>
                {/* --- Toolbar & Filters (Giữ nguyên Tailwind cho layout linh hoạt) --- */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 max-w-lg">
                            <label className="flex flex-col min-w-40 h-12 w-full">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                                    <div className="text-zinc-500 flex bg-white items-center justify-center pl-4 rounded-l-lg border border-zinc-300 border-r-0">
                                        <Search fontSize="small" />
                                    </div>
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ec131e] border border-zinc-300 border-l-0 bg-white h-full placeholder:text-zinc-500 px-4 pl-2 text-base font-normal"
                                        placeholder="Search Voucher By Title..."
                                    //onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={() => setopenVoucherModal(true)}
                            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm"
                        >
                            <Add fontSize="small" />
                            <span className="truncate">Add New Schedule</span>
                        </button>
                    </div>
                </div>
            </div>
            <StaffScheduleTable schedule={schedule} refetchSchedule={refetchSchedule} />
        </div>
    )
}