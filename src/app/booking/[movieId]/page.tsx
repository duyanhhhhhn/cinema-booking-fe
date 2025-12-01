"use client";

import ComboSelectionStep from "@/app/component/booking/ComboSelection";
import PaymentMethodStep from "@/app/component/booking/Payment";
import SeatSelectionStep from "@/app/component/booking/SeatSelection";
import { useBooking } from "@/contexts/BookingContext";


export default function BookingPage() {
  const { bookingState } = useBooking();

  const renderStep = () => {
    switch (bookingState.step) {
      case 1:
        return <SeatSelectionStep />;
      case 2:
        return <ComboSelectionStep />;
      case 3:
        return <PaymentMethodStep />;
      default:
        return <PaymentMethodStep />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f1e] flex flex-col">
      <div className="flex-1">{renderStep()}</div>
    </div>
  );
}
