"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useCreateRoomMutation } from "../room";
import { IRoomRequest } from "../type";

interface Props {
  open: boolean;
  onClose: () => void;
  cinemaId: number;
  onCreated?: (roomId: number) => void; // callback khi tạo xong
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomFormModal({
  open,
  onClose,
  cinemaId,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState(roomTypes[0]);

  const createMutation = useCreateRoomMutation();

  const handleSubmit = () => {
    const payload: IRoomRequest = {
      cinemaId,
      name,
      type,
      totalSeats: 0,
      seatLayout: "[]",
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        onClose(); // đóng modal tạo
        if (onCreated && res?.data) {
          onCreated(res.data.id); // mở RoomDetailModal để build seatLayout
        }
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo phòng chiếu</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          fullWidth
          label="Tên phòng"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          select
          fullWidth
          label="Loại phòng"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {roomTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Tạo phòng
        </Button>
      </DialogContent>
    </Dialog>
  );
}
