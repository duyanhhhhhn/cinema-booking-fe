import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IResponse } from "@/types/core/api";
import type {
  IAdminRevenueReport,
  IAdminRevenueReportFilterParams,
  IAdminReportMovieOption,
} from "./type";

const modelConfig = {
  path: "admin/dashboard/reports/revenue",
  modal: "admin-revenue-report",
};

export class RevenueAdmin extends Model {
  static queryKeys = {
    report: "ADMIN_REVENUE_REPORT_QUERY",
    movieOptions: "ADMIN_REVENUE_REPORT_MOVIE_OPTIONS_QUERY",
  };

  static objects = ObjectsFactory.factory<IAdminRevenueReport>(
    modelConfig,
    this.queryKeys,
  );

  static getReport(filters: IAdminRevenueReportFilterParams = {}) {
    const startDate = (filters.startDate ?? "").trim();
    const endDate = (filters.endDate ?? "").trim();
    const cinemaId =
      typeof filters.cinemaId === "number" && !Number.isNaN(filters.cinemaId)
        ? filters.cinemaId
        : null;
    const movieId =
      typeof filters.movieId === "number" && !Number.isNaN(filters.movieId)
        ? filters.movieId
        : null;

    return {
      queryKey: [
        this.queryKeys.report,
        startDate || null,
        endDate || null,
        cinemaId,
        movieId,
      ],
      queryFn: async () => {
        const res = await this.api.get<IResponse<IAdminRevenueReport>>({
          url: `/admin/dashboard/reports/revenue`,
          params: {
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            ...(cinemaId !== null ? { cinemaId } : {}),
            ...(movieId !== null ? { movieId } : {}),
          },
        });

        return res.data;
      },
    };
  }

  static getMovieOptions(cinemaId?: number | null) {
    const normalizedCinemaId =
      typeof cinemaId === "number" && !Number.isNaN(cinemaId)
        ? cinemaId
        : null;

    return {
      queryKey: [this.queryKeys.movieOptions, normalizedCinemaId],
      queryFn: async () => {
        const res = await this.api.get<IResponse<IAdminReportMovieOption[]>>({
          url: `/admin/dashboard/reports/movie-options`,
          params:
            normalizedCinemaId !== null ? { cinemaId: normalizedCinemaId } : {},
        });

        return res.data;
      },
    };
  }
}

RevenueAdmin.setup();