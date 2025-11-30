"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";

export default function UserManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterRole, setFilterRole] = useState("all");

  // Sample data - replace with API call
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      role: "customer",
      status: "active",
      createdAt: "2024-01-01",
      totalTickets: 15,
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0902345678",
      role: "customer",
      status: "active",
      createdAt: "2024-01-05",
      totalTickets: 8,
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0903456789",
      role: "staff",
      status: "active",
      createdAt: "2023-12-01",
      totalTickets: 0,
    },
    {
      id: 4,
      name: "Admin User",
      email: "admin@cinema.com",
      phone: "0904567890",
      role: "admin",
      status: "active",
      createdAt: "2023-11-01",
      totalTickets: 0,
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleChip = (role) => {
    const roleMap = {
      customer: { label: "Khách hàng", color: "blue" },
      staff: { label: "Nhân viên", color: "orange" },
      admin: { label: "Quản trị", color: "purple" },
    };
    const roleInfo = roleMap[role] || roleMap.customer;
    return (
      <Chip
        label={roleInfo.label}
        size="small"
        className={`bg-${roleInfo.color}-500 text-white`}
      />
    );
  };

  const getStatusChip = (status) => {
    const statusMap = {
      active: { label: "Hoạt động", color: "green" },
      banned: { label: "Đã khóa", color: "red" },
      pending: { label: "Chờ xử lý", color: "orange" },
    };
    const statusInfo = statusMap[status] || statusMap.active;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        className={`bg-${statusInfo.color}-500 text-white`}
      />
    );
  };

  const filteredUsers =
    filterRole === "all"
      ? users
      : users.filter((user) => user.role === filterRole);

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý người dùng
        </Typography>
      </div>

      <Card className="shadow-md mb-4">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <TextField
              placeholder="Tìm kiếm người dùng..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-search text-gray-400"></i>
                  </InputAdornment>
                ),
              }}
              className="flex-1"
            />
            <TextField
              select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(0);
              }}
              className="min-w-[200px]"
            >
              <MenuItem value="all">Tất cả vai trò</MenuItem>
              <MenuItem value="customer">Khách hàng</MenuItem>
              <MenuItem value="staff">Nhân viên</MenuItem>
              <MenuItem value="admin">Quản trị</MenuItem>
            </TextField>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Họ tên</TableCell>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell className="font-semibold">SĐT</TableCell>
                  <TableCell className="font-semibold">Vai trò</TableCell>
                  <TableCell className="font-semibold">Trạng thái</TableCell>
                  <TableCell className="font-semibold">Tổng vé</TableCell>
                  <TableCell className="font-semibold">Ngày tạo</TableCell>
                  <TableCell className="font-semibold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell className="font-semibold">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{getRoleChip(user.role)}</TableCell>
                      <TableCell>{getStatusChip(user.status)}</TableCell>
                      <TableCell>{user.totalTickets}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton size="small" className="text-blue-600">
                            <i className="ti ti-eye"></i>
                          </IconButton>
                          <IconButton size="small" className="text-gray-600">
                            <i className="ti ti-edit"></i>
                          </IconButton>
                          <IconButton
                            size="small"
                            className={user.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            <i className={user.status === "active" ? "ti ti-ban" : "ti ti-check"}></i>
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
            count={filteredUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </CardContent>
      </Card>
    </Box>
  );
}

