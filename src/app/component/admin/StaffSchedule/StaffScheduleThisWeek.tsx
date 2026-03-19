"use client"

import ISchedule from "@/types/data/staff/schedule/schedule";
import { Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

interface StaffScheduleTableProps {
    schedule: ISchedule[],
    refetchSchedule: () => void
}

export default function StaffScheduleThisWeek({ schedule }: StaffScheduleTableProps) {
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
                }),
            });
        }

        return result;
    };
    const weekDays = getWeekDays();
    console.log(weekDays);
    if (!schedule) {
        return <div className="p-6 text-center text-slate-400">Không có lịch làm việc nào trong tuần này.</div>;
    }
    return <>
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
                                Tuần: 15/03 - 21/03/2026
                            </span>
                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
                                <i className="w-5 h-5" data-lucide="chevron-right" />
                            </button>
                            <div className="h-6 w-px bg-slate-700 mx-1" />
                            <button className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-cinema-red hover:bg-slate-700 rounded-lg transition">
                                Hôm nay
                            </button>
                        </div>
                        <button
                            className="bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg shadow-cinema-red/30 flex items-center gap-2"
                            data-purpose="manual-schedule-btn"
                        >
                            <i className="w-4 h-4" data-lucide="plus" />
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
                            <span className="w-2.5 h-2.5 rounded-full bg-cinema-gold" /> Chờ xác
                            nhận
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-cinema-success" /> Đã
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

        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow className="bg-gray-500">
                        <TableCell className="p-5 font-bold bg-gray-500 text-xs tracking-widest border-r border-slate-700 flex items-center">
                            <span className="text-white">Nhân viên</span>
                        </TableCell>
                        {weekDays.map((day, index) => (
                            <TableCell className="p-4 text-center bg-gray-500 border-r border-slate-700">
                                <span className="block text-white font-bold text-sm">{day.dayName}</span>
                                <span className="text-xs text-slate-400">{day.fullDate}</span>
                            </TableCell>
                        ))}

                    </TableRow>
                </TableHead>
                <TableBody>
                    {schedule.map((item) => (
                        <TableRow key={item.id}>

                            <TableCell className="p-5 border-r border-slate-700 flex items-center gap-3 bg-slate-800/20 group-hover:bg-slate-800/40 transition">
                                <img
                                    alt="Avatar"
                                    className="w-11 h-11 rounded-full border-2 border-slate-600 shadow-sm"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAZrGe11oVQx-LEmSUyGSwQ9fSAsINN_W21O5D1Dh2ERQbMSrL2e6OJoZUjYrCMoJEiXIamCmvLX6RGPVyRj0dAmiy29Fx8IDwaENZLmn-2ixrCLJXF1uGM9bz27LxpZphy8KtfrcH9XLek0ekqBkX7DwbH4upZMoD3GJ8Xd8JEWLKCvjE-l59ld8YQy8YLW4u6BLKojA6UHzou7grcOkMxqTemmzwdzc2p0I65CpEe-gMMB_jQufzrLN_NstJAClscH-8GGAK7rhN"
                                />
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">
                                        {item.staff.fullName}
                                    </p>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 mt-1 uppercase tracking-tight">
                                        {item.staff.position}
                                    </span>
                                </div>
                            </TableCell>
                            {item.shift.map((shift) => (
                                shift.id != 0 ? (
                                    <TableCell className="p-2 border-r border-slate-700 min-h-[120px] relative empty-cell-hover cursor-pointer">
                                        <div className="shift-card bg-cinema-success/10 border border-cinema-success/30 border-l-4 border-l-cinema-success p-2.5 rounded-lg mb-2 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-bold text-cinema-success uppercase">
                                                    {shift.name}
                                                </p>
                                                <span className="w-1.5 h-1.5 rounded-full bg-cinema-success shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                            </div>
                                            <p className="text-[10px] text-slate-300 font-medium">
                                                {shift.startTime} - {shift.endTime}
                                            </p>
                                        </div>
                                        <div className="plus-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity pointer-events-none">
                                            <i
                                                className="text-slate-500 w-5 h-5"
                                                data-lucide="plus-circle"
                                            />
                                        </div>
                                    </TableCell>
                                ) : (
                                    <TableCell className="p-2 border-r border-slate-700 relative empty-cell-hover cursor-pointer">
                                        <div className="plus-icon absolute inset-0 flex items-center justify-center opacity-0 transition-opacity pointer-events-none">
                                            <i
                                                className="text-slate-500 w-5 h-5"
                                                data-lucide="plus-circle"
                                            />
                                        </div>
                                    </TableCell>
                                )
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>

}