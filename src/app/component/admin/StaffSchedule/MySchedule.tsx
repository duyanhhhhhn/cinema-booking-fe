"use client"

import ISchedule, { Schedule, ScheduleStatus } from "@/types/data/staff/schedule/schedule"
import { IWorkShift } from "@/types/data/staff/workshift"
import { useQuery } from "@tanstack/react-query"

export default function MySchedule() {
    const my = useQuery<ISchedule[]>(Schedule.getMySchedule(7, 0))
    const data = my?.data?.[0].shift ?? [] as IWorkShift[]
    const getDays = (date) => {
        const today = new Date(date);
        const result = today.toLocaleDateString("vi-VN", { weekday: "long" });
        return result;
    };
    const getTotal = () => {
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].id != 0) {
                total++
            }
        }
        return total;
    }
    console.log(data)
    return (
        <main className="max-w-5xl mx-auto w-full space-y-8">
            {/* BEGIN: HeaderSection */}
            <header
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                data-purpose="page-header"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold border-l-4 pl-4">
                        Lịch làm việc của tôi
                    </h1>
                    <p className="text-gray-400 text-sm mt-1 pl-4">
                        Vai trò: Nhân viên (Staff)
                    </p>
                </div>
                {/* Week Navigation */}
                <nav
                    className="flex items-center gap-4 bg-cinema-card p-2 rounded-lg border border-gray-700"
                    data-purpose="week-navigation"
                >
                    <button
                        aria-label="Tuần trước"
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 19l-7-7 7-7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </button>
                    <span className="font-semibold text-sm md:text-base min-w-[120px] text-center">
                        Tuần này
                    </span>
                    <button
                        aria-label="Tuần sau"
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9 5l7 7-7 7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </button>
                </nav>
            </header>
            <section
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                data-purpose="schedule-summary"
            >
                <div className="bg-cinema-card p-5 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="bg-blue-900/30 p-3 rounded-lg text-blue-400">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Tổng ca</p>
                        <p className="text-xl font-bold">{getTotal()}</p>
                    </div>
                </div>
                {/* Total Hours */}
                <div className="bg-cinema-card p-5 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="bg-green-900/30 p-3 rounded-lg text-green-400">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Tổng giờ làm</p>
                        <p className="text-xl font-bold">35h</p>
                    </div>
                </div>
                {/* Reminders */}
                <div className="bg-cinema-card p-5 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="bg-cinema-accent/20 p-3 rounded-lg text-cinema-accent">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Nhắc nhở</p>
                        <p className="text-xl font-bold">2</p>
                    </div>
                </div>
            </section>
            <section className="space-y-4" data-purpose="daily-schedule-list">
                {data.map((item: IWorkShift) => (
                    <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                        <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                            <span className="text-sm text-gray-400 uppercase tracking-wider">
                                {item.WorkDate}
                            </span>
                            <span className="text-xl text-white font-bold">{getDays(item.WorkDate)}</span>
                        </div>
                        <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                            {/* Shift Card 1 */}
                            <div
                                className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-green min-w-[200px] flex-1"
                                data-purpose="shift-card"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-green">{item.name}</h3>
                                    {item.status != ScheduleStatus.ASSIGNED ?
                                        <span className="text-[10px] px-2 py-0.5 rounded-full text-yellow-600 border border-shift-green/20 font-medium">
                                            Chưa chốt
                                        </span>
                                        : <span className="text-[10px] px-2 py-0.5 rounded-full text-green-600 border border-shift-green/20 font-medium">
                                            Đã chốt
                                        </span>}
                                </div>
                                <p className="text-sm flex items-center gap-2 text-gray-300">
                                    <svg
                                        className="h-4 w-4 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                        />
                                    </svg>
                                    {item.id != 0 ? <p>{item.startTime} - {item.endTime}</p> :
                                        <p>Không có lịch vào hôm nay</p>}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </section>
            <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
                <p>* Vui lòng phản hồi ca làm việc "Chờ xác nhận" trước 24h.</p>
            </footer>
        </main>
    )
}