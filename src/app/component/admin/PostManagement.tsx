"use client"

import { Post } from "@/types/data/post/post"
import { useQuery } from "@tanstack/react-query"
import PostTable from "./post/PostTable";
import { useMemo, useState } from "react";
import AddPostModal from "./post/modal/AddPostModal";
import { Add, Search } from "@mui/icons-material";
import CustomPagination from "./table/CustomPagination";

export default function PostManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [openAddPostModal, setOpenAddPostModal] = useState(false);
    const { data, refetch: refetchPost } = useQuery(Post.getPosts());
    const posts = data?.data || [];
    const [sortKey, setSortKey] = useState<'newest' | 'oldest'>('newest');
    const searchPosts = useMemo(() => {
        if (!posts.length) return [];
        if (searchTerm === "") return posts;
        return posts.filter((post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category.toLowerCase().includes(searchTerm.toLowerCase())
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
    return (
        <div className=" w-full p-8 font-sans text-zinc-900">
            <div className=" flex flex-col gap-6">
                <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex min-w-72 flex-col gap-3">
                        <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-900">
                            Post Management
                        </h1>
                        <p className="text-zinc-600 text-base font-normal">
                            Add, Edit , Delete everything on the System.
                        </p>
                    </div>
                </div>
                {/* --- Toolbar & Filters (Giữ nguyên Tailwind cho layout linh hoạt) --- */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 max-w-lg">
                            <label className="flex flex-col min-w-40 h-12 w-full">
                                <div className="flex w-full flex-1 items-stretch rounded-lg h-full shadow-sm">
                                    <div className="text-zinc-500 flex bg-white items-center justify-center pl-4 rounded-l-lg border border-zinc-300 border-r-0">
                                        <Search fontSize="small" />
                                    </div>
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#ec131e] border border-zinc-300 border-l-0 bg-white h-full placeholder:text-zinc-500 px-4 pl-2 text-base font-normal"
                                        placeholder="Search Post By Title..."
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={() => setOpenAddPostModal(true)}
                            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-[#ec131e] text-white gap-2 text-sm font-bold tracking-wide min-w-0 px-5 hover:bg-[#ec131e]/90 transition-colors shadow-sm"
                        >
                            <Add fontSize="small" />
                            <span className="truncate">Add New Post</span>
                        </button>
                    </div>
                </div>
                {/* --- Main Content Area: Table & Pagination --- */}
                <div className="flex flex-col gap-4">
                    {/* Component Bảng */}
                    <PostTable
                        post={sortedPosts}
                        refetchPost={refetchPost}
                    />
                </div>
                <CustomPagination
                    itemsPerPage={data?.meta.perPage || 0}
                    totalItems={data?.meta.total || 0}
                />
                <AddPostModal
                    open={openAddPostModal}
                    onClose={() => setOpenAddPostModal(false)}
                    refetchPost={refetchPost}
                />
            </div>
        </div>
    )
}