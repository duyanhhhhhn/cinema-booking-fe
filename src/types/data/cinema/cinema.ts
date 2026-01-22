import { Model } from "../../core/model";
import { IPaginateResponse } from "../../core/api";
import { ICinema } from "./types";

export class Cinema extends Model {
  static queryKey = {
    list: (page: number, perPage: number) =>
      ["CINEMA", "LIST", page, perPage] as const,
  };

  static getAllCinemas(params: { page: number; perPage: number }) {
    const { page, perPage } = params;

    return {
      queryKey: this.queryKey.list(page, perPage),
      queryFn: async () => {
        console.log("FETCH cinemas params =", { page, perPage });

        const res = await this.api.get<IPaginateResponse<ICinema>>({
          url: "/public/cinemas",
          params: { page, perPage },
        });
        console.log(
          "FETCH done",
          res.status,
          res.config.baseURL,
          res.request?.responseURL ?? res.config.url,
        );
        return res.data;
      },
      keepPreviousData: true,
    };
  }
}
Cinema.setup();
