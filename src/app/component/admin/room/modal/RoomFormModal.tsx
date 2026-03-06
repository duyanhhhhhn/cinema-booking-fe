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
import SeatLayoutBuilder from "./SeatLayoutBuilder";

interface Props {
  open: boolean;
  onClose: () => void;
  cinemaId: number;
}

export default function RoomFormModal({ open, onClose, cinemaId }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("2D");
  const [totalSeats, setTotalSeats] = useState(0);
  const [seatLayout, setSeatLayout] = useState<string>("[]");

  const createMutation = useCreateRoomMutation();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("totalSeats", totalSeats.toString());
    formData.append("seatLayout", seatLayout);

    createMutation.mutate(formData);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
          <MenuItem value="2D">2D</MenuItem>
          <MenuItem value="3D">3D</MenuItem>
          <MenuItem value="IMAX">IMAX</MenuItem>
          <MenuItem value="4DX">4DX</MenuItem>
        </TextField>

        <SeatLayoutBuilder
          onChange={(layout, total) => {
            setSeatLayout(layout);
            setTotalSeats(total);
          }}
        />

        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
      </DialogContent>
    </Dialog>
  );
}
