/* eslint-disable @next/next/no-img-element */
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

const TicketSuccess = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white font-display flex flex-col items-center justify-center p-4 md:p-8">
      {/* --- PHẦN 1: HEADER THÔNG BÁO --- */}
      <div className="flex flex-col items-center mb-10 text-center animate-fade-in-up">
        <div className="mb-6 relative">
          {/* Hiệu ứng Glow mờ phía sau */}
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150"></div>
          {/* Vòng tròn icon */}
          <div className="relative bg-[#EA2933] h-20 w-20 rounded-full flex items-center justify-center shadow-glow border-4 border-background-dark">
            <CheckIcon className="text-white text-[40px] font-bold" />
          </div>
        </div>
        <h1 className="text-4xl md:text-[40px] font-bold leading-tight mb-3 tracking-tight">
          Thanh toán thành công!
        </h1>
        <p className="text-white/60 text-lg font-light leading-relaxed max-w-[600px]">
          Chúc mừng! Bạn đã đặt vé thành công. Vui lòng xuất trình mã QR bên
          dưới tại rạp hoặc quầy soát vé.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all border border-white/10"
        >
          <HomeIcon style={{ fontSize: 22 }} />
          <span>Về trang chủ</span>
        </Link>
      </div>
    </div>
  );
};

const TicketFailed = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white font-display flex flex-col items-center justify-center p-4 md:p-8">
      <div className="flex flex-col items-center max-w-md text-center animate-fade-in-up">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full scale-150" />
          <div className="relative bg-red-600 h-20 w-20 rounded-full flex items-center justify-center border-4 border-background-dark shadow-lg">
            <ErrorOutlineIcon className="text-white text-[44px]" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
          Thanh toán thất bại
        </h1>
        <p className="text-white/60 text-base leading-relaxed mb-8">
          Giao dịch không hoàn tất. Vui lòng kiểm tra lại phương thức thanh toán
          hoặc thử lại sau.
        </p>

        <div className="w-full bg-card-dark rounded-xl border border-white/10 p-6 mb-8 text-left">
          <p className="text-white/50 text-sm mb-2">Một số lý do thường gặp:</p>
          <ul className="text-white/70 text-sm space-y-1.5 list-disc list-inside">
            <li>Giao dịch bị hủy hoặc hết thời gian</li>
            <li>Số dư không đủ hoặc thẻ bị từ chối</li>
            <li>Lỗi kết nối với cổng thanh toán</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all border border-white/10"
          >
            <HomeIcon style={{ fontSize: 22 }} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
    const status = searchParams.get("status")?.toLowerCase();
    if( !status) return

  if (status === "failed") {
    return <TicketFailed />;
  }

  return <TicketSuccess />;
}