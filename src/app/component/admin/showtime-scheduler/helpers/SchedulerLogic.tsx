import React from "react";
import { CheckCircle, WarningAmber, InfoOutlined, Close } from "@mui/icons-material";
import { motion } from "framer-motion";
import { toast } from "sonner";

export type SchedulerMeta = {
  timelineStart: string;
  timelineEnd: string;
  totalConflicts: number;
};

export type CreateForm = {
  roomId: number;
  movieId: number;
  time: string;
  basePrice: number;
};

export type ActiveInfo = {
  id: number;
  roomId: number;
  startISO: string;
};

export const CLEANUP_MINUTES = 10;

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function todayYMD() {
  const dt = new Date();
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

export function minutesFromHHmm(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function hhmmFromISO(iso: string) {
  const t = iso.split("T")[1] || "";
  const hh = t.slice(0, 2);
  const mm = t.slice(3, 5);
  return `${hh}:${mm}`;
}

export function minutesFromISO(iso: string) {
  return minutesFromHHmm(hhmmFromISO(iso));
}

export function snapMinute(minute: number, step = 5) {
  return Math.round(minute / step) * step;
}

export function toISO(date: string, minuteOfDay: number) {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  return `${date}T${pad2(h)}:${pad2(m)}:00`;
}

export function toStartAtISO(date: string, time: string) {
  const t = (time || "10:00").slice(0, 5);
  return `${date}T${t}:00`;
}

export function parseLocalIso(iso: string) {
  const [d, t = "00:00:00"] = String(iso).split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map((v) => Number(v || 0));
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0, 0);
}

export function isPastOrNowISO(iso: string) {
  return parseLocalIso(iso).getTime() <= Date.now();
}

export function getErrMsg(err: any) {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.response?.data?.error ||
    err?.message;
  return typeof msg === "string" && msg.trim() ? msg : "Có lỗi xảy ra.";
}

export function calcDurationMs(startISO: string, endISO: string) {
  const s = parseLocalIso(startISO).getTime();
  const e = parseLocalIso(endISO).getTime();
  return Math.max(0, e - s);
}

export function addMsToIso(baseISO: string, ms: number) {
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

export function addMinutesToIso(baseISO: string, minutes: number) {
  return addMsToIso(baseISO, minutes * 60 * 1000);
}

export function toLocalDateTimeInputValue(iso?: string | null) {
  const v = String(iso ?? "");
  if (!v) return "";
  const [d, t = "00:00:00"] = v.split("T");
  return `${d}T${t.slice(0, 5)}`;
}

export function fromLocalDateTimeInputValue(v: string) {
  const s = String(v || "").trim();
  if (!s) return "";
  return s.length === 16 ? `${s}:00` : s;
}

const STATUS_VI: Record<string, string> = {
  SCHEDULED: "Đã lên lịch",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export function statusVi(raw?: string | null) {
  const s = String(raw ?? "").trim().toUpperCase();
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

export function canRoomPlayMovie(roomType?: string | null, movieFormat?: string | null) {
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

export function notify(opts: {
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
              <div className="mt-1 text-xs opacity-90 leading-5">{opts.desc}</div>
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

export function computeDropMove(input: {
  overId: string;
  date: string;
  active: ActiveInfo;
  pxPerMinute: number;
  deltaY: number;
  startMinute: number;
  endMinute: number;
}) {
  const { overId, date, active, pxPerMinute, deltaY, startMinute, endMinute } = input;

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