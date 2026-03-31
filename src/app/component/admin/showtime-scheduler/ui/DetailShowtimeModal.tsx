"use client";

import React from "react";
import {
  Close,
  EditOutlined,
  SaveOutlined,
  Search,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { IAdminMovieOption } from "@/types/data/showtime-scheduler";
import {
  canRoomPlayMovie,
  fromLocalDateTimeInputValue,
  notify,
  statusVi,
  toLocalDateTimeInputValue,
} from "../helpers/SchedulerLogic";

type Props = {
  open: boolean;
  detail: any;
  detailId: number;
  detailEdit: boolean;
  detailErr: string | null;
  detailMovieKeyword: string;
  detailMovies: IAdminMovieOption[];
  resources: any[];
  qDetail: any;
  mEdit: any;
  previewPoster: string | null;
  previewTitle: string;
  previewDuration: number;
  previewFormat: string | null;
  previewStartAt: string;
  previewEndAt: string;
  detailRoomType: string | null;
  editForm: {
    roomId: number;
    movieId: number;
    startAt: string;
    basePrice: number;
  };
  hasEditApi: boolean;
  resolveUrl: (_raw?: string | null) => string;
  setDetailEdit: (_v: boolean) => void;
  setDetailErr: (_v: string | null) => void;
  setDetailMovieKeyword: (_v: string) => void;
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }>
  >;
  closeDetailModal: () => void;
  startEditNow: () => void;
  saveEdit: () => void;
};

