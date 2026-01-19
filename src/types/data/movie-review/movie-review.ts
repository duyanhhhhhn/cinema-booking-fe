import { Model } from "@/types/core/model";
import { IMovieReview, IRatingSummary } from "./type";
import { IPaginateResponse, IResponse } from "@/types/core/api";
import path from "path";
import { ObjectsFactory } from "@/types/core/objectFactory";

const modelConfig = {
  path: "client/reviews",
  modal: "reviews",
}
console.log("MovieReview modelConfig:", modelConfig);
export class MovieReview extends Model {
  
  static queryKeys = {
    paginate: 'MOVIE_REVIEW_PAGINATE_QUERY',
    all: 'MOVIE_COMMENT_ALL_QUERY',
    count_rating: "MOVIE_REVIEW_COUNT_RATING_QUERY"
  };

    static objects = ObjectsFactory.factory<IMovieReview>(
      modelConfig,
      this.queryKeys, 
    );
    
  static getAllReviewByMovieId(movieId: number) {
    return {
      queryKey: [this.queryKeys.all, movieId],
      queryFn: () => {
        return this.api.get<IPaginateResponse<IMovieReview>>({
          url: `/client/reviews/${movieId}/comment`,
        })
        .then((r) => r.data);
      },
    };
  }

  static getCountRatingByMovieId(movieId: number) {
    return {
      queryKey: [this.queryKeys.count_rating, movieId],
      queryFn: () => {
        return this.api.get<IResponse<IRatingSummary>>({
          url: `/client/reviews/${movieId}/rating`,
        })
        .then((r) => r.data);
      }
    }
  }
}
MovieReview.setup();