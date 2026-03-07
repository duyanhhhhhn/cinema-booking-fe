"use client";

import React from "react";
import { Close, Search, CheckCircle } from "@mui/icons-material";
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
          className="absolute inset-0 bg-black/30"
          onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
        />
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.985 }}
          transition={{ duration: 0.18 }}
          className="absolute left-1/2 top-1/2 w-[860px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-xl"
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="font-extrabold text-gray-900">Thêm Suất Chiếu</div>
            <button
              type="button"
              className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600"
              onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
            >
              <Close fontSize="small" />
            </button>
          </div>

          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Phòng
                </div>
                <select
                  value={form.roomId}
                  onChange={(e) => onRoomChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value={0}>-- Chọn phòng --</option>
                  {resources.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type ?? "—"} - {r.totalSeats ?? 0} ghế)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Giờ bắt đầu
                </div>
                <input
                  type="time"
                  step={300}
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  Ngày
                </div>
                <input
                  value={date}
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">
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
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">
                Phim
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.roomId) {
                    return notify({
                      type: "warning",
                      title: "Chọn phòng trước",
                      desc: "Vui lòng chọn phòng để lọc phim.",
                    });
                  }
                  setOpenMoviePicker(true);
                }}
                className="w-full rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-3 py-3 flex items-center gap-3"
              >
                <div className="h-14 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                  {selectedMovie?.posterUrl ? (
                    <img
                      src={resolveUrl(selectedMovie.posterUrl)}
                      alt={selectedMovie.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="font-bold text-gray-900 truncate">
                    {selectedMovie ? selectedMovie.title : "Chọn phim"}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {selectedMovie
                      ? `${selectedMovie.durationMinutes} phút • ${selectedMovie.status} • ${selectedMovie.format ?? "—"}`
                      : selectedRoom?.type
                        ? `Danh sách đã lọc theo phòng ${selectedRoom.type}`
                        : "Chọn phòng trước để lọc phim"}
                  </div>
                </div>

                <div className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                  {selectedMovie ? `#${selectedMovie.id}` : "Select"}
                </div>
              </button>
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {formError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
                onClick={() =>
                  !mCreate.isPending && !openMoviePicker && setOpenCreate(false)
                }
                disabled={mCreate.isPending || openMoviePicker}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm"
                onClick={submitCreate}
                disabled={mCreate.isPending || openMoviePicker}
              >
                {mCreate.isPending ? "Đang tạo..." : "Tạo suất"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {openMoviePicker ? (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpenMoviePicker(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 w-[920px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-2xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="font-extrabold text-gray-900">
                Chọn phim {selectedRoom?.type ? `(lọc theo ${selectedRoom.type})` : ""}
              </div>
              <button
                className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600"
                onClick={() => setOpenMoviePicker(false)}
              >
                <Close fontSize="small" />
              </button>
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search fontSize="small" />
                <input
                  value={movieKeyword}
                  onChange={(e) => setMovieKeyword(e.target.value)}
                  className="w-full outline-none text-sm bg-white"
                  placeholder="Tìm theo tên phim..."
                />
              </div>

              <div className="mt-3 h-[420px] overflow-auto rounded-2xl border border-gray-200 bg-white">
                {qMovies.isLoading ? (
                  <div className="p-4 text-sm text-gray-500 bg-white">
                    Đang tải phim...
                  </div>
                ) : qMovies.isError ? (
                  <div className="p-4 text-sm text-red-600 bg-white">
                    Không tải được danh sách phim.
                  </div>
                ) : filteredMovies.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 bg-white">
                    Không có phim phù hợp với phòng {selectedRoom?.type ?? "đã chọn"}.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 bg-white">
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
                          className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3 bg-white"
                        >
                          <div className="h-16 w-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                            {src ? (
                              <img
                                src={src}
                                alt={m.title}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate">
                              {m.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {m.durationMinutes} phút • {m.status} • {m.format ?? "—"}
                            </div>
                          </div>

                          {active ? (
                            <div className="text-emerald-600 inline-flex items-center gap-1 text-sm font-semibold">
                              <CheckCircle fontSize="small" />
                              Đã chọn
                            </div>
                          ) : (
                            <div className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                              #{m.id}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
                  onClick={() => setOpenMoviePicker(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}