"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import {
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useGetRoomsQuery,
} from "../room";

interface Props {
  roomId: number; // 0 = tạo mới
  open: boolean;
  onClose: () => void;
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomDetailModal({ roomId, open, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(roomTypes[0]);
  const [totalSeats, setTotalSeats] = useState(50);
  const [cinemaName, setCinemaName] = useState("");

  const createMutation = useCreateRoomMutation();
  const updateMutation = useUpdateRoomMutation();

  // Nếu roomId > 0, load data để edit
  useEffect(() => {
    if (roomId > 0) {
      // TODO: gọi API get room detail để load
      // Ví dụ: setName(room.name); setType(room.type); ...
    } else {
      setName("");
      setType(roomTypes[0]);
      setTotalSeats(50);
      setCinemaName("");
    }
  }, [roomId]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("totalSeats", totalSeats.toString());
    formData.append("cinemaName", cinemaName);

    if (roomId === 0) {
      createMutation.mutate(formData, {
        onSuccess: () => onClose(),
      });
    } else {
      updateMutation.mutate(
        { id: roomId, payload: formData },
        { onSuccess: () => onClose() },
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {roomId === 0 ? "Thêm phòng" : "Chi tiết phòng"}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Rạp"
          fullWidth
          margin="normal"
          value={cinemaName}
          onChange={(e) => setCinemaName(e.target.value)}
        />
        <TextField
          label="Tên phòng"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Loại"
          select
          fullWidth
          margin="normal"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {roomTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Tổng ghế"
          type="number"
          fullWidth
          margin="normal"
          value={totalSeats}
          onChange={(e) => setTotalSeats(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
