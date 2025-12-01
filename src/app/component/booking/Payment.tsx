"use client";

import { useState } from "react";
import { useBooking } from "@/contexts/BookingContext";
import OrderSummary from "./OrderSummary";

const paymentMethods = [
  {
    id: "momo" as const,
    name: "Thanh toán bằng Momo",
    description: "Ví điện tử",
    icon: "M",
  },
  {
    id: "vnpay" as const,
    name: "Thanh toán bằng VNPay",
    description: "Quét mã QR qua ứng dụng ngân hàng",
    icon: "V",
  },
];

export default function PaymentMethodStep() {
  const { bookingState, setPaymentMethod, setStep } = useBooking();
  const [selected, setSelected] = useState<"momo" | "vnpay" | null>(
    bookingState.paymentMethod
  );

  const handleSelect = (method: "momo" | "vnpay") => {
    setSelected(method);
    setPaymentMethod(method);
  };

  const handleProceed = () => {
    if (selected) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2">
                Chọn Phương thức Thanh toán
              </h1>
              <p className="text-gray-400">
                Vui lòng chọn một trong các phương thức thanh toán dưới đây.
              </p>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelect(method.id)}
                  className={`w-full bg-[#1a1a2e] border-2 rounded-xl p-6 transition-all hover:border-red-600 ${
                    selected === method.id
                      ? "border-red-600"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
                        method.id === "momo"
                          ? "bg-pink-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {method.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <h3 className="text-white text-lg font-bold mb-1">
                        {method.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {method.description}
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selected === method.id
                          ? "border-red-600 bg-red-600"
                          : "border-gray-600"
                      }`}
                    >
                      {selected === method.id && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              onProceed={handleProceed}
              proceedLabel="Thanh toán"
              showMovieInfo={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
