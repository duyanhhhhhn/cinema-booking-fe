"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

export default function TicketHistory() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Sample ticket data - replace with API call
  const tickets = [
    {
      id: "BK001234",
      movie: "Avengers: Secret Wars",
      date: "2024-01-20",
      time: "18:00",
      cinema: "CineMax Hồ Chí Minh",
      room: "Phòng 3",
      seats: ["A5", "A6"],
      combos: [{ name: "Combo Đôi", quantity: 1 }],
      total: 359000,
      status: "completed",
      format: "IMAX",
      qrCode: "/logo/logo.png",
    },
    {
      id: "BK001235",
      movie: "The Last Kingdom",
      date: "2024-01-22",
      time: "15:30",
      cinema: "CineMax Hà Nội",
      room: "Phòng 5",
      seats: ["C8", "C9", "C10"],
      combos: [],
      total: 240000,
      status: "upcoming",
      format: "2D",
      qrCode: "/logo/logo.png",
    },
    {
      id: "BK001236",
      movie: "Space Odyssey 2024",
      date: "2024-01-15",
      time: "21:00",
      cinema: "CineMax Hồ Chí Minh",
      room: "Phòng 2",
      seats: ["D12"],
      combos: [{ name: "Combo Solo", quantity: 1 }],
      total: 169000,
      status: "completed",
      format: "3D",
      qrCode: "/logo/logo.png",
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      completed: { label: "Đã xem", color: "gray" },
      upcoming: { label: "Sắp xem", color: "teal" },
      cancelled: { label: "Đã hủy", color: "red" },
    };
    const statusInfo = statusMap[status] || statusMap.completed;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        className={`bg-${statusInfo.color}-500 text-white`}
      />
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredTickets =
    tabValue === 0
      ? tickets
      : tabValue === 1
      ? tickets.filter((t) => t.status === "upcoming")
      : tickets.filter((t) => t.status === "completed");

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="font-bold mb-6 text-gray-900">
        Vé của tôi
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} className="mb-6">
        <Tab label="Tất cả" />
        <Tab label="Sắp xem" />
        <Tab label="Đã xem" />
      </Tabs>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Typography variant="h6" className="font-bold mb-1">
                        {ticket.movie}
                      </Typography>
                      <Typography variant="caption" className="text-gray-600">
                        Mã vé: {ticket.id}
                      </Typography>
                    </div>
                    {getStatusChip(ticket.status)}
                  </div>

                  <Grid container spacing={2} className="mb-4">
                    <Grid item xs={6} sm={3}>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <i className="ti ti-calendar"></i>
                        <span className="text-sm font-semibold">Ngày</span>
                      </div>
                      <Typography variant="body2" className="font-semibold">
                        {ticket.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <i className="ti ti-clock"></i>
                        <span className="text-sm font-semibold">Giờ</span>
                      </div>
                      <Typography variant="body2" className="font-semibold">
                        {ticket.time}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <i className="ti ti-building"></i>
                        <span className="text-sm font-semibold">Rạp</span>
                      </div>
                      <Typography variant="body2" className="font-semibold">
                        {ticket.cinema}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <i className="ti ti-screen"></i>
                        <span className="text-sm font-semibold">Phòng</span>
                      </div>
                      <Typography variant="body2" className="font-semibold">
                        {ticket.room} - {ticket.format}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <i className="ti ti-seat text-gray-600"></i>
                      <Typography variant="body2">
                        <span className="font-semibold">Ghế:</span> {ticket.seats.join(", ")}
                      </Typography>
                    </div>
                    {ticket.combos.length > 0 && (
                      <div className="flex items-center gap-2">
                        <i className="ti ti-shopping-cart text-gray-600"></i>
                        <Typography variant="body2">
                          <span className="font-semibold">Combo:</span>{" "}
                          {ticket.combos.map((c) => `${c.name} x${c.quantity}`).join(", ")}
                        </Typography>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <i className="ti ti-currency-dollar text-gray-600"></i>
                      <Typography variant="body2">
                        <span className="font-semibold">Tổng tiền:</span>{" "}
                        <span className="text-teal-600 font-bold text-lg">
                          {formatPrice(ticket.total)}
                        </span>
                      </Typography>
                    </div>
                  </div>
                </Grid>

                <Grid item xs={12} md={4}>
                  <div className="flex flex-col gap-3 h-full justify-center">
                    <Button
                      variant="contained"
                      fullWidth
                      className="bg-teal-500 hover:bg-teal-600"
                      onClick={() => handleViewTicket(ticket)}
                    >
                      <i className="ti ti-eye mr-2"></i>
                      Xem vé
                    </Button>
                    <Button variant="outlined" fullWidth>
                      <i className="ti ti-download mr-2"></i>
                      Tải PDF
                    </Button>
                    {ticket.status === "upcoming" && (
                      <Button variant="outlined" fullWidth className="text-red-600 border-red-600">
                        <i className="ti ti-x mr-2"></i>
                        Hủy vé
                      </Button>
                    )}
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <i className="ti ti-ticket-off text-6xl text-gray-400 mb-4"></i>
          <Typography variant="h6" className="text-gray-600 mb-2">
            Chưa có vé nào
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Hãy đặt vé để xem phim ngay hôm nay!
          </Typography>
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center">
          <Typography variant="h6" className="font-bold">
            Vé điện tử
          </Typography>
          <Typography variant="caption" className="text-gray-600">
            {selectedTicket?.id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="text-center border-2 border-dashed border-teal-500 p-6 rounded-lg">
                <img
                  src={selectedTicket.qrCode}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto mb-4"
                />
                <Typography variant="caption" className="text-gray-600">
                  Quét mã QR tại rạp
                </Typography>
              </div>
              <Divider />
              <div className="space-y-2">
                <Typography variant="subtitle1" className="font-bold">
                  {selectedTicket.movie}
                </Typography>
                <Typography variant="body2">
                  <strong>Ngày:</strong> {selectedTicket.date} | <strong>Giờ:</strong>{" "}
                  {selectedTicket.time}
                </Typography>
                <Typography variant="body2">
                  <strong>Rạp:</strong> {selectedTicket.cinema} - {selectedTicket.room}
                </Typography>
                <Typography variant="body2">
                  <strong>Ghế:</strong> {selectedTicket.seats.join(", ")}
                </Typography>
                <Typography variant="body2">
                  <strong>Định dạng:</strong> {selectedTicket.format}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" className="bg-teal-500">
            <i className="ti ti-download mr-2"></i>
            Tải về
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

