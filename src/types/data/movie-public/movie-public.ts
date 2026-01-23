import { Model } from "../../core/model";
import { IPaginateResponse, IResponse } from "../../core/api";
import { IMoviePublic, IMovieStatus } from "./types";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "public/movies",
  modal: "movies",
};
export class MoviePublic extends Model {
  static queryKeys = {
    paginate: "MOVIES_PAGINATE_QUERY",
    findOne: "MOVIES_FIND_ONE_QUERY",
    all: "MOVIES_PUBLIC_ALL_QUERY",
    status: "MOVIES_PUBLIC_STATUS_QUERY",
  };

  static objects = ObjectsFactory.factory<IMoviePublic>(
    modelConfig,
    this.queryKeys,
  );

  static getAllMovieStatus() {
    return {
      queryKey: [this.queryKeys.all],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<IMoviePublic>>({
            url: `/public/movies`,
          })
          .then((r) => r.data);
      },
    };
  }

  static getMovieById(id: number) {
    return {
      queryKey: ["MOVIE_PUBLIC_DETAIL", id],
      queryFn: () => {
        return this.api
          .get<IResponse<IMoviePublic>>({
            url: `/public/movie-detail/${id}`,
          })
          .then((r) => r.data);
      },
    };
  }

  static getAllMovieStatusCard() {
    return {
      queryKey: [this.queryKeys.status],
      queryFn: () => {
        return this.api
          .get<IResponse<IMovieStatus>>({
            url: `/public/movies/status`,
          })
          .then((r) => r.data);
      },
    };
  }
}

MoviePublic.setup();
