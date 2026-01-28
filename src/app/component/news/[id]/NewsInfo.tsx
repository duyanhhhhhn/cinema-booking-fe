import { Post } from "@/types/data/post/post";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function NewsInfo() {
    const param = useParams();
    const id = Number(param.id)
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
    const data = useQuery(Post.getPostsInfo(id));
    const data2 = data?.data?.data;

    const date = new Date(data2 && data2?.at(0).publishedAt).toLocaleString();
    return (
        <>
            <div className="relative flex h-auto min-h-screen w-full flex-col">
                {/* Main Content */}
                <main className="container mx-auto px-4 py-8 md:py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2 pb-4">
                            <a
                                className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                href="#"
                            >
                                Trang chủ
                            </a>
                            <span className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                                /
                            </span>
                            <a
                                className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                href="#"
                            >
                                Tin tức
                            </a>
                            <span className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                                /
                            </span>
                            <span className="text-sm font-medium leading-normal text-gray-300 dark:text-gray-200">
                                {data2?.at(0) && data2?.at(0).category}
                            </span>
                        </div>

                        {/* HeadlineText */}
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white dark:text-white tracking-tight text-left pb-3 pt-6">
                            {data2?.at(0) && data2?.at(0).title}

                        </h1>
                        {/* MetaText */}
                        <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400 pb-6 pt-1">
                            Đăng bởi User vào {date}
                        </p>
                        {/* HeaderImage */}
                        <div
                            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end rounded-xl min-h-[400px] mb-8"
                            data-alt=""
                            style={{
                                backgroundImage:
                                    `url(${data2?.at(0) && urlImage + data2?.at(0).coverUrl})`,
                            }}
                        />
                        {/*Content Area */}
                        <div key={"content"} className="text-white">
                            {data2?.at(0) && data2?.at(0).content}
                        </div>
                        {/* Social Share Buttons */}
                        <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex items-center gap-4">
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                Chia sẻ bài viết:
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 dark:bg-gray-700 hover:bg-primary dark:hover:bg-primary text-gray-700 dark:text-gray-300 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9.19795 21.5H13.198V13.4901H16.1618L16.6711 9.4901H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H16.5V2.5H13.198C11.0768 2.5 9.19795 4.37893 9.19795 6.5V9.4901H7.19795V13.4901H9.19795V21.5Z" />
                                    </svg>
                                </a>
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined text-xl">link</span>
                                </a>
                            </div>
                        </div>
                        {/* Related Articles Section */}
                        {/* <div className="mt-12 pt-8 border-t border-black/10">
                            <h2 className="text-2xl font-bold text-white">
                                Bài viết liên quan
                            </h2>
                            <div key={"relate"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            </div>
                        </div> */}
                    </div>
                </main>
            </div>
        </>
    )
}