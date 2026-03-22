"use client"

import { useNotification } from "@/hooks/useNotification";
import { initialScheduleData, Schedule, ScheduleFormData, useCreateScheduleMutation } from "@/types/data/staff/schedule/schedule"
import { Backdrop, Modal } from "@mui/material"
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export default function AssignStaffModal({ open, onClose, refetchSchedule }: {
    open: boolean, onClose: () => void,
    refetchSchedule: () => void
}) {
    const n = useNotification();
    const methods = useForm<any>({
        defaultValues: initialScheduleData,
        mode: "onChange",
    });
    const { mutate: createSchedule } = useCreateScheduleMutation();
    const onSubmit = async (data: ScheduleFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        createSchedule(formData, {
            onSuccess: () => {
                onClose();
                n.success("Success");
                methods.reset();
                refetchSchedule();
            },
            onError: (error) => {
                n.error(error.message);
            },
        });
    };

    const staff = useQuery(Schedule.getAllStaff());
    const data = staff?.data || [];
    const shift = useQuery(Schedule.getAllShift());
    const shiftData = shift?.data || []
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
                    <form className="p-6 space-y-4" onSubmit={methods.handleSubmit(onSubmit)}>
                        <select className="text-white"
                            {...methods.register("staff_id")}>
                            <option selected value="" className="bg-gray"
                            >Select staff</option>
                            {data.map((item) => (
                                <option value={item.id} className="bg-gray-500">
                                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700">
                                        <img
                                            alt="User"
                                            className="w-8 h-8 rounded-full"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNKJ7YqH6k2FQWqInvKis0tdxEPYyYhfAEHMEhDYwm2AUnKNeFRfRxagm-oRFWekPFFSsnDz0rX2bnDT2apKvdH0O1015AwM4c-cf9kFqEs6hWmKF2rYUS6HLFgKPC-AHcEwNipo2wGLo5Q6xeVtddnbg2qDSjffp3wLzEj_INwaykDX0zmwF4LFCmzvfcwhJPe65p01LcxLljBfxLJ-DfGBP3H5zgrKDyuH1S8DG7Mb_tmvh0HW8vt8XAfhf9qynf-POKr4B0WF4j"
                                        />
                                        <span className="text-sm font-medium text-white">
                                            {item.fullName} ({item.roleName})
                                        </span>
                                    </div>
                                </option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ngày làm việc
                                </label>
                                <input
                                    className="w-full bg-slate-900 border-slate-700 text-white text-sm rounded-lg"
                                    type="date"
                                    defaultValue="2026-03-15"
                                    {...methods.register("work_date")}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Ca làm việc
                                </label>
                                {
                                    <select {...methods.register("shift_id")}
                                        className="w-full bg-slate-900 border-slate-700 text-white text-sm rounded-lg">
                                        <option selected>Chọn ca làm</option>
                                        {shiftData.map((item) => (
                                            <option value={item.id}>{item.name} ({item.startTime} - {item.endTime})</option>
                                        ))}
                                    </select>
                                }
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Trạng thái
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input className="w-4 h-4 text-cinema-gold focus:ring-cinema-gold bg-slate-800 border-slate-600"
                                        type="radio"
                                        {...methods.register("status")}
                                        value={"ASSIGNED"}
                                    />
                                    <span className="text-sm text-slate-300 group-hover:text-white transition">
                                        Chờ xác nhận
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        className="w-4 h-4 text-cinema-success focus:ring-cinema-success bg-slate-800 border-slate-600"
                                        type="radio"
                                        {...methods.register("status")}
                                        value={"CONFIRMED"}
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
                                    type="submit"
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