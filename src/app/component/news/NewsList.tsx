"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Grid,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with API call
  const news = [
    {
      id: 1,
      title: "Khuyến mãi cuối tuần - Giảm 20% tất cả vé",
      category: "Khuyến mãi",
      description: "Áp dụng cho tất cả các suất chiếu vào cuối tuần. Chương trình có hạn, nhanh tay đặt vé ngay!",
      image: "/logo/logo.png",
      date: "2024-01-20",
      featured: true,
    },
    {
      id: 2,
      title: "Phim mới: Avengers: Secret Wars ra mắt",
      category: "Tin tức",
      description: "Phim bom tấn Avengers: Secret Wars chính thức ra mắt tại các rạp CineMax. Đừng bỏ lỡ!",
      image: "/logo/logo.png",
      date: "2024-01-18",
      featured: false,
    },
    {
      id: 3,
      title: "Review: The Last Kingdom - Tác phẩm điện ảnh xuất sắc",
      category: "Review",
      description: "Đánh giá chi tiết về bộ phim The Last Kingdom với những điểm nhấn đặc biệt và diễn xuất ấn tượng.",
      image: "/logo/logo.png",
      date: "2024-01-15",
      featured: false,
    },
    {
      id: 4,
      title: "Combo gia đình - Ưu đãi đặc biệt tháng 1",
      category: "Khuyến mãi",
      description: "Mua combo gia đình với giá ưu đãi đặc biệt. Áp dụng cho khách hàng đặt vé online.",
      image: "/logo/logo.png",
      date: "2024-01-10",
      featured: false,
    },
  ];

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colorMap = {
      "Khuyến mãi": "bg-red-500",
      "Tin tức": "bg-blue-500",
      "Review": "bg-purple-500",
    };
    return colorMap[category] || "bg-gray-500";
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="font-bold mb-6 text-gray-900">
        Tin tức & Khuyến mãi
      </Typography>

      <div className="mb-6">
        <TextField
          fullWidth
          placeholder="Tìm kiếm tin tức..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <i className="ti ti-search text-gray-400"></i>
              </InputAdornment>
            ),
          }}
        />
      </div>

      <Grid container spacing={4}>
        {filteredNews.map((item) => (
          <Grid item xs={12} md={item.featured ? 12 : 6} lg={item.featured ? 12 : 4} key={item.id}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="relative">
                <CardMedia
                  component="img"
                  height={item.featured ? 400 : 250}
                  image={item.image}
                  alt={item.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Chip
                    label={item.category}
                    size="small"
                    className={`${getCategoryColor(item.category)} text-white font-semibold`}
                  />
                </div>
                {item.featured && (
                  <div className="absolute top-4 right-4">
                    <Chip
                      label="Nổi bật"
                      size="small"
                      className="bg-yellow-500 text-white font-semibold"
                    />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <i className="ti ti-calendar"></i>
                  <span>{item.date}</span>
                </div>
                <Typography variant="h6" className="font-bold mb-2 line-clamp-2">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </Typography>
                <Link href={`/news/${item.id}`}>
                  <Button
                    variant="outlined"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50"
                    endIcon={<i className="ti ti-arrow-right"></i>}
                  >
                    Đọc thêm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <i className="ti ti-news-off text-6xl text-gray-400 mb-4"></i>
          <Typography variant="h6" className="text-gray-600 mb-2">
            Không tìm thấy tin tức nào
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Thử tìm kiếm với từ khóa khác
          </Typography>
        </div>
      )}
    </Box>
  );
}

