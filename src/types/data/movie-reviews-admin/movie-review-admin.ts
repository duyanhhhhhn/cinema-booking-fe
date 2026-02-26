import { Model } from "@/types/core/model";
import { IAdminReviewMovieOption, IAdminReviewRow } from "./type";
import { IResponse } from "@/types/core/api";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "admin/movie-reviews",
  modal: "movie-reviews",
};

export class MovieReviewAdmin extends Model {
  static queryKeys = {
    list: "ADMIN_MOVIE_REVIEW_LIST_QUERY",
    movies: "ADMIN_MOVIE_REVIEW_MOVIES_QUERY",
    toggle_hidden: "ADMIN_MOVIE_REVIEW_TOGGLE_HIDDEN_QUERY",
    hide: "ADMIN_MOVIE_REVIEW_HIDE_QUERY",
    unhide: "ADMIN_MOVIE_REVIEW_UNHIDE_QUERY",
  };

  static objects = ObjectsFactory.factory<IAdminReviewRow>(modelConfig, this.queryKeys);

  static getAll(page: number = 1, perPage: number = 10, movieId?: number) {
    return {
      queryKey: [this.queryKeys.list, page, perPage, movieId ?? null],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminReviewRow[]>>({
            url: `/admin/movie-reviews`,
            params: { page, perPage, ...(movieId ? { movieId } : {}) },
          })
          .then((r) => r.data),
    };
  }

  static getMovies() {
    return {
      queryKey: [this.queryKeys.movies],
      queryFn: () =>
        this.api
          .get<IResponse<IAdminReviewMovieOption[]>>({
            url: `/admin/movie-reviews/movies`,
          })
          .then((r) => r.data),
    };
  }

  // PATCH /api/admin/movie-reviews/{id}/toggle-hidden
  static toggleHidden(id: number) {
    return {
      queryKey: [this.queryKeys.toggle_hidden, id],
      queryFn: () =>
        this.api
          .patch<IResponse<any>>({
            url: `/admin/movie-reviews/${id}/toggle-hidden`,
          })
          .then((r) => r.data),
    };
  }

// PATCH /api/admin/movie-reviews/{id}/hide
static hide(id: number) {
  return {
    queryKey: [this.queryKeys.hide, id],
    queryFn: () =>
      this.api
        .patch<IResponse<any>>({
          url: `/admin/movie-reviews/${id}/hide`,
        })
        .then((r) => r.data),
  };
}

// PATCH /api/admin/movie-reviews/{id}/unhide
static unhide(id: number) {
  return {
    queryKey: [this.queryKeys.unhide, id],
    queryFn: () =>
      this.api
        .patch<IResponse<any>>({
          url: `/admin/movie-reviews/${id}/unhide`,
        })
        .then((r) => r.data),
  };
}
}

MovieReviewAdmin.setup();