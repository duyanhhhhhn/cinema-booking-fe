import { IResponse } from "@/types/core/api";

export interface IAdminSchedulerResource {
  id: number;
  name: string;
  type: string | null;
  totalSeats: number;
}

export interface IAdminSchedulerEvent {
  id: number;
  resource: number;
  text: string;
  start: string;
  end: string;
  movieId: number;
  posterUrl: string | null;
  basePrice: number;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED" | string;
  conflict: boolean;
  conflictWithIds: number[];
}

export interface IAdminSchedulerMeta {
  timelineStart: string;
  timelineEnd: string;
  totalConflicts: number;
}

export interface IAdminSchedulerPayload {
  resources: IAdminSchedulerResource[];
  events: IAdminSchedulerEvent[];
  meta: IAdminSchedulerMeta;
}

export type IAdminSchedulerResponse = IResponse<IAdminSchedulerPayload>;

export interface IAdminCreateShowtimeParams {
  cinemaId: number;
  roomId: number;
  movieId: number;
  startAt: string;
  basePrice: number;
}

export interface IAdminMoveShowtimeParams {
  cinemaId: number;
  roomId: number;
  startAt: string;
}

export interface IAdminMovieOption {
  id: number;
  title: string;
  durationMinutes: number;
  posterUrl: string | null;
  status: string;
}