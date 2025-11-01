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
  Switch,
} from "@mui/material";

export default function MovieManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Sample data - replace with API call
  const movies = [
    {
      id: 1,
      title: "Avengers: Secret Wars",
      genre: "Hành động, Khoa học viễn tưởng",
      duration: 180,
      format: "IMAX",
      rating: 4.8,
      status: "showing",
      releaseDate: "2024-01-15",
      endDate: "2024-02-15",
    },
    {
      id: 2,
      title: "The Last Kingdom",
      genre: "Hành động, Lịch sử",
      duration: 150,
      format: "2D",
      rating: 4.5,
      status: "showing",
      releaseDate: "2024-01-10",
      endDate: "2024-02-10",
    },
    {
      id: 3,
      title: "Space Odyssey 2024",
      genre: "Khoa học viễn tưởng",
      duration: 165,
      format: "3D",
      rating: 4.7,
      status: "coming-soon",
      releaseDate: "2024-02-01",
      endDate: "2024-03-01",
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setDialogOpen(true);
  };

  const handleDelete = (movieId) => {
    if (confirm("Bạn có chắc chắn muốn xóa phim này?")) {
      // Handle delete logic
      console.log("Delete movie:", movieId);
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      showing: { label: "Đang chiếu", color: "green" },
      "coming-soon": { label: "Sắp chiếu", color: "orange" },
      ended: { label: "Đã kết thúc", color: "gray" },
    };
    const statusInfo = statusMap[status] || statusMap.showing;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        className={`bg-${statusInfo.color}-500 text-white`}
      />
    );
  };

  return (
    <Box>
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h4" className="font-bold text-gray-900">
          Quản lý phim
        </Typography>
        <Button
          variant="contained"
          className="bg-teal-500 hover:bg-teal-600"
          startIcon={<i className="ti ti-plus"></i>}
          onClick={() => {
            setEditingMovie(null);
            setDialogOpen(true);
          }}
        >
          Thêm phim mới
        </Button>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold">ID</TableCell>
                  <TableCell className="font-semibold">Tên phim</TableCell>
                  <TableCell className="font-semibold">Thể loại</TableCell>
                  <TableCell className="font-semibold">Thời lượng</TableCell>
                  <TableCell className="font-semibold">Định dạng</TableCell>
                  <TableCell className="font-semibold">Đánh giá</TableCell>
                  <TableCell className="font-semibold">Trạng thái</TableCell>
                  <TableCell className="font-semibold">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((movie) => (
                    <TableRow key={movie.id} hover>
                      <TableCell>{movie.id}</TableCell>
                      <TableCell className="font-semibold">{movie.title}</TableCell>
                      <TableCell>{movie.genre}</TableCell>
                      <TableCell>{movie.duration} phút</TableCell>
                      <TableCell>
                        <Chip label={movie.format} size="small" className="bg-purple-500 text-white" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <i className="ti ti-star-filled text-yellow-500"></i>
                          <span>{movie.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusChip(movie.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(movie)}
                            className="text-blue-600"
                          >
                            <i className="ti ti-edit"></i>
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(movie.id)}
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
            count={movies.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMovie ? "Chỉnh sửa phim" : "Thêm phim mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="mt-2">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên phim"
                defaultValue={editingMovie?.title || ""}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={4}
                defaultValue={editingMovie?.description || ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thể loại"
                defaultValue={editingMovie?.genre || ""}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Thời lượng (phút)"
                type="number"
                defaultValue={editingMovie?.duration || ""}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Định dạng"
                select
                defaultValue={editingMovie?.format || "2D"}
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
                label="Ngôn ngữ"
                defaultValue={editingMovie?.language || "Tiếng Anh - Phụ đề Việt"}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày khởi chiếu"
                type="date"
                defaultValue={editingMovie?.releaseDate || ""}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="date"
                defaultValue={editingMovie?.endDate || ""}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Đạo diễn"
                defaultValue={editingMovie?.director || ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diễn viên (phân cách bằng dấu phẩy)"
                defaultValue={editingMovie?.cast || ""}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link trailer (YouTube)"
                defaultValue={editingMovie?.trailer || ""}
              />
            </Grid>
            <Grid item xs={12}>
              <div className="flex items-center gap-2">
                <label>Trạng thái:</label>
                <Switch defaultChecked={editingMovie?.status === "showing"} />
                <span>{editingMovie?.status === "showing" ? "Đang chiếu" : "Sắp chiếu"}</span>
              </div>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" className="bg-teal-500 hover:bg-teal-600">
            {editingMovie ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

