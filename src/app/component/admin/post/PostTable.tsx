"use client";

import { useNotification } from "@/hooks/useNotification";
import { IPost } from "@/types/data/post/post";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";

interface PostTableProp {
    post: IPost[],
    refetchPost: () => void
}

export default function PostTable({ post, refetchPost }: PostTableProp) {
    const n = useNotification();
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;

    return (
        <>
            <TableContainer component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="post table">
                    <TableHead sx={{ backgroundColor: "#f4f4f5" }}>
                        <TableRow sx={{ backgroundColor: "#f4f4f5" }}>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Title
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Slug
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                excerpt
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                content
                            </TableCell >
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Category
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Cover
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Published At
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Function
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody >
                        {post.map(item => (
                            <TableRow key={"row" + item.id}
                                sx={{
                                    "&:last-child td, &:last-child th": { border: 0 },
                                    "&:hover": { backgroundColor: "#fafafa" },
                                }}>
                                <TableCell>
                                    {item.title}
                                </TableCell>
                                <TableCell>
                                    {item.slug}
                                </TableCell>
                                <TableCell>
                                    {item.excerpt}
                                </TableCell>
                                <TableCell>
                                    {item.content}
                                </TableCell>
                                <TableCell>
                                    {item.category}
                                </TableCell>
                                <TableCell>
                                    <Box
                                        component="div"
                                        sx={{
                                            width: 48,
                                            height: 64,
                                            backgroundImage: `url(${urlImage}${item.coverUrl})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            borderRadius: 1,
                                            backgroundColor: "#e4e4e7",
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {item.published}
                                </TableCell>
                                <TableCell>
                                    {dayjs(item.publishedAt).format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" justifyContent="center" gap={1}>
                                        <Link href={`/admin/posts/${item.id}`}>
                                            <IconButton size="small" sx={{ color: "#52525b" }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Link>

                                        <IconButton
                                            size="small"
                                            color="error"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}