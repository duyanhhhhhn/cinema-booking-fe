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
  resolveUrl: (raw?: string | null) => string;
  setDetailEdit: (v: boolean) => void;
  setDetailErr: (v: string | null) => void;
  setDetailMovieKeyword: (v: string) => void;
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
            className="absolute inset-0 bg-black/35"
            onClick={closeDetailModal}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 w-[1040px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="font-extrabold text-gray-900">
                Chi tiết suất chiếu
              </div>

              <div className="flex items-center gap-2">
                {!detailEdit ? (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold inline-flex items-center gap-2"
                    onClick={startEditNow}
                    disabled={!detail || qDetail.isLoading || qDetail.isError || !hasEditApi}
                  >
                    <EditOutlined fontSize="small" />
                    Sửa
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold inline-flex items-center gap-2"
                    onClick={saveEdit}
                    disabled={mEdit.isPending}
                  >
                    <SaveOutlined fontSize="small" />
                    Lưu
                  </button>
                )}

                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700"
                  onClick={closeDetailModal}
                  disabled={mEdit.isPending}
                >
                  <Close fontSize="small" />
                </button>
              </div>
            </div>

            <div className="p-5 bg-white">
              {qDetail.isLoading ? (
                <div className="text-sm text-gray-500">Đang tải chi tiết...</div>
              ) : qDetail.isError ? (
                <div className="text-sm text-red-600">
                  Không tải được chi tiết suất chiếu.
                </div>
              ) : !detail ? (
                <div className="text-sm text-gray-500">Không có dữ liệu.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="font-extrabold text-gray-900">
                          Thông tin
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                          #{detailId}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex gap-3">
                          <div className="w-28 h-36 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                            {previewPoster ? (
                              <img
                                src={resolveUrl(previewPoster)}
                                alt={previewTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-gray-900 truncate">
                              {previewTitle}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              {previewDuration} phút • {statusVi(detail.status)}
                            </div>

                            <div className="mt-2 inline-flex items-center gap-2 text-xs">
                              <span className="px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                                {previewFormat ?? "—"}
                              </span>
                              <span className="px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                                {detail.roomType ?? "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                            <div className="text-[11px] text-gray-500 font-semibold">
                              Bắt đầu
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {String(previewStartAt || "")
                                .replace("T", " ")
                                .slice(0, 16)}
                            </div>
                          </div>

                          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                            <div className="text-[11px] text-gray-500 font-semibold">
                              Kết thúc
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {String(previewEndAt || "")
                                .replace("T", " ")
                                .slice(0, 16)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                          <div className="text-[11px] text-gray-500 font-semibold">
                            Giá vé
                          </div>
                          <div className="text-sm font-bold text-gray-900">
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
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="font-extrabold text-gray-900">
                          Chỉnh sửa
                        </div>
                        <div className="text-xs text-gray-500">
                          {detailEdit
                            ? "Bạn đang chỉnh sửa"
                            : "Bấm Sửa để thay đổi"}
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">
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
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                            >
                              {resources.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} ({r.type ?? "—"} - {r.totalSeats ?? 0} ghế)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">
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
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">
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
                              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              Trạng thái
                            </div>
                            <input
                              value={statusVi(detail?.status)}
                              disabled
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="font-extrabold text-gray-900">
                              Chọn phim
                            </div>
                            <div className="text-xs text-gray-500">
                              Lọc theo phòng:{" "}
                              <span className="font-semibold">
                                {detailRoomType ?? "—"}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                              <Search fontSize="small" />
                              <input
                                value={detailMovieKeyword}
                                onChange={(e) => setDetailMovieKeyword(e.target.value)}
                                disabled={!detailEdit || mEdit.isPending}
                                className="w-full outline-none text-sm bg-white"
                                placeholder="Tìm theo tên phim..."
                              />
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-1">
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
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
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
                          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                            {detailErr}
                          </div>
                        ) : null}

                        {detailEdit ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
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
                              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold"
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