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
import { Visibility, ToggleOn, ToggleOff } from "@mui/icons-material";
import { IRoom } from "../type";
import { useToggleRoomStatusMutation } from "../room";
import { toast } from "sonner";
import { mapNumberToStatus } from "../roomStatus";

interface Props {
  rooms: IRoom[];
  setSelectedRoom: (_room: IRoom) => void;
}

export default function RoomTable({ rooms, setSelectedRoom }: Props) {
  const toggleStatusMutation = useToggleRoomStatusMutation();

  // ===== TYPE CHIP =====
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

  // ===== STATUS CHIP =====
  const renderStatusChip = (statusNumber: number) => {
    const status = mapNumberToStatus(statusNumber);
    const isActive = status === "ACTIVE";

    return (
      <Chip
        label={isActive ? "ACTIVE" : "INACTIVE"}
        size="small"
        sx={{
          fontWeight: 800,
          borderRadius: "999px",
          background: isActive
            ? "linear-gradient(135deg,#ecfdf5,#d1fae5)"
            : "linear-gradient(135deg,#fef2f2,#fee2e2)",
          color: isActive ? "#059669" : "#dc2626",
          border: isActive ? "1px solid #a7f3d0" : "1px solid #fecaca",
        }}
      />
    );
  };

  // ===== TOGGLE STATUS (FIX QUAN TRỌNG) =====
  const handleToggleStatus = (room: IRoom) => {
    const newStatus = room.status === 1 ? 0 : 1; // ✅ tính status mới

    toggleStatusMutation.mutate(
      {
        id: room.id,
        status: newStatus, // ✅ gửi đúng body BE cần
      },
      {
        onSuccess: () => {
          const next = newStatus === 1 ? "ACTIVE" : "INACTIVE";

          toast.success("Cập nhật trạng thái thành công", {
            description: `Phòng "${room.name}" → ${next}`,
          });
        },
        onError: (error: any) => {
          toast.error("Cập nhật thất bại", {
            description: error?.message || "Không thể cập nhật trạng thái.",
          });
        },
      },
    );
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: "1px solid #ececf2",
        overflow: "hidden",
        boxShadow: "0 18px 46px rgba(15,23,42,0.04)",
      }}
    >
      <Table sx={{ minWidth: 900 }}>
        {/* ===== HEADER ===== */}
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 900 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Tên phòng</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Rạp</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Loại</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Tổng ghế</TableCell>
            <TableCell sx={{ fontWeight: 900 }}>Trạng thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 900 }}>
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {/* EMPTY */}
          {rooms.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>
                <Box textAlign="center" py={6}>
                  <Typography fontWeight={800}>Không có dữ liệu</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}

          {/* DATA */}
          {rooms.map((room) => (
            <TableRow key={room.id} hover>
              {/* ID */}
              <TableCell>#{room.id}</TableCell>

              {/* NAME */}
              <TableCell onClick={() => setSelectedRoom(room)}>
                <Typography fontWeight={800}>{room.name}</Typography>
              </TableCell>

              {/* CINEMA */}
              <TableCell>{room.cinemaName || "—"}</TableCell>

              {/* TYPE */}
              <TableCell>{renderTypeChip(room.type)}</TableCell>

              {/* TOTAL SEATS */}
              <TableCell>{room.totalSeats ?? 0}</TableCell>

              {/* STATUS */}
              <TableCell>{renderStatusChip(room.status)}</TableCell>

              {/* ACTION */}
              <TableCell align="right">
                {/* VIEW */}
                <IconButton onClick={() => setSelectedRoom(room)}>
                  <Visibility />
                </IconButton>

                {/* TOGGLE */}
                <IconButton
                  onClick={() => handleToggleStatus(room)}
                  sx={{
                    ml: 1,
                    color: room.status === 1 ? "#16a34a" : "#dc2626",
                  }}
                >
                  {room.status === 1 ? <ToggleOn /> : <ToggleOff />}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
