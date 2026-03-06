"use client";

import IRevenue, { Revenue } from "@/types/data/revenue/revenue";
import {
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import Chart from "chart.js/auto";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import PaymentsIcon from '@mui/icons-material/Payments';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const revenueByDate = useQuery(Revenue.getRevenueByDate(today));
  const rev: IRevenue[] = revenueByDate?.data ?? [];
  const todayRevenue = rev.length > 0 ? rev[0].revenue : 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const data = revenueByDate?.data?.data;
  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            data: data || [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: '#ec131e'
          }
        ]
      }
    });

    return () => {
      chart.destroy();
    };
  }, [revenueByDate]);
  const stats = [
    {
      title: "Tổng doanh thu hôm nay",
      value: todayRevenue,
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
  const topMovies = [
    { title: "Avengers: Secret Wars", revenue: 12500000, tickets: 125 },
    { title: "The Last Kingdom", revenue: 8900000, tickets: 89 },
    { title: "Space Odyssey 2024", revenue: 6700000, tickets: 67 },
  ];
  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <div className="flex w-full">
      {/* Main Content */}
      <main className="flex flex-1 flex-col bg-background-dark">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-background-dark/80 px-8 py-4 backdrop-blur-md">
          <div className="flex w-full max-w-md items-center rounded-lg bg-surface-dark px-4 py-2 ring-1 ring-surface-border focus-within:ring-primary/50 transition-all">
            <span className="material-symbols-outlined text-gray-400">
              search
            </span>
            <input
              className="ml-3 w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none focus:outline-none border-none focus:ring-0 p-0"
              placeholder="Tìm kiếm phim, đơn hàng, khách hàng..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-gray-400 hover:bg-surface-border hover:text-white transition-colors">
              <NotificationsIcon></NotificationsIcon>
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium hover:bg-surface-border transition-colors">
              <CalendarTodayIcon></CalendarTodayIcon>
              <span>24/05/2024</span>
            </button>
          </div>
        </header>
        <div className="p-8 pb-20">
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Tổng Quan
              </h2>
              <p className="mt-1 text-gray-400">
                Chào mừng trở lại! Đây là tình hình rạp hôm nay.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-surface-dark px-4 py-2 text-sm font-medium text-gray-300 hover:bg-surface-border transition-colors">
                <DownloadIcon></DownloadIcon>
                Xuất báo cáo
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/20 hover:bg-red-400 transition-colors">
                <AddIcon></AddIcon>
                Tạo suất chiếu mới
              </button>
            </div>
          </div>
          {/* Stats Cards */}
          <Grid container spacing={3} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <div className="group relative overflow-hidden rounded-xl border p-6 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        {stat.title}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">
                        {stat.value}
                      </h3>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <PaymentsIcon></PaymentsIcon>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex items-center text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <TrendingUpIcon></TrendingUpIcon>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">so với hôm qua</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Grid>
            ))}
          </Grid>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Chart Section */}
            <div className="rounded-xl border border-surface-border bg-surface-dark p-6 lg:col-span-2">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold">
                  Biểu đồ doanh thu
                </h3>
                <div className="flex rounded-lg bg-surface-darker p-1 border border-surface-border">
                  <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium shadow-sm transition-all">
                    Theo tuần
                  </button>
                  <button className="rounded-md px-3 py-1 text-xs font-medium text-gray-400 hover:text-white transition-all">
                    Theo tháng
                  </button>
                </div>
              </div>
              <div className="relative h-64 w-full">
                <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end justify-between gap-2 px-2">
                  <canvas ref={canvasRef}></canvas>
                </div>
              </div>
            </div>
            {/* Top Movies */}
            <div className="rounded-xl border border-surface-border bg-surface-dark p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold">Top Phim</h3>
                <a
                  className="text-xs font-medium hover:text-primary/80"
                  href="#"
                >
                  Xem tất cả
                </a>
              </div>
              <Grid item xs={12} md={4}>
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {topMovies.map((movie, index) => (
                        <div key={index}>
                          <div className="flex items-center gap-3">
                            <div
                              className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                              data-alt="Poster for movie Mai"
                              style={{
                                backgroundImage:
                                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA9v2YNA68MrDWzC8Or22Xz3IGxAEOVpiF5_FEXgdawxRod4cqOhRJeyhM0Gs86viBIiGnbZXtpCTMAlm-Avi_nZOlaj2rOtAgFs7j2Rt3vitKZe9q1FKG9qJ6_7YkJpD7sWqOGYaQAc-Pb4BMu2_cUqcpnxrq6PkiltNUFWbwlvNQMAwdeYqxSPt5N579IA13BdzYS7x4dVXc5Mq1Qmh3VQqQO_SuRUO86l6_w6F8Qe3frSLXzBiTfs6tyMcc8j5oU9K9svjoQxByf")',
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                              }}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <Typography variant="subtitle2" className="font-semibold">
                                  {index + 1}. {movie.title}
                                </Typography>
                                <Typography variant="subtitle2" className="font-semibold text-teal-600">
                                  {formatPrice(movie.revenue)} đ
                                </Typography>
                              </div>
                              <div className="mt-2 h-1.5 w-full rounded-full bg-surface-darker">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{ width: "90%" }}
                                />
                              </div>
                            </div>
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
              <div className="flex flex-col gap-5">
              </div>
            </div>
          </div>
          {/* Recent Activity / Orders Table */}
          <div className="mt-6 rounded-xl border border-surface-border bg-surface-dark">
            <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
              <h3 className="text-lg font-bold text-white">Hoạt động gần đây</h3>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">
                  filter_list
                </span>
                Lọc
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-surface-darker text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Phim
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Chi tiết
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 font-medium" scope="col">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  <tr className="group hover:bg-surface-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                          A
                        </div>
                        <span className="font-medium text-white">
                          Nguyễn Văn A
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">Dune: Part Two</td>
                    <td className="px-6 py-4">2 vé • Ghế G12, G13</td>
                    <td className="px-6 py-4">2 phút trước</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                        Thành công
                      </span>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                          L
                        </div>
                        <span className="font-medium text-white">Lê Thị B</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">Mai</td>
                    <td className="px-6 py-4">4 vé • Ghế F01-F04</td>
                    <td className="px-6 py-4">15 phút trước</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-500/20">
                        Thành công
                      </span>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                          T
                        </div>
                        <span className="font-medium text-white">Trần Văn C</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">Kung Fu Panda 4</td>
                    <td className="px-6 py-4">1 vé • Ghế H10</td>
                    <td className="px-6 py-4">32 phút trước</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500 ring-1 ring-inset ring-yellow-500/20">
                        Chờ thanh toán
                      </span>
                    </td>
                  </tr>
                  <tr className="group hover:bg-surface-darker/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-xs">
                          H
                        </div>
                        <span className="font-medium text-white">
                          Hoàng Văn D
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">Mai</td>
                    <td className="px-6 py-4">2 vé • Ghế K05, K06</td>
                    <td className="px-6 py-4">1 giờ trước</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                        Hủy
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
              <span className="text-xs text-gray-500">
                Hiển thị 4 trên 128 đơn hàng
              </span>
              <div className="flex gap-2">
                <button className="flex items-center justify-center rounded bg-surface-darker px-3 py-1 text-xs font-medium text-gray-400 hover:text-white border border-surface-border hover:border-gray-500 transition-all">
                  Trước
                </button>
                <button className="flex items-center justify-center rounded bg-surface-darker px-3 py-1 text-xs font-medium text-gray-400 hover:text-white border border-surface-border hover:border-gray-500 transition-all">
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

