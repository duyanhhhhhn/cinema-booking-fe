"use client"

import ISchedule, { ScheduleStatus } from "@/types/data/staff/schedule/schedule";
import { Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

interface StaffScheduleTableProps {
    schedule: ISchedule[],
    refetchSchedule: () => void
}

export default function StaffScheduleThisWeek({ schedule, refetchSchedule }: StaffScheduleTableProps) {
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
    if (!schedule) {
        return <div className="p-6 text-center text-slate-400">Không có lịch làm việc nào trong tuần này.</div>;
    }
    return <>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow className="bg-gray-500">
                        <TableCell className="p-5 font-bold bg-gray-500 text-xs tracking-widest border-r border-slate-700 flex items-center">
                            <span className="text-white">Nhân viên</span>
                        </TableCell>
                        {weekDays.map((day, index) => (
                            <TableCell key={"week" + index} className="p-4 text-center bg-gray-500 border-r border-slate-700">
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
                                        {item.staff.roleName}
                                    </span>
                                </div>
                            </TableCell>
                            {item.shift.map((shift) => (
                                shift.id != 0 ? (
                                    <TableCell className="p-2 border-r border-slate-700 min-h-[120px] relative empty-cell-hover cursor-pointer">
                                        {shift.status === ScheduleStatus.ASSIGNED ? (
                                            <div className="shift-card bg-yellow-500/25 border border-yellow-500 border-l-4 border-l-cinema-success p-2.5 rounded-lg mb-2 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-bold text-yellow-500 uppercase">
                                                        {shift.name}
                                                    </p>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cinema-success shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                                </div>
                                                <p className="text-[10px] text-yellow-500 font-medium">
                                                    {shift.startTime} - {shift.endTime}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="shift-card bg-green-500/25 border border-green-500 border-l-4 border-l-cinema-success p-2.5 rounded-lg mb-2 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-bold text-green-500 uppercase">
                                                        {shift.name}
                                                    </p>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cinema-success shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                                </div>
                                                <p className="text-[10px] text-green-500 font-medium">
                                                    {shift.startTime} - {shift.endTime}
                                                </p>
                                            </div>
                                        )}
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