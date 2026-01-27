import TicketHistory from "../component/tickets/TicketHistory";
import { Sora, Nunito } from "next/font/google";

export const metadata = {
  title: "Vé của tôi - Cinema Booking",
  description: "Xem lịch sử vé đã đặt",
};

export default function MyTicketsPage() {
  return <TicketHistory />;
}

