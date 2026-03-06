import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface RoomDetailModalProps {
  roomId: number; // 0 = create new
  open: boolean;
  onClose: () => void;
}

export default function RoomDetailModal({
  roomId,
  open,
  onClose,
}: RoomDetailModalProps) {
  // TODO: fetch room data by roomId and display/edit form
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {roomId === 0 ? "Thêm phòng" : "Chi tiết phòng"}
      </DialogTitle>
      <DialogContent>{/* form fields will go here */}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
