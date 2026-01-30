"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Divider,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Be_Vietnam_Pro } from "next/font/google";
import { Tickets } from "@/types/data/tickets/tickets";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import type { ITicket } from "@/types/data/tickets/type";

type TabKey = "all" | "PENDING" | "PAID" | "CANCELLED";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chưa sử dụng" },
  { key: "PAID", label: "Đã sử dụng" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const norm = (s: string) => s.trim().toLowerCase();

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

const formatVnd = (value: number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
};

const splitSeats = (seats: string) =>
  (seats || "")
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const buildPosterSrc = (posterUrl: string) => {
  const fallback = "/poster/poster.jpg";
  if (!posterUrl) return fallback;
  if (/^https?:\/\//i.test(posterUrl)) return posterUrl;

  const base = (process.env.NEXT_PUBLIC_IMAGE_URL || "").replace(/\/$/, "");
  if (!base) return posterUrl.startsWith("/") ? posterUrl : `/${posterUrl}`;

  if (posterUrl.startsWith("/media/")) return `${base}${posterUrl}`;
  if (posterUrl.startsWith("media/")) return `${base}/${posterUrl}`;
  if (posterUrl.startsWith("/")) return `${base}/media${posterUrl}`;
  return `${base}/media/${posterUrl}`;
};

const toInt = (v: string | null, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
};

type PaymentStatus = "PAID" | "PENDING" | "CANCELLED" | "FAILED";

export default function TicketHistory({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<TabKey>("all");
  const [draft, setDraft] = useState(initialCode);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setDraft(initialCode);
  }, [initialCode]);

  const commit = (next: string) => {
    const v = next.trim();
    router.replace(v ? `/my-tickets/${encodeURIComponent(v)}` : `/my-tickets`);
  };

  const goDetail = (code: string) => {
    router.push(`/my-tickets/${encodeURIComponent(code)}`);
  };

  const page = toInt(searchParams.get("page"), 1);
  const perPage = toInt(searchParams.get("perPage"), 10);

  const searchValue = draft.trim();
  const isBookingCode = /^BK-/i.test(searchValue);
  const movieTitleFilter = isBookingCode ? "" : searchValue;

  const statusParam: PaymentStatus | undefined =
    tab === "all" ? undefined : (tab as "PENDING" | "PAID" | "CANCELLED");

  const ticketList = useQuery({
    ...Tickets.getAllTicketMe(
      page,
      perPage,
      movieTitleFilter || "",
      startDate || "",
      endDate || "",
      statusParam
    ),
    retry: false,
  });

  const raw = ticketList.data as any;
  const tickets = (raw?.data ?? []) as ITicket[];

  const filteredTickets = useMemo(() => {
    const q = norm(initialCode);
    return tickets.filter((t) => {
      const okTab =
        tab === "all" ||
        (tab === "PENDING" && t.status === "PENDING") ||
        (tab === "PAID" && t.status === "PAID") ||
        (tab === "CANCELLED" && t.status === "CANCELLED");

      if (!okTab) return false;
      if (!q) return true;

      const hay = `${t.bookingCode} ${t.movieTitle}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tab, initialCode, tickets]);

  return (
    <Box className={`min-h-screen bg-[#0B0C0F] text-white p-6 md:p-12 ${beVietnam.className} antialiased`}>
      <Box className="mx-auto max-w-5xl">
        <Typography
          component="h1"
          className="!text-left !text-3xl md:!text-4xl font-extrabold tracking-tight text-white !leading-[1.12] !mb-10 md:!mb-12"
          sx={{
            fontFamily: beVietnam.style.fontFamily,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Lịch sử Đặt Vé của bạn
        </Typography>

        <Box className="flex flex-col gap-4 sm:flex-row sm:items-stretch mb-8">
          <OutlinedInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(draft);
              if (e.key === "Escape") setDraft(initialCode);
            }}
            onBlur={() => {
              if (draft.trim() !== initialCode.trim()) commit(draft);
            }}
            placeholder="Tìm theo mã vé hoặc tên phim..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "rgba(255,255,255,0.3)" }} />
              </InputAdornment>
            }
            className="flex-1 rounded-xl bg-[#1A1C21] text-sm text-white"
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                border: "1px solid rgba(255,255,255,0.05)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "1px solid #ef4444",
              },
              input: { color: "white" },
            }}
          />

          <Button
            variant="contained"
            startIcon={<CalendarMonthIcon />}
            onClick={() => {
              const s = window.prompt("Nhập ngày bắt đầu (YYYY-MM-DD):", startDate || "");
              if (s === null) return;
              const e = window.prompt("Nhập ngày kết thúc (YYYY-MM-DD):", endDate || "");
              if (e === null) return;
              setStartDate(s.trim());
              setEndDate(e.trim());
            }}
            className="!rounded-xl !bg-[#15171C] !border !border-white/5 !px-6 !py-3 !text-sm !font-semibold !normal-case hover:!bg-[#ff0000] hover:!border-[#ff0000] hover:!text-white transition-all duration-300"
          >
            Lọc theo ngày
          </Button>
        </Box>

        <Box className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                tab === t.key
                  ? "bg-[#ff0000] text-white shadow-[0_4px_15px_rgba(255,0,0,0.3)]"
                  : "bg-[#1A1C21] text-white/40 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </Box>

        <Box className="space-y-6">
          {filteredTickets.map((ticket) => {
            const date = formatDate(ticket.startTime);
            const time = formatTime(ticket.startTime);
            const seatArr = splitSeats(ticket.seats);
            const posterSrc = buildPosterSrc(ticket.posterUrl);

            return (
              <Box
                key={ticket.id}
                onClick={() => goDetail(ticket.bookingCode)}
                className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-[#15171C] flex flex-col md:flex-row shadow-2xl transition hover:border-white/10"
              >
                <Box className="absolute top-4 right-4 z-10">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                      ticket.status === "PENDING"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                        : ticket.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {(ticket.statusLabel || ticket.status).toUpperCase()}
                  </span>
                </Box>

                <Box className="w-full md:w-52 h-64 md:h-auto shrink-0">
                  <img src={posterSrc} alt={ticket.movieTitle} className="h-full w-full object-cover" />
                </Box>

                <Box className="flex-1 p-6 flex flex-col justify-between">
                  <Box>
                    <Typography className="text-xl font-bold text-white pr-28 leading-tight">
                      {ticket.movieTitle}
                    </Typography>
                    <Typography className="text-xs text-white/40 mt-1 uppercase font-medium">
                      {ticket.cinemaName} • {ticket.roomName}
                    </Typography>

                    <Divider className="!border-white/5 !border-dashed !my-4" />

                    <Box className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
                      <Box>
                        <div className="text-[10px] font-bold text-white/20 uppercase">Ngày chiếu</div>
                        <div className="text-sm font-semibold text-white/80">{date}</div>
                      </Box>
                      <Box>
                        <div className="text-[10px] font-bold text-white/20 uppercase">Suất chiếu</div>
                        <div className="text-sm font-semibold text-white/80">{time}</div>
                      </Box>
                      <Box>
                        <div className="text-[10px] font-bold text-white/20 uppercase">Ghế</div>
                        <div className="text-sm font-semibold text-white/80">{seatArr.join(", ")}</div>
                      </Box>
                      <Box>
                        <div className="text-[10px] font-bold text-white/20 uppercase">Combo</div>
                        <div className="text-sm font-semibold text-white/80 truncate">Không</div>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="mt-8 flex items-end justify-between">
                    <Box className="flex flex-col gap-2">
                      <Box className="bg-white p-1.5 rounded-lg w-fit" onClick={(e) => e.stopPropagation()}>
                        <QRCodeSVG value={ticket.bookingCode} size={80} />
                      </Box>
                      <span className="font-mono text-[9px] tracking-widest text-white/20">{ticket.bookingCode}</span>
                    </Box>

                    <Box className="text-right">
                      <Typography className="text-[10px] font-bold text-white/20 uppercase mb-1">
                        Tổng tiền
                      </Typography>
                      <Typography
                        className={`text-2xl font-black mb-3 ${
                          ticket.status === "CANCELLED" ? "text-white/20 line-through" : "text-red-500"
                        }`}
                      >
                        {formatVnd(ticket.totalPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
