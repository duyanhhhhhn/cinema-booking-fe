"use client";

import React, { useMemo, useState } from "react";
import {
  Add,
  Search,
  MeetingRoomRounded,
  ChairRounded,
  LocalMoviesRounded,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
import RoomTable from "../modal/RoomTable";
import RoomDetailModal from "../modal/RoomDetailModal";
import RoomFormModal from "../modal/RoomFormModal";

import { IRoom } from "../type";
import { useGetRoomsQuery } from "../room";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

export default function RoomManagement() {
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [isRoomFormOpen, setRoomFormOpen] = useState(false);

  // =========================
  // GET CINEMAS
  // =========================
  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = useMemo(() => cinemaData?.data || [], [cinemaData]);

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

  const selectedCinemaName =
    cinemas.find((cinema) => cinema.id === cinemaId)?.name ?? "Tất cả rạp";

  const stats = {
    totalRooms: roomsData?.length ?? 0,
    showing: rooms.length,
    totalSeats: rooms.reduce(
      (sum, room) => sum + Number(room.totalSeats || 0),
      0,
    ),
  };

  return (
    <div
      className={`${roboto.className} w-full bg-[#f6f7fb] p-4 text-zinc-900 sm:p-6 xl:p-8`}
    >
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        toastOptions={{
          duration: 3200,
          className:
            "!rounded-[20px] !border !border-[#ffd9d9] !bg-white !text-[#111827] !shadow-[0_20px_60px_rgba(255,45,47,0.14)]",
          style: {
            padding: "16px",
          },
        }}
      />

      <div className="flex flex-col gap-6">
        <div className="rounded-[30px] border border-[#e8ebf2] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0dede] bg-[#fff8f8] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#d44343]">
                Hệ thống rạp
              </div>
              <h1 className="mt-3 text-[30px] font-black leading-tight tracking-[-0.04em] text-zinc-900 sm:text-[38px]">
                Quản lý Phòng Chiếu
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] font-medium leading-7 text-zinc-500 sm:text-[15px]">
                Tạo phòng chiếu mới, theo dõi số lượng ghế và quản lý từng phòng
                theo rạp phụ trách.
              </p>
            </div>

            <button
              onClick={() => setRoomFormOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#ec131e,#ff6548)] px-5 text-sm font-black text-white shadow-[0_18px_40px_rgba(236,19,30,0.26)] transition hover:-translate-y-[1px]"
            >
              <Add fontSize="small" />
              <span>Thêm phòng</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Tổng phòng",
                value: stats.totalRooms,
                icon: <MeetingRoomRounded fontSize="small" />,
              },
              {
                label: "Đang hiển thị",
                value: stats.showing,
                icon: <Search fontSize="small" />,
              },
              {
                label: "Tổng ghế",
                value: stats.totalSeats,
                icon: <ChairRounded fontSize="small" />,
              },
              {
                label: "Rạp đang lọc",
                value: selectedCinemaName,
                icon: <LocalMoviesRounded fontSize="small" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[26px] border border-[#e8ebf2] bg-white p-5 text-zinc-900 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {item.label}
                    </div>
                    <div className="mt-3 truncate text-[34px] font-black leading-none tracking-[-0.04em]">
                      {item.value}
                    </div>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[#f1e2e2] bg-[#fff6f6] text-[#e05454] shadow-sm">
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[26px] border border-[#e8ebf2] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="w-full xl:max-w-[300px]">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Lọc theo rạp
                </div>
                <select
                  value={cinemaId ?? ""}
                  onChange={(e) =>
                    setCinemaId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="h-14 w-full rounded-[20px] border border-[#e5e7eb] bg-white px-4 text-sm font-black text-zinc-800 outline-none shadow-sm"
                >
                  <option value="">Tất cả rạp</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full xl:max-w-[440px]">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Tìm kiếm phòng
                </div>
                <label className="flex h-14 w-full items-center overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white shadow-sm transition focus-within:border-[#ef9a9a] focus-within:shadow-[0_0_0_4px_rgba(236,19,30,0.06)]">
                  <div className="flex h-full items-center justify-center px-4 text-zinc-400">
                    <Search fontSize="small" />
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm phòng theo tên..."
                    className="h-full w-full bg-transparent pr-4 text-base font-semibold text-zinc-900 outline-none placeholder:text-zinc-400"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e8ebf2] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="mb-4 flex flex-col gap-1">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">
              Danh sách phòng chiếu
            </div>
            <div className="text-[22px] font-black tracking-[-0.03em] text-zinc-900">
              Phòng đang hiển thị theo bộ lọc hiện tại
            </div>
            <div className="text-sm font-medium text-zinc-500">
              Hiển thị {rooms.length} phòng trong khu quản lý.
            </div>
          </div>

          <RoomTable rooms={rooms} setSelectedRoom={setSelectedRoom} />
        </div>

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
