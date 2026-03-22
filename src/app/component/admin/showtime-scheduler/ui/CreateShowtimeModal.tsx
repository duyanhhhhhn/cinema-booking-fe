"use client";

import React, { useMemo } from "react";
import {
  Close,
  Search,
  CheckCircle,
  AccessTime,
  Movie,
  MeetingRoom,
  LocalOffer,
  CalendarMonth,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { IAdminMovieOption } from "@/types/data/showtime-scheduler";
import { notify } from "../helpers/SchedulerLogic";

type Props = {
  open: boolean;
  date: string;
  resources: any[];
  resolveUrl: (raw?: string | null) => string;
  form: {
    roomId: number;
    movieId: number;
    time: string;
    basePrice: number;
  };
  selectedRoom: any;
  selectedMovie: IAdminMovieOption | null;
  filteredMovies: IAdminMovieOption[];
  qMovies: any;
  openMoviePicker: boolean;
  movieKeyword: string;
  formError: string | null;
  mCreate: any;
  setForm: React.Dispatch<
    React.SetStateAction<{
      roomId: number;
      movieId: number;
      time: string;
      basePrice: number;
    }>
  >;
  setOpenCreate: (v: boolean) => void;
  setOpenMoviePicker: (v: boolean) => void;
  setMovieKeyword: (v: string) => void;
  setFormError: (v: string | null) => void;
  onRoomChange: (roomId: number) => void;
  submitCreate: () => void;
};

function TimeQuickPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const groups = useMemo(
    () => [
      {
        label: "Buổi sáng",
        items: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"],
      },
      {
        label: "Buổi chiều",
        items: ["12:00", "12:30", "13:00", "14:00", "15:00", "16:00", "17:00"],
      },
      {
        label: "Buổi tối",
        items: ["18:00", "18:30", "19:00", "19:30", "20:00", "21:00", "22:00"],
      },
    ],
    [],
  );

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AccessTime fontSize="small" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-[-0.01em] text-slate-900 sm:text-lg">
            Chọn giờ chiếu
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            Chạm nhanh để chọn giờ hoặc nhập tay nếu cần.
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {group.items.map((item) => {
                const active = value === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onChange(item)}
                    className={`min-w-[76px] rounded-2xl border px-4 py-3 text-sm font-bold transition-all sm:text-[15px] ${
                      active
                        ? "border-red-500 bg-red-500 text-white shadow-[0_16px_32px_rgba(239,68,68,0.28)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px]">
        <input
          type="time"
          step={300}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
        />
        <div className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-extrabold text-slate-900">
          {value || "--:--"}
        </div>
      </div>
    </div>
  );
}

export default function CreateShowtimeModal({
  open,
  date,
  resources,
  resolveUrl,
  form,
  selectedRoom,
  selectedMovie,
  filteredMovies,
  qMovies,
  openMoviePicker,
  movieKeyword,
  formError,
  mCreate,
  setForm,
  setOpenCreate,
  setOpenMoviePicker,
  setMovieKeyword,
  setFormError,
  onRoomChange,
  submitCreate,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60]">
        <div
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
          onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
        />

        <div className="absolute inset-0 overflow-y-auto px-3 py-20 sm:px-6 sm:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex w-full max-w-[920px] flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_40px_120px_rgba(2,6,23,0.28)]"
          >
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Thêm lịch chiếu
                  </div>
                  <div className="mt-2 text-[28px] font-black tracking-[-0.03em] text-slate-950 sm:text-[34px] leading-tight">
                    Tạo suất chiếu mới
                  </div>
                  <div className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                    Giao diện đã tối ưu thao tác, căn giữa phần nội dung và bỏ khung xem trước để gọn, rõ hơn.
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:text-red-500"
                  onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
                >
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-7">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-800">
                    <MeetingRoom fontSize="small" className="text-red-500" />
                    Phòng chiếu
                  </div>
                  <select
                    value={form.roomId}
                    onChange={(e) => onRoomChange(Number(e.target.value))}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                  >
                    <option value={0}>-- Chọn phòng --</option>
                    {resources.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type ?? "—"} - {r.totalSeats ?? 0} ghế)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-800">
                    <LocalOffer fontSize="small" className="text-red-500" />
                    Giá vé
                  </div>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        basePrice: Number(e.target.value),
                      }))
                    }
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                  />
                </div>
              </div>

              <TimeQuickPicker
                value={form.time}
                onChange={(next) =>
                  setForm((p) => ({ ...p, time: next }))
                }
              />

              <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    <CalendarMonth fontSize="inherit" />
                    Ngày áp dụng
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xl font-black tracking-[-0.02em] text-slate-950">
                    {date}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-500">
                    Ngày được giữ cố định theo logic hiện tại.
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
                  <div className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-800">
                    <Movie fontSize="small" className="text-red-500" />
                    Phim được chọn
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!form.roomId) {
                        return notify({
                          type: "warning",
                          title: "Chọn phòng trước",
                          desc: "Vui lòng chọn phòng để lọc phim phù hợp.",
                        });
                      }
                      setOpenMoviePicker(true);
                    }}
                    className="flex w-full items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-red-200 hover:bg-red-50/40"
                  >
                    <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {selectedMovie?.posterUrl ? (
                        <img
                          src={resolveUrl(selectedMovie.posterUrl)}
                          alt={selectedMovie.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-lg font-black tracking-[-0.02em] text-slate-950">
                        {selectedMovie ? selectedMovie.title : "Chọn phim"}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">
                        {selectedMovie
                          ? `${selectedMovie.durationMinutes} phút • ${selectedMovie.status} • ${selectedMovie.format ?? "—"}`
                          : selectedRoom?.type
                            ? `Danh sách đã lọc theo phòng ${selectedRoom.type}`
                            : "Chọn phòng trước để lọc phim"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                      {selectedMovie ? `#${selectedMovie.id}` : "Chọn"}
                    </div>
                  </button>
                </div>
              </div>

              {formError ? (
                <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm font-bold text-red-700 shadow-[0_16px_40px_rgba(239,68,68,0.10)]">
                  {formError}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
                  disabled={mCreate.isPending || openMoviePicker}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] px-6 text-sm font-bold text-white shadow-[0_18px_40px_rgba(239,68,68,0.28)] transition hover:-translate-y-[1px]"
                  onClick={submitCreate}
                  disabled={mCreate.isPending || openMoviePicker}
                >
                  {mCreate.isPending ? "Đang tạo..." : "Tạo suất chiếu"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {openMoviePicker ? (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
            onClick={() => setOpenMoviePicker(false)}
          />
          <div className="absolute inset-0 overflow-y-auto px-3 py-20 sm:px-6 sm:py-24 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.985 }}
              transition={{ duration: 0.18 }}
              className="mx-auto flex w-full max-w-[980px] flex-col overflow-hidden rounded-[32px] border border-white/40 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_36px_120px_rgba(2,6,23,0.30)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Chọn phim</div>
                  <div className="mt-1 text-[24px] font-black tracking-[-0.02em] text-slate-950 sm:text-[28px] leading-tight">
                    Danh sách phim {selectedRoom?.type ? `(lọc theo ${selectedRoom.type})` : ""}
                  </div>
                </div>
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:text-red-500"
                  onClick={() => setOpenMoviePicker(false)}
                >
                  <Close fontSize="small" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Search fontSize="small" className="text-slate-400" />
                  <input
                    value={movieKeyword}
                    onChange={(e) => setMovieKeyword(e.target.value)}
                    className="w-full bg-transparent text-base font-semibold text-slate-800 outline-none"
                    placeholder="Tìm theo tên phim..."
                  />
                </div>

                <div className="mt-4 min-h-0 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                  {qMovies.isLoading ? (
                    <div className="p-5 text-sm text-slate-500 bg-white">Đang tải phim...</div>
                  ) : qMovies.isError ? (
                    <div className="p-5 text-sm text-red-600 bg-white">Không tải được danh sách phim.</div>
                  ) : filteredMovies.length === 0 ? (
                    <div className="p-5 text-sm text-slate-500 bg-white">
                      Không có phim phù hợp với phòng {selectedRoom?.type ?? "đã chọn"}.
                    </div>
                  ) : (
                    <div className="grid gap-3 bg-white sm:grid-cols-2 xl:grid-cols-3">
                      {filteredMovies.map((m) => {
                        const active = m.id === form.movieId;
                        const src = resolveUrl(m.posterUrl);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setForm((p) => ({ ...p, movieId: m.id }));
                              setOpenMoviePicker(false);
                              setFormError(null);
                            }}
                            className={`group overflow-hidden rounded-[24px] border p-3 text-left transition ${
                              active
                                ? "border-red-400 bg-red-50 shadow-[0_20px_50px_rgba(239,68,68,0.14)]"
                                : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                {src ? (
                                  <img src={src} alt={m.title} className="h-full w-full object-cover" />
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-base font-black tracking-[-0.02em] text-slate-900">
                                  {m.title}
                                </div>
                                <div className="mt-1 text-xs leading-5 text-slate-500">
                                  {m.durationMinutes} phút • {m.status} • {m.format ?? "—"}
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                    #{m.id}
                                  </div>
                                  {active ? (
                                    <div className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                                      <CheckCircle fontSize="small" />
                                      Đã chọn
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end">
                  <button
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    onClick={() => setOpenMoviePicker(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </>
  );
}
