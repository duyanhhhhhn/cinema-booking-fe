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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";

export default function ShowtimeManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);

  // Sample data - replace with API call
  const showtimes = [
    {
      id: 1,
      movie: "Avengers: Secret Wars",
      cinema: "CineMax Hồ Chí Minh",
      room: "Phòng 3",
      date: "2024-01-20",
      time: "18:00",
      format: "IMAX",
      price: 150000,
      availableSeats: 45,
      totalSeats: 50,
    },
    {
      id: 2,
      movie: "The Last Kingdom",
      cinema: "CineMax Hà Nội",
      room: "Phòng 5",
      date: "2024-01-20",
      time: "15:30",
      format: "2D",
      price: 80000,
      availableSeats: 20,
      totalSeats: 80,
    },
    {
      id: 3,
      movie: "Space Odyssey 2024",
      cinema: "CineMax Hồ Chí Minh",
      room: "Phòng 2",
      date: "2024-01-22",
      time: "21:00",
      format: "3D",
      price: 120000,
      availableSeats: 10,
      totalSeats: 60,
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (showtime) => {
    setEditingShowtime(showtime);
    setDialogOpen(true);
  };

  const handleDelete = (showtimeId) => {
    if (confirm("Bạn có chắc chắn muốn xóa suất chiếu này?")) {
      // Handle delete logic
      console.log("Delete showtime:", showtimeId);
    }
  };

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý suất chiếu
        </Typography>
        <Button
          variant="contained"
          className="bg-teal-500 hover:bg-teal-600"
          startIcon={<i className="ti ti-plus"></i>}
          onClick={() => {
            setEditingShowtime(null);
            setDialogOpen(true);
          }}
        >
          Thêm suất chiếu
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Phim</TableCell>
                  <TableCell className="font-semibold">Rạp</TableCell>
                  <TableCell className="font-semibold">Phòng</TableCell>
                  <TableCell className="font-semibold">Ngày</TableCell>
                  <TableCell className="font-semibold">Giờ</TableCell>
                  <TableCell className="font-semibold">Định dạng</TableCell>
                  <TableCell className="font-semibold">Giá vé</TableCell>
                  <TableCell className="font-semibold">Ghế trống</TableCell>
                  <TableCell className="font-semibold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showtimes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((showtime) => (
                    <TableRow key={showtime.id} hover>
                      <TableCell>{showtime.id}</TableCell>
                      <TableCell className="font-semibold">{showtime.movie}</TableCell>
                      <TableCell>{showtime.cinema}</TableCell>
                      <TableCell>{showtime.room}</TableCell>
                      <TableCell>{showtime.date}</TableCell>
                      <TableCell>{showtime.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={showtime.format}
                          size="small"
                          className={`${
                            showtime.format === "IMAX"
                              ? "bg-purple-500"
                              : showtime.format === "3D"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          } text-white`}
                        />
                      </TableCell>
                      <TableCell>{formatPrice(showtime.price)}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${showtime.availableSeats}/${showtime.totalSeats}`}
                          size="small"
                          className={
                            showtime.availableSeats < 10
                              ? "bg-red-500 text-white"
                              : showtime.availableSeats < 20
                              ? "bg-orange-500 text-white"
                              : "bg-green-500 text-white"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(showtime)}
                            className="text-blue-600"
                          >
                            <i className="ti ti-edit"></i>
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(showtime.id)}
                            className="text-red-600"
                          >
                            <i className="ti ti-trash"></i>
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
            count={showtimes.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingShowtime ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="mt-2">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phim"
                select
                defaultValue={editingShowtime?.movie || ""}
                required
              >
                <MenuItem value="1">Avengers: Secret Wars</MenuItem>
                <MenuItem value="2">The Last Kingdom</MenuItem>
                <MenuItem value="3">Space Odyssey 2024</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Chi nhánh"
                select
                defaultValue={editingShowtime?.cinema || ""}
                required
              >
                <MenuItem value="1">CineMax Hồ Chí Minh</MenuItem>
                <MenuItem value="2">CineMax Hà Nội</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phòng chiếu"
                select
                defaultValue={editingShowtime?.room || ""}
                required
              >
                <MenuItem value="1">Phòng 1</MenuItem>
                <MenuItem value="2">Phòng 2</MenuItem>
                <MenuItem value="3">Phòng 3</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày chiếu"
                type="date"
                defaultValue={editingShowtime?.date || ""}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giờ chiếu"
                type="time"
                defaultValue={editingShowtime?.time || ""}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Định dạng"
                select
                defaultValue={editingShowtime?.format || "2D"}
                required
              >
                <MenuItem value="2D">2D</MenuItem>
                <MenuItem value="3D">3D</MenuItem>
                <MenuItem value="IMAX">IMAX</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giá vé"
                type="number"
                defaultValue={editingShowtime?.price || ""}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" className="bg-teal-500 hover:bg-teal-600">
            {editingShowtime ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

