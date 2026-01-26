import { useNotification } from "@/hooks/useNotification";
import { Banner, IBanner, useDeleteBannerMutation } from "@/types/data/home/banner";
import { Delete, Edit } from "@mui/icons-material";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useState } from "react";
import DeletePopup from "../../popup/DeletePopup";

interface BannerTableProps {
    banner: IBanner[];
}
export default function BannerTable({ banner }: BannerTableProps) {
    const n = useNotification();
    const [openDeletePopup, setOpenDeletePopup] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL + "/media/banner/";
    const { mutate: deleteBanner } = useDeleteBannerMutation();
    const handleClickIconDelete = (id: number) => {
        setSelectedId(id);
        setOpenDeletePopup(true);
    };
    const handleConfirmDelete = () => {
        if (selectedId) {
            deleteBanner(selectedId, {
                onSuccess: () => {
                    setOpenDeletePopup(false);
                    setSelectedId(null);
                    n.success('Xoá Banner thành công');
                },
                onError: (error) => {
                    n.error(error.message);
                },
            });
        }
    };
    return (
        <>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="banner table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Image
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Title
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Link Url
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Created Date
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", color: "#3f3f46" }}
                            >
                                Hành Động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {banner.map((item) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    "&:last-child td, &:last-child th": { border: 0 },
                                    "&:hover": { backgroundColor: "#fafafa" },
                                }}
                            >
                                <TableCell component="th" scope="row">
                                    <Box
                                        component="div"
                                        sx={{
                                            width: 48,
                                            height: 64,
                                            backgroundImage: `url(${urlImage}${item.imageUrl})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            borderRadius: 1,
                                            backgroundColor: "#e4e4e7",
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{item.title}</TableCell>
                                <TableCell>{item.linkUrl}</TableCell>
                                <TableCell>
                                    {dayjs(item.createdAt).format("DD/MM/YYYY")}
                                </TableCell>

                                <TableCell align="center">
                                    <Box display="flex" justifyContent="center" gap={1}>
                                        <Link href={`/admin/banners/${item.id}`}>
                                            <IconButton size="small" sx={{ color: "#52525b" }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Link>

                                        <IconButton
                                            onClick={() => handleClickIconDelete(item.id)}
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
            <DeletePopup
                open={openDeletePopup}
                onClose={() => setOpenDeletePopup(false)}
                onConfirm={handleConfirmDelete}
                description={"Bạn có chắc muốn xoá Banner này không?"}
            />
        </>
    )
}