"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";

export default function AdminTicketsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with API call
  const tickets = [
    {
      id: "BK001234",
      movie: "Avengers: Secret Wars",
      customer: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      date: "2024-01-20",
      time: "18:00",
      seats: ["A5", "A6"],
      total: 359000,
      status: "completed",
      paymentMethod: "VNPay",
      createdAt: "2024-01-20 10:30",
    },
    {
      id: "BK001235",
      movie: "The Last Kingdom",
      customer: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0902345678",
      date: "2024-01-22",
      time: "15:30",
      seats: ["C8", "C9", "C10"],
      total: 240000,
      status: "upcoming",
      paymentMethod: "MoMo",
      createdAt: "2024-01-21 11:15",
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusChip = (status) => {
    const statusMap = {
      completed: { label: "Đã xem", color: "green" },
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

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.movie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý vé đã bán
        </Typography>
        <Button
          variant="outlined"
          startIcon={<i className="ti ti-download"></i>}
          className="border-teal-500 text-teal-600"
        >
          Xuất Excel
        </Button>
      </div>

      <Card className="shadow-md mb-4">
        <CardContent className="p-4">
          <TextField
            fullWidth
            placeholder="Tìm kiếm vé (mã vé, khách hàng, phim)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ti ti-search text-gray-400"></i>
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">Mã vé</TableCell>
                  <TableCell className="font-semibold">Khách hàng</TableCell>
                  <TableCell className="font-semibold">Phim</TableCell>
                  <TableCell className="font-semibold">Ngày/Giờ</TableCell>
                  <TableCell className="font-semibold">Ghế</TableCell>
                  <TableCell className="font-semibold">Thanh toán</TableCell>
                  <TableCell className="font-semibold">Tổng tiền</TableCell>
                  <TableCell className="font-semibold">Trạng thái</TableCell>
                  <TableCell className="font-semibold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticket) => (
                    <TableRow key={ticket.id} hover>
                      <TableCell className="font-semibold">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{ticket.customer}</div>
                          <div className="text-sm text-gray-600">{ticket.email}</div>
                          <div className="text-sm text-gray-600">{ticket.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.movie}</TableCell>
                      <TableCell>
                        <div>
                          <div>{ticket.date}</div>
                          <div className="text-sm text-gray-600">{ticket.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.seats.join(", ")}</TableCell>
                      <TableCell>
                        <Chip label={ticket.paymentMethod} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell className="font-semibold text-teal-600">
                        {formatPrice(ticket.total)}
                      </TableCell>
                      <TableCell>{getStatusChip(ticket.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton size="small" className="text-blue-600">
                            <i className="ti ti-eye"></i>
                          </IconButton>
                          <IconButton size="small" className="text-teal-600">
                            <i className="ti ti-printer"></i>
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredTickets.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </CardContent>
      </Card>
    </Box>
  );
}

