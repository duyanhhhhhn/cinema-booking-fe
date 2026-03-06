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
    detail: "ADMIN_SHOWTIME_SCHEDULER_DETAIL_QUERY",
    create: "ADMIN_SHOWTIME_SCHEDULER_CREATE_MUTATION",
    move: "ADMIN_SHOWTIME_SCHEDULER_MOVE_MUTATION",
    cancel: "ADMIN_SHOWTIME_SCHEDULER_CANCEL_MUTATION",
    edit: "ADMIN_SHOWTIME_SCHEDULER_EDIT_MUTATION",
  };

  static objects = ObjectsFactory.factory<IAdminSchedulerEvent>(modelConfig, this.queryKeys);

  static getScheduler(cinemaId: number, date: string) {
    return {
      queryKey: [this.queryKeys.scheduler, cinemaId, date],
      queryFn: () =>
        this.api
          .get<IAdminSchedulerResponse>({
            url: "/admin/showtime-scheduler/scheduler",
            params: { cinemaId, date },
          })
          .then((r) => r.data),
    };
  }

  static getMovies(keyword?: string, roomType?: string | null) {
    const rt = (roomType ?? "").trim();
    const kw = (keyword ?? "").trim();

    return {
      queryKey: [this.queryKeys.movies, kw || null, rt || null],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminMovieOption[]>>({
            url: "/admin/showtime-scheduler/movies",
            params: {
              ...(kw ? { keyword: kw } : {}),
              ...(rt ? { roomType: rt } : {}),
            },
          })
          .then((r) => r.data),
    };
  }

  static getShowtimeDetail(id: number, cinemaId: number) {
    return {
      queryKey: [this.queryKeys.detail, id, cinemaId],
      queryFn: () =>
        this.api
          .get<IResponse<any>>({
            url: `/admin/showtime-scheduler/detail/${id}`,
            params: { cinemaId },
          })
          .then((r) => r.data),
    };
  }

  static createShowtime(params: IAdminCreateShowtimeParams) {
    return {
      queryKey: [this.queryKeys.create],
      queryFn: () =>
        this.api
          .post<IResponse<{ id: number }>>({
            url: "/admin/showtime-scheduler",
            params,
          })
          .then((r) => r.data),
    };
  }

  static moveShowtime(id: number, params: IAdminMoveShowtimeParams) {
    return {
      queryKey: [this.queryKeys.move],
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
      queryKey: [this.queryKeys.cancel],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/${id}/cancel`,
          })
          .then((r) => r.data),
    };
  }

  static editShowtime(
    id: number,
    params: { cinemaId: number; roomId: number; movieId: number; startAt: string; basePrice: number },
  ) {
    return {
      queryKey: [this.queryKeys.edit],
      queryFn: () =>
        this.api
          .patch<IResponse<{ id: number }>>({
            url: `/admin/showtime-scheduler/edit/${id}`,
            params,
          })
          .then((r) => r.data),
    };
  }
}

ShowtimeSchedulerAdmin.setup();