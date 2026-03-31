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
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Roboto } from "next/font/google";
import SeatLayoutBuilder from "./SeatLayoutBuilder";
import { useUpdateSeatLayoutMutation, useUpdateRoomMutation } from "../room";
import { Room } from "../room";
import { toast } from "sonner";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

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
          toast.success("Lưu sơ đồ ghế thành công", {
            description: "Sơ đồ ghế mới đã được cập nhật cho phòng chiếu.",
          });
          setInitialSeatLayout(layoutToSave);
          setHasChanges(false);
        },
        onError: (error: any) =>
          toast.error("Lưu sơ đồ ghế thất bại", {
            description: error?.message || "Không thể lưu sơ đồ ghế lúc này.",
          }),
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
      {
        onSuccess: () =>
          toast.success("Cập nhật phòng thành công", {
            description: "Thông tin phòng chiếu đã được lưu lại.",
          }),
        onError: (error: any) =>
          toast.error("Cập nhật phòng thất bại", {
            description:
              error?.message || "Không thể cập nhật thông tin phòng chiếu.",
          }),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        className: roboto.className,
        sx: {
          borderRadius: "32px",
          border: "1px solid #ececf2",
          background:
            "linear-gradient(180deg,#ffffff 0%,#fcfcfd 40%,#f8fafc 100%)",
          boxShadow: "0 34px 100px rgba(15,23,42,0.14)",
          overflow: "hidden",
          fontFamily: '"Roboto","sans-serif"',
        },
      }}
    >
      <Box
        display="flex"
        height="80vh"
        bgcolor="transparent"
        sx={{ position: "relative", fontFamily: '"Roboto","sans-serif"' }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Đóng form thiết lập phòng chiếu"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 5,
            width: 42,
            height: 42,
            border: "1px solid #fecaca",
            background:
              "linear-gradient(135deg,rgba(255,255,255,0.98),rgba(254,242,242,0.98))",
            color: "#dc2626",
            boxShadow: "0 12px 24px rgba(239,68,68,0.12)",
            "&:hover": {
              background:
                "linear-gradient(135deg,rgba(255,255,255,1),rgba(254,226,226,1))",
              borderColor: "#fca5a5",
            },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 22 }} />
        </IconButton>

        <Box
          width={250}
          p={3}
          borderRight="1px solid #e5e7eb"
          sx={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))",
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ef4444" }}>
            Quản lý phòng
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "#18181b" }}>
            Thiết lập phòng chiếu
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 14, fontWeight: 500, color: "#6b7280", lineHeight: 1.8 }}>
            Chỉnh sửa thông tin phòng và lưu lại sơ đồ ghế ngay tại đây.
          </Typography>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            <Box
              sx={{
                borderRadius: "22px",
                border: "1px solid #ececf2",
                background: "#fff",
                p: 2,
                boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: 1.6,
              }}
            >
              <TextField
                label="Tên phòng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontWeight: 700 } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fafafa",
                    fontWeight: 800,
                  },
                }}
              />

              <TextField
                select
                label="Loại phòng"
                value={type}
                onChange={(e) => setType(e.target.value)}
                size="small"
                fullWidth
                InputLabelProps={{ sx: { fontWeight: 700 } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "#fafafa",
                    fontWeight: 800,
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

            <Button
              variant="outlined"
              onClick={handleSaveRoomInfo}
              disabled={updateRoomMutation.isPending}
              sx={{
                borderRadius: "18px",
                fontWeight: 900,
                py: 1.35,
                borderColor: "#fca5a5",
                color: "#dc2626",
                backgroundColor: "#fff",
                "&:hover": {
                  borderColor: "#ef4444",
                  backgroundColor: "#fff5f5",
                },
              }}
            >
              {updateRoomMutation.isPending
                ? "Đang lưu thông tin..."
                : "Lưu thông tin phòng"}
            </Button>
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveLayout}
              disabled={updateSeatMutation.isPending}
              sx={{
                borderRadius: "18px",
                py: 1.4,
                fontWeight: 900,
                background: "linear-gradient(135deg,#ec131e,#ff6548)",
                boxShadow: "0 18px 40px rgba(236,19,30,0.24)",
                "&:hover": {
                  opacity: 0.95,
                  background: "linear-gradient(135deg,#ec131e,#ff6548)",
                },
              }}
            >
              {updateSeatMutation.isPending
                ? "Đang lưu sơ đồ..."
                : "Lưu sơ đồ ghế"}
            </Button>
          </Box>
        </Box>

        <Box
          flex={1}
          p={2.5}
          sx={{
            background:
              "radial-gradient(circle_at_top,rgba(236,19,30,0.04),transparent 24%), linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
          }}
        >
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

        <Box
          width={270}
          p={3}
          borderLeft="1px solid #e5e7eb"
          sx={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))",
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#ef4444" }}>
            Bảng giá ghế
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "#18181b" }}>
            Giá theo loại ghế
          </Typography>

          {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => (
            <Box
              key={type}
              mt={2}
              border="1px solid #e5e7eb"
              borderRadius="22px"
              bgcolor="#fff"
              px={2}
              py={1.75}
              boxShadow="0 10px 24px rgba(15,23,42,0.04)"
            >
              <Typography sx={{ fontWeight: 900, color: "#18181b" }}>
                {type}
              </Typography>
              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#9ca3af",
                }}
              >
                Giá áp dụng cho loại ghế này
              </Typography>
              <input
                type="number"
                value={seatPrices[type]}
                onChange={(e) =>
                  setSeatPrices({
                    ...seatPrices,
                    [type]: Number(e.target.value),
                  })
                }
                className="mt-3 h-12 w-full rounded-2xl border border-red-100 bg-red-50/60 px-4 py-2 text-right font-black text-zinc-900 outline-none"
                style={{ fontFamily: "Roboto, sans-serif" }}
              />
            </Box>
          ))}

          <Box
            mt={4}
            border="1px solid rgba(239,68,68,0.14)"
            borderRadius="24px"
            bgcolor="#fff"
            px={2.5}
            py={2.5}
            boxShadow="0 12px 28px rgba(239,68,68,0.05)"
            sx={{
              background:
                "linear-gradient(135deg,rgba(239,68,68,0.06),rgba(255,255,255,1))",
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "#9ca3af" }}>
              Tổng số ghế
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em", color: "#18181b" }}>
              {totalSeats}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
