"use client";

import { useParams } from "next/navigation";
import { Box, Card, CardContent, Typography, Chip, Divider } from "@mui/material";
import Image from "next/image";
import NewsInfo from "@/app/component/news/NewsInfo";

export default function NewsDetailPage() {
  const params = useParams();


  // Sample data - replace with API call
  const news = {
    id: params.id,
    title: "Khuyến mãi cuối tuần - Giảm 20% tất cả vé",
    category: "Khuyến mãi",
    content: `
      <p>Chương trình khuyến mãi đặc biệt cuối tuần với ưu đãi giảm 20% cho tất cả các suất chiếu từ thứ 6 đến chủ nhật.</p>
      <p>Áp dụng cho tất cả các phim đang chiếu tại tất cả các rạp CineMax trên toàn quốc.</p>
      <p><strong>Thời gian áp dụng:</strong> Từ ngày 20/01/2024 đến 31/01/2024</p>
      <p><strong>Điều kiện:</strong></p>
      <ul>
        <li>Áp dụng cho đặt vé online và tại quầy</li>
        <li>Không áp dụng với các mã giảm giá khác</li>
        <li>Áp dụng cho tất cả các loại ghế</li>
      </ul>
      <p>Nhanh tay đặt vé ngay hôm nay để không bỏ lỡ cơ hội!</p>
    `,
    image: "/logo/logo.png",
    date: "2024-01-20",
    author: "Admin",
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      "Khuyến mãi": "bg-red-500",
      "Tin tức": "bg-blue-500",
      "Review": "bg-purple-500",
    };
    return colorMap[category] || "bg-gray-500";
  };

  return (
    <>
      <NewsInfo />
    </>
  );
}

