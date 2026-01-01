import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface IMovie {
  id: number;
  poster: string;
  name: string;
  genre: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'ended';
}
export interface MovieFormData {
  title: string
  shortDescription: string
  description: string
  durationMinutes: number
  genre: string
  language: string
  format: string
  director: string
  cast: string
  posterUrl: string
  bannerUrl: string
  trailerUrl: string
  releaseDate: string
  endDate: string
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED";
}

export const initialData: MovieFormData = {
  title: "",
  shortDescription  : "",
  description: "",
  durationMinutes: 0,
  genre: "",
  language: "",
  format: "",
  director: "",
  cast: "",
  releaseDate: "",
  endDate: "",
  posterUrl: "",
  bannerUrl: "",
  trailerUrl: "",
  status: "COMING_SOON",
};
const modelConfig = {
  path: '/movies',
  modal: 'movies'
}

export class Movie extends Model {
    static queryKeys = {
    paginate: 'MOVIES_PAGINATE_QUERY',
    findOne: 'MOVIES_FIND_ONE_QUERY'
  }
   static objects = ObjectsFactory.factory<IMovie>(modelConfig, this.queryKeys)

  static getMovies() {
    return {
      queryKey: ['CONVERSIONRATES_PAGINATE_QUERY'],
      queryFn: () => {
        return this.api
          .get<IPaginateResponse<IMovie[]>>({
            url: '/movies',
          })
          .then(r => r.data)
      }
    }
  }
  static createMovie(payload: MovieFormData) {
    return this.api.post<IResponse<IMovie>>({
      url: '/movies/create-movies',
      data: payload,
    })
  }
  static deleteMovie(id: number) {
    return this.api.delete<IResponse<IMovie>>({
      url: `/movies/delete-movies/${id}`,
    })
  }
}
Movie.setup();

export function useCreateMovieMutation() {
  return useMutation<IResponse<IMovie>, IHttpError, MovieFormData>({
    mutationFn: (payload: MovieFormData) => {
      return Movie.createMovie(payload).then(r => r.data)
    }
  })
}
export function useDeleteMovieMutation() {
  return useMutation<IResponse<IMovie>, IHttpError, number>({
    mutationFn: (id: number) => {
      return Movie.deleteMovie(id).then(r => r.data)
    }
  })
}