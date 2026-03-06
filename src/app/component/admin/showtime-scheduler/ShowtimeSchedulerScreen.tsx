"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  EditOutlined,
  SaveOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  IAdminMovieOption,
  ShowtimeSchedulerAdmin,
} from "@/types/data/showtime-scheduler";

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

type ActiveInfo = { id: number; roomId: number; startISO: string };

const CLEANUP_MINUTES = 10;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function todayYMD() {
  const dt = new Date();
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
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
function parseLocalIso(iso: string) {
  const [d, t = "00:00:00"] = String(iso).split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map((v) => Number(v || 0));
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0, 0);
}
function isPastOrNowISO(iso: string) {
  return parseLocalIso(iso).getTime() <= Date.now();
}
function getErrMsg(err: any) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.response?.data?.error ||
    err?.message;
  return typeof msg === "string" && msg.trim() ? msg : "Có lỗi xảy ra.";
}
function calcDurationMs(startISO: string, endISO: string) {
  const s = parseLocalIso(startISO).getTime();
  const e = parseLocalIso(endISO).getTime();
  return Math.max(0, e - s);
}
function addMsToIso(baseISO: string, ms: number) {
  const d = parseLocalIso(baseISO);
  d.setTime(d.getTime() + ms);
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${y}-${m}-${da}T${hh}:${mm}:${ss}`;
}
function addMinutesToIso(baseISO: string, minutes: number) {
  return addMsToIso(baseISO, minutes * 60 * 1000);
}
function toLocalDateTimeInputValue(iso?: string | null) {
  const v = String(iso ?? "");
  if (!v) return "";
  const [d, t = "00:00:00"] = v.split("T");
  return `${d}T${t.slice(0, 5)}`;
}
function fromLocalDateTimeInputValue(v: string) {
  const s = String(v || "").trim();
  if (!s) return "";
  return s.length === 16 ? `${s}:00` : s;
}

const STATUS_VI: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};
function statusVi(raw?: string | null) {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  return STATUS_VI[s] ?? (s ? s : "—");
}

function normToken(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, " ");
}
function tokenizeList(raw?: string | null) {
  const v = String(raw ?? "").trim();
  if (!v) return [];
  return v.split(",").map(normToken).filter(Boolean);
}
const TOKEN_ALIAS: Record<string, string> = { "ULTRA 4DX": "4DX" };
function aliasToken(t: string) {
  return TOKEN_ALIAS[t] ?? t;
}
function makeTokenSet(raw?: string | null) {
  const set = new Set<string>();
  for (const t of tokenizeList(raw)) set.add(aliasToken(t));
  return set;
}
function canRoomPlayMovie(
  roomType?: string | null,
  movieFormat?: string | null,
) {
  const roomTokens = makeTokenSet(roomType);
  const movieTokens = makeTokenSet(movieFormat);

  if (roomTokens.size === 0) return false;
  if (movieTokens.size === 0) return true;

  const has2D = movieTokens.has("2D");
  const hasOther = Array.from(movieTokens).some((t) => t !== "2D");
  if (has2D && !hasOther) return true;

  for (const t of movieTokens) {
    if (t === "2D") continue;
    if (roomTokens.has(t)) return true;
  }
  return false;
}

const TOAST_ID = "singleton-toast";
function notify(opts: {
  type: "success" | "error" | "warning" | "info";
  title: string;
  desc?: string;
}) {
  const icon =
    opts.type === "success" ? (
      <CheckCircle fontSize="small" />
    ) : opts.type === "warning" ? (
      <WarningAmber fontSize="small" />
    ) : opts.type === "error" ? (
      <WarningAmber fontSize="small" />
    ) : (
      <InfoOutlined fontSize="small" />
    );

  const tone =
    opts.type === "success"
      ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-emerald-900"
      : opts.type === "warning"
        ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 text-amber-900"
        : opts.type === "error"
          ? "border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 text-red-900"
          : "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50 text-blue-900";

  const bar =
    opts.type === "success"
      ? "bg-emerald-500"
      : opts.type === "warning"
        ? "bg-amber-500"
        : opts.type === "error"
          ? "bg-red-500"
          : "bg-blue-500";

  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.985 }}
        transition={{ duration: 0.18 }}
        className={`w-[420px] max-w-[92vw] rounded-2xl border ${tone} shadow-xl overflow-hidden`}
      >
        <div className="p-3 flex items-start gap-3">
          <div className="mt-0.5 h-10 w-10 rounded-xl bg-white/85 border border-black/5 flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-sm truncate">{opts.title}</div>
            {opts.desc ? (
              <div className="mt-1 text-xs opacity-90 leading-5">
                {opts.desc}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t)}
            className="h-10 w-10 rounded-xl bg-white/85 border border-black/5 hover:bg-white flex items-center justify-center"
            aria-label="Close toast"
          >
            <Close fontSize="small" />
          </button>
        </div>
        <div className="h-[3px] bg-black/10">
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 2.5, ease: "linear" }}
            className={`h-full ${bar} origin-left`}
          />
        </div>
      </motion.div>
    ),
    { id: TOAST_ID, duration: 2600 },
  );
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-center justify-between"
    >
      <div>
        <div className="text-xs tracking-wide text-gray-500 uppercase">
          {title}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-3xl font-extrabold text-gray-900">{value}</div>
          {sub ? (
            <div className={`text-xs px-2 py-1 rounded-full border ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700">
        {icon}
      </div>
    </motion.div>
  );
}

