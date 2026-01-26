"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type TicketStatus = "completed" | "upcoming" | "cancelled";
type TabKey = "all" | "upcoming" | "completed" | "cancelled";

type Ticket = {
  id: string;
  movie: string;
  date: string;
  time: string;
  cinema: string;
  room: string;
  seats: string[];
  combos: string;
  total: string;
  status: TicketStatus;
  poster: string;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "upcoming", label: "Chưa sử dụng" },
  { key: "completed", label: "Đã sử dụng" },
  { key: "cancelled", label: "Đã hủy" },
];

const TICKETS: Ticket[] = [
  {
    id: "MAVE123456",
    movie: "Oppenheimer",
    date: "20/12/2023",
    time: "19:45",
    cinema: "CinemaHub Quận 1",
    room: "PHÒNG CHIẾU 04 (IMAX)",
    seats: ["G7", "G8"],
    combos: "1x Combo Bắp Rang Bơ + 2x Nước",
    total: "255.000đ",
    status: "upcoming",
    poster: "/poster/poster.jpg",
  },
  {
    id: "BK001234",
    movie: "Avengers: Secret Wars",
    date: "20/01/2026",
    time: "18:00",
    cinema: "CineMax Hồ Chí Minh",
    room: "PHÒNG 03",
    seats: ["A5", "A6"],
    combos: "1x Combo Đôi",
    total: "359.000đ",
    status: "upcoming",
    poster: "/poster/poster.jpg",
  },
  {
    id: "MAVE777888",
    movie: "Dune: Part Two",
    date: "15/03/2024",
    time: "20:30",
    cinema: "CinemaHub Gò Vấp",
    room: "PHÒNG IMAX",
    seats: ["F10", "F11"],
    combos: "2x Bắp ngọt + 2x Pepsi",
    total: "420.000đ",
    status: "completed",
    poster: "/poster/poster.jpg",
  },
  {
    id: "MAVE999111",
    movie: "Spider-Man: Beyond the Spider-Verse",
    date: "12/06/2025",
    time: "14:00",
    cinema: "CineMax Long Biên",
    room: "PHÒNG 05",
    seats: ["D12"],
    combos: "Không",
    total: "115.000đ",
    status: "upcoming",
    poster: "/poster/poster.jpg",
  },
  {
    id: "MAVE555444",
    movie: "Interstellar (Re-release)",
    date: "10/11/2024",
    time: "21:15",
    cinema: "CinemaHub Quận 7",
    room: "PHÒNG CHIẾU 02",
    seats: ["H5", "H6", "H7"],
    combos: "1x Bắp lớn + 3x Nước",
    total: "485.000đ",
    status: "cancelled",
    poster: "/poster/poster.jpg",
  },
  {
    id: "MAVE222333",
    movie: "The Batman: Part II",
    date: "05/10/2025",
    time: "19:00",
    cinema: "CineMax Đà Nẵng",
    room: "PHÒNG GOLD CLASS",
    seats: ["B1", "B2"],
    combos: "1x Set Couple VIP",
    total: "650.000đ",
    status: "upcoming",
    poster: "/poster/poster.jpg",
  },
  {
    id: "MAVE444666",
    movie: "Inception",
    date: "14/02/2024",
    time: "22:00",
    cinema: "CinemaHub Hoàn Kiếm",
    room: "PHÒNG 01",
    seats: ["E8", "E9"],
    combos: "1x Bắp phô mai",
    total: "210.000đ",
    status: "completed",
    poster: "/poster/poster.jpg",
  },
];


const norm = (s: string) => s.trim().toLowerCase();

export default function TicketHistory({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>("all");
  const [draft, setDraft] = useState(initialCode);

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

  const filteredTickets = useMemo(() => {
    const q = norm(initialCode);
    return TICKETS.filter((t) => {
      const okTab = tab === "all" || t.status === tab;
      if (!okTab) return false;
      if (!q) return true;
      const hay = `${t.id} ${t.movie}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tab, initialCode]);

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
          {filteredTickets.map((ticket) => (
            <Box
              key={ticket.id}
              onClick={() => goDetail(ticket.id)}
              className="relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-[#15171C] flex flex-col md:flex-row shadow-2xl transition hover:border-white/10"
            >
              <Box className="absolute top-4 right-4 z-10">
                <span
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${
                    ticket.status === "upcoming"
                      ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      : ticket.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {ticket.status === "upcoming"
                    ? "CHƯA SỬ DỤNG"
                    : ticket.status === "completed"
                      ? "ĐÀ SỬ DỤNG"
                      : "ĐÃ HỦY"}
                </span>
              </Box>

              <Box className="w-full md:w-52 h-64 md:h-auto shrink-0">
                <img src={ticket.poster} alt={ticket.movie} className="h-full w-full object-cover" />
              </Box>

              <Box className="flex-1 p-6 flex flex-col justify-between">
                <Box>
                  <Typography className="text-xl font-bold text-white pr-28 leading-tight">
                    {ticket.movie}
                  </Typography>
                  <Typography className="text-xs text-white/40 mt-1 uppercase font-medium">
                    {ticket.cinema} • {ticket.room}
                  </Typography>

                  <Divider className="!border-white/5 !border-dashed !my-4" />

                  <Box className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
                    <Box>
                      <div className="text-[10px] font-bold text-white/20 uppercase">Ngày chiếu</div>
                      <div className="text-sm font-semibold text-white/80">{ticket.date}</div>
                    </Box>
                    <Box>
                      <div className="text-[10px] font-bold text-white/20 uppercase">Suất chiếu</div>
                      <div className="text-sm font-semibold text-white/80">{ticket.time}</div>
                    </Box>
                    <Box>
                      <div className="text-[10px] font-bold text-white/20 uppercase">Ghế</div>
                      <div className="text-sm font-semibold text-white/80">{ticket.seats.join(", ")}</div>
                    </Box>
                    <Box>
                      <div className="text-[10px] font-bold text-white/20 uppercase">Combo</div>
                      <div className="text-sm font-semibold text-white/80 truncate">{ticket.combos}</div>
                    </Box>
                  </Box>
                </Box>

                <Box className="mt-8 flex items-end justify-between">
                  <Box className="flex flex-col gap-2">
                    <Box className="bg-white p-1.5 rounded-lg w-fit">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.id}`}
                        alt="QR"
                        className="w-20 h-20"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                    <span className="font-mono text-[9px] tracking-widest text-white/20">{ticket.id}</span>
                  </Box>

                  <Box className="text-right">
                    <Typography className="text-[10px] font-bold text-white/20 uppercase mb-1">
                      Tổng tiền
                    </Typography>
                    <Typography
                      className={`text-2xl font-black mb-3 ${
                        ticket.status === "cancelled" ? "text-white/20 line-through" : "text-red-500"
                      }`}
                    >
                      {ticket.total}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
