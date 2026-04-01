"use client"

import { Schedule } from "@/types/data/staff/schedule/schedule";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react"
import StaffScheduleThisWeek from "./StaffSchedule/StaffScheduleThisWeek";
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import AssignStaffModal from "./StaffSchedule/AssignStaffModal";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export default function () {
    const [openAddScheduleModal, setAddScheduleModal] = useState(false);
    const year = new Date().getFullYear();
    const getWeekDays = (week) => {
        const today = new Date();

        // 👇 fix tại đây
        today.setDate(today.getDate() + 7 * (week - 1));

        const day = today.getDay();

        // tính Monday
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);

        const result = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            result.push({
                date: d,
                dayName: d.toLocaleDateString("vi-VN", { weekday: "long" }),
                fullDate: d.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                }).replace("-", "/"),
            });
        }

        return result;
    };

    const [week, setWeek] = useState(1);
    const weekDays = useMemo(() => getWeekDays(week), [week]);
    const { data, refetch: refetchSchedule } = useQuery(Schedule.getThisWeekSchedules(week));
    let schedule = data;
    const next = () => setWeek(prev => prev + 1);
    const back = () => setWeek(prev => prev - 1);
    return (
        <div>
            <div className="flex-1 flex flex-col min-w-0">
                <header className="border-b border-slate-700 bg-cinema-dark p-6 sticky top-0 z-30">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <i className="text-cinema-red" data-lucide="calendar-range" />
                                Quản lý Phân Ca Làm Việc
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Điều hành và tối ưu hóa nguồn lực nhân sự tại các chi nhánh
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Navigation */}
                            <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                                <button onClick={back} className="px-4 py-2 text-xs text-white font-bold uppercase tracking-wider hover:bg-slate-700 rounded-lg transition">
                                    <NavigateBeforeIcon />
                                </button>
                                <span className="font-bold text-white px-3 text-sm">
                                    Tuần: {weekDays[0].fullDate} - {weekDays[6].fullDate}/{year}
                                </span>
                                <div className="h-6 w-px bg-slate-700 mx-1" />
                                <button onClick={next} className="px-4 py-2 text-xs text-white font-bold uppercase tracking-wider hover:bg-slate-700 rounded-lg transition">
                                    <NavigateNextIcon />
                                </button>
                            </div>
                            <button onClick={() => setAddScheduleModal(true)}
                                className="bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-cinema-red/30 flex items-center gap-2"
                                data-purpose="manual-schedule-btn"
                            >
                                <AddIcon className="w-4 h-4" />
                                Thêm ca làm
                            </button>
                        </div>
                    </div>
                    {/* Filters Row */}
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        <div className="relative group">
                        </div>
                        <div className="ml-auto flex items-center gap-4 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1.5">
                                <CircleIcon className="w-2.5 h-2.5 text-yellow-500" fontSize="small" /> Chờ xác
                                nhận
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CircleIcon className="w-2.5 h-2.5 text-green-500" fontSize="small" /> Đã
                                chốt
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-6">
                    <div className="schedule-grid bg-slate-800/80 sticky top-0 z-20">
                    </div>
                    <div className="divide-y divide-slate-700">
                    </div>
                </main>
            </div>
            <StaffScheduleThisWeek schedule={schedule} refetchSchedule={refetchSchedule} />
            <AssignStaffModal open={openAddScheduleModal} onClose={() => setAddScheduleModal(false)}
                refetchSchedule={refetchSchedule} />
        </div>
    )
}