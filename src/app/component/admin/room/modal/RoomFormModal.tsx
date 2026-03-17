"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useCreateRoomMutation } from "../room";
import { IRoomRequest } from "../type";

interface Cinema {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cinemas: Cinema[];
  onCreated?: (room: any) => void;
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomFormModal({
  open,
  onClose,
  cinemas,
  onCreated,
}: Props) {
  const [cinemaId, setCinemaId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [type, setType] = useState(roomTypes[0]);

  const createMutation = useCreateRoomMutation();

  const handleSubmit = () => {
    if (!cinemaId) return;

    const payload: IRoomRequest = {
      cinemaId: Number(cinemaId),
      name,
      type,
      totalSeats: 0,
      seatLayout: "[]",
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        if (onCreated) {
          onCreated(res);
        }
      },
    });
  };

  const isDisabled = !name.trim() || !cinemaId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Tạo phòng chiếu mới </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Tạo phòng chiếu trước, sau đó bạn sẽ thiết lập sơ đồ ghế.
          </Typography>

          {/* CINEMA */}

          <TextField
            select
            label="Rạp chiếu"
            value={cinemaId}
            onChange={(e) => setCinemaId(Number(e.target.value))}
            fullWidth
          >
            {cinemas.map((cinema) => (
              <MenuItem key={cinema.id} value={cinema.id}>
                {cinema.name}
              </MenuItem>
            ))}
          </TextField>

          {/* ROOM NAME */}

          <TextField
            label="Tên phòng"
            placeholder="Ví dụ: Phòng 1, IMAX Hall..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          {/* ROOM TYPE */}

          <TextField
            select
            label="Loại phòng"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          >
            {roomTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isDisabled}
          sx={{
            backgroundColor: "#ec131e",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              backgroundColor: "#c81018",
            },
          }}
        >
          Tạo phòng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
