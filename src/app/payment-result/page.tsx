/* eslint-disable @next/next/no-img-element */
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CheckIcon from "@mui/icons-material/Check";
import HomeIcon from "@mui/icons-material/Home";
import { useQuery } from "@tanstack/react-query";
import { Booking, useRetryPayment } from "@/types/data/booking/booking";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import {
  ArrowBack,
  ArrowOutward,
  CalendarMonth,
  CheckCircle,
  CloseFullscreen,
  CloseOutlined,
  Event,
  RadioButtonChecked,
  ScheduleOutlined,
} from "@mui/icons-material";
import { formatTime } from "@/utils/helper";
import { use, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";

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
        <p className="text-white/60 text-lg font-light leading-relaxed max-w-150">
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
  const { searchQuery } = useRouteQuery();

  const { data: dataBookingDetail } = useQuery({
    ...Booking.getDetailBooking(searchQuery.get("bookingCode")),
    enabled: !!searchQuery.get("bookingCode"),
  });
  const [selected, setSelected] = useState<"momo" | "vnpay" | null>("momo");
  const urlPoster =
    process.env.NEXT_PUBLIC_IMAGE + dataBookingDetail?.data?.posterUrl;
  const paymentMethods = [
    {
      id: "momo" as const,
      name: "Thanh toán bằng Momo",
      description: "Ví điện tử",
      icon: "M",
      img: "/payment/momo.png",
      bankCode: "ATM",
    },
    {
      id: "vnpay" as const,
      name: "Thanh toán bằng VNPay",
      description: "Hỗ trợ thẻ ATM",
      img: "/payment/vnpay.png",
      icon: "V",
    },
  ];
  const handleSelect = (method: "momo" | "vnpay") => {
    setSelected(method);
  };
  const n = useNotification();
  const { mutate: retryPayment } = useRetryPayment();
  const [timeLeft, setTimeLeft] = useState(
    dataBookingDetail?.data?.remainingSeconds,
  );
  useEffect(() => {
    if (dataBookingDetail?.data?.remainingSeconds !== undefined) {
      setTimeLeft(dataBookingDetail.data.remainingSeconds);
    }
  }, [dataBookingDetail]);
  useEffect(() => {
    if (timeLeft <= 0) {
      n.error("Thời gian giữ ghế của bạn đã hết");
      window.location.href = "/";
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
  const onSubmit = () => {
    if (timeLeft < 0) {
      n.error("Thời gian giữ ghế của bạn đã hết");
      return;
    }
    if (selected) {
      retryPayment(
        {
          bookingCode: searchQuery.get("bookingCode") || "",
          paymentMethod: selected,
        },
        {
          onSuccess: (data) => {
            if (data?.url) {
              window.location.href = data?.url;
              return;
            }
          },
          onError: (error) => {
            n.error(error.message);
          },
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="max-w-250 mx-auto p-4 md:p-8">
        {/* Alert Section */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[#E11D48]/20 blur-xl rounded-full scale-125"></div>
            <div className="relative bg-[#E11D48] h-16 w-16 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.5)]">
              <CloseOutlined sx={{ fontSize: 32, color: "white" }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Thanh toán thất bại!
          </h2>
          <p className="text-sm text-gray-400 max-w-105 leading-relaxed">
            Giao dịch không hoàn tất. Vui lòng chọn lại phương thức thanh toán.
            Ghế của bạn đang được giữ trong:
          </p>

          {/* Pulsing Countdown Timer */}
          <div className="mt-4 bg-black border border-[#E11D48]/40 px-8 py-2 rounded-xl animate-pulse">
            <span className="text-3xl font-mono font-bold tracking-widest text-[#E11D48]">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Enhanced Movie & Order Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold px-1 text-gray-500 uppercase tracking-[0.2em]">
              Chi tiết đơn hàng
            </h3>
            <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="relative flex h-full min-h-55">
                {/* High Quality Poster Image */}
                <div className="w-1/3 shrink-0 relative overflow-hidden">
                  {/* Thay src bằng link ảnh placeholder */}
                  <img
                    alt="Dune poster"
                    className="object-cover w-full h-full"
                    src={urlPoster}
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#111111]"></div>
                </div>

                {/* Movie Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="px-2 py-0.5 rounded bg-[#E11D48] text-[10px] font-bold text-white tracking-widest uppercase">
                        {dataBookingDetail?.data?.ageRating}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono tracking-tighter">
                        {dataBookingDetail?.data?.bookingCode}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-white mb-4 leading-tight">
                      {dataBookingDetail?.data?.movieTitle}
                    </h4>

                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                          Ngày chiếu
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-200">
                          <CalendarMonth
                            sx={{ fontSize: 16 }}
                            className="text-[#E11D48]"
                          />
                          {dataBookingDetail?.data?.showDate}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                          Suất chiếu
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-200">
                          <ScheduleOutlined
                            sx={{ fontSize: 16 }}
                            className="text-[#E11D48]"
                          />
                          {dataBookingDetail?.data?.startTime} -{" "}
                          {dataBookingDetail?.data?.endTime}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                          Phòng chiếu
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-200">
                          {dataBookingDetail?.data?.roomName}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                          Số ghế
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <Event
                            sx={{ fontSize: 16 }}
                            className="text-[#E11D48]"
                          />
                          {dataBookingDetail?.data?.seatCodes}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                        Tổng tiền
                      </p>
                      <p className="text-2xl font-bold text-[#E11D48] tracking-tight">
                        {dataBookingDetail?.data?.totalPrice?.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment & Actions */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-bold px-1 text-gray-500 uppercase tracking-[0.2em]">
                Chọn lại phương thức
              </h3>
              {/* VNPay Card (Inactive State) */}
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`group relative flex items-center gap-4 p-4 bg-black border rounded-xl cursor-pointer transition-all hover:border-red-600 ${
                    selected === method.id
                      ? "border-red-600"
                      : "border-white/10"
                  }`}
                  onClick={() => handleSelect(method.id)}
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[10px] uppercase">
                      <img
                        src={method.img}
                        alt={method.name}
                        className="w-10 h-10"
                      />
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">
                      {method.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {method.description}
                    </p>
                  </div>
                  <div className="text-gray-700 group-hover:text-gray-500 transition-colors">
                    <RadioButtonChecked sx={{ fontSize: 20 }} />
                  </div>
                </button>
              ))}
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={onSubmit}
                className="w-full cursor-pointer bg-[#E11D48] hover:bg-[#E11D48]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#E11D48]/30 transition-all flex items-center justify-center gap-2"
              >
                Tiếp tục thanh toán
                <ArrowOutward sx={{ fontSize: 20 }} />
              </button>

              <Link
                href="/"
                className="w-full py-3 text-gray-500 font-medium text-sm hover:text-white transition-colors flex items-center justify-center gap-1"
              >
                <HomeIcon sx={{ fontSize: 18 }} />
                Quay về trang chủ
              </Link>
            </div>

            {/* Footer Info */}
            <div className="text-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
                Bằng cách nhấn tiếp tục, bạn đồng ý với các Điều khoản & Chính
                sách của CinemaPlus
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status")?.toLowerCase();
  if (!status) return;

  if (status === "failed") {
    return <TicketFailed />;
  }

  return <TicketSuccess />;
}
