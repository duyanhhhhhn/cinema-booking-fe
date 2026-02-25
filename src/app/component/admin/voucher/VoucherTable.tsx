"use client";

import { IVoucher } from "@/types/data/voucher/voucher";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

interface IVoucherTableProps {
    voucher: IVoucher[];
    refetchVoucher: () => void;
}

export default function VoucherTable({ voucher, refetchVoucher }: IVoucherTableProps) {
    return <>
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
                        <TableCell className="p-4 font-medium">Mã voucher</TableCell>
                        <TableCell className="p-4 font-medium">Loại voucher</TableCell>
                        <TableCell className="p-4 font-medium">Giá trị</TableCell>
                        <TableCell className="p-4 font-medium">Giá đơn tối thiểu</TableCell>
                        <TableCell className="p-4 font-medium">Ngày bắt đầu</TableCell>
                        <TableCell className="p-4 font-medium">Ngày kết thúc</TableCell>
                        <TableCell className="p-4 font-medium">Giới hạn sử dụng</TableCell>
                        <TableCell className="p-4 font-medium">Số lượng đã dùng</TableCell>
                        <TableCell className="p-4 font-medium text-right">Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {voucher.map((item) => (
                        <TableRow key={"table" + item.code}>
                            <TableCell className="p-4 text-center">
                                <input
                                    type="checkbox"
                                />
                            </TableCell>
                            <TableCell className="p-4 font-medium">{item.code}</TableCell>
                            <TableCell className="p-4 font-medium">{item.discountType}</TableCell>
                            <TableCell className="p-4 font-medium">{item.discountValue}</TableCell>
                            <TableCell className="p-4 font-medium">{item.minOrderAmount}</TableCell>
                            <TableCell className="p-4 font-medium">{item.startAt}</TableCell>
                            <TableCell className="p-4 font-medium">{item.endAt}</TableCell>
                            <TableCell className="p-4 font-medium">{item.usageLimit}</TableCell>
                            <TableCell className="p-4 font-medium">{item.usedCount}</TableCell>
                            <TableCell className="p-4 font-medium">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="hover:bg-background-dark text-red-500 rounded-lg border"
                                        title="Chỉnh sửa"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            edit
                                        </span>
                                    </button>
                                    <button
                                        className="hover:bg-background-dark rounded-lg transition-colors border"
                                        title="Xóa"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </>;
}