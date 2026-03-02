"use client";

import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import { Toaster, toast } from "sonner";

import { MovieReviewAdmin } from "@/types/data/movie-reviews-admin/movie-review-admin";
import type {
  IAdminReviewRow,
  IAdminReviewMovieOption,
} from "@/types/data/movie-reviews-admin/type";

function formatDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString("vi-VN");
}

function initials(name: string) {
  const parts = String(name || "").trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return (a + b).toUpperCase() || "U";
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.floor(value || 0)));
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < v ? (
          <StarRoundedIcon key={i} fontSize="small" className="text-amber-500" />
        ) : (
          <StarBorderRoundedIcon
            key={i}
            fontSize="small"
            className="text-slate-300"
          />
        ),
      )}
    </div>
  );
}

function normalizeHidden(v: any): boolean {
  return v === true || v === 1 || v === "1";
}

function readHidden(row: any): boolean {
  const raw = row?.hidden ?? row?.isHidden ?? row?.is_hidden;
  return normalizeHidden(raw);
}

function StatusPill({ hidden }: { hidden: boolean }) {
  const cfg = hidden
    ? { label: "Ẩn", cls: "bg-rose-50 text-rose-700 border-rose-200" }
    : {
        label: "Hiện",
        cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {cfg.label}
    </span>
  );
}

type ConfirmPayload = {
  id: number;
  nextHidden: boolean;
  prevHidden: boolean;
  rawHidden: any;
  row?: any;
};