function StatusPill({
  status,
  conflict,
}: {
  status: string;
  conflict: boolean;
}) {
  if (conflict) {
    return (
      <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">
        <WarningAmber fontSize="inherit" />
        Xung đột
      </div>
    );
  }

  const s = String(status ?? "")
    .trim()
    .toUpperCase();
  const cls =
    s === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "CANCELLED"
        ? "bg-gray-100 text-gray-600 border-gray-200"
        : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
      {statusVi(s)}
    </div>
  );
}

function DayDropZone({ id }: { id: "day-prev" | "day-next" }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const base =
    id === "day-prev"
      ? "absolute left-0 top-0 bottom-0 w-10"
      : "absolute right-0 top-0 bottom-0 w-10";
  return (
    <div
      ref={setNodeRef}
      className={`${base} ${isOver ? "bg-blue-100/70 pointer-events-auto" : "pointer-events-none bg-transparent"}`}
    />
  );
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

function StartMarker({ top, label }: { top: number; label: string }) {
  // ✅ đẩy vạch lên cao hơn card 6px để “đỡ sát”
  const y = top - 6;
  return (
    <div
      className="absolute left-0 right-0 z-[6] pointer-events-none"
      style={{ top: y }}
    >
      <div className="relative">
        <div className="h-[2px] bg-red-500/90" />
        <div className="absolute left-2 -top-3 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow">
          {label}
        </div>
      </div>
    </div>
  );
}

function ShowtimeCardBody({
  e,
  resolveUrl,
  dense,
}: {
  e: any;
  resolveUrl: (raw?: string | null) => string;
  dense?: boolean;
}) {
  const src = resolveUrl(e.posterUrl ?? null);
  const borderCls = e.conflict
    ? "border-red-300 ring-1 ring-red-200"
    : "border-gray-200";

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl border ${borderCls} bg-white shadow-sm overflow-hidden select-none hover:shadow-md`}
    >
      <div className={`p-4 flex gap-4 ${dense ? "h-[104px]" : "h-full"}`}>
        <div className="w-20 min-w-20 h-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
          {src ? (
            <img
              src={src}
              alt={e.text}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div
                className={`font-extrabold truncate ${e.conflict ? "text-red-700" : "text-gray-900"}`}
              >
                {e.text}
              </div>
              <div
                className={`text-sm mt-0.5 ${e.conflict ? "text-red-600" : "text-gray-600"}`}
              >
                {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
              </div>
            </div>
            <StatusPill status={e.status} conflict={!!e.conflict} />
          </div>

          <div className="mt-auto pt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
              <LocalOffer fontSize="inherit" />
              {Number.isFinite(Number(e.basePrice)) ? `${e.basePrice}` : "—"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function computeDropMove(input: {
  overId: string;
  date: string;
  active: ActiveInfo;
  pxPerMinute: number;
  deltaY: number;
  startMinute: number;
  endMinute: number;
}) {
  const { overId, date, active, pxPerMinute, deltaY, startMinute, endMinute } =
    input;

  let targetRoomId = active.roomId;
  let targetDate = date;

  if (overId.startsWith("room:")) {
    targetRoomId = Number(overId.split(":")[1]);
  } else if (overId === "day-prev") {
    targetDate = addDays(date, -1);
  } else if (overId === "day-next") {
    targetDate = addDays(date, 1);
  } else {
    return null;
  }

  const origStartMin = minutesFromISO(active.startISO);
  const deltaMin = Math.round((deltaY || 0) / pxPerMinute);
  let newStartMin = snapMinute(origStartMin + deltaMin, 5);
  newStartMin = Math.max(startMinute, Math.min(endMinute - 5, newStartMin));

  const startAt = toISO(targetDate, newStartMin);
  return { targetRoomId, targetDate, startAt };
}

export default function ShowtimeSchedulerScreen() {
  const qc = useQueryClient();

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

  const [cinemaId] = useState<number>(1);
  const [date, setDate] = useState<string>(() => todayYMD());

  const schedulerKey = useMemo(
    () => [ShowtimeSchedulerAdmin.queryKeys.scheduler, cinemaId, date] as const,
    [cinemaId, date],
  );

  const qScheduler = useQuery({
    ...ShowtimeSchedulerAdmin.getScheduler(cinemaId, date),
  });
  const payload = (qScheduler.data as any)?.data;
  const metaTop = (qScheduler.data as any)?.meta;

  const meta: SchedulerMeta = metaTop ?? {
    timelineStart: "08:00",
    timelineEnd: "23:00",
    totalConflicts: 0,
  };
  const resources = payload?.resources ?? [];
  const events = payload?.events ?? [];

  const pxPerMinute = 2.2;
  const startMinute = useMemo(
    () => minutesFromHHmm(meta.timelineStart || "08:00"),
    [meta.timelineStart],
  );
  const endMinute = useMemo(
    () => minutesFromHHmm(meta.timelineEnd || "23:00"),
    [meta.timelineEnd],
  );
  const timelineHeight = Math.max(0, (endMinute - startMinute) * pxPerMinute);

  const hours = useMemo(() => {
    const s = Math.floor(startMinute / 60);
    const e = Math.ceil(endMinute / 60);
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  }, [startMinute, endMinute]);

  const roomById = useMemo(() => {
    const m = new Map<number, any>();
    for (const r of resources) m.set(Number(r.id), r);
    return m;
  }, [resources]);

  const [activeInfo, setActiveInfo] = useState<ActiveInfo | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeEvent = useMemo(
    () =>
      activeId ? (events.find((x: any) => x?.id === activeId) ?? null) : null,
    [activeId, events],
  );

  const pendingNextDateRef = useRef<string | null>(null);

  // ===== DETAIL / EDIT =====
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<number>(0);
  const [detailEdit, setDetailEdit] = useState(false);
  const [detailErr, setDetailErr] = useState<string | null>(null);
  const pendingAutoEditRef = useRef(false);

  const hasDetailApi =
    typeof (ShowtimeSchedulerAdmin as any).getShowtimeDetail === "function";
  const hasEditApi =
    typeof (ShowtimeSchedulerAdmin as any).editShowtime === "function";

  const qDetail = useQuery({
    ...(hasDetailApi
      ? (ShowtimeSchedulerAdmin as any).getShowtimeDetail(detailId, cinemaId)
      : {}),
    enabled: openDetail && detailId > 0 && hasDetailApi,
  });

  const detail = (qDetail.data as any)?.data ?? null;

  const [editForm, setEditForm] = useState<{
    roomId: number;
    movieId: number;
    startAt: string;
    basePrice: number;
  }>({ roomId: 0, movieId: 0, startAt: "", basePrice: 0 });

  const [detailMovieKeyword, setDetailMovieKeyword] = useState("");

  function openDetailModal(id: number, autoEdit = false) {
    setDetailId(Number(id));
    setDetailErr(null);
    setDetailEdit(false);
    pendingAutoEditRef.current = autoEdit;
    setDetailMovieKeyword("");
    setOpenDetail(true);
  }

  function closeDetailModal() {
    setOpenDetail(false);
    setDetailEdit(false);
    setDetailErr(null);
    pendingAutoEditRef.current = false;
  }

  function initEditFromDetail(d: any) {
    setEditForm({
      roomId: Number(d.roomId || 0),
      movieId: Number(d.movieId || 0),
      startAt: String(d.startAt || ""),
      basePrice: Number(d.basePrice || 0),
    });
  }

  function startEditNow() {
    if (!detail) return;
    initEditFromDetail(detail);
    setDetailErr(null);
    setDetailEdit(true);
  }

  useEffect(() => {
    if (!openDetail || !detail) return;

    if (pendingAutoEditRef.current) {
      pendingAutoEditRef.current = false;
      startEditNow();
      return;
    }

    if (!detailEdit) {
      initEditFromDetail(detail);
    }
  }, [openDetail, detail, detailEdit]);

  const detailRoomType = useMemo(() => {
    const rid = Number(editForm.roomId || detail?.roomId || 0);
    const r = resources.find((x: any) => Number(x.id) === rid) ?? null;
    return r?.type
      ? String(r.type).trim()
      : String(detail?.roomType ?? "").trim() || null;
  }, [editForm.roomId, detail, resources]);

  const qDetailMovies = useQuery({
    ...ShowtimeSchedulerAdmin.getMovies(detailMovieKeyword, detailRoomType),
    enabled: openDetail,
  });
  const detailMovies: IAdminMovieOption[] =
    (qDetailMovies.data as any)?.data ?? [];

  const previewMovie = useMemo(() => {
    if (!detailEdit) return null;
    const mid = Number(editForm.movieId || 0);
    if (!mid) return null;
    return detailMovies.find((m) => Number(m.id) === mid) ?? null;
  }, [detailEdit, editForm.movieId, detailMovies]);

  const previewTitle = previewMovie?.title ?? detail?.movieTitle ?? "";
  const previewPoster = previewMovie?.posterUrl ?? detail?.posterUrl ?? null;
  const previewFormat = previewMovie?.format ?? detail?.movieFormat ?? null;
  const previewDuration =
    previewMovie?.durationMinutes ?? detail?.durationMinutes ?? 0;

  const previewStartAt = detailEdit
    ? editForm.startAt || detail?.startAt
    : detail?.startAt;
  const previewEndAt = useMemo(() => {
    const sa = String(previewStartAt ?? "");
    if (!sa) return String(detail?.endAt ?? "");
    const dur = Number(previewDuration || 0);
    if (!dur) return String(detail?.endAt ?? "");
    return addMinutesToIso(sa, dur + CLEANUP_MINUTES);
  }, [previewStartAt, previewDuration, detail?.endAt]);

  const mEdit = useMutation({
    mutationFn: async (p: {
      id: number;
      cinemaId: number;
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }) => {
      if (!hasEditApi) throw new Error("EDIT_API_NOT_IMPLEMENTED");
      return (ShowtimeSchedulerAdmin as any)
        .editShowtime(p.id, {
          cinemaId: p.cinemaId,
          roomId: p.roomId,
          movieId: p.movieId,
          startAt: p.startAt,
          basePrice: p.basePrice,
        })
        .queryFn();
    },
    onSuccess: async () => {
      setDetailErr(null);

      const detailKey = [
        ShowtimeSchedulerAdmin.queryKeys.detail,
        detailId,
        cinemaId,
      ] as any;

      // 1) invalidate + refetch detail ngay lập tức
      await qc.invalidateQueries({ queryKey: detailKey });
      await qc.refetchQueries({ queryKey: detailKey });

      // 2) invalidate + refetch scheduler (để đồng bộ list)
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      await qc.refetchQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });

      // 3) sau khi detail đã refetch, lấy data mới từ cache để cập nhật local editForm/preview
      const fresh = qc.getQueryData<any>(detailKey)?.data;
      if (fresh) {
        initEditFromDetail(fresh);
      }

      setDetailEdit(false);

      notify({
        type: "success",
        title: "Đã lưu thay đổi",
        desc: "Chi tiết đã được đồng bộ ngay.",
      });
    },
  });

  function saveEdit() {
    const rid = Number(editForm.roomId);
    const mid = Number(editForm.movieId);
    const bp = Number(editForm.basePrice);
    const sa = String(editForm.startAt || "").trim();

    if (!rid) return setDetailErr("Vui lòng chọn phòng");
    if (!mid) return setDetailErr("Vui lòng chọn phim");
    if (!sa) return setDetailErr("Vui lòng chọn thời gian bắt đầu");
    if (!Number.isFinite(bp) || bp <= 0)
      return setDetailErr("Giá vé không hợp lệ");
    if (isPastOrNowISO(sa))
      return setDetailErr("Không thể chỉnh sửa vào khung giờ đã trôi qua.");

    const room = resources.find((x: any) => Number(x.id) === rid) ?? null;
    const movie = detailMovies.find((m) => Number(m.id) === mid) ?? null;

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

  // ===== MOVE (DND) =====
  const mMove = useMutation({
    mutationFn: async (p: {
      id: number;
      cinemaId: number;
      roomId: number;
      startAt: string;
      targetDate: string;
    }) => {
      return ShowtimeSchedulerAdmin.moveShowtime(p.id, {
        cinemaId: p.cinemaId,
        roomId: p.roomId,
        startAt: p.startAt,
      }).queryFn();
    },
    onMutate: async (vars) => {
      pendingNextDateRef.current =
        vars.targetDate !== date ? vars.targetDate : null;

      await qc.cancelQueries({ queryKey: schedulerKey as any });
      const prev = qc.getQueryData<any>(schedulerKey as any);
      const oldEvents = prev?.data?.events as any[] | undefined;
      if (!oldEvents) return { prev };

      const cur = oldEvents.find((x) => x?.id === vars.id);
      if (!cur) return { prev };

      const durMs = calcDurationMs(cur.start, cur.end);
      const nextEnd = addMsToIso(vars.startAt, durMs);

      const nextEvents = oldEvents.map((e) =>
        e.id === vars.id
          ? { ...e, resource: vars.roomId, start: vars.startAt, end: nextEnd }
          : e,
      );

      qc.setQueryData<any>(schedulerKey as any, (old) => {
        if (!old?.data) return old;
        return { ...old, data: { ...old.data, events: nextEvents } };
      });

      return { prev };
    },
    onSuccess: async () => {
      notify({
        type: "success",
        title: "Cập nhật thành công",
        desc: "Lịch đã được đồng bộ.",
      });
      const nextDate = pendingNextDateRef.current;
      pendingNextDateRef.current = null;
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      if (nextDate && nextDate !== date) setDate(nextDate);
    },
    onError: async (err: any, _vars, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(schedulerKey as any, ctx.prev);
      pendingNextDateRef.current = null;
      notify({
        type: "error",
        title: "Không thể cập nhật",
        desc: getErrMsg(err),
      });
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
    },
  });

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
      (activeEvent as any)?.movie?.format ??
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

  // ===== CREATE =====
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

  const selectedRoom = useMemo(() => {
    return (
      resources.find((r: any) => Number(r.id) === Number(form.roomId)) ?? null
    );
  }, [resources, form.roomId]);

  const roomTypeParam = useMemo(() => {
    const t = selectedRoom?.type;
    return t ? String(t).trim() : null;
  }, [selectedRoom]);

  const qMovies = useQuery({
    ...ShowtimeSchedulerAdmin.getMovies(movieKeyword, roomTypeParam),
  });
  const movies: IAdminMovieOption[] = (qMovies.data as any)?.data ?? [];

  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === form.movieId) ?? null,
    [movies, form.movieId],
  );

  const filteredMovies = useMemo(() => {
    const key = movieKeyword.trim().toLowerCase();
    if (!key) return movies;
    return movies.filter((m) => (m.title || "").toLowerCase().includes(key));
  }, [movies, movieKeyword]);

  const mCreate = useMutation({
    mutationFn: async (p: {
      cinemaId: number;
      roomId: number;
      movieId: number;
      startAt: string;
      basePrice: number;
    }) => {
      return ShowtimeSchedulerAdmin.createShowtime(p).queryFn();
    },
    onSuccess: async () => {
      setFormError(null);
      setOpenCreate(false);
      setOpenMoviePicker(false);
      await qc.invalidateQueries({
        queryKey: [ShowtimeSchedulerAdmin.queryKeys.scheduler] as any,
      });
      notify({
        type: "success",
        title: "Đã tạo suất chiếu",
        desc: "Suất chiếu mới đã được thêm.",
      });
    },
    onError: (err: any) => {
      setFormError(getErrMsg(err));
      notify({ type: "error", title: "Tạo thất bại", desc: getErrMsg(err) });
    },
  });

  function openCreateModal() {
    const firstRoomId = resources?.[0]?.id ?? 0;
    setForm((prev) => ({
      ...prev,
      roomId: prev.roomId || firstRoomId,
      movieId: 0,
    }));
    setMovieKeyword("");
    setFormError(null);
    setOpenCreate(true);
  }

  function onRoomChange(nextRoomId: number) {
    setForm((p) => ({ ...p, roomId: nextRoomId, movieId: 0 }));
    setFormError(null);
    setMovieKeyword("");
    if (openMoviePicker) {
      setOpenMoviePicker(false);
      window.setTimeout(() => setOpenMoviePicker(true), 0);
    }
  }

  function submitCreate() {
    const roomId = Number(form.roomId);
    const movieId = Number(form.movieId);
    const basePrice = Number(form.basePrice);

    if (!cinemaId || cinemaId <= 0)
      return setFormError("Dữ liệu rạp không hợp lệ.");
    if (!roomId || roomId <= 0) return setFormError("Vui lòng chọn phòng");
    if (!movieId || movieId <= 0) return setFormError("Vui lòng chọn phim");
    if (!form.time) return setFormError("Vui lòng chọn giờ bắt đầu");
    if (!Number.isFinite(basePrice) || basePrice <= 0)
      return setFormError("Giá vé không hợp lệ");

    const startAt = toStartAtISO(date, form.time);
    if (isPastOrNowISO(startAt))
      return setFormError(
        "Không thể tạo lịch chiếu vào thời gian đã trôi qua.",
      );

    const room = resources.find((x: any) => Number(x.id) === roomId) ?? null;
    const movie = movies.find((m) => Number(m.id) === movieId) ?? null;

    if (!canRoomPlayMovie(room?.type ?? null, movie?.format ?? null)) {
      return setFormError("Phòng không phù hợp với định dạng phim.");
    }

    mCreate.mutate({ cinemaId, roomId, movieId, startAt, basePrice });
  }

  // kéo trực tiếp từ card (không cần 6 chấm)
  const pressTimer = useRef<number | null>(null);
  const dragArmedRef = useRef(false);

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

  function DraggableCard({
    e,
    top,
    height,
  }: {
    e: any;
    top: number;
    height: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: `event:${e.id}`,
        data: { eventId: e.id, roomId: e.resource, startISO: e.start },
      });

    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0 : activeId === e.id ? 0 : 1,
      cursor: dragArmedRef.current ? "grabbing" : "pointer",
    } as React.CSSProperties;

    return (
      <div
        ref={setNodeRef}
        className="absolute left-3 right-3 z-[10]"
        style={{ top, height, ...style }}
        onMouseDown={armDrag}
        onMouseUp={disarmDrag}
        onMouseLeave={disarmDrag}
        onTouchStart={armDrag}
        onTouchEnd={disarmDrag}
        {...attributes}
        {...listeners}
        onClick={(ev) => {
          ev.preventDefault();
          if (isDragging) return;
          if (dragArmedRef.current) return;
          openDetailModal(Number(e.id), false);
        }}
      >
        <div className="relative">
          <button
            type="button"
            onPointerDown={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onMouseDown={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onTouchStart={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              openDetailModal(Number(e.id), true);
            }}
            className="absolute top-2 right-2 z-20 h-9 w-9 rounded-xl border border-gray-200 bg-white/95 hover:bg-white flex items-center justify-center text-gray-700 shadow-sm"
            aria-label="Edit"
          >
            <EditOutlined fontSize="small" />
          </button>

          <ShowtimeCardBody e={e} resolveUrl={resolveUrl} />
        </div>
      </div>
    );
  }

  const totalConflicts = meta.totalConflicts ?? 0;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Toaster position="bottom-center" richColors />

      <div className="px-8 pt-8 pb-5 border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Lịch Suất Chiếu</h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý và sắp xếp lịch chiếu phim tại các phòng
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Tổng suất chiếu"
            value={`${events.length}`}
            sub="+—"
            icon={<EventNote fontSize="small" />}
          />

          <div className="md:col-span-1 xl:col-span-3">
            <div className="h-full rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-600">
                    Lịch
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-gray-900">
                    <CalendarMonth fontSize="small" />
                    <span>{date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="h-11 w-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700"
                    onClick={() => setDate((d) => addDays(d, -1))}
                  >
                    <ChevronLeft fontSize="small" />
                  </button>

                  <button
                    className="h-11 w-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700"
                    onClick={() => setDate((d) => addDays(d, 1))}
                  >
                    <ChevronRight fontSize="small" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Điều hướng theo ngày để xem lịch suất chiếu
                </div>
                <div className="flex items-center gap-3">
                  {/* actions nếu cần */}
                </div>
              </div>
            </div>
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
                  className="min-w-[1250px]"
                  style={{
                    display: "grid",
                    gridTemplateColumns: `108px repeat(${resources.length || 1}, 320px)`,
                  }}
                >
                  <div className="sticky top-0 z-20 bg-white border-b border-gray-200" />
                  {(resources.length
                    ? resources
                    : [{ id: 0, name: "—", type: null, totalSeats: 0 }]
                  ).map((r: any) => (
                    <div
                      key={r.id}
                      className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-gray-900">
                            {r.name}
                          </div>
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

                  <div
                    className="relative border-r border-gray-200 bg-white"
                    style={{ height: timelineHeight }}
                  >
                    {hours.map((hour) => {
                      const top = (hour * 60 - startMinute) * pxPerMinute;
                      return (
                        <div
                          key={hour}
                          className="absolute left-0 right-0"
                          style={{ top }}
                        >
                          <div className="text-xs text-gray-500 px-3 -translate-y-2">
                            {pad2(hour)}:00
                          </div>
                          <div className="h-px bg-gray-200" />
                        </div>
                      );
                    })}
                  </div>

                  {(resources.length ? resources : [{ id: 0 }]).map(
                    (r: any) => (
                      <DroppableRoomColumn
                        key={`col-${r.id}`}
                        roomId={r.id}
                        height={timelineHeight}
                      >
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="absolute left-0 right-0 h-px bg-gray-100"
                            style={{
                              top: (hour * 60 - startMinute) * pxPerMinute,
                            }}
                          />
                        ))}

                        {events
                          .filter((e: any) => e.resource === r.id)
                          .map((e: any) => {
                            const sMin = minutesFromISO(e.start);
                            const eMin = minutesFromISO(e.end);
                            const top = (sMin - startMinute) * pxPerMinute;
                            const height = Math.max(
                              78,
                              (eMin - sMin) * pxPerMinute,
                            );

                            return (
                              <React.Fragment key={e.id}>
                                <StartMarker
                                  top={top}
                                  label={hhmmFromISO(e.start)}
                                />
                                <DraggableCard
                                  e={e}
                                  top={top}
                                  height={height}
                                />
                              </React.Fragment>
                            );
                          })}
                      </DroppableRoomColumn>
                    ),
                  )}
                </div>

                {qScheduler.isLoading ? (
                  <div className="p-6 text-sm text-gray-500">
                    Đang tải lịch...
                  </div>
                ) : null}
                {qScheduler.isError ? (
                  <div className="p-6 text-sm text-red-600">
                    Lỗi tải lịch. Kiểm tra API / quyền truy cập.
                  </div>
                ) : null}
              </div>

              <DragOverlay>
                {activeEvent ? (
                  <div className="w-[340px]">
                    <ShowtimeCardBody
                      e={activeEvent}
                      resolveUrl={resolveUrl}
                      dense
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center"
        >
          <Add />
        </button>
      </div>

      {/* CREATE MODAL */}
      {openCreate ? (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() =>
              !mCreate.isPending && !openMoviePicker && setOpenCreate(false)
            }
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 w-[860px] max-w-[96vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white border border-gray-200 shadow-xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="font-extrabold text-gray-900">
                Thêm Suất Chiếu
              </div>
              <button
                type="button"
                className="h-9 w-9 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-600"
                onClick={() =>
                  !mCreate.isPending && !openMoviePicker && setOpenCreate(false)
                }
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
                    if (!form.roomId)
                      return notify({
                        type: "warning",
                        title: "Chọn phòng trước",
                        desc: "Vui lòng chọn phòng để lọc phim.",
                      });
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
                    !mCreate.isPending &&
                    !openMoviePicker &&
                    setOpenCreate(false)
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
      ) : null}

      {/* MOVIE PICKER for CREATE */}
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
                Chọn phim{" "}
                {selectedRoom?.type ? `(lọc theo ${selectedRoom.type})` : ""}
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
                    Không có phim phù hợp với phòng{" "}
                    {selectedRoom?.type ?? "đã chọn"}.
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
                              {m.durationMinutes} phút • {m.status} •{" "}
                              {m.format ?? "—"}
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

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {openDetail ? (
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
                      disabled={
                        !detail ||
                        qDetail.isLoading ||
                        qDetail.isError ||
                        !hasEditApi
                      }
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
                  <div className="text-sm text-gray-500">
                    Đang tải chi tiết...
                  </div>
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
                            #{detail.id}
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
                                {previewDuration} phút •{" "}
                                {statusVi(detail.status)}
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
                              {detailEdit
                                ? editForm.basePrice
                                : detail.basePrice}
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
                                value={
                                  detailEdit ? editForm.roomId : detail.roomId
                                }
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
                                    {r.name} ({r.type ?? "—"} -{" "}
                                    {r.totalSeats ?? 0} ghế)
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
                                value={
                                  detailEdit
                                    ? editForm.basePrice
                                    : detail.basePrice
                                }
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
                                    ? toLocalDateTimeInputValue(
                                        editForm.startAt,
                                      )
                                    : toLocalDateTimeInputValue(detail.startAt)
                                }
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    startAt: fromLocalDateTimeInputValue(
                                      e.target.value,
                                    ),
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

                          {/* ✅ PHẦN CHỌN PHIM (lọc theo phòng) - KHÔNG BỊ LƯỢC BỎ */}
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
                                  onChange={(e) =>
                                    setDetailMovieKeyword(e.target.value)
                                  }
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
                                  value={
                                    detailEdit
                                      ? editForm.movieId
                                      : detail.movieId
                                  }
                                  onChange={(e) => {
                                    const nextMovieId = Number(
                                      e.target.value || 0,
                                    );
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
                                        {m.title} • {m.durationMinutes} phút •{" "}
                                        {m.status} • {m.format ?? "—"}
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
                                {mEdit.isPending
                                  ? "Đang lưu..."
                                  : "Lưu thay đổi"}
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
    </div>
  );
}
