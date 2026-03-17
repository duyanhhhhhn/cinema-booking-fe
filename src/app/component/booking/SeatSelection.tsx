"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Seat } from "@/types/data/seat/seat";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSeats,
  setSeatPriceMap,
  setStep,
  setMovieInfo,
  setHoldInfo,
} from "@/store/bookingSlice";
import { selectBookingSeats } from "@/store/selectors";
import BookingSidebar from "./BookingSidebar";
import { useHoldBookingMutation } from "@/types/data/booking/booking";
import { useNotification } from "@/hooks/useNotification";
import { validateSeatRules } from "@/utils/seat-check";
import NoteSeat from "./NoteSeat";

export default function SeatSelection() {
  const dispatch = useAppDispatch();
  const seatsFromStore = useAppSelector(selectBookingSeats);
  const { mutate: holdBooking } = useHoldBookingMutation();
  const n = useNotification();

  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    seatsFromStore.length > 0 ? seatsFromStore : [],
  );

  const { showtimeId } = useParams();

  const toggleSeat = (seatId: string) => {
    if (!dataSeatMap?.seatMap) return;
    const next = selectedSeats.includes(seatId)
      ? selectedSeats.filter((s) => s !== seatId)
      : [...selectedSeats, seatId];
    const validation = validateSeatRules(dataSeatMap.seatMap, next);
    if (!validation.valid) {
      n.error(validation.message);
      return;
    }
    setSelectedSeats(next);
    dispatch(setSeats(next));
  };
  const showtimeIdNum = showtimeId != null ? Number(showtimeId) : NaN;
  const isValidShowtimeId = !isNaN(showtimeIdNum) && showtimeIdNum > 0;
  const { data: dataSeatMap } = useQuery({
    ...Seat.getSeatMap(showtimeIdNum),
    enabled: isValidShowtimeId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  useEffect(() => {
    if (!dataSeatMap?.seatMap) return;
    const map: Record<string, number> = {};
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const seatId = seat.code || `${row.rowLabel}${seat.number}`;
        map[seatId] = seat.price ?? 0;
      });
    });
    dispatch(setSeatPriceMap(map));
  }, [dataSeatMap, dispatch]);

  const handleContinue = () => {
    if (!dataSeatMap?.seatMap) return;

    const validation = validateSeatRules(dataSeatMap.seatMap, selectedSeats);
    if (!validation.valid) {
      n.error(validation.message);
      return;
    }

    const codeToId = new Map<string, number>();
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const code = seat.code || `${row.rowLabel}${seat.number}`;
        codeToId.set(code, seat.id);
      });
    });

    const seatIds = selectedSeats
      .map((code) => codeToId.get(code))
      .filter((id): id is number => id != null);

    if (seatIds.length !== selectedSeats.length) {
      n.error("Không thể xác định mã ghế. Vui lòng thử lại.");
      return;
    }

    dispatch(setSeats(selectedSeats));
    holdBooking(
      {
        showtimeId: Number(showtimeId),
        seatIds,
      },
      {
        onSuccess: (data) => {
          const res = data as unknown as {
            expiresAt?: string;
            holdToken?: string;
            message?: string;
          };
          if (res.expiresAt) {
            dispatch(
              setHoldInfo({
                expiresAt: res.expiresAt,
                holdToken: res.holdToken,
                heldSeatIds: seatIds,
              }),
            );
          }
          n.success(res.message ?? "Đặt ghế thành công.");
          if (dataSeatMap) {
            dispatch(
              setMovieInfo({
                movie: dataSeatMap.movieTitle,
                showtime: dayjs(dataSeatMap.startTime).format("HH:mm"),
                cinema: dataSeatMap.cinemaName,
                moviePosterUrl: dataSeatMap.moviePosterUrl,
                genre: dataSeatMap.genre,
                duration: dataSeatMap.duration,
                roomName: dataSeatMap.roomName,
                startTime: dataSeatMap.startTime,
              }),
            );
          }
          dispatch(setStep(2));
        },
        onError: (error) => {
          n.error(error.message || "Đặt ghế thất bại");
        },
      },
    );
  };

  return (
    <main className="min-h-screen bg-[#121212] text-slate-200 p-4 md:p-8">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT TRÁI: SƠ ĐỒ GHẾ */}
        <div className="lg:col-span-8 bg-[#1e1e1e] rounded-xl shadow-2xl border border-[#2e2e2e] p-6 md:p-8">
          {/* Màn hình */}
          <div className="text-center mb-16">
            <div className="h-2 w-[85%] mx-auto bg-linear-to-b from-[#ef4444] to-transparent rounded-[50%/100%_100%_0_0] shadow-[0_-15px_30px_-5px_rgba(239,68,68,0.3)] mb-4"></div>
            <p className="text-slate-500 text-sm font-semibold tracking-widest uppercase">
              MÀN HÌNH CHIẾU
            </p>
          </div>

          {/* Grid ghế ngồi */}
          <div className="flex flex-col gap-4 items-center overflow-x-auto pb-6">
            <div className="grid gap-3 min-w-[600px]">
              {dataSeatMap?.seatMap.map((row) => {
                const standardSeats = row.seats?.filter(
                  (s) => s.type !== "COUPLE",
                );

                if (!standardSeats || standardSeats.length === 0) {
                  return null;
                }

                return (
                  <div key={row.rowLabel} className="flex gap-2.5 items-center">
                    <span className="w-4 text-xs font-bold text-slate-600 mr-2">
                      {row.rowLabel}
                    </span>

                    {standardSeats.map((seat) => {
                      const seatId =
                        seat.code || `${row.rowLabel}${seat.number}`;

                      const isSelected = selectedSeats.includes(seatId);

                      const isAvailable =
                        String(seat.status).toUpperCase() === "AVAILABLE";

                      let seatStyle =
                        "bg-[#2a2a2a] text-slate-500 border-b-4 border-black/30";

                      if (!isAvailable) {
                        seatStyle =
                          "bg-slate-700 text-slate-500 border-b-4 border-slate-800 cursor-not-allowed";
                      } else if (isSelected) {
                        seatStyle =
                          "bg-[#dc2626] text-white border-b-4 border-red-900 shadow-[0_0_10px_#ef4444]";
                      } else if (seat.type === "VIP") {
                        seatStyle =
                          "bg-[#991b1b] text-red-200 border-b-4 border-red-950";
                      }
                      return (
                        <button
                          key={seatId}
                          onClick={() => isAvailable && toggleSeat(seatId)}
                          disabled={!isAvailable}
                          className={`
                w-9 h-8 rounded-t-lg disabled:cursor-not-allowed flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-110 hover:brightness-125
                ${seatStyle}
              `}
                        >
                          {seat.code}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Ghế đôi (Sweetbox) */}
            <div className="mt-8 flex gap-6 min-w-[600px] justify-start flex-wrap">
              {" "}
              {/* Thêm flex-wrap nếu cần */}
              {dataSeatMap?.seatMap.map((row) => {
                // 1. Lọc ghế Couple
                const coupleSeats = row.seats?.filter(
                  (s) => s.type === "COUPLE",
                );

                // 2. Nếu không có ghế Couple, trả về null (không render gì)
                if (!coupleSeats || coupleSeats.length === 0) {
                  return null;
                }

                // 3. QUAN TRỌNG: Phải có từ khóa RETURN ở đây
                // Và nên bọc các ghế của hàng đó trong một div (hoặc Fragment)
                return (
                  <div key={row.rowLabel} className="flex gap-4">
                    {coupleSeats.map((seat) => {
                      const seatId =
                        seat.code || `${row.rowLabel}${seat.number}`;
                      const isSelected = selectedSeats.includes(seatId);
                      const isAvailable =
                        String(seat.status).toUpperCase() === "AVAILABLE";

                      return (
                        <button
                          key={seatId}
                          type="button"
                          onClick={() => isAvailable && toggleSeat(seatId)}
                          disabled={!isAvailable}
                          className={`
                w-20 h-10 rounded-t-xl disabled:cursor-not-allowed flex items-center justify-center text-[10px] font-bold transition-all border-b-4
                ${
                  !isAvailable
                    ? "bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed"
                    : isSelected
                      ? "bg-[#dc2626] text-white border-red-900 shadow-[0_0_10px_#ef4444] cursor-pointer hover:scale-105"
                      : "bg-[#3a3a3a] text-slate-400 border-black/30 cursor-pointer hover:scale-105"
                }
              `}
                        >
                          {seat.code || seatId}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chú thích ghế */}
          <div className="mt-12 pt-8 border-t border-[#2e2e2e] grid grid-cols-2 md:grid-cols-4 gap-4">
            <NoteSeat
              color="bg-[#2a2a2a] border border-[#3e3e3e]"
              label="Ghế Thường"
            />
            <NoteSeat color="bg-[#991b1b]" label="Ghế VIP" />
            <NoteSeat color="bg-[#3a3a3a] w-10" label="Ghế Đôi" />
            <NoteSeat
              color="bg-[#dc2626] ring-2 ring-white/50"
              label="Đang chọn"
            />
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN THANH TOÁN (dùng chung 3 step) */}
        <BookingSidebar
          step={1}
          seatMapData={dataSeatMap ?? undefined}
          actionButton={{
            label: "TIẾP TỤC THANH TOÁN",
            onClick: handleContinue,
            disabled: selectedSeats.length === 0,
          }}
        />
      </div>
    </main>
  );
}
