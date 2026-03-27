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

  // ================= BE → UI =================
  const convertToUISeatLayout = (seatMap: any[]): any[] => {
    return seatMap.map((row) => {
      const seats = row.seats.map((seat: any) => ({
        col: seat.number,
        type: seat.type || "STANDARD",
      }));

      return {
        row: row.rowLabel,
        type: row.seats?.[0]?.type || "STANDARD",
        seats,
      };
    });
  };

  // ================= UI → BE =================
  const convertToBackendSeatLayout = (layout: any[], prices: SeatPrices) => {
    return layout.map((row) => {
      const rowLabel = row.row;

      const seats = row.seats.map((seat: any) => {
        const number = seat.col;
        const seatType = seat.type || "STANDARD";

        return {
          id: null,
          number,
          code: `${rowLabel}${number}`,
          type: seatType,
          status: "AVAILABLE",
          price: prices[seatType],
        };
      });

      return {
        rowLabel,
        seats,
      };
    });
  };

  // ================= FETCH ROOM =================
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const response = await Room.api.get<any>({
          url: `/rooms/${roomId}`,
        });

        // fix TS unknown
        const room = (response as any)?.data?.data || (response as any)?.data;

        if (!room) return;

        setName(room.name || "");
        setType(room.type || "2D");
        setTotalSeats(room.totalSeats || 0);

        const rawLayout = room.seatLayout || "[]";

        let parsed: any[] = [];
        try {
          parsed = JSON.parse(rawLayout);
        } catch {
          parsed = [];
        }

        // ✅ convert BE → UI
        const uiLayout = convertToUISeatLayout(parsed);

        const uiString = JSON.stringify(uiLayout);

        setSeatLayout(uiString);
        setInitialSeatLayout(uiString);
        setHasChanges(false);
      } catch (err) {
        console.error("Fetch room error:", err);
      }
    };

    if (roomId) fetchRoomDetail();
  }, [roomId]);

  // ================= HANDLE CHANGE =================
  const handleSeatChange = (layout: string, total: number) => {
    setSeatLayout(layout);
    setTotalSeats(total);
    setHasChanges(true);
  };

  // ================= SAVE LAYOUT =================
  const handleSaveLayout = () => {
    const layoutToUse = hasChanges ? seatLayout : initialSeatLayout;

    let parsedLayout: any[] = [];

    try {
      parsedLayout = JSON.parse(layoutToUse);
    } catch {
      parsedLayout = [];
    }

    const seatMap = convertToBackendSeatLayout(parsedLayout, seatPrices);

    updateSeatMutation.mutate(
      {
        roomId,
        layout: JSON.stringify(seatMap),
        seatPrices,
        totalSeats,
      },
      {
        onSuccess: () => {
          alert("Saved layout!");
          setInitialSeatLayout(layoutToUse);
          setHasChanges(false);
        },
        onError: () => alert("Save failed"),
      },
    );
  };

  // ================= SAVE ROOM =================
  const handleSaveRoomInfo = () => {
    let parsedLayout: any[] = [];

    try {
      parsedLayout = JSON.parse(seatLayout);
    } catch {
      parsedLayout = [];
    }

    const seatMap = convertToBackendSeatLayout(parsedLayout, seatPrices);

    updateRoomMutation.mutate({
      id: roomId,
      payload: {
        cinemaId,
        name,
        type,
        totalSeats,
        seatLayout: JSON.stringify(seatMap),
      },
    });
  };

  // ================= PARSE FOR BUILDER =================
  let parsedLayout: any[] = [];

  try {
    parsedLayout =
      seatLayout && seatLayout !== "[]" ? JSON.parse(seatLayout) : [];
  } catch {
    parsedLayout = [];
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <Box display="flex" height="80vh">
        {/* LEFT */}
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

            <Button variant="outlined" onClick={handleSaveRoomInfo}>
              Save Room Info
            </Button>
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveLayout}
              sx={{
                backgroundColor: "#ec131e",
                "&:hover": { backgroundColor: "#c81018" },
              }}
            >
              Save Layout
            </Button>
          </Box>
        </Box>

        {/* CENTER */}
        <Box flex={1} p={2}>
          <SeatLayoutBuilder
            initialLayout={parsedLayout}
            onChange={handleSeatChange}
          />
        </Box>

        {/* RIGHT */}
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
