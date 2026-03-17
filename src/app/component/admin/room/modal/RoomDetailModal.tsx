// RoomDetailModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import SeatLayoutBuilder from "./SeatLayoutBuilder";
import { useUpdateSeatLayoutMutation, useUpdateRoomMutation } from "../room";
import { Room } from "../room";

type SeatType = "STANDARD" | "VIP" | "COUPLE";

interface SeatPrices extends Record<string, number> {
  STANDARD: number;
  VIP: number;
  COUPLE: number;
}

interface RoomDetailModalProps {
  open: boolean;
  onClose: () => void;
  roomId: number;
  cinemaId: number;
}

const roomTypes = ["2D", "3D", "IMAX", "4DX"];

export default function RoomDetailModal({
  open,
  onClose,
  roomId,
  cinemaId,
}: RoomDetailModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("2D");
  const [seatLayout, setSeatLayout] = useState<string>("[]");
  const [initialSeatLayout, setInitialSeatLayout] = useState<string>("[]");
  const [totalSeats, setTotalSeats] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  const [seatPrices, setSeatPrices] = useState<SeatPrices>({
    STANDARD: 60000,
    VIP: 90000,
    COUPLE: 150000,
  });

  const updateSeatMutation = useUpdateSeatLayoutMutation();
  const updateRoomMutation = useUpdateRoomMutation();

  // ================= GET ROOM DETAIL =================
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const response = await Room.api.get<{
          data: {
            id: number;
            cinemaId: number;
            name: string;
            type: string;
            seatLayout: string;
            totalSeats: number;
          };
        }>({
          url: `/rooms/${roomId}`,
        });

        const room = response.data.data;
        setName(room.name);
        setType(room.type);
        setSeatLayout(room.seatLayout || "[]");
        setInitialSeatLayout(room.seatLayout || "[]");
        setTotalSeats(room.totalSeats || 0);
        setHasChanges(false);
      } catch (err) {
        console.error("Failed to fetch room detail:", err);
      }
    };

    if (roomId) fetchRoomDetail();
  }, [roomId]);

  const handleSeatChange = (layout: string, total: number) => {
    setSeatLayout(layout);
    setTotalSeats(total);
    setHasChanges(true);
  };

  const handleSaveLayout = () => {
    // Nếu không chỉnh sửa gì, giữ layout cũ
    const layoutToSave = hasChanges ? seatLayout : initialSeatLayout;

    updateSeatMutation.mutate(
      { roomId, layout: layoutToSave, seatPrices, totalSeats },
      {
        onSuccess: () => {
          alert("Seat layout saved!");
          setInitialSeatLayout(layoutToSave);
          setHasChanges(false);
        },
        onError: () => alert("Failed to save layout"),
      },
    );
  };

  const handleSaveRoomInfo = () => {
    updateRoomMutation.mutate(
      {
        id: roomId,
        payload: {
          cinemaId,
          name,
          type,
          totalSeats,
          seatLayout: seatLayout || initialSeatLayout || "[]",
        },
      },
      { onSuccess: () => alert("Room updated!") },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <Box display="flex" height="80vh">
        {/* LEFT PANEL */}
        <Box width={260} p={2} borderRight="1px solid #ddd">
          <Typography variant="h6">Room Settings</Typography>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Tên phòng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              fullWidth
            />

            <TextField
              select
              label="Loại phòng"
              value={type}
              onChange={(e) => setType(e.target.value)}
              size="small"
              fullWidth
            >
              {roomTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              onClick={handleSaveRoomInfo}
              disabled={updateRoomMutation.isPending}
            >
              {updateRoomMutation.isPending ? "Saving..." : "Save Room Info"}
            </Button>
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveLayout}
              disabled={updateSeatMutation.isPending}
              sx={{
                backgroundColor: "#ec131e",
                "&:hover": { backgroundColor: "#c81018" },
              }}
            >
              {updateSeatMutation.isPending ? "Saving..." : "Save Layout"}
            </Button>
          </Box>
        </Box>

        {/* CENTER PANEL */}
        <Box flex={1} p={2}>
          <SeatLayoutBuilder
            initialLayout={seatLayout ? JSON.parse(seatLayout) : []}
            onChange={handleSeatChange}
            seatPrices={seatPrices}
            initialRows={Array.from({ length: 6 }, (_, i) =>
              String.fromCharCode(65 + i),
            )}
            initialCols={12}
          />
        </Box>

        {/* RIGHT PANEL */}
        <Box width={260} p={2} borderLeft="1px solid #ddd">
          <Typography variant="h6">Seat Prices</Typography>

          {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => (
            <Box
              key={type}
              display="flex"
              justifyContent="space-between"
              mb={1}
            >
              <Typography>{type}</Typography>
              <input
                type="number"
                value={seatPrices[type]}
                onChange={(e) =>
                  setSeatPrices({
                    ...seatPrices,
                    [type]: Number(e.target.value),
                  })
                }
                className="border px-2 rounded w-20"
              />
            </Box>
          ))}

          <Box mt={4}>
            <Typography>Total Seats</Typography>
            <Typography variant="h4">{totalSeats}</Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
