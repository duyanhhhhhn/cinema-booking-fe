"use client";

import { Model } from "@/types/core/model";
import { IRoom } from "./type";
import { useMutation } from "@tanstack/react-query";

export class Room extends Model {
  static queryKeys = {
    listRooms: (cinemaId?: number) => ["ROOM", "LIST_ROOMS", cinemaId] as const,
  };

  // =========================
  // GET ROOMS
  // =========================

  static getRooms(cinemaId?: number) {
    const url = cinemaId ? `/cinemas/${cinemaId}/rooms` : "/rooms";

    return {
      queryKey: this.queryKeys.listRooms(cinemaId),

      queryFn: async (): Promise<{ message: string; data: IRoom[] }> => {
        const res = await this.api.get<{ message: string; data: IRoom[] }>({
          url,
        });

        return res.data;
      },
    };
  }

  // =========================
  // CREATE ROOM
  // =========================

  static createRoom(payload: FormData) {
    return this.api.post<IRoom>({
      url: "/rooms",
      data: payload,
    });
  }

  // =========================
  // UPDATE ROOM
  // =========================

  static updateRoom(id: number, payload: FormData) {
    return this.api.put<IRoom>({
      url: `/rooms/${id}`,
      data: payload,
    });
  }

  // =========================
  // DELETE ROOM
  // =========================

  static deleteRoom(id: number) {
    return this.api.delete({
      url: `/rooms/${id}`,
    });
  }
}

Room.setup();

// =========================
// MUTATIONS
// =========================

export function useCreateRoomMutation() {
  return useMutation({
    mutationFn: (payload: FormData) =>
      Room.createRoom(payload).then((res) => res.data),
  });
}

export function useUpdateRoomMutation() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      Room.updateRoom(id, payload).then((res) => res.data),
  });
}

export function useDeleteRoomMutation() {
  return useMutation({
    mutationFn: (id: number) => Room.deleteRoom(id).then((res) => res.data),
  });
}

// =========================
// QUERY
// =========================

export function useGetRoomsQuery(cinemaId?: number) {
  return Room.getRooms(cinemaId);
}
