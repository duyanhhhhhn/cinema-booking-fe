"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Download,
  Add,
  FilterAlt,
  Settings,
  EventNote,
  ConfirmationNumber,
  LocalOffer,
  WarningAmber,
  ViewDay,
  ViewWeek,
  Timeline,
  Close,
  Search,
  CheckCircle,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { IAdminMovieOption, ShowtimeSchedulerAdmin } from "@/types/data/showtime-scheduler";

type SchedulerMeta = {
  timelineStart: string;
  timelineEnd: string;
  totalConflicts: number;
};

type CreateForm = {
  roomId: number;
  movieId: number;
  time: string;
  basePrice: number;
};

const DEBUG = true;

function log(...args: any[]) {
  if (DEBUG) console.log(...args);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function minutesFromHHmm(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function hhmmFromISO(iso: string) {
  const t = iso.split("T")[1] || "";
  const hh = t.slice(0, 2);
  const mm = t.slice(3, 5);
  return `${hh}:${mm}`;
}

function minutesFromISO(iso: string) {
  return minutesFromHHmm(hhmmFromISO(iso));
}

function snapMinute(minute: number, step = 5) {
  return Math.round(minute / step) * step;
}

function toISO(date: string, minuteOfDay: number) {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  return `${date}T${pad2(h)}:${pad2(m)}:00`;
}

function toStartAtISO(date: string, time: string) {
  const t = (time || "10:00").slice(0, 5);
  return `${date}T${t}:00`;
}

function MetricCard({
  title,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  const toneCls =
    tone === "danger"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-center justify-between">
      <div>
        <div className="text-xs tracking-wide text-gray-500 uppercase">{title}</div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-3xl font-extrabold text-gray-900">{value}</div>
          {sub ? <div className={`text-xs px-2 py-1 rounded-full border ${toneCls}`}>{sub}</div> : null}
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700">
        {icon}
      </div>
    </div>
  );
}

function StatusPill({ status, conflict }: { status: string; conflict: boolean }) {
  if (conflict) {
    return (
      <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">
        <WarningAmber fontSize="inherit" />
        Xung đột
      </div>
    );
  }

  const cls =
    status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "CANCELLED"
      ? "bg-gray-100 text-gray-600 border-gray-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const label = status === "COMPLETED" ? "Hoàn tất" : status === "CANCELLED" ? "Đã hủy" : "SCHEDULED";
  return <div className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{label}</div>;
}

function DayDropZone({ id }: { id: "day-prev" | "day-next" }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const cls =
    id === "day-prev"
      ? `absolute left-0 top-0 bottom-0 w-10 ${isOver ? "bg-blue-100/70" : "bg-transparent"}`
      : `absolute right-0 top-0 bottom-0 w-10 ${isOver ? "bg-blue-100/70" : "bg-transparent"}`;

  return <div ref={setNodeRef} className={cls} />;
}

function DroppableRoomColumn({
  roomId,
  height,
  children,
}: {
  roomId: number;
  height: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `room:${roomId}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative border-r border-gray-200 bg-white ${isOver ? "bg-blue-50/40" : ""}`}
      style={{ height }}
    >
      {children}
    </div>
  );
}

function DraggableShowtimeCard({
  e,
  top,
  height,
  resolveUrl,
}: {
  e: any;
  top: number;
  height: number;
  resolveUrl: (raw?: string | null) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `event:${e.id}`,
    data: {
      eventId: e.id,
      roomId: e.resource,
      startISO: e.start,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.65 : 1,
    cursor: "grab",
  } as React.CSSProperties;

  const borderCls = e.conflict ? "border-red-300 ring-1 ring-red-200" : "border-gray-200";
  const src = resolveUrl(e.posterUrl ?? null);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`absolute left-3 right-3 rounded-2xl border ${borderCls} bg-white shadow-sm overflow-hidden select-none`}
      style={{ top, height, ...style }}
    >
      <div className="p-3 flex gap-3 h-full">
        <div className="w-16 min-w-16 h-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
          {src ? <img src={src} alt={e.text} className="w-full h-full object-cover" /> : null}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={`font-bold truncate ${e.conflict ? "text-red-700" : "text-gray-900"}`}>{e.text}</div>
              <div className={`text-xs mt-0.5 ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
              </div>
            </div>
            <StatusPill status={e.status} conflict={!!e.conflict} />
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-600">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
              <LocalOffer fontSize="inherit" />
              {Number.isFinite(Number(e.basePrice)) ? `${e.basePrice}` : "—"}
            </div>
            {e.conflict ? (
              <div className="inline-flex items-center gap-1 text-red-700 font-semibold">
                <WarningAmber fontSize="inherit" />
                Xung đột giờ
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShowtimeSchedulerScreen() {
  const qc = useQueryClient();

  const IMAGE_HOST = useMemo(() => (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(/\/+$/, ""), []);
  const IMAGE_BASE = useMemo(() => (IMAGE_HOST.endsWith("/media") ? IMAGE_HOST : `${IMAGE_HOST}/media`), [IMAGE_HOST]);

  const resolveUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return "";
      if (v.startsWith("http://") || v.startsWith("https://")) return v;

      const p = v.startsWith("/") ? v : `/${v}`;
      const finalUrl = p.startsWith("/media/") ? `${IMAGE_HOST}${p}` : `${IMAGE_BASE}${p}`;

      if (DEBUG) console.log("[IMG] raw:", raw, "->", finalUrl);
      return finalUrl;
    };
  }, [IMAGE_BASE, IMAGE_HOST]);

  const [cinemaId] = useState<number>(1);
  const [date, setDate] = useState<string>("2026-02-25");

  const qScheduler = useQuery({ ...ShowtimeSchedulerAdmin.getScheduler(cinemaId, date) });

  const payload = (qScheduler.data as any)?.data;
  const topMeta = (qScheduler.data as any)?.meta;
  const innerMeta = payload?.meta;

  const meta: SchedulerMeta =
    topMeta ?? innerMeta ?? { timelineStart: "08:00", timelineEnd: "23:00", totalConflicts: 0 };

  const resources = payload?.resources ?? [];
  const events = payload?.events ?? [];

  const pxPerMinute = 2.2;
  const startMinute = useMemo(() => minutesFromHHmm(meta.timelineStart || "08:00"), [meta.timelineStart]);
  const endMinute = useMemo(() => minutesFromHHmm(meta.timelineEnd || "23:00"), [meta.timelineEnd]);
  const timelineHeight = Math.max(0, (endMinute - startMinute) * pxPerMinute);

  const hours = useMemo(() => {
    const s = Math.floor(startMinute / 60);
    const e = Math.ceil(endMinute / 60);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [startMinute, endMinute]);

  const totalShowtimes = events.length;
  const totalConflicts = meta.totalConflicts ?? 0;

  const [toast, setToast] = useState<string | null>(null);

  const mMove = useMutation({
    mutationFn: async (p: { id: number; cinemaId: number; roomId: number; startAt: string }) => {
      log("[MOVE] call", p);
      return ShowtimeSchedulerAdmin.moveShowtime(p.id, { cinemaId: p.cinemaId, roomId: p.roomId, startAt: p.startAt }).queryFn();
    },
    onSuccess: async () => {
      setToast("Đã cập nhật suất chiếu");
      await qc.invalidateQueries({ queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any });
      window.setTimeout(() => setToast(null), 1200);
    },
    onError: async (err: any) => {
      const msg = err?.message || err?.response?.data?.message || "MOVE_FAILED";
      log("[MOVE] error", err);
      setToast(msg);
      await qc.invalidateQueries({ queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any });
      window.setTimeout(() => setToast(null), 1600);
    },
  });

  const [activeInfo, setActiveInfo] = useState<{ id: number; roomId: number; startISO: string } | null>(null);

  function onDragStart(ev: DragStartEvent) {
    const d = (ev.active.data.current || {}) as any;
    if (!d?.eventId) return;
    setActiveInfo({ id: d.eventId, roomId: d.roomId, startISO: d.startISO });
    log("[DND] start", { eventId: d.eventId, roomId: d.roomId, startISO: d.startISO });
  }

  function onDragEnd(ev: DragEndEvent) {
    const d = (ev.active.data.current || {}) as any;
    const overId = String(ev.over?.id ?? "");
    if (!d?.eventId || !activeInfo) {
      log("[DND] end: no-active");
      setActiveInfo(null);
      return;
    }

    let targetRoomId = activeInfo.roomId;
    let targetDate = date;

    if (overId.startsWith("room:")) {
      targetRoomId = Number(overId.split(":")[1]);
    } else if (overId === "day-prev") {
      targetDate = addDays(date, -1);
    } else if (overId === "day-next") {
      targetDate = addDays(date, 1);
    } else {
      log("[DND] end: invalid drop", { overId });
      setActiveInfo(null);
      return;
    }

    const origStartMin = minutesFromISO(activeInfo.startISO);
    const deltaMin = Math.round((ev.delta.y || 0) / pxPerMinute);
    let newStartMin = snapMinute(origStartMin + deltaMin, 5);
    newStartMin = Math.max(startMinute, Math.min(endMinute - 5, newStartMin));

    const startAt = toISO(targetDate, newStartMin);

    log("[DND] end", {
      overId,
      deltaY: ev.delta.y,
      deltaMin,
      from: { date, roomId: activeInfo.roomId, startISO: activeInfo.startISO },
      to: { date: targetDate, roomId: targetRoomId, startAt },
    });

    mMove.mutate({ id: activeInfo.id, cinemaId, roomId: targetRoomId, startAt });

    if (targetDate !== date) setDate(targetDate);
    setActiveInfo(null);
  }

  const [openCreate, setOpenCreate] = useState(false);
  const [openMoviePicker, setOpenMoviePicker] = useState(false);
  const [movieKeyword, setMovieKeyword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateForm>({
    roomId: 0,
    movieId: 0,
    time: "10:00",
    basePrice: 90000,
  });

  const qMovies = useQuery({ ...ShowtimeSchedulerAdmin.getMovies() });
  const movies: IAdminMovieOption[] = (qMovies.data as any)?.data ?? [];

  const selectedMovie = useMemo(() => movies.find((m) => m.id === form.movieId) ?? null, [movies, form.movieId]);

  const filteredMovies = useMemo(() => {
    const key = movieKeyword.trim().toLowerCase();
    if (!key) return movies;
    return movies.filter((m) => (m.title || "").toLowerCase().includes(key));
  }, [movies, movieKeyword]);

  const mCreate = useMutation({
    mutationFn: async (p: { cinemaId: number; roomId: number; movieId: number; startAt: string; basePrice: number }) => {
      log("[CREATE] call", p);
      return ShowtimeSchedulerAdmin.createShowtime(p).queryFn();
    },
    onSuccess: async () => {
      setFormError(null);
      setOpenCreate(false);
      setOpenMoviePicker(false);
      await qc.invalidateQueries({ queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any });
    },
    onError: (err: any) => {
      const msg = err?.message || err?.response?.data?.message || "CREATE_FAILED";
      log("[CREATE] error", err);
      setFormError(msg);
    },
  });

  function openCreateModal() {
    const firstRoomId = resources?.[0]?.id ?? 0;
    setForm((prev) => ({ ...prev, roomId: prev.roomId || firstRoomId }));
    setFormError(null);
    setOpenCreate(true);
  }

  function submitCreate() {
    const roomId = Number(form.roomId);
    const movieId = Number(form.movieId);
    const basePrice = Number(form.basePrice);

    if (!cinemaId || cinemaId <= 0) return setFormError("INVALID_CINEMA");
    if (!roomId || roomId <= 0) return setFormError("Vui lòng chọn phòng");
    if (!movieId || movieId <= 0) return setFormError("Vui lòng chọn phim");
    if (!form.time) return setFormError("Vui lòng chọn giờ bắt đầu");
    if (!Number.isFinite(basePrice) || basePrice <= 0) return setFormError("Giá vé không hợp lệ");

    const startAt = toStartAtISO(date, form.time);
    mCreate.mutate({ cinemaId, roomId, movieId, startAt, basePrice });
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="px-8 pt-8 pb-5 border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Lịch Suất Chiếu</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý và sắp xếp lịch chiếu phim tại các phòng</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold">
              <Download fontSize="small" />
              Xuất Excel
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm"
            >
              <Add fontSize="small" />
              Thêm Suất Chiếu
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Tổng suất chiếu" value={`${totalShowtimes}`} sub="+—" icon={<EventNote fontSize="small" />} />
          <MetricCard title="Tỷ lệ lấp đầy" value="—" sub="+—" icon={<ConfirmationNumber fontSize="small" />} />
          <MetricCard title="Doanh thu dự kiến" value="—" sub="+—" icon={<LocalOffer fontSize="small" />} />
          <MetricCard
            title="Cảnh báo trùng lặp"
            value={`${totalConflicts}`}
            sub={totalConflicts > 0 ? "Cần xử lý" : "OK"}
            icon={<WarningAmber fontSize="small" />}
            tone={totalConflicts > 0 ? "danger" : "success"}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <button className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600" onClick={() => setDate((d) => addDays(d, -1))}>
              <ChevronLeft fontSize="small" />
            </button>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <CalendarMonth fontSize="small" />
              {date}
            </div>
            <button className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600" onClick={() => setDate((d) => addDays(d, 1))}>
              <ChevronRight fontSize="small" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-gray-200 bg-white p-1">
              <button className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold flex items-center gap-2">
                <ViewDay fontSize="small" />
                Ngày
              </button>
              <button className="px-3 py-2 rounded-lg text-gray-700 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50">
                <ViewWeek fontSize="small" />
                Tuần
              </button>
              <button className="px-3 py-2 rounded-lg text-gray-700 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50">
                <Timeline fontSize="small" />
                Timeline
              </button>
            </div>

            <button className="h-11 w-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700">
              <FilterAlt fontSize="small" />
            </button>
            <button className="h-11 w-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700">
              <Settings fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="relative" style={{ height: "calc(100vh - 220px)" }}>
            <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
              <div className="h-full overflow-auto relative bg-white">
                <DayDropZone id="day-prev" />
                <DayDropZone id="day-next" />

                <div
                  className="min-w-[1100px]"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `96px repeat(${resources.length || 1}, 280px)`,
                  }}
                >
                  <div className="sticky top-0 z-20 bg-white border-b border-gray-200" />
                  {(resources.length ? resources : [{ id: 0, name: "—", type: null, totalSeats: 0 }]).map((r: any) => (
                    <div key={r.id} className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {r.type ?? "—"} • {r.totalSeats ?? 0} ghế
                          </div>
                        </div>
                        <div className="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                          {(r.type ?? "2D").toString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="relative border-r border-gray-200 bg-white" style={{ height: timelineHeight }}>
                    {hours.map((hour) => {
                      const top = (hour * 60 - startMinute) * pxPerMinute;
                      return (
                        <div key={hour} className="absolute left-0 right-0" style={{ top }}>
                          <div className="text-xs text-gray-500 px-3 -translate-y-2">{pad2(hour)}:00</div>
                          <div className="h-px bg-gray-200" />
                        </div>
                      );
                    })}
                  </div>

                  {(resources.length ? resources : [{ id: 0 }]).map((r: any) => (
                    <DroppableRoomColumn key={`col-${r.id}`} roomId={r.id} height={timelineHeight}>
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 h-px bg-gray-100"
                          style={{ top: (hour * 60 - startMinute) * pxPerMinute }}
                        />
                      ))}

                      {events
                        .filter((e: any) => e.resource === r.id)
                        .map((e: any) => {
                          const sMin = minutesFromISO(e.start);
                          const eMin = minutesFromISO(e.end);
                          const top = (sMin - startMinute) * pxPerMinute;
                          const height = Math.max(56, (eMin - sMin) * pxPerMinute);

                          return (
                            <DraggableShowtimeCard
                              key={e.id}
                              e={e}
                              top={top}
                              height={height}
                              resolveUrl={resolveUrl}
                            />
                          );
                        })}
                    </DroppableRoomColumn>
                  ))}
                </div>

                {qScheduler.isLoading ? <div className="p-6 text-sm text-gray-500">Đang tải lịch...</div> : null}
                {qScheduler.isError ? <div className="p-6 text-sm text-red-600">Lỗi tải lịch. Kiểm tra API / quyền truy cập.</div> : null}
              </div>
            </DndContext>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center"
        >
          <Add />
        </button>

        {toast ? (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-md text-sm">
            {toast}
          </div>
        ) : null}
      </div>

      {openCreate ? (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30" onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)} />
          <div className="absolute left-1/2 top-1/2 w-[860px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="font-extrabold text-gray-900">Thêm Suất Chiếu</div>
              <button className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600" onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}>
                <Close fontSize="small" />
              </button>
            </div>

            <div className="p-4 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Phòng</div>
                  <select
                    value={form.roomId}
                    onChange={(e) => setForm((p) => ({ ...p, roomId: Number(e.target.value) }))}
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
                  <div className="text-xs font-semibold text-gray-600 mb-1">Giờ bắt đầu</div>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Ngày</div>
                  <input value={date} disabled className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-1">Giá vé</div>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setForm((p) => ({ ...p, basePrice: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Phim</div>
                <button
                  type="button"
                  onClick={() => {
                    setMovieKeyword("");
                    setOpenMoviePicker(true);
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 px-3 py-3 flex items-center gap-3"
                >
                  <div className="h-14 w-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden">
                    {selectedMovie?.posterUrl ? (
                      <img src={resolveUrl(selectedMovie.posterUrl)} alt={selectedMovie.title} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-bold text-gray-900 truncate">{selectedMovie ? selectedMovie.title : "Chọn phim"}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {selectedMovie ? `${selectedMovie.durationMinutes} phút • ${selectedMovie.status}` : "Nhấn để chọn phim có poster"}
                    </div>
                  </div>

                  <div className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                    {selectedMovie ? `#${selectedMovie.id}` : "Select"}
                  </div>
                </button>
              </div>

              {formError ? <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{formError}</div> : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold"
                  onClick={() => !mCreate.isPending && !openMoviePicker && setOpenCreate(false)}
                  disabled={mCreate.isPending || openMoviePicker}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm"
                  onClick={submitCreate}
                  disabled={mCreate.isPending || openMoviePicker}
                >
                  {mCreate.isPending ? "Đang tạo..." : "Tạo suất"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {openMoviePicker ? (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/35" onClick={() => setOpenMoviePicker(false)} />
          <div className="absolute left-1/2 top-1/2 w-[920px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="font-extrabold text-gray-900">Chọn phim</div>
              <button className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600" onClick={() => setOpenMoviePicker(false)}>
                <Close fontSize="small" />
              </button>
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <Search fontSize="small" />
                <input value={movieKeyword} onChange={(e) => setMovieKeyword(e.target.value)} className="w-full outline-none text-sm bg-white" placeholder="Tìm theo tên phim..." />
              </div>

              <div className="mt-3 h-[420px] overflow-auto rounded-2xl border border-gray-200 bg-white">
                {qMovies.isLoading ? (
                  <div className="p-4 text-sm text-gray-500 bg-white">Đang tải phim...</div>
                ) : qMovies.isError ? (
                  <div className="p-4 text-sm text-red-600 bg-white">Không tải được danh sách phim.</div>
                ) : filteredMovies.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 bg-white">Không có phim phù hợp.</div>
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
                            {src ? <img src={src} alt={m.title} className="h-full w-full object-cover" /> : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate">{m.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {m.durationMinutes} phút • {m.status}
                            </div>
                          </div>

                          {active ? (
                            <div className="text-emerald-600 inline-flex items-center gap-1 text-sm font-semibold">
                              <CheckCircle fontSize="small" />
                              Đã chọn
                            </div>
                          ) : (
                            <div className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">#{m.id}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold" onClick={() => setOpenMoviePicker(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}