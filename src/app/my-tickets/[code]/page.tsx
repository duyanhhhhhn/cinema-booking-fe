import { Metadata } from "next";
import TicketDetail from "../../component/tickets/TicketDetail";

type Params = Promise<{ code: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Chi tiết vé ${code} - Cinema Booking`,
    description: "Thông tin chi tiết vé đặt",
  };
}

export default async function TicketDetailPage({ params }: { params: Params }) {
  const { code } = await params;
  return <TicketDetail code={code} />;
}
