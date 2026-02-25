/* eslint-disable @next/next/no-img-element */
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HomeIcon from "@mui/icons-material/Home";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

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

      {/* --- PHẦN 2: THẺ VÉ (TICKET CARD) --- */}
      <div className="w-full max-w-[960px] bg-card-dark rounded-xl overflow-hidden border border-white/10 flex flex-col md:flex-row shadow-card relative">
        {/* --- CỘT TRÁI: POSTER PHIM --- */}
        {/* bg-white/[0.02] tạo hiệu ứng kính mờ nhẹ */}
        <div className="w-full md:w-[320px] p-6 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5 bg-white/[0.02]">
          <div className="relative aspect-2/3 w-full rounded-lg overflow-hidden shadow-2xl group cursor-pointer">
            <img
              src="https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
              alt="Oppenheimer Poster"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Gradient đen mờ bên dưới ảnh để nổi bật text */}
            <div className="absolute inset-0 bg-linear-to-t from-background-dark/90 via-transparent to-transparent"></div>

            <div className="absolute bottom-4 left-4">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
                2D | Phụ đề
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold leading-tight mb-2 text-white">
              Oppenheimer
            </h3>
            <p className="text-primary font-medium text-sm flex items-center gap-1.5">
              <AccessTimeIcon style={{ fontSize: 18 }} />
              <span>180 phút</span>
            </p>
          </div>
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN CHI TIẾT & QR --- */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* GRID THÔNG TIN VÉ */}
            <div className="flex-1 p-6 md:p-8 grid grid-cols-2 gap-y-8 gap-x-6">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Rạp
                </p>
                <p className="font-semibold text-lg text-white">
                  CGV Vincom Đồng Khởi
                </p>
                <p className="text-white/50 text-sm mt-0.5">Quận 1, TP. HCM</p>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Ngày chiếu
                </p>
                <p className="font-semibold text-lg text-white">
                  Thứ Tư, 24/05/2024
                </p>
              </div>

              <div>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Phòng chiếu
                </p>
                <p className="font-semibold text-lg text-white">Cinema 05</p>
              </div>

              <div>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Suất chiếu
                </p>
                <p className="font-semibold text-lg text-primary drop-shadow-[0_0_8px_rgba(234,42,51,0.5)]">
                  19:30 - 22:30
                </p>
              </div>

              <div>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Số ghế
                </p>
                <p className="font-bold text-xl tracking-wider text-white">
                  J12, J13
                </p>
              </div>

              <div>
                <p className="text-white/40 text-[11px] uppercase tracking-[0.15em] font-bold mb-1.5">
                  Tổng cộng
                </p>
                <p className="font-bold text-xl text-white">240.000 VNĐ</p>
              </div>
            </div>

            {/* PHẦN QR CODE (Cắt vé) */}
            <div className="relative w-full lg:w-[260px] bg-white/3 p-8 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-white/5">
              {/* Giả lập đường rãnh xé vé (Perforation dots) */}
              <div className="hidden lg:flex absolute -left-[5px] top-0 bottom-0 flex-col justify-between py-6 overflow-hidden h-full z-10">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[10px] h-[10px] rounded-full bg-background-dark mb-4"
                  ></div>
                ))}
              </div>

              {/* Khung QR Gradient */}
              <div className="p-[2px] rounded-xl mb-4 shadow-xl bg-linear-to-br from-primary to-[#8b1a1e]">
                <div className="bg-white p-2.5 rounded-[10px] aspect-square w-36 flex items-center justify-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TIX12345678"
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>
              </div>

              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.15em] mb-1">
                Mã vé (Ticket ID)
              </p>
              <p className="font-mono font-bold text-lg text-white tracking-wider">
                #TIX12345678
              </p>
            </div>
          </div>

          {/* FOOTER CỦA THẺ (NÚT BẤM) */}
          <div className="bg-white/[0.04] border-t border-white/10 px-6 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-white/50 text-sm font-medium">
              <InfoOutlinedIcon
                style={{ fontSize: 20 }}
                className="text-primary"
              />
              <span>Vui lòng đến rạp trước 15 phút.</span>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-[#c41e26] active:scale-95 text-white rounded-lg font-bold text-sm transition-all shadow-glow hover:shadow-[0_0_40px_rgba(234,42,51,0.6)]">
                <HomeIcon style={{ fontSize: 20 }} />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
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