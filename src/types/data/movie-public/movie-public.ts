import { Model } from "../../core/model";
import { IPaginateResponse } from "../../core/api";
import { IMoviePublic } from "./types";

export class MoviePublic extends Model {
  static queryKey = {
    list: (page: number, perPage: number) =>
      ["MOVIE_PUBLIC", "LIST", page, perPage] as const,
  };

  static getAllMovieStatus(params: { page: number; perPage: number }) {
    const { page, perPage } = params;

    return {
      queryKey: this.queryKey.list(page, perPage),
      queryFn: async () => {
        console.log("FETCH movies params =", { page, perPage });

        const res = await this.api.get<IPaginateResponse<IMoviePublic>>({
          url: "/public/movies",
          params: { page, perPage },
        });

        console.log(
          "FETCH done",
          res.status,
          res.config.baseURL,
          res.request?.responseURL ?? res.config.url
        );

        return res.data;
      },
      keepPreviousData: true,
    };
  }
}

MoviePublic.setup();
