"use client";

import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import OrderSummary from "./OrderSummary";
import StepIndicator from "./StepIndicator";

const seatLayout = [
  {
    row: "A",
    seats: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      type: "standard" as const,
    })),
  },
  {
    row: "B",
    seats: [
      ...Array.from({ length: 2 }, (_, i) => ({
        number: i + 1,
        type: "standard" as const,
      })),
      ...Array.from({ length: 2 }, (_, i) => ({
        number: i + 3,
        type: "booked" as const,
      })),
      ...Array.from({ length: 7 }, (_, i) => ({
        number: i + 5,
        type: "standard" as const,
      })),
    ],
  },
  {
    row: "C",
    seats: Array.from({ length: 14 }, (_, i) => ({
      number: i + 1,
      type: "vip" as const,
    })),
  },
  {
    row: "D",
    seats: Array.from({ length: 14 }, (_, i) => ({
      number: i + 1,
      type: "vip" as const,
    })),
  },
  {
    row: "E",
    seats: [
      ...Array.from({ length: 2 }, (_, i) => ({
        number: i + 1,
        type: "couple" as const,
      })),
      { number: 3, type: "couple" as const },
      { number: 4, type: "selected" as const },
      { number: 5, type: "booked" as const },
      { number: 6, type: "couple" as const },
      { number: 7, type: "couple" as const },
    ],
  },
];

const seatTypes = [
  { label: "Ghế thường", color: "bg-gray-600", key: "standard" },
  { label: "Ghế VIP", color: "bg-yellow-500", key: "vip" },
  { label: "Ghế đôi", color: "bg-pink-400", key: "couple" },
  { label: "Đang chọn", color: "bg-red-600", key: "selected" },
  { label: "Đã chọn", color: "bg-teal-500", key: "booked" },
  { label: "Đã đặt", color: "bg-red-800", key: "reserved" },
];

export default function SeatSelectionStep() {
  const { bookingState, setSeats, setStep } = useBooking();
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    bookingState.seats
  );
  const [timer, setTimer] = useState("10:00");

  const handleSeatClick = (row: string, number: number, type: string) => {
    if (type === "booked") return;

    const seatId = `${row}${number}`;
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleProceed = () => {
    if (selectedSeats.length > 0) {
      setSeats(selectedSeats);
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(3);
  };

  const getSeatColor = (type: string, row: string, number: number) => {
    const seatId = `${row}${number}`;
    if (selectedSeats.includes(seatId)) return "bg-teal-500 text-white";

    switch (type) {
      case "standard":
        return "bg-gray-600 text-white hover:bg-gray-500";
      case "vip":
        return "bg-yellow-500 text-gray-900 hover:bg-yellow-400";
      case "couple":
        return "bg-pink-400 text-white hover:bg-pink-300";
      case "booked":
        return "bg-red-800 text-gray-400 cursor-not-allowed";
      case "selected":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <StepIndicator currentStep={1} />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-white text-4xl font-bold mb-4">Chọn Ghế</h1>

              <div className="bg-[#1a1a2e] rounded-lg p-4 mb-6 inline-flex items-center gap-2">
                {/* <Clock className="w-4 h-4 text-red-500" /> */}
                <span className="text-white text-sm">
                  Ghế đang được giữ trong
                </span>
                <span className="text-red-500 font-bold">{timer}</span>
              </div>
            </div>

            <div className="bg-[#1a1a2e] rounded-lg p-8 mb-6">
              <div className="bg-gray-700 rounded-lg py-3 mb-8 text-center">
                <span className="text-white font-medium">Màn hình</span>
              </div>

              <div className="space-y-3 mb-8">
                {seatLayout.map((rowData) => (
                  <div key={rowData.row} className="flex items-center gap-2">
                    <span className="text-white font-bold w-8">
                      {rowData.row}
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      {rowData.seats.map((seat) => (
                        <button
                          key={seat.number}
                          onClick={() =>
                            handleSeatClick(rowData.row, seat.number, seat.type)
                          }
                          disabled={seat.type === "booked"}
                          className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${getSeatColor(
                            seat.type,
                            rowData.row,
                            seat.number
                          )}`}
                        >
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                {seatTypes.map((type) => (
                  <div key={type.key} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${type.color}`}></div>
                    <span className="text-gray-400 text-sm">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="mb-6 bg-[#1a1a2e] rounded-lg p-4">
              <div className="flex gap-4">
                <img
                  src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Movie poster"
                  className="w-24 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold mb-3">
                    Doraemon: Nobita và Bản Giao Hưởng Địa Cầu
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      {/* <MapPin className="w-4 h-4" /> */}
                      <span>CGV Vincom Center</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      {/* <Calendar className="w-4 h-4" /> */}
                      <span>Thứ Hai, 27/05/2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      {/* <Clock className="w-4 h-4" /> */}
                      <span>19:30 - Phòng chiếu 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <OrderSummary
              onProceed={handleProceed}
              onBack={handleBack}
              proceedLabel="Tiếp tục"
              showMovieInfo={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
