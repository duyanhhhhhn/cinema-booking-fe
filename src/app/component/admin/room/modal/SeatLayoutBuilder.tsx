"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { Box, Button, Typography } from "@mui/material";

type SeatType = "STANDARD" | "VIP" | "COUPLE";
type Mode = "SELECT" | "PAINT" | "ERASE";

interface Seat {
  row: string;
  col: number;
  type: SeatType;
}

interface SeatPrices {
  STANDARD: number;
  VIP: number;
  COUPLE: number;
}

interface SeatLayoutBuilderProps {
  onChange: (_layout: string, _total: number) => void;
  seatPrices?: SeatPrices;
  initialRows?: string[];
  initialCols?: number;
  initialLayout?: any; // array parsed từ seat_layout
}

const seatColors = {
  STANDARD: "linear-gradient(135deg,#fff7f7,#ffd9dd)",
  VIP: "linear-gradient(135deg,#ff8a8a,#ef4444)",
  COUPLE: "linear-gradient(135deg,#ffb4c1,#fb7185)",
};

const seatTypeMeta = {
  STANDARD: {
    label: "Standard",
    accent: "#ef4444",
    background: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.16)",
  },
  VIP: {
    label: "VIP",
    accent: "#dc2626",
    background: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.18)",
  },
  COUPLE: {
    label: "Couple",
    accent: "#be123c",
    background: "rgba(225,29,72,0.1)",
    border: "rgba(225,29,72,0.18)",
  },
};

const modeMeta = {
  SELECT: {
    label: "Chọn",
    description: "Chọn nhiều ghế",
  },
  PAINT: {
    label: "Vẽ ghế",
    description: "Tạo hoặc đổi ghế",
  },
  ERASE: {
    label: "Xóa ghế",
    description: "Gỡ ghế khỏi sơ đồ",
  },
};

