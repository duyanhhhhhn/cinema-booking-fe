"use client";

import { useBooking } from "@/contexts/BookingContext";

interface OrderSummaryProps {
  onProceed: () => void;
  onBack?: () => void;
  proceedLabel?: string;
  showMovieInfo?: boolean;
}

export default function OrderSummary({
  onProceed,
  onBack,
  proceedLabel = "Tiếp tục",
  showMovieInfo = true,
}: OrderSummaryProps) {
  const { bookingState, getTotalPrice, getSeatPrice, getComboPrice } =
    useBooking();

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-6 sticky top-6">
      <h3 className="text-white text-xl font-bold mb-6">Tóm tắt đơn hàng</h3>

      {showMovieInfo && (
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm">Phim</span>
            <span className="text-white text-right font-medium">
              {bookingState.movie}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm">Suất chiếu</span>
            <span className="text-white text-right">
              {bookingState.showtime}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-sm">Rạp</span>
            <span className="text-white text-right">{bookingState.cinema}</span>
          </div>

          {bookingState.seats.length > 0 && (
            <div className="flex justify-between items-start">
              <span className="text-gray-400 text-sm">Ghế</span>
              <span className="text-white text-right">
                {bookingState.seats.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-700 pt-4 space-y-3">
        {bookingState.seats.length > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Vé ({bookingState.seats.length})
              </span>
              <span className="text-white">
                {getSeatPrice().toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="pl-4 text-xs text-gray-500">
              Ghế: {bookingState.seats.join(", ")}
            </div>
          </>
        )}

        {bookingState.combos
          .filter((c) => c.quantity > 0)
          .map((combo) => (
            <div key={combo.id}>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {combo.name} ({combo.quantity})
                </span>
                <span className="text-white">
                  {(combo.price * combo.quantity).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          ))}

        {bookingState.bookingFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Phí tiện ích</span>
            <span className="text-white">
              {bookingState.bookingFee.toLocaleString("vi-VN")}đ
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 mt-4 pt-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white text-lg font-bold">Tổng cộng</span>
          <span className="text-white text-2xl font-bold">
            {getTotalPrice().toLocaleString("vi-VN")}đ
          </span>
        </div>

        <button
          onClick={onProceed}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition mb-3"
        >
          {proceedLabel} →
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full bg-transparent text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            ← Quay lại
          </button>
        )}
      </div>
    </div>
  );
}
