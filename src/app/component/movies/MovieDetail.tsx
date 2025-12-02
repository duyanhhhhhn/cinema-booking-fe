"use client";
import "./style/MovieDetail.style.css";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircleOutline,
  ConfirmationNumber
} from "@mui/icons-material";

interface MovieDetailProps {
  movieId: string;
}

export default function MovieDetail({ movieId }: MovieDetailProps) {
  const [tabValue, setTabValue] = useState<number>(0);
  const [trailerOpen, setTrailerOpen] = useState<boolean>(false);

  // Sample data - replace with API call
  const movie = {
    id: movieId || 1,
    title: "Avengers: Secret Wars",
    description:
      "Cuộc chiến cuối cùng của vũ trụ Marvel với những siêu anh hùng yêu thích. Đây là bộ phim epic nhất từ trước đến nay với nhiều tình tiết bất ngờ và hiệu ứng đặc biệt đỉnh cao.",
    fullDescription:
      "Trong phần cuối của loạt phim Avengers, các siêu anh hùng phải đoàn kết để chống lại kẻ thù mạnh nhất từ trước đến nay. Với sự tham gia của tất cả các nhân vật yêu thích từ Marvel Cinematic Universe, Avengers: Secret Wars hứa hẹn sẽ là một trải nghiệm điện ảnh không thể bỏ lỡ.",
    poster: "/poster/poster.jpg",
    trailer: "https://www.youtube.com/embed/example",
    rating: 4.8,
    duration: 180,
    format: "IMAX",
    genre: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    director: "Kevin Feige",
    cast: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Scarlett Johansson",
      "Mark Ruffalo",
    ],
    releaseDate: "2024-01-15",
    language: "Tiếng Anh - Phụ đề Việt",
    ageRating: "C18",
    reviews: [
      {
        user: "Nguyễn Văn A",
        rating: 5,
        comment: "Phim tuyệt vời! Hiệu ứng đỉnh cao.",
        date: "2024-01-20",
      },
      {
        user: "Trần Thị B",
        rating: 4,
        comment: "Câu chuyện hay nhưng hơi dài.",
        date: "2024-01-19",
      },
    ],
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <main className="movie-detail-page">
      {/* Hero poster + info */}
      <section className="movie-detail-hero">
        {/* logo + backgroung hero */}
        <div 
          className="movie-detail-hero-background"
          style={
            { 
              backgroundImage: `url("${movie.poster}")` 
            }
          }
          ></div>
          {/* làm mờ poster */}
          {/* <div className="movie-detail-hero-overlay"></div> */}

          {/* Nội dung hero (poster + info bên phải)*/}
          <div className="movie-detail-hero-content">
            <div className="movie-detail-hero-poster-wrapper">
              <img
                alt={`${movie.title} Poster`}
                className="movie-detail-poster"
                src={movie.poster}
              />
            </div>
            <div className="movie-detail-hero-info">
              <h1 className="movie-detail-title">{movie.title}</h1>
              <p className="movie-detail-short-description">
                {movie.description}
              </p>
              {/* loại: đánh giá (sao), đọ tuổi, thời gian xem  */}
              <div className="movie-detail-meta">
                <div className="movie-detail-meta-item movie-detail-meta-rating">
                  <span className="movie-detail-meta-icon material-symbols-outlined">star</span>
                  <span className="movie-detail-meta-">
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
                { /* độ tuổi đánh giá */ }
                <div className="movie-detail-meta-item movie movie-detail-meta-age">
                  <span className="movie-detail-age-badge">{movie.ageRating}</span>
                </div>
                { /* thời lượng phim */ }
                <div className="movie-detail-meta-item">
                  <span className="movie-detail-meta-label">
                    {movie.duration} phút
                  </span>
                </div>
              </div>
              {/* Các thể loại phim */}
              <ul className="movie-detail-genres">
                {movie.genre.map((x) => (
                  <li key={x} className="movie-detail-genre-tag">{x}</li>
                ))}
              </ul>
              {/* Các nút */}
              <div className="movie-detail-actions">
              <a
                href={movie.trailer}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary movie-detail-btn-trailer"
              >
                <PlayCircleOutline className="material-symbols-outlined movie-detail-btn-icon" />
                <span className="movie-detail-btn-text">Xem Trailer</span>
              </a>

              <button className="btn btn-secondary movie-detail-btn-booking">
                <ConfirmationNumber className="material-symbols-outlined movie-detail-btn-icon">
                </ConfirmationNumber>
                <span className="movie-detail-btn-text">Đặt Vé Ngay</span>
              </button>
              </div>
            </div>
          </div>
      </section>
      {/* Mô tả chi tiết */}
            <section className="movie-detail-body">
        <div className="movie-detail-layout">
          {/* ===== 2.1 CỘT TRÁI: THÔNG TIN, LỊCH CHIẾU, REVIEW ===== */}
          <div className="movie-detail-main-column">
            {/* 2.1.1 Thông tin phim */}
            <section className="movie-detail-section movie-detail-info-section">
              <h2 className="movie-detail-section-title">Thông Tin Phim</h2>

              {/* Thông tin cơ bản: ngày chiếu, đạo diễn, thời lượng, rating, ngôn ngữ, phân loại */}
              <div className="movie-detail-info-grid">
                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    calendar_today
                  </span>
                  <span className="movie-detail-info-text">
                    Khởi chiếu:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.releaseDate}
                    </span>
                  </span>
                </div>

                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    person
                  </span>
                  <span className="movie-detail-info-text">
                    Đạo diễn:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.director}
                    </span>
                  </span>
                </div>

                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    schedule
                  </span>
                  <span className="movie-detail-info-text">
                    Thời lượng:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.duration} phút
                    </span>
                  </span>
                </div>

                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    star_half
                  </span>
                  <span className="movie-detail-info-text">
                    Đánh giá:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.rating}/5
                    </span>
                  </span>
                </div>

                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    translate
                  </span>
                  <span className="movie-detail-info-text">
                    Ngôn ngữ:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.language}
                    </span>
                  </span>
                </div>

                <div className="movie-detail-info-item">
                  <span className="movie-detail-info-icon material-symbols-outlined">
                    badge
                  </span>
                  <span className="movie-detail-info-text">
                    Phân loại:{" "}
                    <span className="movie-detail-info-highlight">
                      {movie.ageRating}
                    </span>
                  </span>
                </div>
              </div>

              {/* Diễn viên */}
              <div className="movie-detail-cast">
                <h3 className="movie-detail-subtitle">Diễn viên</h3>
                <ul className="movie-detail-cast-list">
                  {movie.cast.map((actor) => (
                    <li key={actor} className="movie-detail-cast-item">
                      {actor}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nội dung phim */}
              <div className="movie-detail-description">
                <h3 className="movie-detail-subtitle">Nội Dung Phim</h3>
                <p className="movie-detail-full-description">
                  {movie.fullDescription}
                </p>
              </div>
            </section>

            {/* 2.1.2 Lịch chiếu */}
            <section className="movie-detail-section movie-detail-showtimes-section">
              <h2 className="movie-detail-section-title">Lịch Chiếu</h2>

              {/* Chọn ngày */}
              <div className="movie-detail-showtimes-date">
                <h3 className="movie-detail-subtitle">Chọn ngày</h3>
                <div className="movie-detail-date-list">
                  {[
                    { label: "T2", day: "15" },
                    { label: "T3", day: "16" },
                    { label: "T4", day: "17" },
                    { label: "T5", day: "18" },
                    { label: "T6", day: "19" },
                    { label: "T7", day: "20" },
                    { label: "CN", day: "21" },
                  ].map((d, index) => (
                    <button
                      key={d.label + d.day}
                      className={
                        "movie-detail-date-item" +
                        (index === 0 ? " movie-detail-date-item--active" : "")
                      }
                    >
                      <span className="movie-detail-date-label">
                        {d.label}
                      </span>
                      <span className="movie-detail-date-day">{d.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh sách rạp + giờ chiếu */}
              <div className="movie-detail-cinema-list">
                <div className="movie-detail-cinema-card">
                  <h4 className="movie-detail-cinema-name">
                    CGV Vincom Center
                  </h4>
                  <p className="movie-detail-cinema-address">
                    191 Bà Triệu, Hai Bà Trưng, Hà Nội
                  </p>
                  <div className="movie-detail-time-list">
                    {["10:00", "13:30", "16:45", "19:00", "21:30"].map(
                      (time) => (
                        <button
                          key={time}
                          className="movie-detail-time-item"
                        >
                          {time}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="movie-detail-cinema-card">
                  <h4 className="movie-detail-cinema-name">
                    Lotte Cinema Landmark
                  </h4>
                  <p className="movie-detail-cinema-address">
                    5B Nguyễn Du, Hai Bà Trưng, Hà Nội
                  </p>
                  <div className="movie-detail-time-list">
                    {["11:15", "14:00", "17:15", "20:30"].map((time) => (
                      <button
                        key={time}
                        className="movie-detail-time-item"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2.1.3 Đánh giá */}
            <section className="movie-detail-section movie-detail-reviews-section">
              <h2 className="movie-detail-section-title">Đánh Giá</h2>

              <div className="movie-detail-reviews-list">
                {movie.reviews.map((review) => {
                  const initial = review.user.charAt(0).toUpperCase();

                  return (
                    <div
                      className="movie-detail-review-item"
                      key={review.user + review.date}
                    >
                      <div className="movie-detail-review-avatar">
                        {initial}
                      </div>

                      <div className="movie-detail-review-content">
                        <div className="movie-detail-review-header">
                          <div className="movie-detail-review-user">
                            <p className="movie-detail-review-name">
                              {review.user}
                            </p>
                            <div className="movie-detail-review-stars">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const filled = index < review.rating;
                                return (
                                  <span
                                    key={index}
                                    className={
                                      "movie-detail-review-star material-symbols-outlined" +
                                      (filled
                                        ? " movie-detail-review-star--filled"
                                        : "")
                                    }
                                  >
                                    star
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <p className="movie-detail-review-date">
                            {review.date}
                          </p>
                        </div>

                        <p className="movie-detail-review-comment">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
