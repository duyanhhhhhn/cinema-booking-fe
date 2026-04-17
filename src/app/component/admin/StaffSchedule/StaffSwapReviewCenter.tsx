"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ApprovalRounded,
  PendingActionsRounded,
  StorefrontRounded,
  ViewWeek,
  ChecklistRtl,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Cinema } from "@/types/data/cinema/cinema";
import type { ICinema } from "@/types/data/cinema/types";
import {
  Schedule,
  type IStaffSwapRequestItem,
} from "@/types/data/staff/schedule/schedule";

import {
  formatDateLong,
  formatShiftRange,
  getErrorMessage,
  getInitials,
  getPositionLabel,
  getSwapStatusMeta,
  normalizeNumber,
} from "./staffScheduleUtils";
import {
  staffScheduleRoboto,
  staffScheduleSurface,
} from "./staffScheduleTheme";

function HeaderTabs() {
  const tabs = [
    {
      href: "/admin/staff-schedules",
      label: "Lịch làm",
      description: "Mở bảng tuần của nhân viên trong chi nhánh.",
      icon: <ViewWeek fontSize="small" />,
    },
    {
      href: "/admin/staff-schedules/assign",
      label: "Phân ca",
      description: "Tạo hoặc chỉnh ca trực tiếp trên bảng phân công.",
      icon: <ChecklistRtl fontSize="small" />,
    },
    {
      href: "/admin/staff-schedules/swaps",
      label: "Duyệt làm thay",
      description: "Kiểm tra và phản hồi các yêu cầu đổi ca.",
      icon: <ApprovalRounded fontSize="small" />,
    },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {tabs.map((item) => {
        const active = item.href === "/admin/staff-schedules/swaps";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block border px-4 py-4 text-left transition ${
              active
                ? "border-red-600 bg-red-600 text-white shadow-[0_18px_38px_rgba(220,38,38,0.18)]"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center border ${
                active
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-red-100 bg-red-50 text-red-600"
              }`}
            >
              {item.icon}
            </div>
            <div className="mt-4 text-base font-black">{item.label}</div>
            <div
              className={`mt-2 text-sm leading-6 ${
                active ? "text-white/85" : "text-slate-500"
              }`}
            >
              {item.description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  accentClass,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <div className={`${staffScheduleSurface} px-4 py-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
          {label}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center ${accentClass}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function SwapReviewCard({
  item,
  highlight,
  pendingAction,
  onApprove,
  onReject,
}: {
  item: IStaffSwapRequestItem;
  highlight?: boolean;
  pendingAction?: string | null;
  onApprove: (_id: number) => void;
  onReject: (_id: number) => void;
}) {
  const meta = getSwapStatusMeta(item.status);

  return (
    <article
      id={`swap-review-card-${item.id}`}
      className={`${staffScheduleSurface} p-5 ${
        highlight
          ? "ring-2 ring-red-300 shadow-[0_18px_40px_rgba(244,63,94,0.16)]"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Người nhờ
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-white text-sm font-black text-slate-700">
                  {getInitials(item.requester.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-black text-slate-900">
                    {item.requester.fullName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {getPositionLabel(
                      item.requester.position || item.requester.roleName,
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Người thay
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-white text-sm font-black text-slate-700">
                  {getInitials(item.target.fullName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-black text-slate-900">
                    {item.target.fullName}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {getPositionLabel(item.target.position || item.target.roleName)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="border border-slate-200 bg-white px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Ca
              </div>
              <div className="mt-2 text-base font-black text-slate-900">
                {item.shift.name}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {formatDateLong(item.workDate)}
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {formatShiftRange(item.shift)}
              </div>
            </div>

            <div className="border border-slate-200 bg-white px-4 py-4">
              <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                Lý do
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-700">
                {item.note?.trim() || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-[240px] flex-col items-start gap-3 2xl:items-end">
          <span
            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${meta.lightBadgeClass}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pendingAction === `approve-${item.id}`}
          onClick={() => onApprove(item.id)}
          className="h-11 border border-emerald-600 bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
        >
          {pendingAction === `approve-${item.id}`
            ? "Đang duyệt..."
            : "Duyệt"}
        </button>
        <button
          type="button"
          disabled={pendingAction === `reject-${item.id}`}
          onClick={() => onReject(item.id)}
          className="h-11 border border-rose-600 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {pendingAction === `reject-${item.id}` ? "Đang xử lý..." : "Từ chối"}
        </button>
      </div>
    </article>
  );
}

export default function StaffSwapReviewCenter() {
  const { user, loading } = useAuth();
  const n = useNotification();
  const { ConfirmDialog } = n;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const role = String(user?.role || "").toUpperCase();
  const isManager = role === "MANAGER";
  const focusRequestId = Number(searchParams.get("focusRequest") || 0);

  const [pendingSwapReviewAction, setPendingSwapReviewAction] = useState<string | null>(
    null,
  );

  const qCinemas = useQuery({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 50 }),
    enabled: Boolean(user) && isManager,
  });

  const cinemas: ICinema[] = useMemo(
    () => (Array.isArray(qCinemas.data?.data) ? qCinemas.data.data : []),
    [qCinemas.data],
  );

  const effectiveCinemaId = normalizeNumber(user?.cinemaId);

  const selectedCinemaName = useMemo(() => {
    if (!effectiveCinemaId) return "Chưa chọn chi nhánh";
    return (
      cinemas.find((cinema) => Number(cinema.id) === Number(effectiveCinemaId))
        ?.name ?? `Chi nhánh #${effectiveCinemaId}`
    );
  }, [cinemas, effectiveCinemaId]);

  const qSwapReviews = useQuery({
    ...Schedule.getSwapRequests({
      box: "review",
      cinemaId: effectiveCinemaId,
    }),
    enabled: Boolean(user) && isManager && Boolean(effectiveCinemaId),
  });

  const swapReviews: IStaffSwapRequestItem[] = useMemo(
    () => (Array.isArray(qSwapReviews.data?.data) ? qSwapReviews.data.data : []),
    [qSwapReviews.data],
  );

  const reviewSwapMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number;
      action: "APPROVE" | "REJECT";
    }) => Schedule.reviewSwapRequest(id, action).then((response) => response.data),
    onMutate: ({ id, action }) => {
      const token = `${action.toLowerCase()}-${id}`;
      setPendingSwapReviewAction(token);
      return { token };
    },
    onSuccess: (response) => {
      n.success(response.message || "Đã cập nhật duyệt chuyển ca.");
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.swapRequests],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.cinemaSchedule],
      });
      queryClient.invalidateQueries({
        queryKey: [Schedule.queryKeys.mySchedule],
      });
    },
    onError: (error) => {
      n.error(getErrorMessage(error));
    },
    onSettled: () => {
      setPendingSwapReviewAction(null);
    },
  });

  useEffect(() => {
    if (!focusRequestId) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`swap-review-card-${focusRequestId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 160);

    return () => window.clearTimeout(timer);
  }, [focusRequestId, swapReviews.length]);

  const errorMessage = qSwapReviews.isError
    ? getErrorMessage(qSwapReviews.error)
    : qCinemas.isError
      ? getErrorMessage(qCinemas.error)
      : "";

  const requestReviewSwap = (id: number, action: "APPROVE" | "REJECT") => {
    const config =
      action === "APPROVE"
        ? {
            title: "Xác nhận",
            message: "Duyệt yêu cầu này?",
            confirmText: "Duyệt",
          }
        : {
            title: "Xác nhận",
            message: "Từ chối yêu cầu này?",
            confirmText: "Từ chối",
          };

    n.confirm(config.message, {
      title: config.title,
      confirmText: config.confirmText,
      cancelText: "Quay lại",
      onConfirm: () => reviewSwapMutation.mutate({ id, action }),
    });
  };

  if (loading) {
    return (
      <div
        className={`${staffScheduleRoboto.className} ${staffScheduleSurface} px-6 py-10 text-sm font-semibold text-slate-600`}
      >
        Đang tải yêu cầu làm thay...
      </div>
    );
  }

  if (!isManager) {
    return (
      <div
        className={`${staffScheduleRoboto.className} rounded-none border border-amber-200 bg-white px-6 py-6 text-sm text-amber-800`}
      >
        Trang này chỉ dành cho manager chi nhánh.
      </div>
    );
  }

  return (
    <div className={`${staffScheduleRoboto.className} space-y-4 text-slate-900`}>
      <ConfirmDialog />

      <section className={`${staffScheduleSurface} overflow-hidden`}>
        <div className="grid gap-6 border-b border-slate-200 bg-white px-6 py-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
              Điều phối lịch ca
            </div>
            <h1 className="text-[32px] font-black tracking-[-0.04em] text-slate-900">
              Duyệt làm thay
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Chọn nhanh đúng bảng để quay lại xem lịch, phân ca hoặc tiếp tục
              duyệt yêu cầu đổi ca của staff.
            </p>
          </div>

          <div className="border border-slate-200 bg-white px-4 py-4">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Chi nhánh
            </div>
            <div className="mt-2 text-lg font-black text-slate-900">
              {selectedCinemaName}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <HeaderTabs />
        </div>
      </section>

      <section className={`${staffScheduleSurface} p-5`}>
        <div className="grid gap-4 xl:grid-cols-[280px_180px] xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              <StorefrontRounded sx={{ fontSize: 14 }} />
              Chi nhánh
            </div>
            <div className="flex h-11 items-center border border-slate-300 px-3.5 text-sm font-semibold text-slate-700">
              {selectedCinemaName}
            </div>
          </div>
          <SummaryTile
            label="Chờ duyệt"
            value={String(swapReviews.length)}
            icon={<PendingActionsRounded fontSize="small" />}
            accentClass="border border-amber-200 bg-amber-50 text-amber-600"
          />
        </div>

        {errorMessage ? (
          <div className="mt-4 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className={`${staffScheduleSurface} p-5`}>
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="text-lg font-black text-slate-900">Chờ duyệt</div>
          <div className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {qSwapReviews.isLoading ? "Đang tải..." : `${swapReviews.length} yêu cầu`}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {qSwapReviews.isLoading ? (
            <div className="border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              Đang tải...
            </div>
          ) : swapReviews.length ? (
            swapReviews.map((item) => (
              <SwapReviewCard
                key={item.id}
                item={item}
                highlight={Number(item.id) === focusRequestId}
                pendingAction={pendingSwapReviewAction}
                onApprove={(id) => requestReviewSwap(id, "APPROVE")}
                onReject={(id) => requestReviewSwap(id, "REJECT")}
              />
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Không có yêu cầu.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
