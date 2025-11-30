"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Grid, TextField, InputAdornment } from "@mui/material";
import MovieCard from "./MovieCard";

export default function MovieList() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with API call
  const allMovies = [
    {
      id: 1,
      title: "Avengers: Secret Wars",
      description: "Cuộc chiến cuối cùng của vũ trụ Marvel với những siêu anh hùng yêu thích",
      poster: "/logo/logo.png",
      rating: 4.8,
      duration: 180,
      format: "IMAX",
      isShowing: true,
      comingSoon: false,
    },
    {
      id: 2,
      title: "The Last Kingdom",
      description: "Hành trình của những chiến binh huyền thoại trong thế giới trung cổ",
      poster: "/logo/logo.png",
      rating: 4.5,
      duration: 150,
      format: "2D",
      isShowing: true,
      comingSoon: false,
    },
    {
      id: 3,
      title: "Space Odyssey 2024",
      description: "Cuộc phiêu lưu vào không gian sâu thẳm với công nghệ tương lai",
      poster: "/logo/logo.png",
      rating: 4.7,
      duration: 165,
      format: "3D",
      isShowing: false,
      comingSoon: true,
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredMovies = allMovies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (tabValue === 0) return matchesSearch && movie.isShowing;
    if (tabValue === 1) return matchesSearch && movie.comingSoon;
    return matchesSearch;
  });

  return (
    <Box className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">Phim</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <TextField
            fullWidth
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ti ti-search text-gray-400"></i>
                </InputAdornment>
              ),
            }}
            className="flex-1"
          />
        </div>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          className="mb-6"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="Đang chiếu" />
          <Tab label="Sắp chiếu" />
          <Tab label="Tất cả" />
        </Tabs>
      </div>

      <Grid container spacing={4}>
        {filteredMovies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>

      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <i className="ti ti-movie-off text-6xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-lg">Không tìm thấy phim nào</p>
        </div>
      )}
    </Box>
  );
}

