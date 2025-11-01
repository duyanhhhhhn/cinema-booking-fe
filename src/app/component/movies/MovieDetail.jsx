"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography,
  IconButton,
  Modal,
  Rating,
} from "@mui/material";

export default function MovieDetail({ movieId }) {
  const [tabValue, setTabValue] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Sample data - replace with API call
  const movie = {
    id: movieId || 1,
    title: "Avengers: Secret Wars",
    description: "Cuộc chiến cuối cùng của vũ trụ Marvel với những siêu anh hùng yêu thích. Đây là bộ phim epic nhất từ trước đến nay với nhiều tình tiết bất ngờ và hiệu ứng đặc biệt đỉnh cao.",
    fullDescription: "Trong phần cuối của loạt phim Avengers, các siêu anh hùng phải đoàn kết để chống lại kẻ thù mạnh nhất từ trước đến nay. Với sự tham gia của tất cả các nhân vật yêu thích từ Marvel Cinematic Universe, Avengers: Secret Wars hứa hẹn sẽ là một trải nghiệm điện ảnh không thể bỏ lỡ.",
    poster: "/logo/logo.png",
    trailer: "https://www.youtube.com/embed/example",
    rating: 4.8,
    duration: 180,
    format: "IMAX",
    genre: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    director: "Kevin Feige",
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo"],
    releaseDate: "2024-01-15",
    language: "Tiếng Anh - Phụ đề Việt",
    ageRating: "C18",
    reviews: [
      { user: "Nguyễn Văn A", rating: 5, comment: "Phim tuyệt vời! Hiệu ứng đỉnh cao.", date: "2024-01-20" },
      { user: "Trần Thị B", rating: 4, comment: "Câu chuyện hay nhưng hơi dài.", date: "2024-01-19" },
    ],
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Grid container spacing={4}>
        {/* Left Column - Poster and Info */}
        <Grid item xs={12} md={4}>
          <div className="relative mb-6">
            <Image
              src={movie.poster}
              alt={movie.title}
              width={400}
              height={600}
              className="rounded-lg shadow-xl object-cover w-full"
            />
            <div className="absolute top-4 right-4">
              <Chip
                label={movie.format}
                className="bg-purple-500 text-white font-semibold"
              />
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <i className="ti ti-star-filled text-yellow-500 text-xl"></i>
              <span className="text-xl font-bold">{movie.rating}</span>
              <span className="text-gray-600">/ 5.0</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="ti ti-clock text-lg"></i>
              <span>{movie.duration} phút</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="ti ti-calendar text-lg"></i>
              <span>Khởi chiếu: {movie.releaseDate}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="ti ti-language text-lg"></i>
              <span>{movie.language}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="ti ti-accessible text-lg"></i>
              <span>Độ tuổi: {movie.ageRating}</span>
            </div>
          </div>

          <Link href={`/booking/${movie.id}`}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              className="bg-teal-500 hover:bg-teal-600 py-3 text-lg font-semibold"
            >
              <i className="ti ti-ticket mr-2"></i>
              Đặt vé ngay
            </Button>
          </Link>

          <Button
            fullWidth
            variant="outlined"
            className="mt-3 py-3"
            onClick={() => setTrailerOpen(true)}
          >
            <i className="ti ti-player-play mr-2"></i>
            Xem trailer
          </Button>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h3" className="font-bold mb-4 text-gray-900">
            {movie.title}
          </Typography>

          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.map((g, idx) => (
              <Chip key={idx} label={g} variant="outlined" />
            ))}
          </div>

          <Tabs value={tabValue} onChange={handleTabChange} className="mb-4">
            <Tab label="Mô tả" />
            <Tab label="Diễn viên & Đội ngũ" />
            <Tab label="Đánh giá" />
          </Tabs>

          <Divider className="mb-4" />

          {tabValue === 0 && (
            <div className="space-y-4">
              <Typography variant="body1" className="text-gray-700 leading-relaxed">
                {movie.fullDescription}
              </Typography>
            </div>
          )}

          {tabValue === 1 && (
            <div className="space-y-4">
              <div>
                <Typography variant="h6" className="font-semibold mb-2">
                  Đạo diễn
                </Typography>
                <Typography variant="body1" className="text-gray-700">
                  {movie.director}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" className="font-semibold mb-2">
                  Diễn viên
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <Chip key={idx} label={actor} variant="outlined" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {tabValue === 2 && (
            <div className="space-y-4">
              {movie.reviews.map((review, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <Typography variant="subtitle1" className="font-semibold">
                      {review.user}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </div>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    {review.date}
                  </Typography>
                </div>
              ))}
              <Button variant="outlined" className="mt-4">
                Viết đánh giá
              </Button>
            </div>
          )}
        </Grid>
      </Grid>

      {/* Trailer Modal */}
      <Modal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        className="flex items-center justify-center"
      >
        <Box className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="font-semibold">
              Trailer: {movie.title}
            </Typography>
            <IconButton onClick={() => setTrailerOpen(false)}>
              <i className="ti ti-x"></i>
            </IconButton>
          </div>
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={movie.trailer}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded"
            ></iframe>
          </div>
        </Box>
      </Modal>
    </Box>
  );
}

