"use client";

import React, { useState, useRef, useEffect } from "react";
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
  onChange: (layout: string, total: number) => void;
  seatPrices?: SeatPrices;
  initialRows?: string[];
  initialCols?: number;
  initialLayout?: any; // array parsed từ seat_layout
}

const seatColors = {
  STANDARD: "#777",
  VIP: "#ff3d3d",
  COUPLE: "#ff69b4",
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

    setSeatMap(map);
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
    <Box display="flex" height={500} onMouseUp={handleMouseUp}>
      {/* LEFT PANEL */}
      <Box width={200} p={2} borderRight="1px solid #333">
        <Typography variant="h6">Cursor Mode</Typography>
        <Button fullWidth onClick={() => setMode("SELECT")}>
          Select
        </Button>
        <Button fullWidth onClick={() => setMode("PAINT")}>
          Paint
        </Button>
        <Button fullWidth onClick={() => setMode("ERASE")}>
          Erase
        </Button>

        <Typography mt={3}>Seat Types</Typography>
        {(["STANDARD", "VIP", "COUPLE"] as SeatType[]).map((type) => (
          <Button
            key={type}
            fullWidth
            sx={{ mt: type === "STANDARD" ? 2 : 1 }}
            variant={seatType === type ? "contained" : "outlined"}
            onClick={() => setSeatType(type)}
          >
            {type} ({seatPrices[type].toLocaleString()}đ)
          </Button>
        ))}

        <Box mt={3}>
          <Typography>Số hàng</Typography>
          <input
            type="number"
            value={rows.length}
            min={1}
            onChange={(e) => {
              const newRowCount = Number(e.target.value);
              const newRows = Array.from({ length: newRowCount }, (_, i) =>
                String.fromCharCode(65 + i),
              );
              setRows(newRows);
            }}
            className="border px-2 rounded w-20"
          />
          <Typography mt={2}>Ghế mỗi hàng</Typography>
          <input
            type="number"
            value={cols}
            min={1}
            onChange={(e) => setCols(Number(e.target.value))}
            className="border px-2 rounded w-20"
          />
        </Box>
      </Box>

      {/* CENTER GRID */}
      <Box flex={1} textAlign="center" overflow="auto">
        <Typography
          sx={{
            background: "#222",
            color: "#ff4444",
            p: 1,
            mb: 2,
            width: 400,
            margin: "auto",
          }}
        >
          SCREEN
        </Typography>
        {rows.map((row) => (
          <Box key={row} display="flex" justifyContent="center" mb={1}>
            <Box width={20}>{row}</Box>
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
                    width: 34,
                    height: 34,
                    m: 0.5,
                    borderRadius: 1,
                    background: isSelected
                      ? "#00bfff"
                      : seat
                        ? seatColors[seat.type]
                        : "#444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    userSelect: "none",
                  }}
                >
                  {col}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* RIGHT PANEL */}
      <Box width={220} p={2} borderLeft="1px solid #333">
        <Typography variant="h6">Legend</Typography>
        <Typography>Standard: {legend.STANDARD}</Typography>
        <Typography>VIP: {legend.VIP}</Typography>
        <Typography>Couple: {legend.COUPLE}</Typography>
        <Typography mt={2}>Total Seats: {seatMap.length}</Typography>
      </Box>
    </Box>
  );
}
