"use client";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  IconButton,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import { IRoom } from "../type";
import { useDeleteRoomMutation } from "../room";
import { toast } from "sonner";

interface Props {
  rooms: IRoom[];
  setSelectedRoom: (_room: IRoom) => void;
}

export default function RoomTable({ rooms, setSelectedRoom }: Props) {
  const deleteMutation = useDeleteRoomMutation();

  const renderTypeChip = (type: string) => (
    <Chip
      label={type || "—"}
      size="small"
      sx={{
        fontWeight: 800,
        borderRadius: "999px",
        background: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
        color: "#b91c1c",
        border: "1px solid #fecdd3",
      }}
    />
  );

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: "1px solid #ececf2",
        overflow: "hidden",
        boxShadow: "0 18px 46px rgba(15,23,42,0.04)",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow
            sx={{
              background:
                "linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(244,244,245,1) 100%)",
            }}
          >
            <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              ID
            </TableCell>
            <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              Tên phòng
            </TableCell>
            <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              Rạp
            </TableCell>
            <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              Loại
            </TableCell>
            <TableCell sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              Tổng ghế
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 900, color: "#3f3f46", py: 2 }}>
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ borderBottom: 0 }}>
                <Box sx={{ py: 8, textAlign: "center", color: "#71717a" }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#18181b" }}>
                    Chưa có phòng phù hợp
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 14, fontWeight: 500 }}>
                    Hãy thử chọn rạp khác hoặc thay đổi từ khóa tìm kiếm.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : null}

          {rooms.map((room) => (
            <TableRow
              key={room.id}
              hover
              sx={{
                "&:hover": { backgroundColor: "#fffdfd" },
                "&:last-child td": { borderBottom: 0 },
              }}
            >
              <TableCell sx={{ py: 2, fontWeight: 800, color: "#71717a" }}>
                #{room.id}
              </TableCell>

              <TableCell
                sx={{ py: 2, cursor: "pointer" }}
                onClick={() => setSelectedRoom(room)}
              >
                <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#18181b" }}>
                  {room.name}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>
                  Xem chi tiết và sơ đồ ghế
                </Typography>
              </TableCell>

              <TableCell sx={{ py: 2, fontWeight: 700, color: "#3f3f46" }}>
                {room.cinemaName}
              </TableCell>

              <TableCell sx={{ py: 2 }}>{renderTypeChip(room.type)}</TableCell>

              <TableCell sx={{ py: 2, fontWeight: 900, color: "#18181b" }}>
                {room.totalSeats}
              </TableCell>

              <TableCell align="right">
                <IconButton
                  onClick={() => setSelectedRoom(room)}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "14px",
                    backgroundColor: "#fff7f7",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    mr: 1,
                    "&:hover": { backgroundColor: "#fff1f2" },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() =>
                    deleteMutation.mutate(room.id, {
                      onSuccess: () => {
                        toast.success("Xóa phòng thành công", {
                          description: `Phòng "${room.name}" đã được xóa khỏi hệ thống.`,
                        });
                      },
                      onError: (error: any) => {
                        toast.error("Xóa phòng thất bại", {
                          description:
                            error?.message || "Không thể xóa phòng chiếu này.",
                        });
                      },
                    })
                  }
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "14px",
                    backgroundColor: "#fff1f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                    "&:hover": { backgroundColor: "#ffe4e6" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
