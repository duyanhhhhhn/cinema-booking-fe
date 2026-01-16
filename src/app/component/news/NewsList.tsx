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
  colors,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/data/post/post";

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with API call
  const news = [];

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
  const modelConfig = {
    path: '/news',
    modal: 'NewsList'
  }
  const { data, isLoading, error } = useQuery(Post.getPosts());
  const data2 = useQuery(Post.getPostsInfo(1));
  const posts = data?.data ?? [];
  console.log("Posts array:", posts);
  console.log("Single Post data:", data2?.data);
  const newsList = [];
  for (let i = 0; i < posts.length; i++) {
    newsList.push(
      <article key={i} style={{ borderColor: "#261c1c" }} className="group flex flex-col h-full bg-[#261c1c] rounded-xl border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 cursor-pointer">
        <div className="relative h-56 overflow-hidden">
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-white/10">
            {posts[i].category}
          </div>
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            data-alt="Popcorn buckets and movie tickets on a red background"
            style={{
              backgroundImage: `url(${posts[i].coverUrl})`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-60" />
        </div>
        <div className="flex flex-col flex-1 p-5 gap-3">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {posts[i].title}
          </h3>
          <p style={{ color: "#9c8486" }} className="text-text-muted text-sm line-clamp-2 leading-relaxed mb-auto">
            des
          </p>
          <div style={{ color: "#9c8486" }} className="flex items-center justify-between pt-4 border-t border-border-dark mt-2">
            <span className="text-xs text-text-muted font-medium">
              {posts[i].publishedAt}
            </span>
            <a href={`/news/${posts[i].id}`} className="text-xs font-bold text-red-500 flex items-center gap-1 group/btn">
              Info
            </a>
          </div>
        </div>
      </article>
    )
  }

  return (
    <>
      <>
        {/* Top Navigation */}
        <main className="bg-[#181111] flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col gap-10">
          {/* Hero Section: Featured Article */}
          <section className="bg-[#261c1c] relative w-full rounded-2xl overflow-hidden bg-surface-dark border border-border-dark group cursor-pointer shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative w-full aspect-video lg:aspect-auto lg:h-[450px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent lg:hidden z-10"></div>
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  data-alt="Cinematic shot of a desert landscape from a new movie"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMscBGmmVnlcVX2O3CBrXlFfSIUnKQzMFHgTNzQo_0cROn_LAdytJbgF-tjFN84BG9mohS1zV6rX-rJhoEk0v88HtAj4eCxMG7_cKK3X0P3SovX5yz1UcNLbNXdWFAYYKDWMNJQ87hmYOE-L4ERMgYierqem2RxC18WvAV8xa78HANV-vEccOGAzgyercHGQqWFUiStFJ2UD0ZDjwtPCpnsVRjITnYd9cEplEaFo6biXfmqkTTh9fqrzU_1CA-NwAZ98eDQhVg15V_")'
                  }}
                ></div>
                {/* Badge for mobile */}
                <span className="absolute top-4 left-4 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  cate
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-12 gap-6 relative">
                <div className="flex flex-col gap-4">
                  <span className="hidden lg:inline-block w-fit bg-red-900 outline text-red-600 outline-solid outline-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    cate
                  </span>
                  <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors">
                    Title
                  </h1>
                  <p className="text-gray-400 text-lg font-normal leading-relaxed line-clamp-3">
                    ex content
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <span>created date</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-text-gray-500" />
                </div>
                <div className="mt-2">
                  <a href="/news/1" className="inline-flex items-center gap-2 text-red-700 font-bold hover:text-white hover:bg-primary px-5 py-2.5 rounded-lg border border-primary transition-all duration-300">
                    <span>Đọc chi tiết</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
          {/* Filters & Tools */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-dark pb-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Tin tức mới nhất
                </h2>
                <p style={{ color: "#9c8486" }}>
                  Cập nhật tin tức điện ảnh, khuyến mãi và sự kiện nóng hổi.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search Field */}
                <div className="relative w-full sm:w-64 bg-[#261c1c]">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
                    </div>
                  </div>
                  <input
                    className="block w-full rounded-lg border border-border-dark py-2.5 pl-10 pr-3 text-sm text-white focus:ring-1 placeholder-text-muted transition-colors"
                    placeholder="Tìm bài viết..."
                    type="text"
                  />
                </div>
                {/* Sort Field */}
                <div className="relative w-full sm:w-48 ">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white">
                    <span className="material-symbols-outlined text-[20px]">
                    </span>
                  </div>
                  <select className="block w-full bg-[#261c1c] rounded-lg border py-2.5 pl-10 pr-8 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none transition-colors">
                    <option>Mới nhất</option>
                    <option>Cũ nhất</option>
                    <option>Xem nhiều nhất</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {newsList}
          </section>
          {/* Pagination */}
          <div className="flex justify-center pt-8 pb-12">
            <button className="flex items-center gap-2 px-8 py-3 rounded-lg border bg-[#261c1c] text-white font-bold hover:bg-primary hover:border-primary transition-all duration-300 group shadow-lg">
              Xem thêm nhiều tin cũ hơn
            </button>
          </div>
        </main>
      </>

    </>
  );
}

