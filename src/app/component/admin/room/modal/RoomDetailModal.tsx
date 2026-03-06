"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

import { useCreateRoomMutation, useUpdateRoomMutation } from "../room";

import SeatLayoutBuilder from "./SeatLayoutBuilder";

interface Props {
  roomId: number;
  cinemaId?: number;
  open: boolean;
  onClose: () => void;
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomDetailModal({
  roomId,
  cinemaId,
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(roomTypes[0]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [seatLayout, setSeatLayout] = useState("[]");

  const createMutation = useCreateRoomMutation();
  const updateMutation = useUpdateRoomMutation();

  const handleSave = () => {
    const payload = {
      cinemaId: cinemaId || 0,
      name,
      type,
      totalSeats,
      seatLayout,
    };

    if (roomId === 0) {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          // mở modal room mới tạo
          window.location.reload();
        },
      });
    } else {
      updateMutation.mutate(
        { id: roomId, payload },
        {
          onSuccess: () => onClose(),
        },
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {roomId === 0 ? "Tạo phòng chiếu" : "Chi tiết phòng"}
      </DialogTitle>

      <DialogContent dividers>
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

        {/* SEAT BUILDER */}

        <SeatLayoutBuilder
          onChange={(layout, total) => {
            setSeatLayout(layout);
            setTotalSeats(total);
          }}
        />

        <TextField
          label="Tổng ghế"
          type="number"
          fullWidth
          margin="normal"
          value={totalSeats}
          InputProps={{
            readOnly: true,
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
