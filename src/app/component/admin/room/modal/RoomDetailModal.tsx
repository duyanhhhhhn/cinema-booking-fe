"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  CloseRounded,
  SaveRounded,
  TheatersRounded,
} from "@mui/icons-material";
import { Roboto } from "next/font/google";
import { toast } from "sonner";

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

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

const seatTypeLabels: Record<SeatType, string> = {
  STANDARD: "Standard",
  VIP: "VIP",
  COUPLE: "Couple",
};

const seatTypeColors: Record<SeatType, string> = {
  STANDARD: "#6b7280",
  VIP: "#ef4444",
  COUPLE: "#db2777",
};

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

  const isSavingLayout = updateSeatMutation.status === "pending";
  const isSavingRoom = updateRoomMutation.status === "pending";

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#ffffff",
      fontWeight: 700,
      minHeight: 36,
    },
    "& .MuiInputLabel-root": {
      fontWeight: 700,
    },
  };

  const panelCardSx = {
    borderRadius: "14px",
    border: "1px solid #e8edf3",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 22px rgba(15,23,42,0.03)",
  };

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

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const response = await Room.api.get<any>({
          url: `/rooms/${roomId}`,
        });

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

  const handleSeatChange = (layout: string, total: number) => {
    setSeatLayout(layout);
    setTotalSeats(total);
    setHasChanges(true);
  };

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
          toast.success("Lưu sơ đồ ghế thành công", {
            description: `Sơ đồ ghế của phòng "${name || roomId}" đã được cập nhật.`,
          });
          setInitialSeatLayout(layoutToUse);
          setHasChanges(false);
        },
        onError: (error: any) => {
          toast.error("Lưu sơ đồ ghế thất bại", {
            description: error?.message || "Không thể lưu sơ đồ ghế lúc này.",
          });
        },
      },
    );
  };

  const handleSaveRoomInfo = () => {
    let parsedLayout: any[] = [];

    try {
      parsedLayout = JSON.parse(seatLayout);
    } catch {
      parsedLayout = [];
    }

    const seatMap = convertToBackendSeatLayout(parsedLayout, seatPrices);

    updateRoomMutation.mutate(
      {
        id: roomId,
        payload: {
          cinemaId,
          name,
          type,
          totalSeats,
          seatLayout: JSON.stringify(seatMap),
        },
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật phòng chiếu thành công", {
            description: `Thông tin phòng "${name || roomId}" đã được lưu.`,
          });
        },
        onError: (error: any) => {
          toast.error("Cập nhật phòng chiếu thất bại", {
            description: error?.message || "Không thể lưu thông tin phòng chiếu.",
          });
        },
      },
    );
  };

  const parsedLayout = useMemo(() => {
    try {
      return seatLayout && seatLayout !== "[]" ? JSON.parse(seatLayout) : [];
    } catch {
      return [];
    }
  }, [seatLayout]);

  const seatBreakdown = useMemo(() => {
    const counts: Record<SeatType, number> = {
      STANDARD: 0,
      VIP: 0,
      COUPLE: 0,
    };

    for (const row of parsedLayout) {
      for (const seat of row?.seats ?? []) {
        const seatType = (seat?.type || row?.type || "STANDARD") as SeatType;
        if (counts[seatType] !== undefined) {
          counts[seatType] += 1;
        }
      }
    }

    return counts;
  }, [parsedLayout]);

  const statusText = hasChanges ? "Chưa lưu" : "Đồng bộ";
  const maxSeatPrice = Math.max(
    seatPrices.STANDARD,
    seatPrices.VIP,
    seatPrices.COUPLE,
  );
  const compactSectionSx = {
    borderRadius: "12px",
    border: "1px solid #edf1f5",
    backgroundColor: "#fbfcfe",
    p: { xs: 1, lg: 1.15 },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        className: roboto.className,
        sx: {
          width: "min(1760px, calc(100vw - 8px))",
          maxWidth: "unset",
          borderRadius: "14px",
          border: "1px solid #e5eaf1",
          backgroundColor: "#ffffff",
          boxShadow: "0 24px 72px rgba(15,23,42,0.12)",
          height: "calc(100vh - 8px)",
          maxHeight: "calc(100vh - 8px)",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", lg: "center" },
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid #eef1f4",
            px: { xs: 2.5, lg: 3.5 },
            py: { xs: 1.5, lg: 1.75 },
            backgroundColor: "#ffffff",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  color: "#ef4444",
                }}
              >
                Quản lý phòng chiếu
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 22, lg: 24 },
                  fontWeight: 900,
                  lineHeight: 1.1,
                  letterSpacing: "-0.05em",
                  color: "#18181b",
                }}
              >
                Thiết lập phòng chiếu
              </Typography>
              {[
                { label: "Loại", value: type || "—" },
                { label: "Ghế", value: `${totalSeats}` },
                { label: "Trạng thái", value: statusText },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: "999px",
                    border: "1px solid #e8edf3",
                    backgroundColor: "#fbfcfe",
                    px: 1,
                    py: 0.55,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: "#9ca3af",
                    }}
                  >
                    {item.label}:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 900,
                      color: "#111827",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              border: "1px solid #e8edf3",
              backgroundColor: "#ffffff",
              color: "#6b7280",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
              "&:hover": {
                backgroundColor: "#fff5f5",
                color: "#ef4444",
              },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 2.5, lg: 3.5 },
            py: { xs: 2, lg: 2.5 },
          }}
        >
          <Box sx={{ ...panelCardSx, p: { xs: 1.5, lg: 2 } }}>
            <Box
              sx={{
                display: "grid",
                gap: 0.85,
                gridTemplateColumns: {
                  xs: "1fr",
                  xl: "minmax(0,1fr) minmax(0,1.25fr)",
                },
                alignItems: "start",
              }}
            >
              <Box sx={compactSectionSx}>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#9ca3af",
                  }}
                >
                  Phòng
                </Typography>
                <Box
                  sx={{
                    mt: 0.8,
                    display: "grid",
                    gap: 0.85,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "minmax(0,1fr) 180px",
                    },
                  }}
                >
                  <TextField
                    label="Tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  />

                  <TextField
                    select
                    label="Loại"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={inputSx}
                  >
                    {roomTypes.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box
                  sx={{
                    mt: 0.85,
                    display: "grid",
                    gap: 0.85,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 154px))",
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleSaveRoomInfo}
                    disabled={isSavingRoom}
                    startIcon={<TheatersRounded />}
                    sx={{
                      minHeight: 34,
                      borderRadius: "10px",
                      borderColor: "#f1b7b7",
                      color: "#dc2626",
                      fontWeight: 900,
                      fontSize: 11,
                      px: 1,
                      "&:hover": {
                        borderColor: "#ef4444",
                        backgroundColor: "#fff5f5",
                      },
                    }}
                  >
                    {isSavingRoom ? "Đang lưu..." : "Lưu phòng"}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSaveLayout}
                    disabled={isSavingLayout}
                    startIcon={<SaveRounded />}
                    sx={{
                      minHeight: 34,
                      borderRadius: "10px",
                      backgroundColor: "#ec131e",
                      boxShadow: "0 8px 18px rgba(236,19,30,0.16)",
                      fontWeight: 900,
                      fontSize: 11,
                      px: 1,
                      "&:hover": {
                        backgroundColor: "#d6111b",
                      },
                    }}
                  >
                    {isSavingLayout ? "Đang lưu..." : "Lưu ghế"}
                  </Button>
                </Box>
              </Box>

              <Box
                sx={{
                  ...compactSectionSx,
                  display: "grid",
                  gap: 0.85,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "#9ca3af",
                  }}
                >
                  Tuỳ chọn nhanh
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.7,
                  }}
                >
                  {[
                    { label: "ID", value: `#${roomId}`, color: "#9ca3af" },
                    { label: "Lưu", value: statusText, color: "#ef4444" },
                    { label: "Std", value: seatBreakdown.STANDARD, color: seatTypeColors.STANDARD },
                    { label: "VIP", value: seatBreakdown.VIP, color: seatTypeColors.VIP },
                    { label: "Đôi", value: seatBreakdown.COUPLE, color: seatTypeColors.COUPLE },
                    { label: "Ghế", value: totalSeats, color: "#ef4444" },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.7,
                        minHeight: 34,
                        borderRadius: "999px",
                        border: "1px solid #e8edf3",
                        backgroundColor: "#ffffff",
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.55,
                          fontSize: 9,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "#9ca3af",
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            height: 8,
                            width: 8,
                            borderRadius: "999px",
                            backgroundColor: item.color,
                          }}
                        />
                        {item.label}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 900,
                          lineHeight: 1,
                          color: "#111827",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gap: 0.7,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(4, minmax(0,1fr))",
                    },
                  }}
                >
                  {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((seatType) => (
                    <Box
                      key={seatType}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0,1fr)",
                        alignItems: "center",
                        gap: 0.65,
                        borderRadius: "10px",
                        border: "1px solid #e8edf3",
                        backgroundColor: "#ffffff",
                        px: 0.8,
                        py: 0.65,
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          minWidth: 44,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            height: 8,
                            width: 8,
                            borderRadius: "999px",
                            backgroundColor: seatTypeColors[seatType],
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 900,
                            color: "#111827",
                          }}
                        >
                          {seatType === "STANDARD"
                            ? "Std"
                            : seatType === "COUPLE"
                              ? "Đôi"
                              : seatTypeLabels[seatType]}
                        </Typography>
                      </Box>

                      <TextField
                        type="number"
                        value={seatPrices[seatType]}
                        onChange={(e) =>
                          setSeatPrices({
                            ...seatPrices,
                            [seatType]: Number(e.target.value),
                          })
                        }
                        size="small"
                        sx={{
                          ...inputSx,
                          "& .MuiOutlinedInput-root": {
                            ...inputSx["& .MuiOutlinedInput-root"],
                            minHeight: 32,
                            fontWeight: 900,
                            borderRadius: "9px",
                          },
                          "& .MuiOutlinedInput-input": {
                            px: 1.1,
                            py: 0.85,
                            fontSize: 13,
                          },
                        }}
                      />
                    </Box>
                  ))}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      borderRadius: "10px",
                      border: "1px solid #f1d2d2",
                      backgroundColor: "#fffafa",
                      px: 1,
                      py: 0.75,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        color: "#ef4444",
                      }}
                    >
                      Giá cao nhất
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "#111827",
                      }}
                    >
                      {maxSeatPrice.toLocaleString("vi-VN")} VNĐ
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 1.25,
                borderTop: "1px solid #eef1f4",
                pt: 1.25,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 18,
                        lineHeight: 1.1,
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        color: "#111827",
                      }}
                    >
                      Sơ đồ ghế
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.35,
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#6b7280",
                      }}
                    >
                      Vùng thao tác chính được giữ ở dưới để nhìn thấy ghế sớm hơn.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.75,
                    }}
                  >
                      {[
                      { label: "Hàng", value: parsedLayout.length },
                      { label: "Ghế", value: totalSeats },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          borderRadius: "999px",
                          border: "1px solid #e8edf3",
                          backgroundColor: "#fbfcfe",
                          px: 0.95,
                          py: 0.55,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 9,
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.14em",
                            color: "#9ca3af",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            fontWeight: 900,
                            color: "#111827",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

              <Box sx={{ mt: 1.25 }}>
                <SeatLayoutBuilder
                  key={`${roomId}-${initialSeatLayout}`}
                  initialLayout={parsedLayout}
                  onChange={handleSeatChange}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
