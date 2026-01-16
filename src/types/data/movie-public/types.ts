// NOTE: this is file setup types on typescript 
// setup enum movie status
export type MovieStatus = 'COMING_SOON' | 'NOW_SHOWING' | 'ENDED';

// setup types movie dto 
export interface IMoviePublic {
  id: number;
  title: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  genre: string;
  language: string;
  format: string;
  director: string;
  cast: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  releaseDate: string; 
  endDate: string;     
  status: MovieStatus;
  createdAt: string; 
}