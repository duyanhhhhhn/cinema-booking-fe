"use client"

import { Schedule } from "@/types/data/staff/schedule/schedule";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react"
import StaffScheduleThisWeek from "./StaffSchedule/StaffScheduleThisWeek";
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import AssignStaffModal from "./StaffSchedule/AssignStaffModal";

export default function () {
    const [openAddScheduleModal, setAddScheduleModal] = useState(false);
    const year = new Date().getFullYear();
    const getWeekDays = () => {
        const today = new Date();
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
                dayName: d.toLocaleDateString("vi-VN", { weekday: "long" }), // T2, T3...
                fullDate: d.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                }).replace("-", "/"),
            });
        }

        return result;
    };
    const weekDays = getWeekDays();
    const { data, refetch: refetchSchedule } = useQuery(Schedule.getThisWeekSchedules());
    const schedule = data;
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
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
                                    <i className="w-5 h-5" data-lucide="chevron-left" />
                                </button>
                                <span className="font-bold text-white px-3 text-sm">
                                    Tuần: {weekDays[0].fullDate} - {weekDays[6].fullDate}/{year}
                                </span>
                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
                                    <i className="w-5 h-5" data-lucide="chevron-right" />
                                </button>
                                <div className="h-6 w-px bg-slate-700 mx-1" />
                                <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-cinema-red hover:bg-slate-700 rounded-lg transition">
                                    Hôm nay
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
                            <select className="bg-slate-800 border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-cinema-red focus:border-cinema-red block w-56 p-2.5 pl-4 appearance-none cursor-pointer">
                                <option>Tất cả chi nhánh</option>
                                <option>CGV Vincom Center</option>
                                <option>CGV Landmark 81</option>
                                <option>CGV Aeon Mall</option>
                            </select>
                            <i
                                className="w-4 h-4 absolute right-4 top-3 text-slate-500 pointer-events-none"
                                data-lucide="map-pin"
                            />
                        </div>
                        <div className="relative group">
                            <select className="bg-slate-800 border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-cinema-red focus:border-cinema-red block w-56 p-2.5 pl-4 appearance-none cursor-pointer">
                                <option>Tất cả vị trí</option>
                                <option>MANAGER</option>
                                <option>TICKET_SELLER</option>
                                <option>F&amp;B_STAFF</option>
                                <option>CLEANER</option>
                            </select>
                            <i
                                className="w-4 h-4 absolute right-4 top-3 text-slate-500 pointer-events-none"
                                data-lucide="briefcase"
                            />
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
                <main className="p-6 overflow-x-auto">
                    <div
                        className="bg-cinema-dark rounded-2xl border border-slate-700 overflow-hidden shadow-2xl min-w-[1200px]"
                        data-purpose="scheduling-matrix"
                    >
                        <div className="schedule-grid bg-slate-800/80 border-b border-slate-700 sticky top-0 z-20">
                        </div>
                        <div className="divide-y divide-slate-700">
                        </div>
                    </div>
                </main>
            </div>
            <StaffScheduleThisWeek schedule={schedule} refetchSchedule={refetchSchedule} />
            <AssignStaffModal open={openAddScheduleModal} onClose={() => setAddScheduleModal(false)}
                refetchSchedule={refetchSchedule} />
        </div>
    )
}