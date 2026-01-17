"use client";

import { useEffect, useMemo, useState } from "react";
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
import { IPost, Post } from "@/types/data/post/post";
import { set } from "react-hook-form";

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState("");
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
  const firstId = 1;
  const data2 = useQuery(Post.getPostsInfo(firstId));
  var first;
  if (data2 != null && data2?.data != undefined) {
    first = data2?.data;
  }
  const firstDate = new Date(first?.publishedAt).toLocaleDateString();
  const posts = data?.data ?? [];
  const [sortKey, setSortKey] = useState<'newest' | 'oldest'>('newest');
  const filteredNews = posts.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const searchPosts = useMemo(() => {
    if (!posts.length) return [];
    if (searchTerm === "") return posts;
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);
  const sortedPosts = useMemo(() => {
    if (!searchPosts.length) return [];

    const sorted = [...searchPosts];

    return sortKey === 'newest'
      ? sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      : sorted.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() -
          new Date(b.publishedAt).getTime()
      );
  }, [searchPosts, sortKey]);
  const paginate = [];
  paginate.push(
    <ul key={"paging"} className="flex -space-x-px items-center gap-2 px-8 py-3 rounded-lg text-white font-bold hover:bg-primary hover:border-primary transition-all duration-300 group shadow-lg">
      {data?.meta?.page > data?.meta?.totalPages && <li>
        <a href="#" className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium rounded-s-base text-sm px-3 h-9 focus:outline-none">Previous</a>
      </li>}
      <li>
        <a href={`/news/${data?.meta?.page}`} className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">{data?.meta?.page}</a>
      </li>
      {data?.meta?.page + 1 <= data?.meta?.totalPages && <li>
        <a href={`/news/${data?.meta?.page + 1}`} className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">{data?.meta?.page + 1}</a>
      </li>}
      {data?.meta?.page + 2 <= data?.meta?.totalPages && <li>
        <a href={`/news/${data?.meta?.page + 2}`} className="flex items-center justify-center text-fg-brand bg-neutral-tertiary-medium box-border border border-default-medium hover:text-fg-brand font-medium text-sm w-9 h-9 focus:outline-none">{data?.meta?.page + 2}</a>
      </li>}
      {data?.meta?.page + 3 <= data?.meta?.totalPages && <li>
        <a href={`/news/${data?.meta?.page + 3}`} className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">{data?.meta?.page + 3}</a>
      </li>}
      {data?.meta?.page + 4 <= data?.meta?.totalPages && <li>
        <a href={`/news/${data?.meta?.page + 4}`} className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">{data?.meta?.page + 4}</a>
      </li>}
      {data?.meta?.page + 5 < data?.meta?.totalPages && <li>
        <a href="#" className="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium rounded-e-base text-sm px-3 h-9 focus:outline-none">Next</a>
      </li>}
    </ul>
  );
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
                      `url(${first?.coverUrl})`,
                  }}
                ></div>
                {/* Badge for mobile */}
                <span className="absolute top-4 left-4 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {first?.category}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-12 gap-6 relative">
                <div className="flex flex-col gap-4">
                  <span className="hidden lg:inline-block w-fit bg-red-900 outline text-red-600 outline-solid outline-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {first?.category}
                  </span>
                  <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {first?.title}
                  </h1>
                  <p className="text-gray-400 text-lg font-normal leading-relaxed line-clamp-3">
                    {first?.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <span>{firstDate}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-text-gray-500" />
                </div>
                <div className="mt-2">
                  <a href={`/news/${firstId}`} className="inline-flex items-center gap-2 text-red-700 font-bold hover:text-white hover:bg-primary px-5 py-2.5 rounded-lg border border-primary transition-all duration-300">
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
                    onChange={e => setSearchTerm(e.target.value)}
                    type="text"
                  />
                </div>
                {/* Sort Field */}
                <div className="relative w-full sm:w-48 ">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white">
                    <span className="material-symbols-outlined text-[20px]">
                    </span>
                  </div>
                  <select
                    onChange={
                      e => setSortKey(e.target.value as 'newest' | 'oldest')
                    }
                    className="block w-full bg-[#261c1c] rounded-lg border py-2.5 pl-10 pr-8 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer appearance-none transition-colors">
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sortedPosts.map(post => {
              return <article key={post?.id} style={{ borderColor: "#261c1c" }} className="group flex flex-col h-full bg-[#261c1c] rounded-xl border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1 cursor-pointer">
                <a href={`/news/${post?.id}`} className="relative h-56 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-white/10">
                    {post?.category}
                  </div>
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    data-alt="Popcorn buckets and movie tickets on a red background"
                    style={{
                      backgroundImage: `url(${post?.coverUrl})`,
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-60" />
                </a>
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {post?.title}
                  </h3>
                  <p style={{ color: "#9c8486" }} className="text-text-muted text-sm line-clamp-2 leading-relaxed mb-auto">
                    des
                  </p>
                  <div style={{ color: "#9c8486" }} className="flex items-center justify-between pt-4 border-t border-border-dark mt-2">
                    <span className="text-xs text-text-muted font-medium">
                      {post?.publishedAt}
                    </span>
                    <a href={`/news/${post?.id}`} className="text-xs font-bold text-red-500 flex items-center gap-1 group/btn">
                      Info
                    </a>
                  </div>
                </div>
              </article>
            })}
          </section>
          {/* Pagination */}

          <div className="flex justify-center pt-8 pb-12">
            {paginate}
          </div>
        </main>
      </>

    </>
  );
}

