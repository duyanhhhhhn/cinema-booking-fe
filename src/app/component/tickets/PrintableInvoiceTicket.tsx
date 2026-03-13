"use client";

import React from "react";
import Image from "next/image";
export type PrintTicketResponse = {
  bookingCode: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  startTime: string;
  printedTickets: PrintedTicket[];
  totalPrinted: number;
  printedAt: string;
  printStamp: string;
};

export type PrintedTicket = {
  ticketCode: string;
  seatCode: string;
  seatType: string;
  price: number;
  qrData: string;
};

type PrintableInvoiceTicketProps = {
  data: PrintTicketResponse;
};

function formatDateTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMoney(value?: number) {
  if (value == null) return "0đ";
  return `${value.toLocaleString("vi-VN")}đ`;
}

function getSeatTypeLabel(seatType?: string) {
  if (!seatType) return "Thường";
  switch (seatType.toUpperCase()) {
    case "VIP":
      return "Ghế VIP";
    case "COUPLE":
      return "Ghế Couple";
    case "STANDARD":
      return "Ghế Standard";
    default:
      return seatType;
  }
}

function SideBrandColumn() {
  return (
    <div className="flex h-full w-[52px] flex-col items-center justify-between py-2">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[6px] bg-white shadow-sm ring-1 ring-sky-200"
        >
          <div className="text-center leading-[1]">
            <div className="text-[7px] font-bold uppercase tracking-tight text-sky-700">
              beta
            </div>
            <div className="text-[6px] font-semibold uppercase text-sky-500">
              two
            </div>
            <div className="text-[6px] font-semibold uppercase text-sky-500">
              cinema
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarcodeFake({ value }: { value: string }) {
  const bars = Array.from({ length: Math.max(value.length * 4, 48) }).map(
    (_, i) => {
      const wide = i % 5 === 0 || i % 7 === 0;
      const height = 62 + ((i * 9) % 22);
      return {
        width: wide ? 3 : i % 2 === 0 ? 1 : 2,
        height,
      };
    },
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[88px] items-end gap-[1px]">
        {bars.map((bar, i) => (
          <span
            key={i}
            className="inline-block bg-black"
            style={{
              width: `${bar.width}px`,
              height: `${bar.height}px`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 text-[12px] tracking-[2.5px] text-neutral-600">
        {value}
      </div>
    </div>
  );
}

function TicketInfoRow({
  left,
  right,
  leftClassName = "",
  rightClassName = "",
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftClassName?: string;
  rightClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-end gap-3">
      <div className={`text-[13px] text-neutral-700 ${leftClassName}`}>
        {left}
      </div>
      <div className={`text-[13px] text-neutral-800 ${rightClassName}`}>
        {right}
      </div>
    </div>
  );
}

function SingleTicketPaper({
  root,
  ticket,
  index,
}: {
  root: PrintTicketResponse;
  ticket: PrintedTicket;
  index: number;
}) {
  return (
    <div className="mx-auto w-[390px] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] print:shadow-none">
      <div className="flex">
        <div className="bg-sky-400">
          <SideBrandColumn />
        </div>

        <div className="flex-1 px-4 py-5 font-sans text-neutral-900">
          <div className="min-h-[1090px]">
            <div className="text-center">
<div className="mx-auto mb-3 flex items-center justify-center">
  <Image
    src="/logo/logo_cinema.png"
    alt="Beta Two Cinemas"
    width={82}
    height={82}
    className="h-auto w-auto object-contain"
    priority
  />
</div>

              <div className="text-[28px] font-semibold italic tracking-tight text-neutral-700">
                Beta Two
              </div>

              <div className="mt-1 text-[10px] uppercase tracking-[1px] text-neutral-500">
                Trải nghiệm điện ảnh trọn vẹn
              </div>

              <div className="mt-3 text-[11px] font-medium uppercase leading-4 text-neutral-700">
                Mã in: {root.printStamp || "---"}
              </div>

              <div className="mt-3 text-[12px] font-bold uppercase leading-4 text-neutral-800">
                {root.cinemaName}
              </div>

              <div className="mx-auto mt-1 max-w-[240px] text-[11px] leading-4 text-neutral-600">
                Phòng chiếu: {root.roomName}
              </div>
            </div>

            <div className="my-4 border-t border-dashed border-neutral-300" />

            <div className="text-center">
              <div className="text-[24px] font-bold uppercase tracking-[1px] text-neutral-700">
                Vé xem phim
              </div>
              <div className="mt-1 text-[14px] uppercase tracking-[2px] text-neutral-300">
                {root.bookingCode}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-neutral-600">
              <div>Ký hiệu: N/A</div>
              <div className="text-right">Tổng vé: {root.totalPrinted}</div>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-3 text-[11px] text-neutral-600">
              <div>Số vé: {ticket.ticketCode}</div>
              <div className="text-right">STT: {index + 1}</div>
            </div>

            <div className="mt-4 space-y-1.5">
              <TicketInfoRow
                left={formatDateTime(root.startTime)}
                right=""
                leftClassName="font-medium"
              />

              <div className="text-[16px] font-bold leading-5 text-neutral-800">
                {root.movieTitle}
              </div>

              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div className="text-[13px] text-neutral-600">
                  {getSeatTypeLabel(ticket.seatType)}
                </div>
                <div className="text-[13px] font-medium text-neutral-700">
                  {formatMoney(ticket.price)}
                </div>
              </div>

              <div className="mt-1 text-right text-[10px] italic text-neutral-400">
                (Đã gồm VAT)
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-6">
              <div>
                <div className="text-[13px] text-neutral-500">Ghế/Seat</div>
                <div className="mt-1 text-[16px] font-bold text-neutral-800">
                  {ticket.seatCode}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[13px] text-neutral-500">Phòng/Room</div>
                <div className="mt-1 text-[16px] font-bold text-neutral-800">
                  {root.roomName}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-[12px] font-semibold text-neutral-600">
              ** Xuất trình vé khi vào rạp **
            </div>

            <div className="my-4 border-t border-dashed border-neutral-300" />

            <div className="space-y-1 text-[11px] text-neutral-600">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div>Mã booking: {root.bookingCode}</div>
                <div>In lúc: {formatDateTime(root.printedAt)}</div>
              </div>
              <div>QR Data: {ticket.qrData}</div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-[16px] font-semibold text-neutral-700">
                Xin chân thành cảm ơn quý khách!
              </div>
              <div className="mx-auto mt-2 max-w-[250px] text-[11px] leading-4 text-neutral-500">
                Vui lòng đến trước giờ chiếu để được hỗ trợ tốt nhất. Không đổi
                trả vé sau khi in.
              </div>
            </div>

            <div className="my-5 border-t border-dashed border-neutral-300" />

            <div className="text-center">
              <div className="text-[13px] font-bold uppercase tracking-[0.6px] text-neutral-700">
                BETA TWO CINEMAS - RẠP NGON GIÁ TỐT
              </div>
              <div className="mt-1 text-[10px] text-neutral-500">
                www.betatwocinemas.vn - facebook.com/betatwocinemas
              </div>
            </div>

            <div className="mt-5">
              <BarcodeFake value={ticket.ticketCode || root.bookingCode} />
            </div>
          </div>
        </div>

        <div className="bg-sky-400">
          <SideBrandColumn />
        </div>
      </div>
    </div>
  );
}

export default function PrintableInvoiceTicket({
  data,
}: PrintableInvoiceTicketProps) {
  const tickets = data?.printedTickets ?? [];

  if (!data || tickets.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white text-neutral-500">
        Không có dữ liệu vé để in
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-neutral-300 px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="flex w-full max-w-[900px] flex-col items-center gap-8 print:max-w-none print:gap-0">
        {tickets.map((ticket, index) => (
          <div
            key={ticket.ticketCode || `${data.bookingCode}-${index}`}
            className="print:mb-0 print:break-after-page"
          >
            <SingleTicketPaper root={data} ticket={ticket} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
