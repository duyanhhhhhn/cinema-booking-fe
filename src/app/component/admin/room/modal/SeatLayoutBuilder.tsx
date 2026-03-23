"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Select, MenuItem } from "@mui/material";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import { SEAT_PRESETS, RowDTO, SeatType } from "./seatPresets";

export default function SeatLayoutBuilder({
  initialLayout,
  onChange,
}: {
  initialLayout: RowDTO[];
  onChange: (layout: string, total: number) => void;
}) {
  const [rows, setRows] = useState<RowDTO[]>([]);

  // ================= LOAD =================
  useEffect(() => {
    if (!initialLayout || initialLayout.length === 0) return;
    setRows(initialLayout);
  }, [initialLayout]);

  // ================= EMIT =================
  useEffect(() => {
    const total = rows.reduce((sum, r) => sum + r.seats.length, 0);
    onChange(JSON.stringify(rows), total);
  }, [rows]);

  // ================= ACTIONS =================

  const addRow = () => {
    const nextChar = String.fromCharCode(65 + rows.length);
    const colCount = rows[0]?.seats.length || 10;

    setRows([
      ...rows,
      {
        row: nextChar,
        type: "STANDARD",
        seats: Array.from({ length: colCount }, (_, i) => ({
          col: i + 1,
          type: "STANDARD",
        })),
      },
    ]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const changeRowType = (rIndex: number, type: SeatType) => {
    const newRows = [...rows];

    const colCount =
      type === "COUPLE"
        ? Math.floor(newRows[rIndex].seats.length / 2)
        : newRows[rIndex].seats.length;

    newRows[rIndex] = {
      ...newRows[rIndex],
      type,
      seats: Array.from({ length: colCount }, (_, i) => ({
        col: i + 1,
        type,
      })),
    };

    setRows(newRows);
  };

  const addSeatToRow = (rowIndex: number) => {
    const newRows = [...rows];
    const row = newRows[rowIndex];

    row.seats.push({
      col: row.seats.length + 1,
      type: row.type,
    });

    setRows(newRows);
  };

  const removeSeatFromRow = (rowIndex: number) => {
    const newRows = [...rows];
    newRows[rowIndex].seats.pop();
    setRows(newRows);
  };

  const applyPreset = (index: number) => {
    setRows(SEAT_PRESETS[index].layout());
  };

  // ================= UI =================

  const getSeatColor = (type: SeatType) => {
    switch (type) {
      case "VIP":
        return "#ef4444";
      case "COUPLE":
        return "#ec4899";
      default:
        return "#9ca3af";
    }
  };

  return (
    <Box>
      {/* HEADER */}
      <Box display="flex" gap={2} mb={2}>
        <Select
          size="small"
          displayEmpty
          onChange={(e) => applyPreset(Number(e.target.value))}
        >
          <MenuItem disabled value="">
            Chọn layout mẫu
          </MenuItem>
          {SEAT_PRESETS.map((p, i) => (
            <MenuItem key={i} value={i}>
              {p.name}
            </MenuItem>
          ))}
        </Select>

        <Button variant="contained" onClick={addRow}>
          + Thêm hàng
        </Button>
      </Box>

      {/* GRID */}
      {rows.map((row, rIndex) => (
        <Box key={row.row} display="flex" alignItems="center" mb={1}>
          <Typography width={30}>{row.row}</Typography>

          {/* ROW TYPE */}
          <Select
            size="small"
            value={row.type}
            onChange={(e) => changeRowType(rIndex, e.target.value as SeatType)}
            sx={{
              mr: 2,
              minWidth: 140, // giữ độ rộng tối thiểu
              width: 140, // cố định width
            }}
          >
            <MenuItem value="STANDARD">STANDARD</MenuItem>
            <MenuItem value="VIP">VIP</MenuItem>
            <MenuItem value="COUPLE">COUPLE</MenuItem>
          </Select>

          {/* SEATS (ICON) */}
          {row.seats.map((seat, cIndex) => (
            <Box
              key={cIndex}
              sx={{
                position: "relative",
                display: "inline-flex",
                mx: 0.5,
                cursor: "pointer",
              }}
            >
              <EventSeatIcon
                sx={{
                  fontSize: row.type === "COUPLE" ? 56 : 36,
                  color: getSeatColor(row.type),
                }}
              />

              {/* SEAT NUMBER */}
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#fff",
                  pointerEvents: "none",
                }}
              >
                {seat.col}
              </Typography>
            </Box>
          ))}

          <Button size="small" onClick={() => addSeatToRow(rIndex)}>
            +
          </Button>
          <Button size="small" onClick={() => removeSeatFromRow(rIndex)}>
            -
          </Button>
          <Button size="small" color="error" onClick={() => removeRow(rIndex)}>
            Xóa
          </Button>
        </Box>
      ))}
    </Box>
  );
}
