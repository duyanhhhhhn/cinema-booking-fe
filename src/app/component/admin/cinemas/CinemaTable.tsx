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
  Typography,
} from "@mui/material";
import { Edit, Delete, Restore } from "@mui/icons-material";
import {
  ICinema,
  useDeactivateCinemaMutation,
  useActivateCinemaMutation,
} from "@/types/data/cinema";
import DeletePopup from "../../popup/DeletePopup";
import dayjs from "dayjs";
import { toast } from "sonner";

interface CinemaTableProps {
  cinemas: ICinema[];
  refetchCinemas: () => void;
  onEditCinema: (_cinema: ICinema) => void;
}

export default function CinemaTable({
  cinemas,
  refetchCinemas,
  onEditCinema,
}: CinemaTableProps) {
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<ICinema | null>(null);

  const deactivateMutation = useDeactivateCinemaMutation();
  const activateMutation = useActivateCinemaMutation();

  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

  const getFullImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
      return imageUrl;
    return `${urlImage}/${imageUrl}`;
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
          toast.success("Cập nhật rạp thành công", {
            description: `Rạp "${selectedCinema.name}" đã ngưng hoạt động.`,
          });
          refetchCinemas();
          setOpenDeletePopup(false);
          setSelectedCinema(null);
        },
        onError: (err: any) =>
          toast.error("Cập nhật rạp thất bại", {
            description: err?.message || "Không thể ngưng hoạt động rạp này.",
          }),
      });
    } else {
      // Activate
      activateMutation.mutate(selectedCinema.id, {
        onSuccess: () => {
          toast.success("Cập nhật rạp thành công", {
            description: `Rạp "${selectedCinema.name}" đã hoạt động trở lại.`,
          });
          refetchCinemas();
          setOpenDeletePopup(false);
          setSelectedCinema(null);
        },
        onError: (err: any) =>
          toast.error("Cập nhật rạp thất bại", {
            description: err?.message || "Không thể kích hoạt lại rạp này.",
          }),
      });
    }
  };

  const renderStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? "Hoạt động" : "Ngưng hoạt động"}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 800,
        borderRadius: "999px",
        px: 0.75,
        color: isActive ? "#dc2626" : "#991b1b",
        background: isActive
          ? "linear-gradient(135deg,#fff1f2,#ffe4e6)"
          : "linear-gradient(135deg,#ffffff,#fff7f7)",
        border: isActive ? "1px solid #fecaca" : "1px solid #f3d2d2",
      }}
    />
  );

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #ececf2",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 18px 46px rgba(15,23,42,0.04)",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Table sx={{ minWidth: 760 }} aria-label="cinema table">
          <TableHead
            sx={{
              background:
                "linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(244,244,245,1) 100%)",
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Ảnh
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Tên rạp
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Địa chỉ
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Số điện thoại
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Ngày tạo
              </TableCell>
              <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
                Trạng thái
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cinemas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ borderBottom: 0 }}>
                  <Box
                    sx={{
                      py: 8,
                      textAlign: "center",
                      color: "#71717a",
                    }}
                  >
                    <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#18181b" }}>
                      Chưa có rạp phù hợp
                    </Typography>
                    <Typography sx={{ mt: 1, fontSize: 14, fontWeight: 500 }}>
                      Hãy thử tìm kiếm khác hoặc thay đổi bộ lọc trạng thái.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : null}

            {cinemas.map((cinema) => (
              <TableRow
                key={cinema.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    backgroundColor: "#fffdfd",
                  },
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      backgroundImage: `url(${getFullImageUrl(cinema.imageUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "18px",
                      backgroundColor: "#e4e4e7",
                      border: "1px solid #e4e4e7",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#18181b" }}>
                    {cinema.name}
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>
                    Mã rạp #{cinema.id}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2, fontWeight: 600, color: "#52525b", maxWidth: 260 }}>
                  {cinema.address}
                </TableCell>
                <TableCell sx={{ py: 2, fontWeight: 700, color: "#3f3f46" }}>
                  {cinema.phone}
                </TableCell>
                <TableCell sx={{ py: 2, fontWeight: 700, color: "#52525b" }}>
                  {dayjs(cinema.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell sx={{ py: 2 }}>{renderStatusChip(cinema.isActive)}</TableCell>
                <TableCell align="center" sx={{ py: 2 }}>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        onEditCinema(cinema);
                      }}
                      size="small"
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "14px",
                        backgroundColor: "#fff7f7",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        "&:hover": { backgroundColor: "#fff1f2" },
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() => handleClickToggleStatus(cinema)}
                      size="small"
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "14px",
                        border: "1px solid",
                        borderColor: "#fecaca",
                        backgroundColor: cinema.isActive ? "#fff1f2" : "#fff7f7",
                        color: "#dc2626",
                        "&:hover": {
                          backgroundColor: "#ffe4e6",
                        },
                      }}
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
