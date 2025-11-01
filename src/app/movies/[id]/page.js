import MovieDetail from "../../component/movies/MovieDetail";

export async function generateMetadata({ params: _params }) {
  return {
    title: "Chi tiết phim - Cinema Booking",
    description: "Thông tin chi tiết về phim",
  };
}

export default function MovieDetailPage({ params }) {
  return <MovieDetail movieId={params.id} />;
}

