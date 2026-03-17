"use client";

import React, { useMemo, useState } from "react";
import { Add } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import RoomTable from "../modal/RoomTable";
import RoomDetailModal from "../modal/RoomDetailModal";
import RoomFormModal from "../modal/RoomFormModal";

import { IRoom } from "../type";
import { useGetRoomsQuery } from "../room";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";

export default function RoomManagement() {
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [isRoomFormOpen, setRoomFormOpen] = useState(false);

  // =========================
  // GET CINEMAS
  // =========================
  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = cinemaData?.data || [];

  // =========================
  // GET ROOMS
  // =========================
  const roomsQueryConfig = useGetRoomsQuery(cinemaId || undefined);

  const { data: roomsData, isLoading } = useQuery<IRoom[]>({
    queryKey: roomsQueryConfig.queryKey,
    queryFn: roomsQueryConfig.queryFn,
  });

  // =========================
  // FILTER ROOMS
  // =========================
  const rooms = useMemo(() => {
    if (!roomsData) return [];

    return roomsData
      .map((room: IRoom) => {
        const cinema = cinemas.find((c) => c.id === room.cinemaId);
        return {
          ...room,
          cinemaName: cinema?.name || "Unknown",
        };
      })
      .filter((room) => {
        const matchesSearch = searchTerm
          ? room.name.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesCinema = cinemaId ? room.cinemaId === cinemaId : true;
        return matchesSearch && matchesCinema;
      });
  }, [roomsData, cinemas, searchTerm, cinemaId]);

  if (isLoading) return <div>Loading rooms...</div>;

  return (
    <div className="w-full p-8 font-sans text-zinc-900">
      <div className="flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-4xl font-black">Quản lý Phòng Chiếu</h1>
            <p className="text-zinc-600">
              Tạo phòng chiếu mới và thiết lập sơ đồ ghế cho từng phòng.
            </p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex gap-4 items-center flex-wrap">
          {/* FILTER CINEMA */}
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
            className="flex items-center gap-2 bg-[#ec131e] text-white px-5 h-12 rounded-lg font-bold hover:bg-[#c81018]"
          >
            <Add fontSize="small" />
            Thêm phòng
          </button>
        </div>

        {/* TABLE */}
        <RoomTable rooms={rooms} setSelectedRoom={setSelectedRoom} />

        {/* CREATE ROOM MODAL */}
        {isRoomFormOpen && (
          <RoomFormModal
            open={isRoomFormOpen}
            cinemas={cinemas}
            onClose={() => setRoomFormOpen(false)}
            onCreated={(room) => {
              setRoomFormOpen(false);
              setSelectedRoom(room);
            }}
          />
        )}

        {/* ROOM DETAIL MODAL */}
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
