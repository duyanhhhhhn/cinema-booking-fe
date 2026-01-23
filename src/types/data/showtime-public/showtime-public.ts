import { Model } from "@/types/core/model";
import { IMovieShowtimeGroup } from "./type";

const modelConfig = {
  path: "showtime/public",
  modal: "showtime",
};
console.log("ShowtimePublic modelConfig:", modelConfig);
export class ShowtimePublic extends Model {
  static factory<T>(
    modelConfig: { path: string; modal: string },
    queryKeys: { all: readonly ["SHOWTIME_PUBLIC", "ALL"] },
  ) {
    throw new Error("Method not implemented.");
  }
  static queryKeys = {
    all: ["SHOWTIME_PUBLIC", "ALL"] as const,
  };

  static objects = this.factory<IMovieShowtimeGroup>(
    modelConfig,
    this.queryKeys,
  );

  static getAllShowtimePublic() {
    return {
      queryKey: this.queryKeys.all,
      queryFn: () => {
        return this.api
          .get<{ data: IMovieShowtimeGroup[] }>({
            url: `/showtime/public`,
          })
          .then((r) => r);
      },
    };
  }
}
