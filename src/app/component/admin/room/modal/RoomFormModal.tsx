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
import { Roboto } from "next/font/google";
import { useState } from "react";
import { useCreateRoomMutation } from "../room";
import { IRoomRequest } from "../type";
import { toast } from "sonner";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

interface Cinema {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cinemas: Cinema[];
  onCreated?: (_room: any) => void;
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
        toast.success("Tạo phòng chiếu thành công", {
          description: `Phòng "${name}" đã được tạo và sẵn sàng thiết lập sơ đồ ghế.`,
        });
        if (onCreated) {
          onCreated(res);
        }
      },
      onError: (error: any) => {
        toast.error("Tạo phòng chiếu thất bại", {
          description: error?.message || "Không thể tạo phòng chiếu mới.",
        });
      },
    });
  };

  const isDisabled = !name.trim() || !cinemaId;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: roboto.className,
        sx: {
          borderRadius: "28px",
          border: "1px solid #ececf2",
          background:
            "linear-gradient(160deg,#ffffff 0%,#fbfdff 45%,#f8fafc 100%)",
          boxShadow: "0 30px 90px rgba(15,23,42,0.16)",
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ef4444" }}>
          Quản lý phòng chiếu
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#18181b" }}>
          Tạo phòng chiếu mới
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.8 }}>
            Tạo phòng chiếu trước, sau đó bạn sẽ thiết lập sơ đồ ghế.
          </Typography>

          <TextField
            select
            label="Rạp chiếu"
            value={cinemaId}
            onChange={(e) => setCinemaId(Number(e.target.value))}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 700 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "18px",
                backgroundColor: "#fff",
                fontWeight: 700,
              },
            }}
          >
            {cinemas.map((cinema) => (
              <MenuItem key={cinema.id} value={cinema.id}>
                {cinema.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Tên phòng"
            placeholder="Ví dụ: Phòng 1, IMAX Hall..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 700 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "18px",
                backgroundColor: "#fff",
                fontWeight: 700,
              },
            }}
          />

          <TextField
            select
            label="Loại phòng"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            InputLabelProps={{ sx: { fontWeight: 700 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "18px",
                backgroundColor: "#fff",
                fontWeight: 700,
              },
            }}
          >
            {roomTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{ fontWeight: 900, borderRadius: "16px", px: 2.5 }}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isDisabled}
          sx={{
            background: "linear-gradient(135deg,#ec131e,#ff6548)",
            fontWeight: 900,
            px: 3,
            borderRadius: "16px",
            boxShadow: "0 18px 40px rgba(236,19,30,0.24)",
            "&:hover": {
              opacity: 0.95,
              background: "linear-gradient(135deg,#ec131e,#ff6548)",
            },
          }}
        >
          Tạo phòng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