export default function SeatLayoutBuilder({
  onChange,
  seatPrices = { STANDARD: 60000, VIP: 90000, COUPLE: 150000 },
  initialRows = ["A", "B", "C", "D", "E", "F"],
  initialCols = 12,
  initialLayout,
}: SeatLayoutBuilderProps) {
  const [rows, setRows] = useState<string[]>(initialRows);
  const [cols, setCols] = useState<number>(initialCols);
  const [seatMap, setSeatMap] = useState<Seat[]>([]);
  const [mode, setMode] = useState<Mode>("PAINT");
  const [seatType, setSeatType] = useState<SeatType>("STANDARD");
  const [selectedSeats, setSelectedSeats] = useState<
    { row: string; col: number }[]
  >([]);
  const isDragging = useRef(false);

  // =========================
  // LOAD INITIAL LAYOUT
  // =========================
  useEffect(() => {
    if (!initialLayout) return;

    let parsedLayout: any[] = [];

    // Nếu là string JSON, parse
    if (typeof initialLayout === "string") {
      try {
        parsedLayout = JSON.parse(initialLayout);
      } catch (e) {
        console.error("Invalid initialLayout JSON", e);
        parsedLayout = [];
      }
    } else if (Array.isArray(initialLayout)) {
      parsedLayout = initialLayout;
    } else {
      console.warn("initialLayout is not array", initialLayout);
      parsedLayout = [];
    }

    const map: Seat[] = [];

    parsedLayout.forEach((row: any) => {
      if (!row?.seats || !Array.isArray(row.seats)) return;
      row.seats.forEach((seat: any) => {
        map.push({
          row: row.rowLabel,
          col: Number(seat.seatNumber),
          type: seat.type as SeatType,
        });
      });
    });

    startTransition(() => {
      setSeatMap(map);
    });
  }, [initialLayout]);

  // =========================
  // MOUSE EVENTS
  // =========================
  const handleMouseDown = () => (isDragging.current = true);
  const handleMouseUp = () => {
    isDragging.current = false;
    if (mode === "PAINT" || mode === "ERASE") applySelectedSeats();
  };
  const handleMouseEnter = (row: string, col: number) => {
    if (isDragging.current) toggleSeatSelection(row, col);
  };

  const toggleSeatSelection = (row: string, col: number) => {
    const exists = selectedSeats.find((s) => s.row === row && s.col === col);
    if (exists)
      setSelectedSeats(
        selectedSeats.filter((s) => s.row !== row || s.col !== col),
      );
    else setSelectedSeats([...selectedSeats, { row, col }]);
  };

  const handleSeatClick = (row: string, col: number) => {
    if (mode === "SELECT") toggleSeatSelection(row, col);
    else if (mode === "PAINT" || mode === "ERASE") {
      toggleSeatSelection(row, col);
      applySelectedSeats();
    }
  };

  // =========================
  // APPLY CHANGES
  // =========================
  const applySelectedSeats = () => {
    if (selectedSeats.length === 0) return;

    const newMap = [...seatMap];

    selectedSeats.forEach((seat) => {
      const index = newMap.findIndex(
        (s) => s.row === seat.row && s.col === seat.col,
      );
      if (mode === "ERASE" && index >= 0) newMap.splice(index, 1);
      if (mode === "PAINT") {
        if (index >= 0) newMap[index].type = seatType;
        else newMap.push({ row: seat.row, col: seat.col, type: seatType });
      }
    });

    setSeatMap(newMap);
    generateLayout(newMap);
    setSelectedSeats([]);
  };

  // =========================
  // GENERATE LAYOUT JSON
  // =========================
  const generateLayout = (map: Seat[]) => {
    const grouped: Record<string, any[]> = {};
    map.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push({
        seatNumber: String(seat.col),
        code: `${seat.row}${seat.col}`,
        type: seat.type,
        status: "AVAILABLE",
        price: seatPrices[seat.type],
      });
    });
    const layout = Object.keys(grouped).map((row) => ({
      rowLabel: row,
      seats: grouped[row],
    }));
    onChange(JSON.stringify(layout), map.length);
  };

  const getSeat = (row: string, col: number) =>
    seatMap.find((s) => s.row === row && s.col === col);

  const legend = {
    STANDARD: seatMap.filter((s) => s.type === "STANDARD").length,
    VIP: seatMap.filter((s) => s.type === "VIP").length,
    COUPLE: seatMap.filter((s) => s.type === "COUPLE").length,
  };

  return (
    <Box
      onMouseUp={handleMouseUp}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: 560,
        fontFamily: '"Roboto","sans-serif"',
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            borderRadius: "24px",
            border: "1px solid #ececf2",
            background: "#fff",
            px: 2,
            py: 1.8,
            boxShadow: "0 14px 32px rgba(15,23,42,0.05)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "1.25fr 1.1fr 0.82fr 0.78fr",
              },
              gap: 1.4,
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Công cụ thao tác
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#18181b",
                }}
              >
                Chế độ con trỏ
              </Typography>
              <Box
                sx={{
                  mt: 1.2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {(Object.keys(modeMeta) as Mode[]).map((item) => {
                  const active = mode === item;
                  return (
                    <Button
                      key={item}
                      onClick={() => setMode(item)}
                      sx={{
                        minWidth: 0,
                        flex: "1 1 0",
                        justifyContent: "center",
                        borderRadius: "16px",
                        px: 1.25,
                        py: 1.1,
                        textTransform: "none",
                        border: active
                          ? "1px solid rgba(239,68,68,0.24)"
                          : "1px solid #ececf2",
                        background: active
                          ? "linear-gradient(135deg,rgba(239,68,68,0.09),rgba(255,255,255,1))"
                          : "#fafafa",
                        boxShadow: active
                          ? "0 12px 22px rgba(239,68,68,0.1)"
                          : "none",
                        "&:hover": {
                          background: active
                            ? "linear-gradient(135deg,rgba(239,68,68,0.12),rgba(255,255,255,1))"
                            : "#f4f4f5",
                        },
                      }}
                    >
                      <Box textAlign="center">
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: active ? "#dc2626" : "#18181b",
                          }}
                        >
                          {modeMeta[item].label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#71717a",
                          }}
                        >
                          {modeMeta[item].description}
                        </Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Loại ghế
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#18181b",
                }}
              >
                Vẽ nhanh theo loại ghế
              </Typography>
              <Box
                sx={{
                  mt: 1.2,
                  display: "grid",
                  gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                  gap: 1,
                }}
              >
                {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => {
                  const active = seatType === type;
                  const meta = seatTypeMeta[type];
                  return (
                    <Button
                      key={type}
                      onClick={() => setSeatType(type)}
                      sx={{
                        alignItems: "stretch",
                        justifyContent: "flex-start",
                        borderRadius: "16px",
                        border: active
                          ? `1px solid ${meta.border}`
                          : "1px solid #ececf2",
                        background: active ? meta.background : "#fafafa",
                        px: 1.15,
                        py: 1.1,
                        textTransform: "none",
                        minWidth: 0,
                        "&:hover": {
                          background: active ? meta.background : "#f4f4f5",
                        },
                      }}
                    >
                      <Box textAlign="left" width="100%">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "999px",
                            background: meta.accent,
                            mb: 0.9,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 900,
                            color: active ? meta.accent : "#18181b",
                          }}
                        >
                          {meta.label}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#71717a",
                          }}
                        >
                          {seatPrices[type].toLocaleString()}đ
                        </Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Kích thước phòng
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#18181b",
                }}
              >
                Số hàng và số ghế
              </Typography>
              <Box sx={{ mt: 1.2, display: "grid", gap: 1 }}>
                <Box
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #ececf2",
                    background: "#fafafa",
                    px: 1.2,
                    py: 1,
                  }}
                >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#71717a",
                      }}
                    >
                      Số hàng
                    </Typography>
                    <input
                      type="number"
                      value={rows.length}
                      min={1}
                      onChange={(e) => {
                        const newRowCount = Number(e.target.value);
                        const newRows = Array.from(
                          { length: newRowCount },
                          (_, i) => String.fromCharCode(65 + i),
                        );
                        setRows(newRows);
                      }}
                      className="mt-1.5 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-base font-black text-zinc-900 outline-none"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    />
                </Box>

                <Box
                  sx={{
                    borderRadius: "18px",
                    border: "1px solid #ececf2",
                    background: "#fafafa",
                    px: 1.2,
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#71717a",
                    }}
                  >
                    Ghế mỗi hàng
                  </Typography>
                  <input
                    type="number"
                    value={cols}
                    min={1}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="mt-1.5 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-base font-black text-zinc-900 outline-none"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Thống kê ghế
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#18181b",
                }}
              >
                Nhìn nhanh sơ đồ
              </Typography>
              <Box sx={{ mt: 1.2, display: "grid", gap: 0.85 }}>
                {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => {
                  const meta = seatTypeMeta[type];
                  return (
                    <Box
                      key={type}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "15px",
                        border: "1px solid #ececf2",
                        px: 1.25,
                        py: 1,
                        background: "#fafafa",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={0.9}>
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "999px",
                            background: meta.accent,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#3f3f46",
                          }}
                        >
                          {meta.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: "#18181b",
                        }}
                      >
                        {legend[type]}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box
                sx={{
                  mt: 1,
                  borderRadius: "18px",
                  border: "1px solid rgba(239,68,68,0.14)",
                  background:
                    "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(255,255,255,1))",
                  px: 1.35,
                  py: 1.25,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#ef4444",
                  }}
                >
                  Tổng ghế
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: 24,
                    fontWeight: 900,
                    color: "#18181b",
                  }}
                >
                  {seatMap.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          borderRadius: "28px",
          border: "1px solid #ececf2",
          background:
            "linear-gradient(180deg,rgba(255,255,255,1),rgba(250,250,250,0.96))",
          px: { xs: 1.4, md: 2.4 },
          py: { xs: 1.8, md: 2.4 },
          boxShadow: "0 18px 36px rgba(15,23,42,0.05)",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            width: "min(520px, 100%)",
            mx: "auto",
            mb: 2.2,
            borderRadius: "999px",
            background:
              "linear-gradient(180deg,#fff5f5 0%,#ffe4e6 100%)",
            border: "1px solid rgba(239,68,68,0.18)",
            py: 1.1,
            boxShadow: "0 16px 28px rgba(239,68,68,0.12)",
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#f87171",
            }}
          >
            Screen
          </Typography>
        </Box>

        <Box sx={{ minWidth: "fit-content" }}>
          {rows.map((row) => (
            <Box
              key={row}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.8,
                mb: 1.2,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#3f3f46",
                }}
              >
                {row}
              </Box>
              {Array.from({ length: cols }).map((_, i) => {
                const col = i + 1;
                const seat = getSeat(row, col);
                const isSelected = selectedSeats.some(
                  (s) => s.row === row && s.col === col,
                );
                return (
                  <Box
                    key={col}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={() => handleMouseEnter(row, col)}
                    onClick={() => handleSeatClick(row, col)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "11px",
                      background: seat
                        ? seatColors[seat.type]
                        : "linear-gradient(180deg,#f4f4f5,#e4e4e7)",
                      border: isSelected
                        ? "2px solid rgba(239,68,68,0.92)"
                        : seat
                          ? "1px solid rgba(239,68,68,0.14)"
                          : "1px dashed #d4d4d8",
                      boxShadow: isSelected
                        ? "0 0 0 4px rgba(239,68,68,0.12)"
                        : seat
                          ? "0 10px 20px rgba(239,68,68,0.09)"
                          : "none",
                      color: seat?.type === "STANDARD" ? "#dc2626" : seat ? "#fff" : "#71717a",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      userSelect: "none",
                      transition:
                        "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                      "&:hover": {
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {col}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
