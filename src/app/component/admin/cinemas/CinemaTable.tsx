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
import { ICinema, useDeleteCinemaMutation } from "@/types/data/cinema";
import DeletePopup from "../../popup/DeletePopup";
import { useNotification } from "@/hooks/useNotification";
import dayjs from "dayjs";

interface CinemaTableProps {
  cinemas: ICinema[];
  refetchCinemas: () => void;
}

export default function CinemaTable({ cinemas, refetchCinemas }: CinemaTableProps) {
  const n = useNotification();
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { mutate: deleteCinema } = useDeleteCinemaMutation();

  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    return `${urlImage}/${imageUrl}?t=${Date.now()}`;
  };

  const handleClickIconDelete = (id: number) => {
    setSelectedId(id);
    setOpenDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteCinema(selectedId, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedId(null);
          refetchCinemas();
          n.success("Xoá rạp chiếu thành công");
        },
        onError: (error: any) => {
          n.error(error.message);
        },
      });
    }
  };

  const renderStatusChip = (isActive: boolean) => {
    return (
      <Chip
        label={isActive ? "Hoạt động" : "Ngưng hoạt động"}
        color={isActive ? "success" : "primary"}
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
        <Table sx={{ minWidth: 650 }} aria-label="cinema table">
          <TableHead sx={{ backgroundColor: "#f4f4f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Tên rạp</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Địa chỉ</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Số điện thoại</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Ngày tạo</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cinemas.map((cinema) => (
              <TableRow
                key={cinema.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { backgroundColor: "#fafafa" },
                }}
              >
                <TableCell>
                  <Box
                    component="div"
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundImage: `url(${getFullImageUrl(cinema.imageUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: 1,
                      backgroundColor: "#e4e4e7",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{cinema.name}</TableCell>
                <TableCell>{cinema.address}</TableCell>
                <TableCell>{cinema.phone}</TableCell>
                <TableCell>{dayjs(cinema.createdAt).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{renderStatusChip(cinema.isActive)}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Link href={`/admin/cinemas/${cinema.id}`}>
                      <IconButton size="small" sx={{ color: "#52525b" }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Link>
                    <IconButton
                      onClick={() => handleClickIconDelete(cinema.id)}
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
        description={"Bạn có chắc muốn xoá rạp chiếu này không?"}
      />
    </>
  );
}
