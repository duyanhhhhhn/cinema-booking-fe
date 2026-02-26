export interface IAdminReviewRow {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  movieId: number;
  movieTitle: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;

  hidden: boolean; // ✅ thêm
}
export interface IAdminReviewMovieOption {
  movieId: number;
  movieTitle: string;
  reviewCount: number;
  avgRating: number;
}