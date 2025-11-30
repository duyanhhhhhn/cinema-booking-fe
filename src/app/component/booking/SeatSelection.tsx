"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { Seat } from "@/types";

interface SeatSelectionProps {
  onSeatSelect: (seats: Seat[]) => void;
}

export default function SeatSelection({ onSeatSelect }: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Seat layout - sample data
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  const columns = Array.from({ length: 12 }, (_, i) => i + 1);

  // Sample seat data - replace with API call
  const getSeatStatus = (row: string, col: number) => {
    // VIP seats (rows A-D)
    if (["A", "B", "C", "D"].includes(row)) {
      return { type: "vip", price: 150000, available: Math.random() > 0.2 };
    }
    // Couple seats (middle section)
    if (col >= 5 && col <= 8) {
      return { type: "couple", price: 200000, available: Math.random() > 0.3 };
    }
    // Standard seats
    return { type: "standard", price: 80000, available: Math.random() > 0.15 };
  };

  const handleSeatClick = (row: string, col: number) => {
    const seatId = `${row}${col}`;
    const seatData = getSeatStatus(row, col);

    if (!seatData.available) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }

    if (onSeatSelect) {
      const seats = selectedSeats.includes(seatId)
        ? selectedSeats.filter((id) => id !== seatId)
        : [...selectedSeats, seatId];
      
      const seatObjects: Seat[] = seats.map((id) => {
        const r = id[0];
        const c = parseInt(id.slice(1));
        const status = getSeatStatus(r, c);
        return {
          id,
          row: r,
          col: c,
          price: status.price,
          status: status.available ? 'selected' : 'occupied',
          type: status.type as 'standard' | 'vip' | 'couple'
        };
      });
      onSeatSelect(seatObjects);
    }
  };

  const getSeatColor = (row: string, col: number, status: any) => {
    if (!status.available) return "bg-gray-400 cursor-not-allowed";
    if (selectedSeats.includes(`${row}${col}`)) return "bg-teal-500 hover:bg-teal-600";
    if (status.type === "vip") return "bg-purple-500 hover:bg-purple-600";
    if (status.type === "couple") return "bg-pink-500 hover:bg-pink-600";
    return "bg-gray-300 hover:bg-gray-400";
  };

  const calculateTotal = (): number => {
    return selectedSeats.reduce((total, seatId) => {
      const status = getSeatStatus(seatId[0], parseInt(seatId.slice(1)));
      return total + status.price;
    }, 0);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Box className="container mx-auto px-4 py-6">
      <Typography variant="h5" className="font-bold mb-6 text-gray-900">
        Chọn ghế ngồi
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Screen */}
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 text-white py-4 px-8 rounded-lg mb-4 inline-block min-w-[80%]">
              <Typography variant="h6" className="font-bold">
                MÀN HÌNH
              </Typography>
            </div>
          </div>

          {/* Seat Map */}
          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            {/* Column Numbers */}
            <div className="flex justify-center mb-2">
              <div className="w-8"></div>
              {columns.map((col) => (
                <div key={col} className="w-8 text-center text-sm font-semibold">
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {rows.map((row) => (
              <div key={row} className="flex items-center mb-2">
                <div className="w-8 text-center font-semibold">{row}</div>
                {columns.map((col) => {
                  const status = getSeatStatus(row, col);
                  return (
                    <button
                      key={`${row}${col}`}
                      onClick={() => handleSeatClick(row, col)}
                      disabled={!status.available}
                      className={`w-8 h-8 m-1 rounded transition-all ${getSeatColor(
                        row,
                        col,
                        status
                      )} text-white text-xs font-semibold`}
                      title={`${row}${col} - ${formatPrice(status.price)}`}
                    >
                      {status.type === "couple" ? (
                        <i className="ti ti-heart text-xs"></i>
                      ) : (
                        col
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <span className="text-sm">Ghế thường ({formatPrice(80000)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded"></div>
              <span className="text-sm">VIP ({formatPrice(150000)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded"></div>
              <span className="text-sm">Đôi ({formatPrice(200000)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded"></div>
              <span className="text-sm">Đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded"></div>
              <span className="text-sm">Đã bán</span>
            </div>
          </div>
        </Grid>

        {/* Right Sidebar - Selected Seats Summary */}
        <Grid item xs={12} md={4}>
          <Card className="sticky top-20 shadow-lg">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Ghế đã chọn
              </Typography>

              {selectedSeats.length === 0 ? (
                <Typography variant="body2" className="text-gray-500 text-center py-8">
                  Chưa chọn ghế nào
                </Typography>
              ) : (
                <div className="space-y-3 mb-4">
                  {selectedSeats.map((seatId) => {
                    const status = getSeatStatus(seatId[0], parseInt(seatId.slice(1)));
                    return (
                      <div
                        key={seatId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Chip
                            label={seatId}
                            size="small"
                            className="bg-teal-500 text-white font-semibold"
                          />
                          <span className="text-sm text-gray-600">{status.type}</span>
                        </div>
                        <span className="font-semibold text-teal-600">
                          {formatPrice(status.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Divider className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số ghế:</span>
                  <span className="font-semibold">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-teal-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <Button
                variant="contained"
                fullWidth
                size="large"
                className="bg-teal-500 hover:bg-teal-600 mt-4"
                disabled={selectedSeats.length === 0}
              >
                Tiếp tục
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

