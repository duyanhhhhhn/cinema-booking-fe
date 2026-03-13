"use client";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  IconButton,
} from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import { IRoom } from "../type";
import { useDeleteRoomMutation } from "../room";

interface Props {
  rooms: IRoom[];
  setSelectedRoom: (room: IRoom) => void;
}

export default function RoomTable({ rooms, setSelectedRoom }: Props) {
  const deleteMutation = useDeleteRoomMutation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên phòng</TableCell>
            <TableCell>Rạp</TableCell>
            <TableCell>Loại</TableCell>
            <TableCell>Tổng ghế</TableCell>
            <TableCell align="right">Hành động</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id} hover>
              <TableCell>{room.id}</TableCell>

              <TableCell
                style={{ cursor: "pointer", color: "#1976d2" }}
                onClick={() => setSelectedRoom(room)}
              >
                {room.name}
              </TableCell>

              <TableCell>{room.cinemaName}</TableCell>

              <TableCell>{room.type}</TableCell>

              <TableCell>{room.totalSeats}</TableCell>

              <TableCell align="right">
                <IconButton onClick={() => setSelectedRoom(room)}>
                  <Visibility color="primary" />
                </IconButton>

                <IconButton onClick={() => deleteMutation.mutate(room.id)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
