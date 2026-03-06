"use client";

import React, { useMemo, useState } from "react";
import { Add } from "@mui/icons-material";

import { useQuery } from "@tanstack/react-query";

import RoomTable from "../modal/RoomTable";
import RoomDetailModal from "../modal/RoomDetailModal";

import { IRoom } from "../type";
import { useGetRoomsQuery } from "../room";

import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import RoomFormModal from "../modal/RoomFormModal";

export default function RoomManagement() {
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

  const [cinemaId, setCinemaId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // GET CINEMAS
  // =========================
  const [isRoomFormOpen, setRoomFormOpen] = useState(false);
  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));

  const cinemas = cinemaData?.data || [];

  // =========================
  // GET ROOMS
  // =========================

  const queryConfig = useGetRoomsQuery(cinemaId || undefined);

  const { data: roomsData, isLoading } = useQuery(queryConfig);

  const rooms = useMemo(() => {
    if (!roomsData?.data) return [];

    const list = roomsData.data.map((room) => {
      const cinema = cinemas.find((c) => c.id === room.cinemaId);

      return {
        ...room,
        cinemaName: cinema?.name || "Unknown",
      };
    });

    if (!searchTerm) return list;

    return list.filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [roomsData, cinemas, searchTerm]);

  if (isLoading) return <div>Loading rooms...</div>;

  return (
    <div className="w-full p-8 font-sans text-zinc-900">
      <div className="flex flex-col gap-6">
        {/* HEADER */}

        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-4xl font-black">Quản lý Phòng Chiếu</h1>

            <p className="text-zinc-600">
              Thêm, sửa và quản lý các phòng chiếu theo rạp.
            </p>
          </div>
        </div>

        {/* TOOLBAR */}

        <div className="flex gap-4 items-center">
          {/* SELECT CINEMA */}

          <select
            value={cinemaId ?? ""}
            onChange={(e) =>
              setCinemaId(e.target.value ? Number(e.target.value) : null)
            }
            className="h-12 border border-zinc-300 rounded-lg px-3 bg-white"
          >
            <option value="">Tất cả rạp</option>

            {cinemas.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>

          {/* SEARCH */}

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm phòng..."
            className="h-12 border border-zinc-300 rounded-lg px-4 w-full max-w-md"
          />

          {/* ADD ROOM */}

          <button
            onClick={() => setRoomFormOpen(true)}
            className="flex items-center gap-2 bg-[#ec131e] text-white px-5 h-12 rounded-lg font-bold"
          >
            <Add fontSize="small" />
            Thêm phòng
          </button>
        </div>

        {/* TABLE */}

        <RoomTable rooms={rooms} setSelectedRoom={setSelectedRoom} />

        {isRoomFormOpen && (
          <RoomFormModal
            open={isRoomFormOpen}
            cinemaId={cinemaId || 0} // cinemaId hiện tại
            onClose={() => setRoomFormOpen(false)}
            onCreated={(roomId) => {
              setRoomFormOpen(false); // đóng modal tạo phòng
              setSelectedRoom({
                id: roomId,
                cinemaId: cinemaId || 0,
                name: "",
                type: "2D",
                totalSeats: 0,
                seatLayout: "",
              });
            }}
          />
        )}
        {/* MODAL */}

        {selectedRoom && (
          <RoomDetailModal
            roomId={selectedRoom.id}
            cinemaId={selectedRoom.cinemaId}
            open={true}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </div>
    </div>
  );
}
