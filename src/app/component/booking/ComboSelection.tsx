"use client";

import { useState, useEffect } from "react";
import { useBooking } from "@/contexts/BookingContext";
import OrderSummary from "./OrderSummary";
import { Combo } from "@/types/booking/booking";
import StepIndicator from "./StepIndicator";

const availableCombos: Combo[] = [
  {
    id: "combo1",
    name: "Combo Bắp Nước Lớn",
    description: "1 Bắp lớn + 2 Nước ngọt lớn (Coca/Pepsi/7Up)",
    price: 129000,
    image:
      "https://images.pexels.com/photos/3850838/pexels-photo-3850838.jpeg?auto=compress&cs=tinysrgb&w=400",
    quantity: 0,
  },
  {
    id: "combo2",
    name: "Combo Bạn Bè",
    description: "2 Bắp vừa + 2 Nước ngọt vừa + 1 Snack",
    price: 159000,
    image:
      "https://images.pexels.com/photos/7234388/pexels-photo-7234388.jpeg?auto=compress&cs=tinysrgb&w=400",
    quantity: 0,
  },
  {
    id: "combo3",
    name: "Combo Couple",
    description: "1 Bắp lớn + 2 Nước ngọt vừa",
    price: 109000,
    image:
      "https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400",
    quantity: 0,
  },
];

export default function ComboSelectionStep() {
  const { bookingState, setCombos, setStep } = useBooking();
  const [combos, setCombosLocal] = useState<Combo[]>(
    bookingState.combos.length > 0 ? bookingState.combos : availableCombos
  );
  const [timer, setTimer] = useState("08:45");

  const updateQuantity = (comboId: string, change: number) => {
    setCombosLocal((prev) =>
      prev.map((combo) => {
        if (combo.id === comboId) {
          const newQuantity = Math.max(0, combo.quantity + change);
          return { ...combo, quantity: newQuantity };
        }
        return combo;
      })
    );
  };

  const handleProceed = () => {
    setCombos(combos);
    setStep(3);
  };

  const handleBack = () => {
    setCombos(combos);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <StepIndicator currentStep={2} />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2">
                Chọn Combo Của Bạn
              </h1>
              <p className="text-gray-400">
                Chọn combo đồ ăn & thức uống yêu thích của bạn.
              </p>

              <div className="bg-[#1a1a2e] rounded-lg p-4 mt-4 inline-flex items-center gap-2">
                {/* <Clock className="w-4 h-4 text-red-500" /> */}
                <span className="text-white text-sm">
                  Ghế đang được giữ trong
                </span>
                <span className="text-red-500 font-bold">{timer}</span>
              </div>
            </div>

            <div className="space-y-4">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-[#1a1a2e] rounded-xl p-6 flex items-center gap-6"
                >
                  <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-1">
                      {combo.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {combo.description}
                    </p>
                    <span className="text-red-500 text-xl font-bold">
                      {combo.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(combo.id, -1)}
                      disabled={combo.quantity === 0}
                      className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {/* <Minus className="w-5 h-5" /> */}
                    </button>

                    <span className="text-white text-xl font-bold w-8 text-center">
                      {combo.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(combo.id, 1)}
                      className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
                    >
                      {/* <PlusIcon className="w-5 h-5" /> */}
                    </button>
                  </div>
                </div>
              ))}
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
                      <span>CGV Vincom Center</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>Thứ Hai, 27/05/2024</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
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
