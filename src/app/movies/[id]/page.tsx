import MovieDetail from "../../component/movies/MovieDetail";
import { Metadata } from "next";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});



type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  return {
    title: "Chi tiết phim - Cinema Booking",
    description: "Thông tin chi tiết về phim",
  };
}

export default async function MovieDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <MovieDetail movieId={id} />;
}
