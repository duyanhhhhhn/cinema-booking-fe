"use client";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

export default function Dashboard() {
  const stats = [
    {
      title: "Tổng doanh thu hôm nay",
      value: "25,450,000",
      currency: "đ",
      icon: "ti ti-currency-dollar",
      color: "bg-teal-500",
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Vé đã bán hôm nay",
      value: "342",
      currency: "vé",
      icon: "ti ti-ticket",
      color: "bg-blue-500",
      change: "+8.2%",
      trend: "up",
    },
    {
      title: "Suất chiếu hôm nay",
      value: "28",
      currency: "suất",
      icon: "ti ti-clock",
      color: "bg-purple-500",
      change: "+5",
      trend: "up",
    },
    {
      title: "Người dùng mới",
      value: "127",
      currency: "người",
      icon: "ti ti-users",
      color: "bg-green-500",
      change: "+15.3%",
      trend: "up",
    },
  ];

  const recentTickets = [
    { id: "BK001234", movie: "Avengers", customer: "Nguyễn Văn A", amount: 359000, time: "10:30" },
    { id: "BK001235", movie: "The Last Kingdom", customer: "Trần Thị B", amount: 240000, time: "11:15" },
    { id: "BK001236", movie: "Space Odyssey", customer: "Lê Văn C", amount: 169000, time: "12:00" },
  ];

  const topMovies = [
    { title: "Avengers: Secret Wars", revenue: 12500000, tickets: 125 },
    { title: "The Last Kingdom", revenue: 8900000, tickets: 89 },
    { title: "Space Odyssey 2024", revenue: 6700000, tickets: 67 },
  ];

  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <Box>
      <Typography variant="h4" className="font-bold mb-6 text-gray-900">
        Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} className="mb-6">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <i className={`${stat.icon} text-white text-2xl`}></i>
                  </div>
                  <div className={`text-sm font-semibold ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <Typography variant="h4" className="font-bold mb-1">
                  {formatPrice(stat.value)}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Tickets */}
        <Grid item xs={12} md={8}>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h6" className="font-bold">
                  Vé bán gần đây
                </Typography>
                <Button size="small" className="text-teal-600">
                  Xem tất cả
                </Button>
              </div>
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <Typography variant="subtitle2" className="font-semibold">
                        {ticket.id}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {ticket.movie} - {ticket.customer}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="subtitle2" className="font-semibold text-teal-600">
                        {formatPrice(ticket.amount)} đ
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {ticket.time}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Movies */}
        <Grid item xs={12} md={4}>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Top phim doanh thu
              </Typography>
              <div className="space-y-4">
                {topMovies.map((movie, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <Typography variant="subtitle2" className="font-semibold">
                        {index + 1}. {movie.title}
                      </Typography>
                      <Typography variant="subtitle2" className="font-semibold text-teal-600">
                        {formatPrice(movie.revenue)} đ
                      </Typography>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${(movie.revenue / topMovies[0].revenue) * 100}%` }}
                      ></div>
                    </div>
                    <Typography variant="caption" className="text-gray-600">
                      {movie.tickets} vé đã bán
                    </Typography>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} className="mt-6">
        <Grid item xs={12} md={6}>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Doanh thu 7 ngày qua
              </Typography>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <Typography variant="body2" className="text-gray-500">
                  Biểu đồ sẽ được hiển thị ở đây (Chart.js/Recharts)
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Phân bổ doanh thu theo chi nhánh
              </Typography>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <Typography variant="body2" className="text-gray-500">
                  Biểu đồ sẽ được hiển thị ở đây (Pie Chart)
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

