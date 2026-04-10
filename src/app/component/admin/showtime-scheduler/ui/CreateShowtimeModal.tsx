"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Close,
  Search,
  CheckCircle,
  AccessTime,
  Movie,
  MeetingRoom,
  LocalOffer,
  CalendarMonth,
  ArrowBackRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { IAdminMovieOption } from "@/types/data/showtime-scheduler";
import { addDays, notify, todayYMD } from "../helpers/SchedulerLogic";

type Props = {
  open: boolean;
  date: string;
  resources: any[];
  resolveUrl: (_raw?: string | null) => string;
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
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setOpenCreate: (_v: boolean) => void;
  setOpenMoviePicker: React.Dispatch<React.SetStateAction<boolean>>;
  setMovieKeyword: (_v: string) => void;
  setFormError: (_v: string | null) => void;
  onRoomChange: (_roomId: number) => void;
  submitCreate: () => void;
};

function TimeQuickPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (_next: string) => void;
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
    <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AccessTime fontSize="small" />
        </div>
        <div>
          <div className="text-[15px] font-extrabold tracking-[-0.01em] text-slate-900 sm:text-base">
            Chọn giờ chiếu
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            Chạm nhanh để chọn giờ hoặc nhập tay nếu cần.
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const active = value === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onChange(item)}
                    className={`min-w-[72px] rounded-2xl border px-3.5 py-2.5 text-sm font-bold transition-all sm:text-[15px] ${
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

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px]">
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
  setDate,
  setOpenCreate,
  setOpenMoviePicker,
  setMovieKeyword,
  setFormError,
  onRoomChange,
  submitCreate,
}: Props) {
  const movieListRef = useRef<HTMLDivElement | null>(null);
  const movieSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [movieSearchState, setMovieSearchState] = useState({
    roomId: 0,
    visible: false,
  });
  const showMovieSearch =
    openMoviePicker &&
    movieSearchState.roomId === form.roomId &&
    movieSearchState.visible;

  useEffect(() => {
    if (!openMoviePicker) return;
    movieListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [form.roomId, openMoviePicker]);

  useEffect(() => {
    if (!showMovieSearch) return;
    movieSearchInputRef.current?.focus();
  }, [showMovieSearch]);

  if (!open) return null;

  const changeDate = (next: string | ((_current: string) => string)) => {
    setDate(next);
    setFormError(null);
  };

  const handleClose = () => {
    if (mCreate.isPending) return;
    setOpenMoviePicker(false);
    setMovieSearchState({ roomId: 0, visible: false });
    setMovieKeyword("");
    setOpenCreate(false);
  };

  const handleMovieSearchToggle = () => {
    if (!form.roomId) {
      return notify({
        type: "warning",
        title: "Chọn phòng trước",
        desc: "Vui lòng chọn phòng để lọc phim phù hợp.",
      });
    }

    setOpenMoviePicker(true);
    setMovieSearchState((prev) => {
      const nextVisible =
        !(prev.roomId === form.roomId && prev.visible);

      if (!nextVisible) setMovieKeyword("");

      return {
        roomId: form.roomId,
        visible: nextVisible,
      };
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]">
        <div
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
          onClick={handleClose}
        />

        <div className="absolute inset-0 overflow-y-auto px-3 py-20 sm:px-6 sm:py-24 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex w-full max-w-[880px] flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_40px_120px_rgba(2,6,23,0.28)]"
          >
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] px-5 py-5 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Thêm lịch chiếu
                  </div>
                  <div className="mt-2 text-[28px] font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-[32px]">
                    Tạo suất chiếu mới
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                    <CalendarMonth sx={{ fontSize: 16 }} />
                    {date}
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:text-red-500"
                  onClick={handleClose}
                >
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.92fr)]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-slate-800">
                    <MeetingRoom fontSize="small" className="text-red-500" />
                    Phòng chiếu
                  </div>
                  <select
                    value={form.roomId}
                    onChange={(e) => onRoomChange(Number(e.target.value))}
                    disabled={resources.length === 0}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                  >
                    <option value={0}>-- Chọn phòng --</option>
                    {resources.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type ?? "—"} - {r.totalSeats ?? 0} ghế)
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 text-sm text-slate-500">
                    {resources.length === 0
                      ? "Không có phòng đang hoạt động. Phòng bảo trì hoặc tạm ngưng đã được ẩn."
                      : selectedRoom
                      ? `Đang chọn ${selectedRoom.name} ${selectedRoom.type ? `• ${selectedRoom.type}` : ""}`
                      : "Chọn phòng trước để lọc phim phù hợp."}
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
                  <div className="flex items-center gap-2 text-[15px] font-extrabold text-slate-800">
                    <CalendarMonth fontSize="small" className="text-red-500" />
                    Ngày chiếu
                  </div>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-black tracking-[-0.02em] text-slate-950">
                    {date}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => changeDate((current) => addDays(current, -1))}
                      className="flex h-11 items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50"
                    >
                      <ArrowBackRounded sx={{ fontSize: 18 }} />
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() => changeDate(todayYMD())}
                      className="h-11 rounded-2xl border border-red-500 bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] text-sm font-bold text-white shadow-[0_16px_34px_rgba(239,68,68,0.22)] transition hover:-translate-y-[1px]"
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => changeDate((current) => addDays(current, 1))}
                      className="flex h-11 items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50"
                    >
                      Sau
                      <ArrowForwardRounded sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-slate-800">
                    <LocalOffer fontSize="small" className="text-red-500" />
                    Giá vé
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          basePrice: Number(e.target.value),
                        }))
                      }
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-16 text-base font-bold text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    Nhập giá vé áp dụng cho suất chiếu này.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-5">
                  <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-slate-800">
                    <Movie fontSize="small" className="text-red-500" />
                    Phim được chọn
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-3.5">
                    <div
                      className={`flex w-full items-center ${
                        selectedMovie ? "gap-3" : "justify-end"
                      }`}
                    >
                      {selectedMovie ? (
                        <>
                          <div className="flex h-20 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            {selectedMovie.posterUrl ? (
                              <img
                                src={resolveUrl(selectedMovie.posterUrl)}
                                alt={selectedMovie.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Movie fontSize="small" className="text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[17px] font-black tracking-[-0.02em] text-slate-950">
                              {selectedMovie.title}
                            </div>
                            <div className="mt-1 text-sm leading-6 text-slate-500">
                              {`${selectedMovie.durationMinutes} phút • ${selectedMovie.status} • ${selectedMovie.format ?? "—"}`}
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleMovieSearchToggle}
                          disabled={!form.roomId || resources.length === 0}
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border bg-white shadow-sm transition ${
                            showMovieSearch
                              ? "border-red-200 text-red-500"
                              : "border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-500"
                          } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300`}
                          aria-label="Tìm phim"
                        >
                          <Search fontSize="small" />
                        </button>
                      </div>
                    </div>

                    {openMoviePicker ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
                      >
                        <div className="p-4">
                          <AnimatePresence initial={false}>
                            {showMovieSearch ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -6 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                                  <Search fontSize="small" className="text-slate-400" />
                                  <input
                                    ref={movieSearchInputRef}
                                    value={movieKeyword}
                                    onChange={(e) => setMovieKeyword(e.target.value)}
                                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none"
                                    placeholder="Tìm theo tên phim..."
                                  />
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>

                          <div
                            ref={movieListRef}
                            className={`${showMovieSearch ? "mt-4" : "mt-1"} max-h-[360px] overflow-y-scroll pr-1.5 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent`}
                          >
                            {qMovies.isLoading ? (
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                Đang tải phim...
                              </div>
                            ) : qMovies.isError ? (
                              <div className="rounded-[20px] border border-red-200 bg-red-50 p-5 text-sm text-red-600">
                                Không tải được danh sách phim.
                              </div>
                            ) : resources.length === 0 ? (
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                Rạp này chưa có phòng đang hoạt động nên chưa thể chọn phim để tạo suất chiếu.
                              </div>
                            ) : !selectedRoom ? (
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                Chọn phòng trước để lọc phim theo loại phòng.
                              </div>
                            ) : filteredMovies.length === 0 ? (
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                                Không có phim khả dụng cho phòng {selectedRoom?.type ?? "đã chọn"}.
                              </div>
                            ) : (
                              <div className="space-y-2.5">
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
                                      className={`flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition ${
                                        active
                                          ? "border-red-300 bg-red-50 shadow-[0_16px_34px_rgba(239,68,68,0.12)]"
                                          : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40"
                                      }`}
                                    >
                                      <div className="flex h-[84px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                        {src ? (
                                          <img
                                            src={src}
                                            alt={m.title}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : null}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="truncate text-[15px] font-black tracking-[-0.02em] text-slate-900">
                                          {m.title}
                                        </div>
                                        <div className="mt-1 text-xs leading-5 text-slate-500">
                                          {m.durationMinutes} phút • {m.status} • {m.format ?? "—"}
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-2">
                                        <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                          #{m.id}
                                        </div>
                                        {active ? (
                                          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                                            <CheckCircle sx={{ fontSize: 14 }} />
                                            Đã chọn
                                          </div>
                                        ) : (
                                          <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                                            Chọn
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </div>

                <TimeQuickPicker
                  value={form.time}
                  onChange={(next) =>
                    setForm((p) => ({ ...p, time: next }))
                  }
                />
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
                  onClick={handleClose}
                  disabled={mCreate.isPending}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] px-6 text-sm font-bold text-white shadow-[0_18px_40px_rgba(239,68,68,0.28)] transition hover:-translate-y-[1px]"
                  onClick={submitCreate}
                  disabled={mCreate.isPending}
                >
                  {mCreate.isPending ? "Đang tạo..." : "Tạo suất chiếu"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </>
  );
}
