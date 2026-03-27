"use client";

import { Post } from "@/types/data/post/post";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const urlRegex = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#ff5a5c] underline underline-offset-4 transition hover:text-[#ff7b7d]"
        >
          {part}
        </a>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
}

function renderContent(content?: string) {
  if (!content) return null;

  return content
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block, index) => (
      <p
        key={`paragraph-${index}`}
        className="text-[16px] leading-8 text-[#d4d4d8]"
      >
        {renderTextWithLinks(block.trim())}
      </p>
    ));
}

export default function NewsInfo() {
  const param = useParams();
  const id = Number(param.id);
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const { data, isLoading } = useQuery(Post.getPostsInfo(id));
  const post = data?.data?.at(0);

  const publishedDate = useMemo(() => {
    if (!post?.publishedAt) return "";
    return new Date(post.publishedAt).toLocaleString("vi-VN");
  }, [post?.publishedAt]);

  const coverImage = post?.coverUrl
    ? `${urlImage}${post.coverUrl}`
    : "";

  const currentPath =
    typeof window !== "undefined" ? window.location.href : "";

  if (isLoading) {
    return (
      <main className={`${plusJakartaSans.className} min-h-screen bg-[#121212]`}>
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-40 rounded bg-[#232327]" />
            <div className="h-12 w-3/4 rounded bg-[#232327]" />
            <div className="h-5 w-52 rounded bg-[#232327]" />
            <div className="h-[360px] rounded-[28px] bg-[#1a1a1d]" />
            <div className="space-y-4 rounded-[28px] border border-[#2a2a2f] bg-[#1a1a1d] p-6">
              <div className="h-5 w-full rounded bg-[#232327]" />
              <div className="h-5 w-full rounded bg-[#232327]" />
              <div className="h-5 w-4/5 rounded bg-[#232327]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${plusJakartaSans.className} min-h-screen bg-[#121212]`}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <a
            href="/news"
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2f] bg-[#1a1a1d] px-4 py-2 text-sm font-bold text-[#d4d4d8] transition hover:border-[#3a3a42] hover:bg-[#202024] hover:text-white"
          >
            <ArrowBackRoundedIcon fontSize="small" />
            Quay lại tin tức
          </a>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-[#2a2a2f] bg-[#1a1a1d] shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <div className="relative h-[280px] w-full md:h-[360px] lg:h-[440px]">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: coverImage
                  ? `url(${coverImage})`
                  : "linear-gradient(135deg, #1b1b1f, #2a2a2f)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#2b1516]/95 px-4 py-2 text-sm font-bold text-[#ff5a5c]">
                <LocalOfferRoundedIcon fontSize="small" />
                {post?.category || "Tin tức"}
              </div>

              <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white md:text-4xl lg:text-5xl">
                {post?.title || "Chi tiết bài viết"}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-[#d4d4d8]">
                <div className="flex items-center gap-2">
                  <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
                  <span>{publishedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <LinkRoundedIcon sx={{ fontSize: 18 }} />
                  <span>{post?.category || "Bài viết ưu đãi"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="rounded-[28px] border border-[#2a2a2f] bg-[#1a1a1d] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.22)] md:p-8">
            <div className="mb-6 border-b border-[#2a2a2f] pb-5">
              <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-white">
                Nội dung chi tiết
              </h2>
              <p className="mt-2 text-sm font-medium text-[#a1a1aa]">
                Thông tin ưu đãi, voucher hoặc tin tức liên quan được cập nhật đầy đủ bên dưới.
              </p>
            </div>

            <div className="space-y-5">
              {renderContent(post?.content)}
            </div>
          </article>

          <aside className="h-fit rounded-[28px] border border-[#2a2a2f] bg-[#1a1a1d] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.22)]">
            <h3 className="text-lg font-extrabold text-white">
              Thông tin bài viết
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[#2a2a2f] bg-[#18181b] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#71717a]">
                  Danh mục
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {post?.category || "Tin tức"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#2a2a2f] bg-[#18181b] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#71717a]">
                  Thời gian đăng
                </p>
                <p className="mt-2 text-sm font-bold text-white">
                  {publishedDate || "Đang cập nhật"}
                </p>
              </div>

              {currentPath && (
                <div className="rounded-2xl border border-[#2a2a2f] bg-[#18181b] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#71717a]">
                    Liên kết bài viết
                  </p>
                  <a
                    href={currentPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-sm font-bold text-[#ff5a5c] underline underline-offset-4 hover:text-[#ff7b7d]"
                  >
                    {currentPath}
                  </a>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}