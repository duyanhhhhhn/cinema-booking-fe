"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tickets } from "@/types/data/tickets/tickets";
import type { ITicket } from "@/types/data/tickets/type";

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

const toStatusUI = (s?: ITicket["status"]): TicketStatusUI => {
  if (s === "PAID") return "completed";
  if (s === "CANCELLED" || s === "FAILED") return "cancelled";
  return "upcoming";
};

export type TicketDetailVM = {
  bookingCode: string;
  status: TicketStatusUI;
  statusRaw?: ITicket["status"];
  statusLabel: string;
  poster: string;
  movie: string;
  quote: string;
  tags: string[];
  cinemaName: string;
  cinemaAddressLines: string[];
  roomLabel: string;
  timeRange: string;
  dateLabel: string;
  seats: string[];
  bookingAt: string;
  paymentMethod: string;
  items: { qty: number; name: string; price: string }[];
  total: string;
  disabledDownload: boolean;
};

export function useTicketDetail(code: string) {
  const [copied, setCopied] = useState(false);

  const ticketList = useQuery({
    ...Tickets.getAllTicketMe(1, 200, "", "", "", undefined),
    retry: false,
  });

  const ticket = useMemo<ITicket | null>(() => {
    const raw = ticketList.data as any;
    const list = (raw?.data ?? []) as ITicket[];
    return (
      list.find(
        (x) =>
          String(x.bookingCode || "").toLowerCase() ===
          String(code || "").toLowerCase()
      ) ?? null
    );
  }, [ticketList.data, code]);

  const statusUI = useMemo(() => {
    const st = toStatusUI(ticket?.status);
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
  }, [ticket?.status]);

  const vm = useMemo<TicketDetailVM>(() => {
    if (!ticket) {
      return {
        bookingCode: code,
        status: "upcoming",
        statusRaw: undefined,
        statusLabel: "—",
        poster: "/poster/poster.jpg",
        movie: "Không tìm thấy vé",
        quote: "Vui lòng kiểm tra lại mã vé.",
        tags: ["—"],
        cinemaName: "—",
        cinemaAddressLines: ["—"],
        roomLabel: "—",
        timeRange: "—",
        dateLabel: "—",
        seats: ["—"],
        bookingAt: "—",
        paymentMethod: "—",
        items: [{ qty: 1, name: "Không có dữ liệu", price: "0đ" }],
        total: "0đ",
        disabledDownload: true,
      };
    }

    const st = toStatusUI(ticket.status);

    return {
      bookingCode: ticket.bookingCode,
      status: st,
      statusRaw: ticket.status,
      statusLabel: ticket.statusLabel || ticket.status,
      poster: buildPosterSrc(ticket.posterUrl),
      movie: ticket.movieTitle,
      quote: "",
      tags: ["—"],
      cinemaName: ticket.cinemaName,
      cinemaAddressLines: ["—"],
      roomLabel: ticket.roomName ? `PHÒNG ${ticket.roomName}` : "—",
      timeRange: ticket.startTime ? `${formatTime(ticket.startTime)}` : "—",
      dateLabel: ticket.startTime ? formatDateLabel(ticket.startTime) : "—",
      seats: splitSeats(ticket.seats),
      bookingAt: "—",
      paymentMethod: "—",
      items: [{ qty: 1, name: "—", price: "0đ" }],
      total: formatVnd(ticket.totalPrice),
      disabledDownload: ticket.status === "CANCELLED" || ticket.status === "FAILED",
    };
  }, [ticket, code]);

  const qrUrl = useMemo(() => {
    const v = encodeURIComponent(vm.bookingCode || code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${v}`;
  }, [vm.bookingCode, code]);

  const onShare = async () => {
    const text = `Mã vé: ${vm.bookingCode || code}`;
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

  const onDownload = () => window.print();

  return {
    vm,
    statusUI,
    qrUrl,
    copied,
    onShare,
    onDownload,
    isLoading: ticketList.isLoading,
    isError: ticketList.isError,
  };
}
