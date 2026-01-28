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
import { Edit, Delete, Restore } from "@mui/icons-material";
import {
  ICinema,
  useDeactivateCinemaMutation,
  useActivateCinemaMutation,
} from "@/types/data/cinema";
import DeletePopup from "../../popup/DeletePopup";
import { useNotification } from "@/hooks/useNotification";
import dayjs from "dayjs";

interface CinemaTableProps {
  cinemas: ICinema[];
  refetchCinemas: () => void;
}

interface CinemaTableProps {
  cinemas: ICinema[];
  refetchCinemas: () => void;
  onEditCinema: (cinema: ICinema) => void; // thêm callback
}

export default function CinemaTable({
  cinemas,
  refetchCinemas,
  onEditCinema,
}: CinemaTableProps) {
  const n = useNotification();
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<ICinema | null>(null);

  const deactivateMutation = useDeactivateCinemaMutation();
  const activateMutation = useActivateCinemaMutation();

  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
      return imageUrl;
    return `${urlImage}/${imageUrl}?t=${Date.now()}`;
  };

  // Khi click icon Delete / Restore
  const handleClickToggleStatus = (cinema: ICinema) => {
    setSelectedCinema(cinema);
    setOpenDeletePopup(true);
  };

  const handleConfirmToggleStatus = () => {
    if (!selectedCinema) return;

    if (selectedCinema.isActive) {
      // Deactivate
      deactivateMutation.mutate(selectedCinema.id, {
        onSuccess: () => {
          n.success(`Rạp "${selectedCinema.name}" đã ngưng hoạt động`);
          refetchCinemas();
          setOpenDeletePopup(false);
          setSelectedCinema(null);
        },
        onError: (err: any) => n.error(err.message),
      });
    } else {
      // Activate
      activateMutation.mutate(selectedCinema.id, {
        onSuccess: () => {
          n.success(`Rạp "${selectedCinema.name}" đã hoạt động trở lại`);
          refetchCinemas();
          setOpenDeletePopup(false);
          setSelectedCinema(null);
        },
        onError: (err: any) => n.error(err.message),
      });
    }
  };

  const renderStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? "Hoạt động" : "Ngưng hoạt động"}
      color={isActive ? "success" : "default"}
      size="small"
      variant="filled"
      sx={{ fontWeight: 500 }}
    />
  );

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
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Ảnh
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Tên rạp
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Địa chỉ
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Số điện thoại
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Ngày tạo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                Trạng thái
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", color: "#3f3f46" }}
              >
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
                <TableCell>
                  {dayjs(cinema.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>{renderStatusChip(cinema.isActive)}</TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onEditCinema(cinema);
                      }}
                    >
                      <IconButton size="small" sx={{ color: "#52525b" }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Link>

                    <IconButton
                      onClick={() => handleClickToggleStatus(cinema)}
                      size="small"
                      sx={{ color: cinema.isActive ? "red" : "green" }}
                    >
                      {cinema.isActive ? (
                        <Delete fontSize="small" />
                      ) : (
                        <Restore fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DeletePopup vẫn nguyên */}
      <DeletePopup
        open={openDeletePopup}
        onClose={() => setOpenDeletePopup(false)}
        onConfirm={handleConfirmToggleStatus}
        description={
          selectedCinema?.isActive
            ? `Bạn có chắc muốn ngưng hoạt động rạp "${selectedCinema.name}" không?`
            : `Bạn có muốn kích hoạt lại rạp "${selectedCinema?.name}" không?`
        }
      />
    </>
  );
}
