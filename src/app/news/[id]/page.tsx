"use client";

import { useParams } from "next/navigation";
import { Box, Card, CardContent, Typography, Chip, Divider } from "@mui/material";
import Image from "next/image";

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
    <Box className="container mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <div className="relative h-96 w-full">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <Chip
              label={news.category}
              className={`${getCategoryColor(news.category)} text-white font-semibold`}
            />
          </div>
        </div>
        <CardContent className="p-8">
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <i className="ti ti-calendar"></i>
              <span>{news.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ti ti-user"></i>
              <span>{news.author}</span>
            </div>
          </div>

          <Typography variant="h3" className="font-bold mb-6 text-gray-900">
            {news.title}
          </Typography>

          <Divider className="my-6" />

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

