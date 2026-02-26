import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";
import {
  IAdminCreateShowtimeParams,
  IAdminMoveShowtimeParams,
  IAdminSchedulerResponse,
  IAdminSchedulerEvent,
  IAdminMovieOption,
} from "./type";

const modelConfig = {
  path: "admin/showtime-scheduler",
  modal: "showtime-scheduler",
};

export class ShowtimeSchedulerAdmin extends Model {
  static queryKeys = {
    scheduler: "ADMIN_SHOWTIME_SCHEDULER_QUERY",
    movies: "ADMIN_SHOWTIME_SCHEDULER_MOVIES_QUERY",
    create: "ADMIN_SHOWTIME_SCHEDULER_CREATE_QUERY",
    move: "ADMIN_SHOWTIME_SCHEDULER_MOVE_QUERY",
    cancel: "ADMIN_SHOWTIME_SCHEDULER_CANCEL_QUERY",
  };

  static objects = ObjectsFactory.factory<IAdminSchedulerEvent>(modelConfig, this.queryKeys);

  static getScheduler(cinemaId: number, date: string) {
    return {
      queryKey: [this.queryKeys.scheduler, cinemaId, date],
      queryFn: () =>
        this.api
          .get<IAdminSchedulerResponse>({
            url: `/admin/showtime-scheduler/scheduler`,
            params: { cinemaId, date },
          })
          .then((r) => r.data),
    };
  }

  static getMovies(keyword?: string) {
    return {
      queryKey: [this.queryKeys.movies, keyword ?? null],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminMovieOption[]>>({
            url: `/admin/showtime-scheduler/movies`,
            params: { ...(keyword ? { keyword } : {}) },
          })
          .then((r) => r.data),
    };
  }

  static createShowtime(params: IAdminCreateShowtimeParams) {
    return {
      queryKey: [
        this.queryKeys.create,
        params.cinemaId,
        params.roomId,
        params.movieId,
        params.startAt,
        params.basePrice,
      ],
      queryFn: () =>
        this.api
          .post<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler`,
            params,
          })
          .then((r) => r.data),
    };
  }

  static moveShowtime(id: number, params: IAdminMoveShowtimeParams) {
    return {
      queryKey: [this.queryKeys.move, id, params.cinemaId, params.roomId, params.startAt],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/${id}/move`,
            params,
          })
          .then((r) => r.data),
    };
  }

  static cancelShowtime(id: number) {
    return {
      queryKey: [this.queryKeys.cancel, id],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/${id}/cancel`,
          })
          .then((r) => r.data),
    };
  }
}

ShowtimeSchedulerAdmin.setup();