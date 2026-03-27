"use client";

import { ICombo, useDeleteComboMutation, useDeleteProductMutation } from "@/types/data/concession/combo";
import CustomPagination from "../table/CustomPagination";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState } from "react";
import EditComboModal from "./modal/EditConcessionModal";
import DeletePopup from "../user/DeletePopup";
import { useNotification } from "@/hooks/useNotification";

interface IConcessionTableProps {
    combo: ICombo[];
    refetchCombo: () => void;
}
export default function ConcessionTable({ combo, refetchCombo }: IConcessionTableProps) {
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
    const n = useNotification();
    const [openEditComboModal, setEditComboModal] = useState(false);
    const [openDeletePopup, setOpenDeletePopup] = useState(false);
    const [selectedCombo, setSelectedCombo] = useState<ICombo | null>(null);
    const { mutate: deleteCombo } = useDeleteComboMutation();
    const { mutate: deleteProduct } = useDeleteProductMutation();
    const handleClickIconDelete = (combo: ICombo) => {
        setSelectedCombo(combo);
        setOpenDeletePopup(true);
    };
    const handleConfirmDelete = () => {
        if (selectedCombo && selectedCombo.type === "COMBO") {
            deleteCombo(selectedCombo.id, {
                onSuccess: () => {
                    setOpenDeletePopup(false);
                    setSelectedCombo(null);
                    refetchCombo()
                    n.success('Xoá thành công');
                },
                onError: (error) => {
                    n.error(error.message);
                },
            });
        }
        else if (selectedCombo && selectedCombo.type === "SINGLE") {
            deleteProduct(selectedCombo.id, {
                onSuccess: () => {
                    setOpenDeletePopup(false);
                    setSelectedCombo(null);
                    refetchCombo()
                    n.success('Xoá thành công');
                },
                onError: (error) => {
                    n.error(error.message);
                },
            });
        }
    };
    return <>
        <div className="bg-surface-dark rounded-xl border border-border-dark overflow-hidden">
            <TableContainer className="overflow-x-auto">
                <Table className="w-full text-left border-collapse">
                    <TableHead>
                        <TableRow className="bg-background-dark border-b border-border-dark text-text-secondary text-xs uppercase tracking-wider">
                            <TableCell className="p-4 font-medium w-12 text-center">
                                <input
                                    className="rounded border-border-dark bg-surface-highlight text-primary focus:ring-offset-0 focus:ring-primary h-4 w-4"
                                    type="checkbox"
                                />
                            </TableCell>
                            <TableCell className="p-4 font-medium">Sản phẩm</TableCell>
                            <TableCell className="p-4 font-medium w-12 text-center">Thông tin sản phẩm</TableCell>
                            <TableCell className="p-4 font-medium">Loại</TableCell>
                            <TableCell className="p-4 font-medium">Giá bán</TableCell>
                            <TableCell className="p-4 font-medium">Trạng thái</TableCell>
                            <TableCell className="p-4 font-medium text-right">Thao tác</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody className="divide-y divide-border-dark text-sm">
                        {combo.map((item) => (
                            <TableRow key={"item" + item.name + item.id} className="group hover:bg-surface-highlight/50 transition-colors">
                                <TableCell className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                    />
                                </TableCell>
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
                                <TableCell className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div
                                            data-alt="Combo popcorn and soda image"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDoTN_ceozyPJuJ1Oz6wQtXUb0Du9LdTmX8z1aT0kANGA1mZA9lNG3f0VPf56ufbzRKx1_XmLVuzMSQjFDk2ejCADKo9INYlpWHEaxJuwK1PiO2Qw66i9_eOxS0yjaE4mW-YHY4oOx60UdRVfED0HUl2ByOPrbeIen6y4taabEeSq4YgkBUh9uNQ8swc5egu6ZgcvzsJQ1_bZz7hnJTZHtjBY4CVH62TStVwbIXr6jCGswkmebWjyikdUwavrVtAsOi8_wFee3YE42c")'
                                            }}
                                        ></div>
                                        <div>
                                            <p className="font-medium">
                                                {item.name}
                                            </p>
                                            <div className="text-xs">
                                                {
                                                    item.type === "COMBO" &&
                                                    <div className="bg-background-dark/50 border border-border-dark/50 rounded-lg p-2 flex flex-col gap-1.5">
                                                        <p className="text-[10px] px-5 uppercase font-bold tracking-wider mb-0.5 border-b-1">
                                                            Combo gồm
                                                        </p>
                                                        {
                                                            item.itemList != null && item.itemList.map((comboItem, index) => (
                                                                <div key={index + "key"} className="flex items-center gap-2 text-xs">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                                    <span className="font-medium">{comboItem.quantity}x</span> {comboItem.productName}
                                                                </div>
                                                            )
                                                            )}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="p-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {item.type}
                                    </span>
                                </TableCell>
                                <TableCell className="p-4 font-medium">{item.price.toLocaleString()} đ</TableCell>
                                <TableCell className="p-4">
                                    <button className="flex border rounded-lg p-1">
                                        {item.isActive == true && <p>ACTIVE</p>}
                                    </button>
                                </TableCell>
                                <TableCell className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-yellow-500 text-white rounded-md p-1"
                                            title="Chỉnh sửa"
                                            onClick={() => {
                                                setSelectedCombo(item);
                                                setEditComboModal(true);
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                <EditIcon></EditIcon>
                                            </span>
                                        </button>
                                        <button
                                            className="bg-red-500 text-white rounded-md transition-colors p-1"
                                            title="Xóa"
                                            onClick={() => handleClickIconDelete(item)}
                                        >
                                            <span className="text-[20px]">
                                                <DeleteIcon></DeleteIcon>
                                            </span>
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Pagination */}
            <CustomPagination
                itemsPerPage={10}
                totalItems={combo.length}
            />
            <EditComboModal
                open={openEditComboModal} onClose={() => setEditComboModal(false)}
                refetchCombo={refetchCombo}
                combo={selectedCombo}
                type={selectedCombo?.type == "SINGLE" ? "single" : "combo"}
                comboItem={selectedCombo?.itemList || []}></EditComboModal>
            <DeletePopup
                open={openDeletePopup}
                onClose={() => setOpenDeletePopup(false)}
                onConfirm={handleConfirmDelete}
                description={"Bạn có chắc muốn " + (selectedCombo?.type === "SINGLE" ? "xoá sản phẩm" : "xoá combo") + " này không?"}
            />
        </div>
    </>

}