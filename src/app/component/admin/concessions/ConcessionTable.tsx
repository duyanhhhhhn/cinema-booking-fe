"use client";

import { Combo, ICombo } from "@/types/data/concession/combo";
import { useQuery } from "@tanstack/react-query";
import CustomPagination from "../table/CustomPagination";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

interface IConcessionTableProps {
    combo: ICombo[];
    refetchCombo: () => void;
}
export default function ConcessionTable({ combo, refetchCombo }: IConcessionTableProps) {
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
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
                            <TableRow key={"item" + item.name} className="group hover:bg-surface-highlight/50 transition-colors">
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
                                            <p className="text-xs">
                                                {
                                                    item.type === "COMBO" &&
                                                    <div className="bg-background-dark/50 border border-border-dark/50 rounded-lg p-2 flex flex-col gap-1.5">
                                                        <p className="text-[10px] uppercase font-bold tracking-wider mb-0.5">
                                                            Sản phẩm thành phần
                                                        </p>
                                                        {
                                                            item.itemList.map((comboItem, index) => (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                                                    <span className="font-medium">{comboItem.quantity}x</span> {comboItem.productName}
                                                                </div>
                                                            )
                                                            )}
                                                    </div>
                                                }
                                            </p>
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
                                    <div className="relative inline-flex text-center cursor-pointer">
                                        <input
                                            defaultChecked={false}
                                            className="sr-only peer"
                                            type="checkbox"
                                            defaultValue=""
                                        />
                                        <div className="w-9 h-5 bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                                    </div>
                                </TableCell>
                                <TableCell className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="hover:bg-background-dark text-red-500 rounded-lg"
                                            title="Chỉnh sửa"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                edit
                                            </span>
                                        </button>
                                        <button
                                            className="hover:bg-background-dark rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <span className="text-[20px]">
                                                delete
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
        </div>
    </>

}