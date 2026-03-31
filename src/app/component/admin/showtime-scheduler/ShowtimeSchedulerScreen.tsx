"use client";

import React, { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  Add,
  CalendarMonth,
  Storefront,
  WarningAmber,
} from "@mui/icons-material";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";

import MetricCard from "./ui/MetricCard";
import SchedulerBoard from "./ui/SchedulerBoard";
import CreateShowtimeModal from "./ui/CreateShowtimeModal";
import DetailShowtimeModal from "./ui/DetailShowtimeModal";

import { useSchedulerData } from "./hooks/useSchedulerData";
import { useSchedulerMutations } from "./hooks/useSchedulerMutations";

import {
  addDays,
  addMinutesToIso,
  canRoomPlayMovie,
  computeDropMove,
  isPastOrNowISO,
  notify,
  toStartAtISO,
  todayYMD,
} from "./helpers/SchedulerLogic";

import { ShowtimeSchedulerAdmin } from "@/types/data/showtime-scheduler";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export default function ShowtimeSchedulerScreen() {
  const IMAGE_HOST = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
        /\/+$/,
        "",
      ),
    [],
  );

  const IMAGE_BASE = useMemo(
    () => (IMAGE_HOST.endsWith("/media") ? IMAGE_HOST : `${IMAGE_HOST}/media`),
    [IMAGE_HOST],
  );

  const resolveUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return "";
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      const p = v.startsWith("/") ? v : `/${v}`;
      return p.startsWith("/media/")
        ? `${IMAGE_HOST}${p}`
        : `${IMAGE_BASE}${p}`;
    };
  }, [IMAGE_BASE, IMAGE_HOST]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openMoviePicker, setOpenMoviePicker] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [movieKeyword, setMovieKeyword] = useState("");
  const [detailMovieKeyword, setDetailMovieKeyword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [detailErr, setDetailErr] = useState<string | null>(null);

  const [detailId, setDetailId] = useState<number>(0);
  const [detailEdit, setDetailEdit] = useState(false);

  const [form, setForm] = useState({
    roomId: 0,
    movieId: 0,
    time: "10:00",
    basePrice: 90000,
  });

  const [editForm, setEditForm] = useState({
    roomId: 0,
    movieId: 0,
    startAt: "",
    basePrice: 0,
  });

  const [activeInfo, setActiveInfo] = useState<any>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const pendingNextDateRef = useRef<string | null>(null);
  const pendingAutoEditRef = useRef(false);
  const pressTimer = useRef<number | null>(null);
  const dragArmedRef = useRef(false);

  const {
    cinemaId,
    setCinemaId,
    date,
    setDate,
    role,
    isAdmin,
    cinemas,
    qScheduler,
    resources,
    events,
    meta,
    pxPerMinute,
    startMinute,
    endMinute,
    timelineHeight,
    hours,
    roomById,
    qMovies,
    movies,
    detailMovies,
  } = useSchedulerData(
    openCreate,
    openDetail,
    form.roomId,
    editForm.roomId,
    detailMovieKeyword,
    movieKeyword,
  );

  const qDetail = useQuery({
    ...ShowtimeSchedulerAdmin.getShowtimeDetail(detailId, cinemaId),
    enabled: openDetail && detailId > 0 && cinemaId > 0,
  });

  const detail = (qDetail.data as any)?.data ?? null;

  function initEditFromDetail(d: any) {
    setEditForm({
      roomId: Number(d.roomId || 0),
      movieId: Number(d.movieId || 0),
      startAt: String(d.startAt || ""),
      basePrice: Number(d.basePrice || 0),
    });
  }

  useEffect(() => {
    if (!openDetail || !detail) return;
    if (!pendingAutoEditRef.current) return;

    pendingAutoEditRef.current = false;
    startTransition(() => {
      initEditFromDetail(detail);
      setDetailErr(null);
      setDetailEdit(true);
    });
  }, [openDetail, detail]);

  const schedulerKey = useMemo(
    () => [ShowtimeSchedulerAdmin.queryKeys.scheduler, cinemaId, date] as const,
    [cinemaId, date],
  );

  const { mCreate, mEdit, mMove } = useSchedulerMutations({
    cinemaId,
    date,
    schedulerKey,
    detailId,
    initEditFromDetail,
    setDetailEdit,
    setDetailErr,
    setOpenCreate,
    setOpenMoviePicker,
    setFormError,
    pendingNextDateRef,
    setDate,
  });

  const selectedRoom = useMemo(
    () => resources.find((r: any) => Number(r.id) === Number(form.roomId)) ?? null,
    [resources, form.roomId],
  );

  const selectedMovie = useMemo(
    () => movies.find((m: any) => Number(m.id) === Number(form.movieId)) ?? null,
    [movies, form.movieId],
  );

  const filteredMoviesByRoom = useMemo(() => {
    if (!selectedRoom) return movies;
    return movies.filter((m: any) =>
      canRoomPlayMovie(selectedRoom?.type ?? null, m.format ?? null),
    );
  }, [movies, selectedRoom]);

  const filteredMovies = useMemo(() => {
    const key = movieKeyword.trim().toLowerCase();
    if (!key) return filteredMoviesByRoom;
    return filteredMoviesByRoom.filter((m: any) =>
      String(m.title || "").toLowerCase().includes(key),
    );
  }, [filteredMoviesByRoom, movieKeyword]);

  const detailRoomType = useMemo(() => {
    const rid = Number(editForm.roomId || detail?.roomId || 0);
    const r = resources.find((x: any) => Number(x.id) === rid) ?? null;
    return r?.type ? String(r.type).trim() : String(detail?.roomType ?? "").trim() || null;
  }, [editForm.roomId, detail, resources]);

  const filteredDetailMovies = useMemo(() => {
    const rid = Number(editForm.roomId || detail?.roomId || 0);
    const room = resources.find((x: any) => Number(x.id) === rid) ?? null;
    if (!room) return detailMovies;
    return detailMovies.filter((m: any) =>
      canRoomPlayMovie(room?.type ?? null, m.format ?? null),
    );
  }, [detailMovies, resources, editForm.roomId, detail]);

  const previewMovie = useMemo(() => {
    if (!detailEdit) return null;
    const mid = Number(editForm.movieId || 0);
    if (!mid) return null;
    return filteredDetailMovies.find((m: any) => Number(m.id) === mid) ?? null;
  }, [detailEdit, editForm.movieId, filteredDetailMovies]);

  const previewTitle = previewMovie?.title ?? detail?.movieTitle ?? "";
  const previewPoster = previewMovie?.posterUrl ?? detail?.posterUrl ?? null;
  const previewFormat = previewMovie?.format ?? detail?.movieFormat ?? null;
  const previewDuration =
    previewMovie?.durationMinutes ?? detail?.durationMinutes ?? 0;

  const previewStartAt = detailEdit
    ? editForm.startAt || detail?.startAt
    : detail?.startAt;

  const previewEndAt = useMemo(() => {
    if (!previewStartAt || !previewDuration) return detail?.endAt ?? "";
    return addMinutesToIso(previewStartAt, previewDuration + 10);
  }, [previewStartAt, previewDuration, detail]);

  const activeEvent = useMemo(
    () => (activeId ? events.find((x: any) => x?.id === activeId) ?? null : null),
    [activeId, events],
  );

  function openCreateModal() {
    if (cinemaId <= 0) {
      notify({
        type: "warning",
        title: "Chưa có rạp",
        desc: isAdmin ? "Vui lòng chọn rạp trước." : "Tài khoản chưa được gán rạp.",
      });
      return;
    }

    const firstRoomId = resources?.[0]?.id ?? 0;
    setForm((prev) => ({
      ...prev,
      roomId: prev.roomId || firstRoomId,
      movieId: 0,
    }));
    setOpenMoviePicker(false);
    setMovieKeyword("");
    setFormError(null);
    setOpenCreate(true);
  }

  function onRoomChange(nextRoomId: number) {
    setForm((p) => ({ ...p, roomId: nextRoomId, movieId: 0 }));
    setFormError(null);
    setMovieKeyword("");
  }

  function submitCreate() {
    const roomId = Number(form.roomId);
    const movieId = Number(form.movieId);
    const basePrice = Number(form.basePrice);

    if (!cinemaId || cinemaId <= 0) return setFormError("Dữ liệu rạp không hợp lệ.");
    if (!roomId || roomId <= 0) return setFormError("Vui lòng chọn phòng");
    if (!movieId || movieId <= 0) return setFormError("Vui lòng chọn phim");
    if (!form.time) return setFormError("Vui lòng chọn giờ bắt đầu");
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      return setFormError("Giá vé không hợp lệ");
    }

    const startAt = toStartAtISO(date, form.time);
    if (isPastOrNowISO(startAt)) {
      return setFormError("Không thể tạo lịch chiếu vào thời gian đã trôi qua.");
    }

    const room = resources.find((x: any) => Number(x.id) === roomId) ?? null;
    const movie = movies.find((m: any) => Number(m.id) === movieId) ?? null;

    if (!canRoomPlayMovie(room?.type ?? null, movie?.format ?? null)) {
      return setFormError("Phòng không phù hợp với định dạng phim.");
    }

    mCreate.mutate({ cinemaId, roomId, movieId, startAt, basePrice });
  }

  function saveEdit() {
    const rid = Number(editForm.roomId);
    const mid = Number(editForm.movieId);
    const bp = Number(editForm.basePrice);
    const sa = String(editForm.startAt || "").trim();

    if (!rid) return setDetailErr("Vui lòng chọn phòng");
    if (!mid) return setDetailErr("Vui lòng chọn phim");
    if (!sa) return setDetailErr("Vui lòng chọn thời gian bắt đầu");
    if (!Number.isFinite(bp) || bp <= 0) return setDetailErr("Giá vé không hợp lệ");
    if (isPastOrNowISO(sa)) {
      return setDetailErr("Không thể chỉnh sửa vào khung giờ đã trôi qua.");
    }

    const room = resources.find((x: any) => Number(x.id) === rid) ?? null;
    const movie = filteredDetailMovies.find((m: any) => Number(m.id) === mid) ?? null;

    if (!canRoomPlayMovie(room?.type ?? null, movie?.format ?? null)) {
      return setDetailErr("Phòng không phù hợp với định dạng phim.");
    }

    mEdit.mutate({
      id: detailId,
      cinemaId,
      roomId: rid,
      movieId: mid,
      startAt: sa,
      basePrice: bp,
    });
  }

  function closeDetailModal() {
    setOpenDetail(false);
    setDetailEdit(false);
    setDetailErr(null);
    pendingAutoEditRef.current = false;
  }

  function openDetailModal(id: number, autoEdit = false) {
    setDetailId(Number(id));
    setDetailErr(null);
    setDetailEdit(false);
    pendingAutoEditRef.current = autoEdit;
    setDetailMovieKeyword("");
    setOpenDetail(true);
  }

  function startEditNow() {
    if (!detail) return;
    initEditFromDetail(detail);
    setDetailErr(null);
    setDetailEdit(true);
  }

  function armDrag() {
    dragArmedRef.current = false;
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      dragArmedRef.current = true;
    }, 110);
  }

  function disarmDrag() {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  }

  function onDragStart(ev: DragStartEvent) {
    const d = (ev.active.data.current || {}) as any;
    if (!d?.eventId) return;
    setActiveInfo({ id: d.eventId, roomId: d.roomId, startISO: d.startISO });
    setActiveId(d.eventId);
  }

  function onDragEnd(ev: DragEndEvent) {
    const overId = String(ev.over?.id ?? "");

    const clear = () => {
      setActiveInfo(null);
      setActiveId(null);
    };

    if (!activeInfo) return clear();

    const move = computeDropMove({
      overId,
      date,
      active: activeInfo,
      pxPerMinute,
      deltaY: ev.delta.y || 0,
      startMinute,
      endMinute,
    });

    if (!move) return clear();

    if (isPastOrNowISO(move.startAt)) {
      notify({
        type: "warning",
        title: "Không thể di chuyển",
        desc: "Khung giờ đã trôi qua.",
      });
      return clear();
    }

    const targetRoom = roomById.get(move.targetRoomId);
    const roomType = targetRoom?.type ?? null;
    const movieFormat =
      (activeEvent as any)?.format ??
      (activeEvent as any)?.movieFormat ??
      null;

    if (activeEvent && !canRoomPlayMovie(roomType, movieFormat)) {
      notify({
        type: "error",
        title: "Phòng không phù hợp",
        desc: "Định dạng phim không khớp với loại phòng.",
      });
      return clear();
    }

    mMove.mutate({
      id: activeInfo.id,
      cinemaId,
      roomId: move.targetRoomId,
      startAt: move.startAt,
      targetDate: move.targetDate,
    });

    clear();
  }

  const totalConflicts = meta.totalConflicts ?? 0;

  return (
    <div className={`${roboto.className} min-h-screen bg-[linear-gradient(180deg,#fffdfd_0%,#fcfcfd_38%,#f8fafc_100%)] text-slate-900 font-semibold`}>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        toastOptions={{
          duration: 3200,
          className:
            `${roboto.className} !rounded-[20px] !border !border-[#ffd9d9] !bg-white !text-[#111827] !font-semibold !shadow-[0_20px_60px_rgba(255,45,47,0.14)]`,
          style: {
            padding: "16px",
          },
        }}
      />

      <div className="sticky top-0 z-30 bg-transparent px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6 xl:px-8 xl:pt-8">
        <div className="rounded-[24px] border border-[#e8ebf0] bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
                Quản lý rạp chiếu
              </div>
              <h1 className="mt-3 text-[30px] font-black leading-tight tracking-[-0.035em] text-slate-900 sm:text-[38px]">
                Lịch Suất Chiếu
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-7 text-slate-500 sm:text-[15px]">
                Theo dõi lịch chiếu, kiểm tra xung đột và điều phối phòng chiếu trong cùng một không gian làm việc.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <div className="rounded-[22px] border border-[#ececf2] bg-white px-4 py-3 text-sm font-black uppercase text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                {role || "—"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Tổng suất chiếu"
              value={`${events.length}`}
              icon={<CalendarMonth fontSize="small" />}
            />

            <MetricCard
              title="Xung đột"
              value={`${totalConflicts}`}
              sub={totalConflicts > 0 ? "Cần xử lý" : "Ổn định"}
              icon={<WarningAmber fontSize="small" />}
              tone={totalConflicts > 0 ? "danger" : "success"}
            />

            <div className="md:col-span-2 xl:col-span-2">
              <div className="h-full rounded-[30px] border border-[#ececf2] bg-white p-4 shadow-[0_20px_52px_rgba(15,23,42,0.06)] sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      Điều hướng lịch
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[24px] font-black tracking-[-0.03em] text-slate-900 sm:text-[28px]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
                        <CalendarMonth fontSize="small" />
                      </div>
                      <span>{date}</span>
                    </div>
                    <div className="mt-2 text-[13px] leading-6 text-slate-500 sm:text-sm">
                      Chọn ngày làm việc và rạp chiếu trước khi thêm hoặc điều chỉnh suất chiếu.
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:items-end">
                    {isAdmin ? (
                      <div className="w-full xl:w-[320px]">
                        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Cinema
                        </div>
                        <div className="relative">
                          <Storefront
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                          />
                          <select
                            value={cinemaId || 0}
                            onChange={(e) => setCinemaId(Number(e.target.value))}
                            className="w-full rounded-[22px] border border-[#ececf2] bg-white py-3.5 pl-10 pr-4 text-sm font-black text-slate-800 outline-none shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                          >
                            <option value={0}>-- Chọn rạp --</option>
                            {cinemas.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full rounded-[22px] border border-[#ececf2] bg-white px-4 py-3.5 xl:w-[320px] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Cinema
                        </div>
                        <div className="mt-1 truncate text-sm font-black tracking-[-0.02em] text-slate-900">
                          {qScheduler.data?.data?.cinemaName}
                        </div>
                      </div>
                    )}

                    <div className="grid w-full grid-cols-3 gap-2 xl:w-[320px]">
                      <button
                        className="flex h-12 items-center justify-center gap-1 rounded-[20px] border border-[#ececf2] bg-white font-black text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:bg-red-50"
                        onClick={() => setDate((d) => addDays(d, -1))}
                      >
                        Trước
                      </button>

                      <button
                        className="flex h-12 items-center justify-center gap-1 rounded-[20px] border border-red-500 bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] font-black text-white shadow-[0_16px_32px_rgba(239,68,68,0.22)] transition hover:-translate-y-[1px]"
                        onClick={() => setDate(todayYMD())}
                      >
                        Hôm nay
                      </button>

                      <button
                        className="flex h-12 items-center justify-center gap-1 rounded-[20px] border border-[#ececf2] bg-white font-black text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:-translate-y-[1px] hover:bg-red-50"
                        onClick={() => setDate((d) => addDays(d, 1))}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 xl:px-8">
        <SchedulerBoard
          resources={resources}
          events={events}
          hours={hours}
          timelineHeight={timelineHeight}
          startMinute={startMinute}
          pxPerMinute={pxPerMinute}
          activeId={activeId}
          activeEvent={activeEvent}
          resolveUrl={resolveUrl}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          openDetailModal={openDetailModal}
          dragArmedRef={dragArmedRef}
          armDrag={armDrag}
          disarmDrag={disarmDrag}
        />

        {qScheduler.isLoading ? (
          <div className="rounded-[24px] border border-[#ececf2] bg-white px-6 py-5 text-sm font-bold text-gray-500 shadow-sm">
            Đang tải lịch...
          </div>
        ) : null}

        {qScheduler.isError ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-6 py-5 text-sm font-bold text-red-600 shadow-sm">
            Lỗi tải lịch. Kiểm tra API / quyền truy cập.
          </div>
        ) : null}

        <button
          onClick={openCreateModal}
          disabled={cinemaId <= 0}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-[24px] border border-red-400 bg-[linear-gradient(135deg,#ef4444,#ff5a3d)] text-white shadow-[0_22px_52px_rgba(239,68,68,0.28)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
        >
          <Add />
        </button>
      </div>

      <CreateShowtimeModal
        open={openCreate}
        date={date}
        resources={resources}
        resolveUrl={resolveUrl}
        form={form}
        selectedRoom={selectedRoom}
        selectedMovie={selectedMovie}
        filteredMovies={filteredMovies}
        qMovies={qMovies}
        openMoviePicker={openMoviePicker}
        movieKeyword={movieKeyword}
        formError={formError}
        mCreate={mCreate}
        setForm={setForm}
        setDate={setDate}
        setOpenCreate={setOpenCreate}
        setOpenMoviePicker={setOpenMoviePicker}
        setMovieKeyword={setMovieKeyword}
        setFormError={setFormError}
        onRoomChange={onRoomChange}
        submitCreate={submitCreate}
      />

      <DetailShowtimeModal
        open={openDetail}
        detail={detail}
        detailId={detailId}
        detailEdit={detailEdit}
        detailErr={detailErr}
        detailMovieKeyword={detailMovieKeyword}
        detailMovies={filteredDetailMovies}
        resources={resources}
        qDetail={qDetail}
        mEdit={mEdit}
        previewPoster={previewPoster}
        previewTitle={previewTitle}
        previewDuration={previewDuration}
        previewFormat={previewFormat}
        previewStartAt={previewStartAt}
        previewEndAt={previewEndAt}
        detailRoomType={detailRoomType}
        editForm={editForm}
        hasEditApi={true}
        resolveUrl={resolveUrl}
        setDetailEdit={setDetailEdit}
        setDetailErr={setDetailErr}
        setDetailMovieKeyword={setDetailMovieKeyword}
        setEditForm={setEditForm}
        closeDetailModal={closeDetailModal}
        startEditNow={startEditNow}
        saveEdit={saveEdit}
      />
    </div>
  );
}
