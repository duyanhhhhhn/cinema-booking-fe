"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShowtimeSelection from "../../component/booking/ShowtimeSelection";
import SeatSelection from "../../component/booking/SeatSelection";
import ComboSelection from "../../component/booking/ComboSelection";
import Payment from "../../component/booking/Payment";
import { Box, Stepper, Step, StepLabel, Button, Typography } from "@mui/material";

const steps = ["Chọn suất chiếu", "Chọn ghế", "Chọn combo", "Thanh toán"];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    movieId: params.movieId,
    showtime: null,
    seats: [],
    combos: [],
  });

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleShowtimeSelect = (showtime) => {
    setBookingData((prev) => ({ ...prev, showtime }));
    handleNext();
  };

  const handleSeatSelect = (seats) => {
    setBookingData((prev) => ({ ...prev, seats }));
  };

  const handleComboSelect = (combos) => {
    setBookingData((prev) => ({ ...prev, combos }));
  };

  const handlePaymentSuccess = (paymentData) => {
    // Redirect to success page
    router.push(`/booking-success?bookingId=${paymentData.bookingId}`);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ShowtimeSelection onSelectShowtime={handleShowtimeSelect} />;
      case 1:
        return (
          <SeatSelection
            onSeatSelect={handleSeatSelect}
          />
        );
      case 2:
        return (
          <ComboSelection
            selectedCombos={bookingData.combos}
            onComboSelect={handleComboSelect}
          />
        );
      case 3:
        return (
          <Payment
            bookingData={bookingData}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="font-bold mb-6 text-gray-900 text-center">
        Đặt vé xem phim
      </Typography>

      <Stepper activeStep={activeStep} className="mb-8">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box className="mb-6">{renderStepContent()}</Box>

      <Box className="flex justify-between mt-6">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          className="min-w-[120px]"
        >
          <i className="ti ti-arrow-left mr-2"></i>
          Quay lại
        </Button>
        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={bookingData.seats.length === 0}
            className="bg-teal-500 hover:bg-teal-600 min-w-[120px]"
          >
            Tiếp tục
            <i className="ti ti-arrow-right ml-2"></i>
          </Button>
        )}
        {activeStep === 2 && (
          <Button
            variant="contained"
            onClick={handleNext}
            className="bg-teal-500 hover:bg-teal-600 min-w-[120px]"
          >
            Tiếp tục thanh toán
            <i className="ti ti-arrow-right ml-2"></i>
          </Button>
        )}
      </Box>
    </Box>
  );
}

