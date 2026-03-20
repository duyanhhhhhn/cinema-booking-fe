"use client"

import { Backdrop, Modal } from "@mui/material"

export default function AssignStaffModal({ open, onClose, refetchSchedule }: {
    open: boolean, onClose: () => void,
    refetchSchedule: () => void
}) {
    return <Modal open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
            backdrop: {
                timeout: 500,
                className: "bg-black/60 backdrop-blur-sm",
            },
        }}>
        <div>
            <main className="p-6">
                <div
                    className="bg-cinema-dark rounded-xl border border-slate-700 overflow-hidden shadow-2xl"
                    data-purpose="scheduling-matrix"
                >
                    {/* Grid Header */}
                    <div className="schedule-grid bg-slate-800/50 border-b border-slate-700">
                        <div className="p-4 font-bold text-slate-400 uppercase text-xs tracking-widest border-r border-slate-700">
                            Nhân viên
                        </div>
                        <div className="p-4 text-center border-r border-slate-700">
                            <span className="block text-white font-bold">Thứ 2</span>
                            <span className="text-xs text-slate-400">15/03</span>
                        </div>
                        <div className="p-4 text-center border-r border-slate-700 bg-slate-700/30">
                            <span className="block text-white font-bold">Thứ 3</span>
                            <span className="text-xs text-slate-400">16/03</span>
                        </div>
                        <div className="p-4 text-center border-r border-slate-700">
                            <span className="block text-white font-bold">Thứ 4</span>
                            <span className="text-xs text-slate-400">17/03</span>
                        </div>
                        <div className="p-4 text-center border-r border-slate-700">
                            <span className="block text-white font-bold">Thứ 5</span>
                            <span className="text-xs text-slate-400">18/03</span>
                        </div>
                        <div className="p-4 text-center border-r border-slate-700">
                            <span className="block text-white font-bold">Thứ 6</span>
                            <span className="text-xs text-slate-400">19/03</span>
                        </div>
                        <div className="p-4 text-center border-r border-slate-700">
                            <span className="block text-white font-bold">Thứ 7</span>
                            <span className="text-xs text-slate-400 text-cinema-red">20/03</span>
                        </div>
                        <div className="p-4 text-center">
                            <span className="block text-white font-bold">Chủ Nhật</span>
                            <span className="text-xs text-slate-400 text-cinema-red">21/03</span>
                        </div>
                    </div>
                    {/* Grid Body */}
                    <div className="divide-y divide-slate-700">
                        {/* Row: Employee 1 */}
                        <div className="schedule-grid group">
                            <div className="p-4 border-r border-slate-700 flex items-center gap-3">
                                <img
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAZrGe11oVQx-LEmSUyGSwQ9fSAsINN_W21O5D1Dh2ERQbMSrL2e6OJoZUjYrCMoJEiXIamCmvLX6RGPVyRj0dAmiy29Fx8IDwaENZLmn-2ixrCLJXF1uGM9bz27LxpZphy8KtfrcH9XLek0ekqBkX7DwbH4upZMoD3GJ8Xd8JEWLKCvjE-l59ld8YQy8YLW4u6BLKojA6UHzou7grcOkMxqTemmzwdzc2p0I65CpEe-gMMB_jQufzrLN_NstJAClscH-8GGAK7rhN"
                                />
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">
                                        Nguyễn Văn An
                                    </p>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 mt-1 uppercase">
                                        Manager
                                    </span>
                                </div>
                            </div>
                            {/* Cells */}
                            <div className="p-2 border-r border-slate-700 min-h-[100px] relative group/cell">
                                <div className="shift-card bg-cinema-success/20 border-l-4 border-cinema-success p-2 rounded cursor-pointer mb-2">
                                    <p className="text-xs font-bold text-cinema-success">Ca Sáng</p>
                                    <p className="text-[10px] text-slate-300">08:00 - 15:00</p>
                                </div>
                                <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 bg-slate-900/40 transition">
                                    <i className="text-slate-400 w-6 h-6" data-lucide="plus-circle" />
                                </button>
                            </div>
                            <div className="p-2 border-r border-slate-700 bg-slate-700/10">
                                {/* Off Day */}
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell">
                                <div className="shift-card bg-cinema-gold/20 border-l-4 border-cinema-gold p-2 rounded cursor-pointer">
                                    <p className="text-xs font-bold text-cinema-gold uppercase">
                                        Ca Đêm
                                    </p>
                                    <p className="text-[10px] text-slate-300">22:00 - 05:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 relative group/cell" />
                        </div>
                        {/* Row: Employee 2 */}
                        <div className="schedule-grid group">
                            <div className="p-4 border-r border-slate-700 flex items-center gap-3">
                                <img
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2B_vojL3drjE-xtB2mKQgBNrmIY6brfeTfvn5_OOAA-KhEf5y7Q7Oh8abSL9_RS6LNdHLz3wS7-ycfaneWNcGuWnjQ0CIKHFhiirKTe52jONmNAd6VUJJZcs6XGckaqSlqdrtZa1qqCFilri_iZHj5Ck0YciYZFibbuxk8K6ntxc3bD0NbwH-IUBYU-RpErSbEVymiNbv0Il95aaZHaqUYdq0b6uO7xdjdomSyY4ADnlSDB8AoszyY7QyaFwZ5tVE8y2CsCSlb_ik"
                                />
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">
                                        Lê Thị Hoa
                                    </p>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 mt-1 uppercase">
                                        Ticket Seller
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 bg-slate-700/10 relative group/cell">
                                <div className="shift-card bg-cinema-success/20 border-l-4 border-cinema-success p-2 rounded cursor-pointer mb-2">
                                    <p className="text-xs font-bold text-cinema-success">Ca Chiều</p>
                                    <p className="text-[10px] text-slate-300">14:00 - 21:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell">
                                <div className="shift-card bg-cinema-success/20 border-l-4 border-cinema-success p-2 rounded cursor-pointer mb-2">
                                    <p className="text-xs font-bold text-cinema-success">Ca Chiều</p>
                                    <p className="text-[10px] text-slate-300">14:00 - 21:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell">
                                <div className="shift-card bg-cinema-gold/20 border-l-4 border-cinema-gold p-2 rounded cursor-pointer">
                                    <p className="text-xs font-bold text-cinema-gold uppercase">
                                        Trực Lễ
                                    </p>
                                    <p className="text-[10px] text-slate-300">08:00 - 18:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 relative group/cell" />
                        </div>
                        {/* Row: Employee 3 */}
                        <div className="schedule-grid group">
                            <div className="p-4 border-r border-slate-700 flex items-center gap-3">
                                <img
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-slate-600"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0v-DD4C6QQ6wcoDvYOJsFjhuYFiFGSMhANoEn2lys11fLilOYDt7ZiuGURxPqXHY1I8XDMx_xhu5xRQ05qOmLxq9HnJVGM1VpXXZFgWGcuMvr3J0YLjd45Ilmth-EtvriO8kSXpr5QsMXwBNOR8Z8WWl-oIklcgc6PXFGJq9dI7BJmJG7uZ8iIY6AsmLgI2ZZR0K3fsoK_hSsnsf6ujLJMw0tDt-fyuRza6qKbzCVjtxOc0HI_fqyVvMbzBtsdZHsbpVg88vB1xIg"
                                />
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">
                                        Trần Minh Tâm
                                    </p>
                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 mt-1 uppercase">
                                        F&amp;B Staff
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell">
                                <div className="shift-card bg-cinema-success/20 border-l-4 border-cinema-success p-2 rounded cursor-pointer">
                                    <p className="text-xs font-bold text-cinema-success">Ca Đêm</p>
                                    <p className="text-[10px] text-slate-300">22:00 - 06:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 bg-slate-700/10 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell">
                                <div className="shift-card bg-cinema-gold/20 border-l-4 border-cinema-gold p-2 rounded cursor-pointer mb-1">
                                    <p className="text-xs font-bold text-cinema-gold">Ca Sáng</p>
                                    <p className="text-[10px] text-slate-300">07:00 - 12:00</p>
                                </div>
                                <div className="shift-card bg-cinema-gold/20 border-l-4 border-cinema-gold p-2 rounded cursor-pointer">
                                    <p className="text-xs font-bold text-cinema-gold">Tăng ca</p>
                                    <p className="text-[10px] text-slate-300">18:00 - 21:00</p>
                                </div>
                            </div>
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 border-r border-slate-700 relative group/cell" />
                            <div className="p-2 relative group/cell" />
                        </div>
                    </div>
                </div>
                {/* END: WeeklyScheduleGrid */}
            </main>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                data-purpose="edit-shift-modal"
            >
                <div className="bg-cinema-dark w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <i className="w-5 h-5 text-cinema-red" data-lucide="edit-3" />
                            Chi tiết Phân ca
                        </h3>
                        <button className="text-slate-400 hover:text-white transition">
                            <i className="w-6 h-6" data-lucide="x" />
                        </button>
                    </div>
                    {/* Modal Body */}
                    <form className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Nhân viên
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700">
                                <img
                                    alt="User"
                                    className="w-8 h-8 rounded-full"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNKJ7YqH6k2FQWqInvKis0tdxEPYyYhfAEHMEhDYwm2AUnKNeFRfRxagm-oRFWekPFFSsnDz0rX2bnDT2apKvdH0O1015AwM4c-cf9kFqEs6hWmKF2rYUS6HLFgKPC-AHcEwNipo2wGLo5Q6xeVtddnbg2qDSjffp3wLzEj_INwaykDX0zmwF4LFCmzvfcwhJPe65p01LcxLljBfxLJ-DfGBP3H5zgrKDyuH1S8DG7Mb_tmvh0HW8vt8XAfhf9qynf-POKr4B0WF4j"
                                />
                                <span className="text-sm font-medium text-white">
                                    Nguyễn Văn An (Manager)
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ngày làm việc
                                </label>
                                <input
                                    className="w-full bg-slate-900 border-slate-700 text-white text-sm rounded-lg focus:ring-cinema-red focus:border-cinema-red"
                                    type="date"
                                    defaultValue="2026-03-15"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ca làm việc
                                </label>
                                <select className="w-full bg-slate-900 border-slate-700 text-white text-sm rounded-lg focus:ring-cinema-red focus:border-cinema-red">
                                    <option>Ca Sáng (08:00 - 15:00)</option>
                                    <option>Ca Chiều (14:00 - 21:00)</option>
                                    <option>Ca Đêm (21:00 - 04:00)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Trạng thái
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input className="w-4 h-4 text-cinema-gold focus:ring-cinema-gold bg-slate-800 border-slate-600"
                                        name="status"
                                        type="radio"
                                    />
                                    <span className="text-sm text-slate-300 group-hover:text-white transition">
                                        Chờ xác nhận
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-4 h-4 text-cinema-success focus:ring-cinema-success bg-slate-800 border-slate-600"
                                        name="status"
                                        type="radio"
                                    />
                                    <span className="text-sm text-slate-300 group-hover:text-white transition">
                                        Đã chốt
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition"
                                    type="button"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-lg transition"
                                    type="button"
                                >
                                    Hủy
                                </button>
                            </div>
                            <button
                                className="w-full text-slate-500 hover:text-red-400 text-xs font-bold flex items-center justify-center gap-1 transition mt-2"
                                type="button"
                            >
                                <i className="w-3 h-3" data-lucide="trash-2" />
                                XÓA CA LÀM NÀY
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Modal>
}