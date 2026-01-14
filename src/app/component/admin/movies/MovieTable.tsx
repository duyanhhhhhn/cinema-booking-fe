import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Link,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { IMovie, useDeleteMovieMutation } from "@/types/data/movie";
import DeletePopup from "../../popup/DeletePopup";
import { useNotification } from "@/hooks/useNotification";
import dayjs from "dayjs";

interface MovieTableProps {
  movies: IMovie[];
  refetchMovies: () => void; 
}

export default function MovieTable({ movies, refetchMovies }: MovieTableProps) {
  const n = useNotification();
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  // 1. Thêm state để lưu ID phim cần xoá
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { mutate: deleteMovie } = useDeleteMovieMutation();

  const handleClickIconDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteMovie(selectedId, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedId(null);
          refetchMovies();
          n.success('Xoá phim thành công');
        },
        onError: (error) => {
          n.error(error.message);
        },
      });
    }
  };
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;

  const renderStatusChip = (status: string) => {
    let color: "success" | "primary" | "default" = "default";
    let label = "";
    switch (status) {
      case "NOW_SHOWING":
        color = "success";
        label = "Đang chiếu";
        break;
      case "COMING_SOON":
        color = "primary";
        label = "Sắp chiếu";
        break;
      case "ENDED":
        color = "default";
        label = "Ngừng chiếu";
        break;
    }
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        variant="filled"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="movie table">
          <TableHead sx={{ backgroundColor: "#f4f4f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Poster
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Tên Phim
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Thể Loại
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Thời Lượng
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Ngày Khởi Chiếu
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Ngày Kết Thúc
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Trạng Thái
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#3f3f46" }}
              >
                Hành Động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie) => (
              <TableRow
                key={movie.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "#fafafa" },
                }}
              >
                <TableCell component="th" scope="row">
                  <Box
                    component="div"
                    sx={{
                      width: 48,
                      height: 64,
                      backgroundImage: `url(${urlImage}${movie.posterUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 1,
                      backgroundColor: "#e4e4e7",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{movie.title}</TableCell>
                <TableCell>
                  {movie.genre ?
                    <Chip
                      label={movie.genre}
                      size="small"
                      variant="filled"
                    />
                    :""
                  }
                </TableCell>
                <TableCell>{movie.durationMinutes} Phút</TableCell>
                <TableCell>{dayjs(movie.createdAt).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{dayjs(movie.endDate).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{renderStatusChip(movie.status)}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Link href={`/admin/movies/${movie.id}`}>
                    <IconButton
                      size="small"
                      sx={{ color: "#52525b" }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    </Link>

                    <IconButton
                      onClick={() => handleClickIconDelete(movie.id)}
                      size="small"
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeletePopup
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmDelete}
        description={"Bạn có chắc muốn xoá Phim này không?"}
      />
    </>
  );
}
