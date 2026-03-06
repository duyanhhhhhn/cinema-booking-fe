"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PrintableInvoiceTicket, {
  PrintTicketResponse,
} from "../component/tickets/PrintableInvoiceTicket";

export default function DemoPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "BK00000001";

  const mockByCode: Record<string, PrintTicketResponse> = {
    BK00000001: {
      bookingCode: "BK00000001",
      movieTitle: "Thiên Đường Máu",
      cinemaName: "Beta Two Cinemas Vạn Hạnh",
      roomName: "P2",
      startTime: "2026-01-13T13:30:00",
      totalPrinted: 2,
      printedAt: "2026-01-12T20:15:00",
      printStamp: "PRINT-STAMP-20260112-01",
      printedTickets: [
        {
          ticketCode: "TK000001",
          seatCode: "L4",
          seatType: "STANDARD",
          price: 50000,
          qrData: "QR-TK000001",
        },
        {
          ticketCode: "TK000002",
          seatCode: "L5",
          seatType: "VIP",
          price: 70000,
          qrData: "QR-TK000002",
        },
      ],
    },
  };

  const data = mockByCode[code] || mockByCode["BK00000001"];

  useEffect(() => {
    const t = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(t);
  }, []);

  return <PrintableInvoiceTicket data={data} />;
}