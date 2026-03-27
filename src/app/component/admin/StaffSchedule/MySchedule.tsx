"use client"

import { Schedule } from "@/types/data/staff/schedule/schedule"
import { useQuery } from "@tanstack/react-query"

export default function MySchedule() {
    const my = useQuery(Schedule.getMySchedule(2, 0))
    console.log(my?.data)
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
            {/* END: HeaderSection */}
            {/* BEGIN: SummaryCards */}
            <section
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                data-purpose="schedule-summary"
            >
                {/* Total Shifts */}
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
                        <p className="text-xl font-bold">5</p>
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
            {/* END: SummaryCards */}
            {/* BEGIN: ScheduleList */}
            <section className="space-y-4" data-purpose="daily-schedule-list">
                {/* Monday */}
                <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">
                            15/03
                        </span>
                        <span className="text-xl font-bold">Thứ 2</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                        {/* Shift Card 1 */}
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-green min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-green">Ca Sáng</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-green/10 text-shift-green border border-shift-green/20 font-medium">
                                    Đã chốt
                                </span>
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
                                08:00 - 15:00
                            </p>
                        </div>
                    </div>
                </article>
                {/* Tuesday */}
                <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">
                            16/03
                        </span>
                        <span className="text-xl font-bold">Thứ 3</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-yellow min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-yellow">Ca Chiều</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-yellow/10 text-shift-yellow border border-shift-yellow/20 font-medium">
                                    Chờ xác nhận
                                </span>
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
                                15:00 - 22:00
                            </p>
                        </div>
                    </div>
                </article>
                {/* Wednesday - Multiple Shifts */}
                <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">
                            17/03
                        </span>
                        <span className="text-xl font-bold">Thứ 4</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                        {/* Shift 1 */}
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-green min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-green">Ca Sáng</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-green/10 text-shift-green border border-shift-green/20 font-medium">
                                    Đã chốt
                                </span>
                            </div>
                            <p className="text-sm flex items-center gap-2 text-gray-300">
                                08:00 - 12:00
                            </p>
                        </div>
                        {/* Shift 2 */}
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-green min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-green">Ca Tối</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-green/10 text-shift-green border border-shift-green/20 font-medium">
                                    Đã chốt
                                </span>
                            </div>
                            <p className="text-sm flex items-center gap-2 text-gray-300">
                                18:00 - 23:00
                            </p>
                        </div>
                    </div>
                </article>
                {/* Thursday - Empty Day */}
                <article className="flex flex-col md:flex-row bg-cinema-card/50 rounded-xl border border-gray-800 overflow-hidden opacity-50">
                    <div className="md:w-1/5 bg-gray-800/20 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                        <span className="text-sm uppercase tracking-wider">18/03</span>
                        <span className="text-xl font-bold">Thứ 5</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex items-center justify-center italic text-gray-500">
                        Nghỉ / Không có ca
                    </div>
                </article>
                {/* Friday */}
                <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700">
                        <span className="text-sm text-gray-400 uppercase tracking-wider">
                            19/03
                        </span>
                        <span className="text-xl font-bold">Thứ 6</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-green min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-green">Ca Toàn Thời Gian</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-green/10 text-shift-green border border-shift-green/20 font-medium">
                                    Đã chốt
                                </span>
                            </div>
                            <p className="text-sm flex items-center gap-2 text-gray-300">
                                09:00 - 18:00
                            </p>
                        </div>
                    </div>
                </article>
                {/* Saturday */}
                <article className="flex flex-col md:flex-row bg-cinema-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="md:w-1/5 bg-gray-800/30 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700 text-cinema-accent">
                        <span className="text-sm uppercase tracking-wider">20/03</span>
                        <span className="text-xl font-bold">Thứ 7</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex flex-col md:flex-row flex-wrap gap-4">
                        <div
                            className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-shift-yellow min-w-[200px] flex-1"
                            data-purpose="shift-card"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-shift-yellow">
                                    Ca Đêm (Cuối Tuần)
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-shift-yellow/10 text-shift-yellow border border-shift-yellow/20 font-medium">
                                    Chờ xác nhận
                                </span>
                            </div>
                            <p className="text-sm flex items-center gap-2 text-gray-300">
                                20:00 - 02:00
                            </p>
                        </div>
                    </div>
                </article>
                {/* Sunday - Empty Day */}
                <article className="flex flex-col md:flex-row bg-cinema-card/50 rounded-xl border border-gray-800 overflow-hidden opacity-50">
                    <div className="md:w-1/5 bg-gray-800/20 p-4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-700 text-cinema-accent">
                        <span className="text-sm uppercase tracking-wider">21/03</span>
                        <span className="text-xl font-bold">Chủ Nhật</span>
                    </div>
                    <div className="md:w-4/5 p-4 flex items-center justify-center italic text-gray-500">
                        Nghỉ / Không có ca
                    </div>
                </article>
            </section>
            {/* END: ScheduleList */}
            {/* BEGIN: FooterNote */}
            <footer className="text-center text-gray-500 text-sm py-4 border-t border-gray-800">
                <p>* Vui lòng phản hồi ca làm việc "Chờ xác nhận" trước 24h.</p>
            </footer>
            {/* END: FooterNote */}
        </main>
    )
}