export default function MovieReviewManagement() {
  const [keyword, setKeyword] = useState("");
  const [movieFilter, setMovieFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [tab, setTab] = useState<"ALL" | "VISIBLE" | "HIDDEN">("ALL");

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [openView, setOpenView] = useState(false);
  const [viewRow, setViewRow] = useState<IAdminReviewRow | null>(null);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmPayload | null>(null);

  const toastLoadingIdRef = useRef<string | number | null>(null);

  const movieId = useMemo(() => {
    if (movieFilter === "ALL") return undefined;
    const n = Number(movieFilter);
    return Number.isFinite(n) ? n : undefined;
  }, [movieFilter]);

  const qMovies = useQuery({ ...MovieReviewAdmin.getMovies() });
  const qReviews = useQuery({
    ...MovieReviewAdmin.getAll(page, perPage, movieId),
  });

  const movies: IAdminReviewMovieOption[] = (qMovies.data?.data ?? []) as any;
  const rows: IAdminReviewRow[] = (qReviews.data?.data ?? []) as any;

  const meta: any = (qReviews.data as any)?.meta;
  const total: number = meta?.total ?? rows.length;
  const totalPages: number = meta?.perPage
    ? Math.max(1, Math.ceil(total / meta.perPage))
    : 1;

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1;
  const showingTo = Math.min(page * perPage, total);

  const isLoading = qMovies.isLoading || qReviews.isLoading;
  const isError = qMovies.isError || qReviews.isError;

  const qc = useQueryClient();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const listPredicate = (q: any) =>
    Array.isArray(q.queryKey) &&
    q.queryKey[0] === MovieReviewAdmin.queryKeys.list;

  const mSetVisibility = useMutation({
    mutationFn: async (p: {
      id: number;
      nextHidden: boolean;
      prevHidden: boolean;
      rawHidden: any;
    }) => {
      if (!Number.isFinite(p.id))
        throw new Error("Invalid review id: " + String(p.id));
      setPendingId(p.id);

      const action = p.nextHidden ? "HIDE" : "UNHIDE";
      console.groupCollapsed(`[ADMIN_REVIEW] PATCH ${action} id=${p.id}`);
      console.log("prevHidden(computed):", p.prevHidden);
      console.log("rawHidden(from row):", p.rawHidden);
      console.log("nextHidden:", p.nextHidden);
      console.log(
        "endpoint:",
        p.nextHidden
          ? `/admin/movie-reviews/${p.id}/hide`
          : `/admin/movie-reviews/${p.id}/unhide`,
      );

      try {
        const res = p.nextHidden
          ? await MovieReviewAdmin.hide(p.id).queryFn()
          : await MovieReviewAdmin.unhide(p.id).queryFn();

        console.log("response.message:", (res as any)?.message);
        console.log("response.data:", (res as any)?.data);
        console.groupEnd();
        return res;
      } catch (e) {
        console.error("PATCH error:", e);
        console.groupEnd();
        throw e;
      }
    },

    onMutate: async (p) => {
      console.groupCollapsed(`[ADMIN_REVIEW] Optimistic update id=${p.id}`);
      console.log("set hidden =>", p.nextHidden);
      console.groupEnd();

      await qc.cancelQueries({ predicate: listPredicate });
      const prev = qc.getQueriesData({ predicate: listPredicate });

      qc.setQueriesData({ predicate: listPredicate }, (old: any) => {
        if (!old?.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((r: IAdminReviewRow) =>
            r.id === p.id ? ({ ...r, hidden: p.nextHidden } as any) : r,
          ),
        };
      });

      return { prev };
    },

    onError: (e, p, ctx) => {
      console.error(`[ADMIN_REVIEW] SET_VISIBILITY_ERROR id=${p?.id}`, e);
      if (ctx?.prev) {
        console.log("[ADMIN_REVIEW] rollback cache");
        for (const [key, data] of ctx.prev) qc.setQueryData(key, data);
      }
    },

    onSuccess: async (res: any, p) => {
      console.log(`[ADMIN_REVIEW] invalidate list after id=${p.id}`, {
        message: res?.message,
      });
      await qc.invalidateQueries({ predicate: listPredicate });
      await qc.refetchQueries({ predicate: listPredicate });
    },

    onSettled: (_res, _err, p) => {
      console.log(`[ADMIN_REVIEW] settled id=${p?.id}`);
      setPendingId(null);
    },
  });

  const viewRows = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((r: any) => {
      const hidden = readHidden(r);

      if (tab === "VISIBLE" && hidden) return false;
      if (tab === "HIDDEN" && !hidden) return false;

      if (ratingFilter !== "ALL" && String(r.rating) !== ratingFilter)
        return false;

      if (!kw) return true;
      const hay =
        `${r.userFullName ?? ""} ${r.userEmail ?? ""} ${r.movieTitle ?? ""} ${
          r.comment ?? ""
        }`.toLowerCase();
      return hay.includes(kw);
    });
  }, [rows, keyword, ratingFilter, tab]);

  const openConfirmToggle = (payload: ConfirmPayload) => {
    setConfirmData(payload);
    setOpenConfirm(true);
  };

  const closeConfirm = () => {
    setOpenConfirm(false);
    setConfirmData(null);
  };

  const runToggle = (payload: ConfirmPayload) => {
    const loadingText = payload.nextHidden
      ? "Đang ẩn đánh giá..."
      : "Đang hiện đánh giá...";
    toastLoadingIdRef.current = toast.loading(loadingText);

    mSetVisibility.mutate(
      {
        id: payload.id,
        nextHidden: payload.nextHidden,
        prevHidden: payload.prevHidden,
        rawHidden: payload.rawHidden,
      },
      {
        onSuccess: (res: any) => {
          const serverMsg = String(res?.message ?? "").trim();

          const fallbackMsg = payload.nextHidden
            ? "Đã ẩn thành công"
            : "Đã hiện thành công";

          const msg =
            serverMsg &&
            !/^ok$/i.test(serverMsg) &&
            !/success$/i.test(serverMsg) &&
            serverMsg.length >= 3
              ? serverMsg
              : fallbackMsg;

          toast.success(msg, {
            icon: payload.nextHidden ? (
              <VisibilityOffRoundedIcon fontSize="small" />
            ) : (
              <VisibilityRoundedIcon fontSize="small" />
            ),
          });
        },

        onError: (err: any) => {
          const msg =
            String(err?.message ?? "").trim() ||
            (payload.nextHidden
              ? "Ẩn đánh giá thất bại"
              : "Hiện đánh giá thất bại");

          toast.error(msg, {
            icon: <ErrorRoundedIcon fontSize="small" />,
          });
        },

        onSettled: () => {
          if (toastLoadingIdRef.current != null) {
            toast.dismiss(toastLoadingIdRef.current);
            toastLoadingIdRef.current = null;
          }
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-white px-6 py-6">
      <Toaster richColors position="top-right" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Quản lý đánh giá
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kiểm soát nội dung phản hồi từ khách hàng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <SettingsOutlinedIcon fontSize="small" />
            Cài đặt kiểm duyệt
          </button>

          <button className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
            <FileDownloadOutlinedIcon fontSize="small" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <SearchOutlinedIcon fontSize="small" className="text-slate-400" />
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm theo khách hàng, nội dung đánh giá..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={movieFilter}
              onChange={(e) => {
                setMovieFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả phim</option>
              {movies.map((m) => (
                <option key={m.movieId} value={String(m.movieId)}>
                  {m.movieTitle}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="ALL">Mọi xếp hạng</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { k: "ALL", label: "Tất cả" },
            { k: "VISIBLE", label: "Đang hiển thị" },
            { k: "HIDDEN", label: "Đã ẩn" },
          ].map((t) => {
            const active = tab === (t.k as any);
            return (
              <button
                key={t.k}
                onClick={() => {
                  setTab(t.k as any);
                  setPage(1);
                }}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  active
                    ? "bg-rose-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto relative">
          <table className="min-w-[960px] w-full">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                <th className="px-5 py-4">Khách hàng</th>
                <th className="px-5 py-4">Phim</th>
                <th className="px-5 py-4">Xếp hạng</th>
                <th className="px-5 py-4">Nội dung đánh giá</th>
                <th className="px-5 py-4">Ngày đăng</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4 text-right sticky right-0 bg-slate-50">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-rose-600"
                  >
                    Lỗi tải dữ liệu.
                  </td>
                </tr>
              ) : viewRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                viewRows.map((r: any) => {
                  const hidden = readHidden(r);
                  const nextHidden = !hidden;

                  return (
                    <tr key={r.id} className="border-t border-slate-200">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
                            {initials(r.userFullName)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {r.userFullName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {r.movieTitle}
                      </td>

                      <td className="px-5 py-4">
                        <Stars value={r.rating} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[360px] truncate text-sm text-slate-700">
                          {r.comment ?? ""}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDateTime(r.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusPill hidden={hidden} />
                      </td>

                      <td className="px-5 py-4 sticky right-0 bg-white">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setViewRow(r);
                              setOpenView(true);
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                            title="Chi tiết"
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </button>

                          <button
                            type="button"
                            disabled={pendingId === r.id}
                            onClick={() => {
                              const rawHidden =
                                r?.hidden ?? r?.isHidden ?? r?.is_hidden;

                              console.groupCollapsed(
                                `[ADMIN_REVIEW] CLICK id=${r.id}`,
                              );
                              console.log("rawHidden:", rawHidden);
                              console.log("computed hidden:", hidden);
                              console.log("nextHidden:", nextHidden);
                              console.log(
                                "will call:",
                                nextHidden ? "HIDE (/hide)" : "UNHIDE (/unhide)",
                              );
                              console.groupEnd();

                              openConfirmToggle({
                                id: r.id,
                                nextHidden,
                                prevHidden: hidden,
                                rawHidden,
                                row: r,
                              });
                            }}
                            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            title={hidden ? "Hiện lại" : "Ẩn"}
                          >
                            {hidden ? (
                              <VisibilityOutlinedIcon fontSize="small" />
                            ) : (
                              <VisibilityOffOutlinedIcon fontSize="small" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Hiển thị {showingFrom} đến {showingTo} trong tổng số {total} đánh giá
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Trước
            </button>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              {page} / {totalPages}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết đánh giá</DialogTitle>
        <DialogContent>
          <div className="space-y-2 text-sm">
            <div>
              <b>Khách hàng:</b> {viewRow?.userFullName}
            </div>
            <div>
              <b>Email:</b> {viewRow?.userEmail}
            </div>
            <div>
              <b>Phim:</b> {viewRow?.movieTitle}
            </div>

            <div className="flex items-center gap-2">
              <b>Đánh giá:</b> {viewRow ? <Stars value={viewRow.rating} /> : null}
            </div>

            <div>
              <b>Ngày đăng:</b> {formatDateTime(viewRow?.createdAt)}
            </div>

            <div>
              <b>Trạng thái:</b>{" "}
              {viewRow ? (readHidden(viewRow as any) ? "Ẩn" : "Hiện") : "-"}
            </div>

            <div className="pt-2">
              <b>Nội dung:</b>
              <div className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3">
                {viewRow?.comment ?? ""}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openConfirm}
        onClose={closeConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="text-slate-900 font-extrabold">
          Xác nhận thao tác
        </DialogTitle>

        <DialogContent>
          <div className="space-y-2 text-sm text-slate-700">
            <div>
              {confirmData?.nextHidden ? (
                <>
                  Bạn có chắc chắn muốn{" "}
                  <b className="text-rose-600">ẩn</b> đánh giá này khỏi giao diện
                  người dùng không?
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn{" "}
                  <b className="text-emerald-600">hiện</b> lại đánh giá này
                  không?
                </>
              )}
            </div>

            {confirmData?.row ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="font-semibold text-slate-900">
                  {confirmData.row.movieTitle ?? "-"}
                </div>
                <div className="text-xs text-slate-500">
                  {confirmData.row.userFullName ?? "-"} •{" "}
                  {confirmData.row.userEmail ?? "-"}
                </div>
                <div className="mt-2 line-clamp-3 text-sm text-slate-700">
                  {confirmData.row.comment ?? ""}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button onClick={closeConfirm} variant="outlined">
            Huỷ
          </Button>

          <Button
            onClick={() => {
              if (!confirmData) return;
              closeConfirm();
              runToggle(confirmData);
            }}
            variant="contained"
            disabled={confirmData?.id != null && pendingId === confirmData.id}
            style={{
              background: confirmData?.nextHidden ? "#e11d48" : "#059669",
            }}
          >
            {confirmData?.nextHidden ? "Ẩn" : "Hiện"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}