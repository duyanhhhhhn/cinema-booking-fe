"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  TextField,
  Alert,
} from "@mui/material";

export default function Payment({ bookingData, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
      icon: "ti ti-wallet",
      description: "Thanh toán qua ví điện tử VNPay",
    },
    {
      id: "momo",
      name: "MoMo",
      icon: "ti ti-brand-cashapp",
      description: "Thanh toán qua ví MoMo",
    },
    {
      id: "zalopay",
      name: "ZaloPay",
      icon: "ti ti-brand-google-wallet",
      description: "Thanh toán qua ZaloPay",
    },
    {
      id: "stripe",
      name: "Stripe",
      icon: "ti ti-credit-card",
      description: "Thanh toán bằng thẻ tín dụng/ghi nợ",
    },
  ];

  const calculateTotal = () => {
    let total = 0;
    if (bookingData?.seats) {
      total += bookingData.seats.reduce((sum, seat) => sum + seat.price, 0);
    }
    if (bookingData?.combos) {
      total += bookingData.combos.reduce(
        (sum, combo) => sum + combo.price * combo.quantity,
        0
      );
    }
    return total;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      if (onPaymentSuccess) {
        onPaymentSuccess({
          bookingId: `BK${Date.now()}`,
          paymentMethod,
          total: calculateTotal(),
        });
      }
    }, 2000);
  };

  return (
    <Box className="container mx-auto px-4 py-6">
      <Typography variant="h5" className="font-bold mb-6 text-gray-900">
        Thanh toán
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Payment Method */}
        <Grid item xs={12} md={8}>
          <Card className="mb-6 shadow-md">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Phương thức thanh toán
              </Typography>

              <FormControl component="fieldset" className="w-full">
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="mb-4 p-4 border rounded-lg hover:border-teal-500 transition-colors"
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio />}
                        label={
                          <div className="flex items-center gap-3 flex-1">
                            <i className={`${method.icon} text-2xl text-teal-500`}></i>
                            <div>
                              <Typography variant="subtitle1" className="font-semibold">
                                {method.name}
                              </Typography>
                              <Typography variant="caption" className="text-gray-600">
                                {method.description}
                              </Typography>
                            </div>
                          </div>
                        }
                        className="w-full m-0"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Thông tin liên hệ
              </Typography>

              <div className="space-y-4">
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  required
                />
              </div>

              <Alert severity="info" className="mt-4">
                Mã vé điện tử sẽ được gửi đến email này sau khi thanh toán thành công.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Summary */}
        <Grid item xs={12} md={4}>
          <Card className="sticky top-20 shadow-lg">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Tóm tắt đơn hàng
              </Typography>

              {/* Movie Info */}
              {bookingData?.movie && (
                <div className="mb-4">
                  <Typography variant="subtitle2" className="font-semibold mb-1">
                    {bookingData.movie.title}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {bookingData.showtime?.date} - {bookingData.showtime?.time}
                  </Typography>
                </div>
              )}

              <Divider className="my-4" />

              {/* Seats */}
              {bookingData?.seats && bookingData.seats.length > 0 && (
                <div className="mb-4">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Ghế ngồi:
                  </Typography>
                  <div className="space-y-1">
                    {bookingData.seats.map((seat, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{seat.id}</span>
                        <span>{formatPrice(seat.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combos */}
              {bookingData?.combos && bookingData.combos.length > 0 && (
                <div className="mb-4">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Combo:
                  </Typography>
                  <div className="space-y-1">
                    {bookingData.combos.map((combo, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {combo.name} x{combo.quantity}
                        </span>
                        <span>{formatPrice(combo.price * combo.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Divider className="my-4" />

              {/* Total */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <Typography variant="body1" className="font-semibold">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="h6" className="font-bold text-teal-600">
                    {formatPrice(calculateTotal())}
                  </Typography>
                </div>
              </div>

              <Button
                variant="contained"
                fullWidth
                size="large"
                className="bg-teal-500 hover:bg-teal-600 mt-4 py-3 text-lg font-semibold"
                onClick={handlePayment}
                disabled={isProcessing || !email || !phone}
              >
                {isProcessing ? (
                  <>
                    <i className="ti ti-loader-2 animate-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="ti ti-wallet mr-2"></i>
                    Thanh toán ngay
                  </>
                )}
              </Button>

              <Typography variant="caption" className="text-gray-500 text-center block mt-4">
                Bằng cách thanh toán, bạn đồng ý với{" "}
                <a href="#" className="text-teal-600 hover:underline">
                  Điều khoản & Điều kiện
                </a>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