export default function DetailShowtimeModal({
  open,
  detail,
  detailId,
  detailEdit,
  detailErr,
  detailMovieKeyword,
  detailMovies,
  resources,
  qDetail,
  mEdit,
  previewPoster,
  previewTitle,
  previewDuration,
  previewFormat,
  previewStartAt,
  previewEndAt,
  detailRoomType,
  editForm,
  hasEditApi,
  resolveUrl,
  setDetailEdit,
  setDetailErr,
  setDetailMovieKeyword,
  setEditForm,
  closeDetailModal,
  startEditNow,
  saveEdit,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.16),rgba(15,23,42,0.78))] backdrop-blur-[4px]"
            onClick={closeDetailModal}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 w-[1120px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[36px] border border-white/30 bg-[linear-gradient(160deg,#ffffff_0%,#fbfdff_38%,#f8fafc_100%)] shadow-[0_40px_140px_rgba(2,6,23,0.34)]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] px-5 py-5">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Showtime detail</div>
                <div className="mt-1 text-[30px] font-black tracking-[-0.04em] text-slate-900">
                  Chi tiết suất chiếu
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!detailEdit ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-red-200 hover:bg-red-50"
                    onClick={startEditNow}
                    disabled={!detail || qDetail.isLoading || qDetail.isError || !hasEditApi}
                  >
                    <EditOutlined fontSize="small" />
                    Sửa
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_40px_rgba(239,68,68,0.28)]"
                    onClick={saveEdit}
                    disabled={mEdit.isPending}
                  >
                    <SaveOutlined fontSize="small" />
                    Lưu
                  </button>
                )}

                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-red-200 hover:text-red-500"
                  onClick={closeDetailModal}
                  disabled={mEdit.isPending}
                >
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            <div className="bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.04),transparent_22%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6">
              {qDetail.isLoading ? (
                <div className="text-sm text-gray-500">Đang tải chi tiết...</div>
              ) : qDetail.isError ? (
                <div className="text-sm text-red-600">
                  Không tải được chi tiết suất chiếu.
                </div>
              ) : !detail ? (
                <div className="text-sm text-gray-500">Không có dữ liệu.</div>
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(155deg,#ffffff_0%,#f8fafc_48%,#eef2ff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div className="font-black tracking-[-0.02em] text-gray-900">
                          Thông tin
                        </div>
                        <div className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black text-red-600">
                          #{detailId}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex gap-3">
                          <div className="h-40 w-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            {previewPoster ? (
                              <img
                                src={resolveUrl(previewPoster)}
                                alt={previewTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="truncate text-2xl font-black tracking-[-0.03em] text-slate-900">
                              {previewTitle}
                            </div>
                            <div className="mt-1 text-sm font-bold text-slate-500">
                              {previewDuration} phút • {statusVi(detail.status)}
                            </div>

                            <div className="mt-3 inline-flex items-center gap-2 text-xs">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                                {previewFormat ?? "—"}
                              </span>
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                                {detail.roomType ?? "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Bắt đầu
                            </div>
                            <div className="text-sm font-black tracking-[-0.02em] text-slate-900">
                              {String(previewStartAt || "")
                                .replace("T", " ")
                                .slice(0, 16)}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Kết thúc
                            </div>
                            <div className="text-sm font-black tracking-[-0.02em] text-slate-900">
                              {String(previewEndAt || "")
                                .replace("T", " ")
                                .slice(0, 16)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-sm">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                            Giá vé
                          </div>
                          <div className="text-sm font-black tracking-[-0.02em] text-slate-900">
                            {detailEdit ? editForm.basePrice : detail.basePrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="lg:col-span-2"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(155deg,#ffffff_0%,#f8fafc_52%,#fff7f7_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div className="font-black tracking-[-0.02em] text-gray-900">
                          Chỉnh sửa
                        </div>
                        <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                          {detailEdit
                            ? "Bạn đang chỉnh sửa"
                            : "Bấm Sửa để thay đổi"}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Phòng
                            </div>
                            <select
                              value={detailEdit ? editForm.roomId : detail.roomId}
                              onChange={(e) => {
                                const nextRoomId = Number(e.target.value);
                                const nextRoom =
                                  resources.find(
                                    (x: any) => Number(x.id) === nextRoomId,
                                  ) ?? null;

                                const currentMovieId = Number(
                                  editForm.movieId || detail?.movieId || 0,
                                );
                                const currentMovie =
                                  detailMovies.find(
                                    (m) => Number(m.id) === currentMovieId,
                                  ) ?? null;

                                const keepMovie =
                                  currentMovieId > 0 && currentMovie
                                    ? canRoomPlayMovie(
                                        nextRoom?.type ?? null,
                                        currentMovie.format ?? null,
                                      )
                                    : false;

                                setEditForm((p) => ({
                                  ...p,
                                  roomId: nextRoomId,
                                  movieId: keepMovie ? currentMovieId : 0,
                                }));

                                setDetailMovieKeyword("");
                                setDetailErr(null);

                                if (!keepMovie && currentMovieId > 0) {
                                  notify({
                                    type: "warning",
                                    title: "Phim không phù hợp phòng mới",
                                    desc: "Vui lòng chọn phim khác.",
                                  });
                                }
                              }}
                              disabled={!detailEdit || mEdit.isPending}
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-black text-slate-800 outline-none shadow-sm transition focus:border-red-400"
                            >
                              {resources.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({r.type ?? "—"} - {r.totalSeats ?? 0} ghế)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Giá vé
                            </div>
                            <input
                              type="number"
                              value={detailEdit ? editForm.basePrice : detail.basePrice}
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  basePrice: Number(e.target.value),
                                }))
                              }
                              disabled={!detailEdit || mEdit.isPending}
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-black text-slate-800 outline-none shadow-sm transition focus:border-red-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Bắt đầu
                            </div>
                            <input
                              type="datetime-local"
                              value={
                                detailEdit
                                  ? toLocalDateTimeInputValue(editForm.startAt)
                                  : toLocalDateTimeInputValue(detail.startAt)
                              }
                              onChange={(e) =>
                                setEditForm((p) => ({
                                  ...p,
                                  startAt: fromLocalDateTimeInputValue(e.target.value),
                                }))
                              }
                              disabled={!detailEdit || mEdit.isPending}
                              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-black text-slate-800 outline-none shadow-sm transition focus:border-red-400"
                            />
                          </div>

                          <div>
                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Trạng thái
                            </div>
                            <input
                              value={statusVi(detail?.status)}
                              disabled
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(160deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="font-black tracking-[-0.02em] text-gray-900">
                              Chọn phim
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                              Lọc theo phòng:{" "}
                              <span className="font-black text-slate-600">
                                {detailRoomType ?? "—"}
                              </span>
                            </div>
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                              <Search fontSize="small" />
                              <input
                                value={detailMovieKeyword}
                                onChange={(e) => setDetailMovieKeyword(e.target.value)}
                                disabled={!detailEdit || mEdit.isPending}
                                className="w-full bg-transparent text-[15px] font-bold text-slate-800 outline-none"
                                placeholder="Tìm theo tên phim..."
                              />
                            </div>

                            <div>
                              <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Phim
                              </div>
                              <select
                                value={detailEdit ? editForm.movieId : detail.movieId}
                                onChange={(e) => {
                                  const nextMovieId = Number(e.target.value || 0);
                                  setEditForm((p) => ({
                                    ...p,
                                    movieId: nextMovieId,
                                  }));
                                  setDetailErr(null);
                                }}
                                disabled={!detailEdit || mEdit.isPending}
                                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] font-black text-slate-800 outline-none shadow-sm transition focus:border-red-400"
                              >
                                <option value={0}>-- Chọn phim --</option>
                                {detailMovies.length === 0 ? (
                                  <option value={0} disabled>
                                    Không có phim phù hợp
                                  </option>
                                ) : (
                                  detailMovies.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.title} • {m.durationMinutes} phút • {m.status} • {m.format ?? "—"}
                                    </option>
                                  ))
                                )}
                              </select>

                              {detailEdit && Number(editForm.movieId) <= 0 ? (
                                <div className="mt-2 text-xs text-red-600">
                                  Vui lòng chọn phim
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {detailErr ? (
                          <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 shadow-[0_16px_40px_rgba(239,68,68,0.10)]">
                            {detailErr}
                          </div>
                        ) : null}

                        {detailEdit ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-2xl border border-white/80 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
                              onClick={() => {
                                setDetailEdit(false);
                                setDetailErr(null);
                              }}
                              disabled={mEdit.isPending}
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              className="rounded-2xl bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(239,68,68,0.28)]"
                              onClick={saveEdit}
                              disabled={mEdit.isPending}
                            >
                              {mEdit.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
