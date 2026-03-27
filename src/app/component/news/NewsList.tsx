"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Post } from "@/types/data/post/post";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function NewsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"newest" | "oldest">("newest");
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const { searchQuery, updateQuery } = useRouteQuery();

  const currentPage = Number(searchQuery.get("page") || 1);
  const perPage = Number(searchQuery.get("perPage") || 6);

  const queryParam = useMemo(() => {
    return {
      page: currentPage,
      perPage,
    };
  }, [currentPage, perPage]);

  const { data } = useQuery({
    ...Post.objects.paginateQueryFactory(queryParam),
  });

  const firstId = 1;
  const featuredQuery = useQuery(Post.getPostsInfo(firstId));

  const featuredPost = featuredQuery?.data?.data?.at(0);
  const featuredDate = featuredPost?.publishedAt
    ? new Date(featuredPost.publishedAt).toLocaleDateString("vi-VN")
    : "";

  const posts = data?.data ?? [];

  const searchedPosts = useMemo(() => {
    if (!posts.length) return [];
    if (!searchTerm.trim()) return posts;

    return posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  const sortedPosts = useMemo(() => {
    const sorted = [...searchedPosts];

    return sortKey === "newest"
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
  }, [searchedPosts, sortKey]);

  const totalItems = data?.meta?.total || 0;
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / (data?.meta?.perPage || perPage || 6))
  );

  const createPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = createPageNumbers();

  const handlePageChange = (page: number) => {
    updateQuery({
      page: String(page),
      perPage: String(perPage),
    });
  };

  return (
    <main className={`${plusJakartaSans.className} min-h-screen bg-[#121212]`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-[#2a2a2f] bg-[#1a1a1d] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="relative min-h-[300px] lg:min-h-[440px]">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: featuredPost?.coverUrl
                    ? `url(${urlImage}${featuredPost.coverUrl})`
                    : "linear-gradient(135deg, #1b1b1f, #2a2a2f)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden" />
            </div>

            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#2b1516] px-4 py-2 text-sm font-bold text-[#ff5a5c]">
                <LocalOfferRoundedIcon fontSize="small" />
                {featuredPost?.category || "Ưu đãi nổi bật"}
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white md:text-4xl lg:text-5xl">
                {featuredPost?.title || "Tin tức và ưu đãi mới nhất từ rạp"}
              </h1>

              <p className="mt-4 text-[15px] leading-7 text-[#a1a1aa] md:text-base">
                {featuredPost?.excerpt ||
                  "Khám phá những ưu đãi hấp dẫn, chương trình giảm giá mới và các cập nhật điện ảnh nổi bật trong tuần."}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#a1a1aa]">
                <CalendarMonthRoundedIcon fontSize="small" />
                <span>{featuredDate}</span>
              </div>

              <div className="mt-7">
                <a
                  href={`/news/${firstId}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#ff2d2f] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(255,45,47,0.22)] transition hover:bg-[#ef1f21]"
                >
                  Đọc chi tiết
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[28px] border border-[#2a2a2f] bg-[#1a1a1d] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-white">
                Tin tức ưu đãi & giảm giá
              </h2>
              <p className="mt-2 text-sm font-medium text-[#a1a1aa] md:text-base">
                Cập nhật nhanh các chương trình khuyến mãi, combo và tin tức mới nhất.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:w-[300px]">
                <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                <input
                  className="h-12 w-full rounded-2xl border border-[#2a2a2f] bg-[#18181b] pl-10 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-[#71717a] focus:border-[#ff6b6d] focus:bg-[#1c1c20]"
                  placeholder="Tìm bài viết..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  value={searchTerm}
                />
              </div>

              <select
                onChange={(e) => setSortKey(e.target.value as "newest" | "oldest")}
                value={sortKey}
                className="h-12 min-w-[180px] rounded-2xl border border-[#2a2a2f] bg-[#18181b] px-4 text-sm font-bold text-white outline-none transition focus:border-[#ff6b6d] focus:bg-[#1c1c20]"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedPosts.map((post) => {
            const dateLabel = post?.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
              : "";

            return (
              <article
                key={post?.id}
                className="group overflow-hidden rounded-[28px] border border-[#2a2a2f] bg-[#1a1a1d] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(0,0,0,0.3)]"
              >
                <a href={`/news/${post?.id}`} className="block">
                  <div className="relative h-56 overflow-hidden bg-[#18181b]">
                    <div
                      className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: post?.coverUrl
                          ? `url(${urlImage}${post.coverUrl})`
                          : "linear-gradient(135deg, #1b1b1f, #2a2a2f)",
                      }}
                    />
                    <div className="absolute left-4 top-4 inline-flex rounded-full bg-[#151517]/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#ff5a5c] shadow-sm">
                      {post?.category}
                    </div>
                  </div>

                  <div className="flex flex-col p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#a1a1aa]">
                      <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
                      <span>{dateLabel}</span>
                    </div>

                    <h3 className="line-clamp-2 text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-white transition group-hover:text-[#ff5a5c]">
                      {post?.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#a1a1aa]">
                      {post?.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#2a2a2f] pt-4">
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#71717a]">
                        Tin ưu đãi
                      </span>
                      <span className="text-sm font-bold text-[#ff5a5c]">
                        Xem thêm
                      </span>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </section>

        {sortedPosts.length === 0 && (
          <section className="mt-8 rounded-[28px] border border-dashed border-[#2a2a2f] bg-[#1a1a1d] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2b1516] text-[#ff5a5c]">
              <LocalOfferRoundedIcon />
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Không tìm thấy bài viết phù hợp
            </h3>
            <p className="mt-2 text-sm font-medium text-[#a1a1aa]">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc sắp xếp.
            </p>
          </section>
        )}

        <section className="mt-10 pb-10">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-sm font-medium text-[#a1a1aa]">
              Hiển thị{" "}
              <span className="font-bold text-white">
                {totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1}-
                {Math.min(currentPage * perPage, totalItems)}
              </span>{" "}
              trên <span className="font-bold text-white">{totalItems}</span> bài viết
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a2f] bg-[#1a1a1d] text-[#ff5a5c] transition hover:bg-[#221314] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
              </button>

              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-10 min-w-[40px] items-center justify-center text-sm font-bold text-[#71717a]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(Number(page))}
                    className={`inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                      currentPage === page
                        ? "bg-[#ff2d2f] text-white shadow-[0_10px_24px_rgba(255,45,47,0.22)]"
                        : "border border-[#2a2a2f] bg-[#1a1a1d] text-[#d4d4d8] hover:bg-[#221314] hover:text-[#ff5a5c]"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a2f] bg-[#1a1a1d] text-[#ff5a5c] transition hover:bg-[#221314] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}