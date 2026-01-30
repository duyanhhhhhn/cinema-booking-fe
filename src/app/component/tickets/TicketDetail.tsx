"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Be_Vietnam_Pro } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import { Tickets } from "@/types/data/tickets/tickets";
import type { ITicket } from "@/types/data/tickets/type";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type TicketStatusUI = "completed" | "upcoming" | "cancelled";

const splitSeats = (seats: string) =>
  (seats || "")
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
};

const formatVnd = (value: number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "0đ";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
};

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

const toStatusUI = (s: ITicket["status"]): TicketStatusUI => {
  if (s === "PAID") return "completed";
  if (s === "CANCELLED" || s === "FAILED") return "cancelled";
  return "upcoming";
};

export default function TicketDetail({ code }: { code: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const ticketList = useQuery({
    ...Tickets.getAllTicketMe(1, 200, "", "", "", undefined),
    retry: false,
  });

  const ticket = useMemo<ITicket | null>(() => {
    const raw = ticketList.data as any;
    const list = (raw?.data ?? []) as ITicket[];
    const found = list.find((x) => String(x.bookingCode || "").toLowerCase() === String(code || "").toLowerCase());
    return found ?? null;
  }, [ticketList.data, code]);

  const statusUI = useMemo(() => {
    const st: TicketStatusUI = ticket ? toStatusUI(ticket.status) : "upcoming";
    if (st === "completed")
      return {
        label: "ĐÃ SỬ DỤNG",
        cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      };
    if (st === "cancelled")
      return {
        label: "ĐÃ HỦY",
        cls: "bg-rose-500/10 text-rose-300 border-rose-500/20",
      };
    return {
      label: "CHƯA SỬ DỤNG",
      cls: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    };
  }, [ticket]);

  const poster = useMemo(() => buildPosterSrc(ticket?.posterUrl || ""), [ticket?.posterUrl]);
  const movie = ticket?.movieTitle || "Không tìm thấy vé";
  const quote = ticket ? "" : "Vui lòng kiểm tra lại mã vé.";
  const tags = useMemo(() => ["—"], []);
  const cinemaName = ticket?.cinemaName || "—";
  const cinemaAddressLines = useMemo(() => ["—"], []);
  const roomLabel = ticket?.roomName ? `PHÒNG ${ticket.roomName}` : "—";
  const timeRange = ticket?.startTime ? `${formatTime(ticket.startTime)}` : "—";
  const dateLabel = ticket?.startTime ? formatDateLabel(ticket.startTime) : "—";
  const seats = ticket?.seats ? splitSeats(ticket.seats) : ["—"];
  const bookingAt = "—";
  const paymentMethod = "—";
  const items = useMemo(() => [{ qty: 1, name: "—", price: "0đ" }], []);
  const total = ticket ? formatVnd(ticket.totalPrice) : "0đ";

  const qrUrl = useMemo(() => {
    const v = encodeURIComponent(ticket?.bookingCode || code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${v}`;
  }, [ticket?.bookingCode, code]);

  const onShare = async () => {
    const text = `Mã vé: ${ticket?.bookingCode || code}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      // @ts-ignore
      if (navigator?.share) {
        // @ts-ignore
        await navigator.share({ title: "Vé xem phim", text, url });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(url || text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const onDownload = () => {
    window.print();
  };

  const disabledDownload = !ticket || ticket.status === "CANCELLED" || ticket.status === "FAILED";

  return (
    <div className={`min-h-screen bg-[#0B0C0F] text-white ${beVietnam.className} antialiased`}>
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12 2xl:max-w-[1400px]">
        <div className="mb-6 flex items-center gap-3 text-white/60">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-white/60 hover:text-white transition"
          >
            <span className="text-lg leading-none">←</span>
            <span>Quay lại lịch sử</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_460px] 2xl:grid-cols-[1fr_520px]">
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#121318] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
              <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
            </div>

            <div className="relative grid gap-6 p-7 md:grid-cols-[280px_1fr] md:gap-10 md:p-10">
              <div className="rounded-2xl bg-white/5 p-2">
                <div className="overflow-hidden rounded-xl bg-black/30">
                  <img src={poster} alt={movie} className="h-[340px] w-full object-cover md:h-[420px]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold text-white/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {movie}
                </h1>

                <p className="mt-2 text-sm font-medium italic text-white/55">{quote}</p>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-white/35">
                      Rạp chiếu
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-white">{cinemaName}</div>
                    <div className="mt-1 space-y-0.5 text-xs font-medium text-white/50">
                      {cinemaAddressLines.map((x, i) => (
                        <div key={i}>{x}</div>
                      ))}
                    </div>
                    <Link
                      href="#"
                      className="mt-3 inline-flex text-xs font-extrabold text-red-400 hover:text-red-300"
                    >
                      Xem bản đồ ⟶
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-white/35">
                      Phòng
                    </div>
                    <div className="mt-2 text-sm font-extrabold text-white">{roomLabel}</div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-white/35">
                          Thời gian
                        </div>
                        <div className="mt-1 text-sm font-extrabold text-white">{timeRange}</div>
                        <div className="mt-0.5 text-xs font-medium text-white/50">{dateLabel}</div>
                      </div>

                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-white/35">
                          Ghế
                        </div>
                        <div className="mt-1 text-sm font-extrabold text-red-400">
                          {seats.join(", ")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                    <span className="text-white/80">🛒</span>
                    <span>Chi tiết dịch vụ kèm theo</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                        <div className="min-w-0 text-white/70">
                          <span className="mr-2 font-extrabold text-white/40">{it.qty}x</span>
                          <span className="font-semibold">{it.name}</span>
                        </div>
                        <div className="shrink-0 font-extrabold text-white/75">{it.price}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-end justify-between border-t border-white/5 pt-5">
                    <div className="text-base font-extrabold text-white/80">Tổng thanh toán</div>
                    <div className="text-2xl font-black tracking-tight text-red-500">{total}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#121318] shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
              <div className="absolute -left-28 -bottom-28 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />
            </div>

            <div className="relative p-7 md:p-10">
              <div className="flex items-center justify-end">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusUI.cls}`}
                >
                  {statusUI.label}
                </span>
              </div>

              <div className="mt-4 text-center">
                <div className="text-lg font-extrabold text-white">Mã vé của bạn</div>
              </div>

              <div className="mt-5 rounded-2xl bg-white p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="overflow-hidden rounded-xl bg-[#0B0C0F] p-6">
                  <div className="mx-auto flex w-fit items-center justify-center rounded-xl bg-white p-4">
                    <img src={qrUrl} alt="QR" className="h-[160px] w-[160px]" />
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/30">
                  Mã xác thực (booking code)
                </div>
                <div className="mt-2 text-xl font-black tracking-[0.12em] text-white">
                  {ticket?.bookingCode || code}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={onDownload}
                  disabled={disabledDownload}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${
                    disabledDownload
                      ? "border-white/5 bg-white/5 text-white/30 cursor-not-allowed"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/8"
                  }`}
                >
                  <span className="text-base">⬇</span>
                  <span>Tải vé</span>
                </button>

                <button
                  onClick={onShare}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-white/8"
                >
                  <span className="text-base">⤴</span>
                  <span>{copied ? "Đã copy" : "Chia sẻ"}</span>
                </button>
              </div>

              <div className="mt-7 space-y-3 border-t border-white/5 pt-5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-white/40">Đặt vào lúc:</div>
                  <div className="font-extrabold text-white/70">{bookingAt}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-white/40">Hình thức:</div>
                  <div className="font-extrabold text-white/70">{paymentMethod}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-300">
              !
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white">Lưu ý khi nhận vé</div>
              <div className="mt-1 text-xs font-medium leading-relaxed text-white/60">
                Vui lòng cung cấp mã vé hoặc mã QR tại quầy vé hoặc máy check-in tự động tối thiểu 15 phút trước giờ chiếu.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
