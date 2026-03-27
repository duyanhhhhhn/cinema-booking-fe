"use client";

import {
  ICombo,
  useDeleteComboMutation,
  useDeleteProductMutation,
} from "@/types/data/concession/combo";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import {
  Box,
  Pagination,
  PaginationItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import EditComboModal from "./modal/EditConcessionModal";
import DeletePopup from "../user/DeletePopup";
import { useRouteQuery } from "@/hooks/useRouteQuery";

interface IConcessionTableProps {
  combo: ICombo[];
  refetchCombo: () => void;
}

export default function ConcessionTable({
  combo,
  refetchCombo,
}: IConcessionTableProps) {
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL || "";
  const { updateQuery, searchQuery } = useRouteQuery();

  const [openEditComboModal, setEditComboModal] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ICombo | null>(null);

  const { mutate: deleteCombo } = useDeleteComboMutation();
  const { mutate: deleteProduct } = useDeleteProductMutation();

  const handleClickIconDelete = (combo: ICombo) => {
    setSelectedCombo(combo);
    setOpenDeletePopup(true);
  };

  const showDeleteSuccessToast = (type: "COMBO" | "SINGLE") => {
    toast.success(type === "COMBO" ? "Xóa combo thành công" : "Xóa sản phẩm thành công", {
      description:
        type === "COMBO"
          ? "Combo đã được gỡ khỏi danh sách F&B."
          : "Sản phẩm đã được gỡ khỏi danh sách F&B.",
      duration: 3200,
    });
  };

  const showDeleteErrorToast = (message?: string) => {
    toast.error("Xóa thất bại", {
      description: message || "Đã xảy ra lỗi trong quá trình xóa. Vui lòng thử lại.",
      duration: 4200,
    });
  };

  const handleConfirmDelete = () => {
    if (selectedCombo && selectedCombo.type === "COMBO") {
      deleteCombo(selectedCombo.id, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedCombo(null);
          refetchCombo();
          showDeleteSuccessToast("COMBO");
        },
        onError: (error) => {
          showDeleteErrorToast(error.message);
        },
      });
    } else if (selectedCombo && selectedCombo.type === "SINGLE") {
      deleteProduct(selectedCombo.id, {
        onSuccess: () => {
          setOpenDeletePopup(false);
          setSelectedCombo(null);
          refetchCombo();
          showDeleteSuccessToast("SINGLE");
        },
        onError: (error) => {
          showDeleteErrorToast(error.message);
        },
      });
    }
  };

  const tableData = useMemo(() => combo || [], [combo]);

  const itemsPerPage = 10;
  const pageFromQuery = searchQuery.get("page");
  const currentPage = pageFromQuery ? parseInt(pageFromQuery, 10) : 1;
  const safeCurrentPage =
    Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const totalItems = tableData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startItem =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(safeCurrentPage * itemsPerPage, totalItems);

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-[#ececf2] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <TableContainer className="overflow-x-auto">
          <Table className="min-w-full border-collapse">
            <TableHead>
              <TableRow className="bg-[#fff5f5]">
                <TableCell className="w-12 border-b border-[#f7dede] px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-[#f3b4b4] accent-[#ff2d2f]"
                  />
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Sản phẩm
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Thông tin
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Loại
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Giá bán
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Trạng thái
                </TableCell>

                <TableCell className="border-b border-[#f7dede] px-4 py-4 text-right text-[12px] font-bold uppercase tracking-[0.16em] text-[#de5c5d]">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody className="text-sm">
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#ff2d2f]">
                        <LocalMoviesOutlinedIcon fontSize="medium" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Chưa có sản phẩm nào
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                        Hiện chưa có dữ liệu để hiển thị. Hãy thêm sản phẩm mới để
                        bắt đầu quản lý F&amp;B.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item) => {
                  const imageUrl = item.imageUrl ? `${urlImage}${item.imageUrl}` : "";
                  const isCombo = item.type === "COMBO";
                  const isActive = item.isActive === true;

                  return (
                    <TableRow
                      key={`item-${item.name}-${item.id}`}
                      className="border-b border-[#f2f3f7] transition hover:bg-[#fffdfd]"
                    >
                      <TableCell className="px-4 py-4 text-center align-middle">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-[#d9dce5] accent-[#ff2d2f]"
                        />
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Box
                            component="div"
                            sx={{
                              width: 58,
                              height: 58,
                              backgroundImage: imageUrl ? `url(${imageUrl})` : "none",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "16px",
                              backgroundColor: "#f4f4f5",
                              border: "1px solid #ececf2",
                              flexShrink: 0,
                            }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold text-gray-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs font-medium text-gray-400">
                              Mã sản phẩm #{item.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <div className="max-w-[240px]">
                          {isCombo && item.itemList != null && item.itemList.length > 0 ? (
                            <div className="rounded-2xl border border-[#f2e4e4] bg-[#fffafa] p-3">
                              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#e06465]">
                                Combo gồm
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {item.itemList.map((comboItem, index) => (
                                  <div
                                    key={`${comboItem.productName}-${index}`}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff7b7d]" />
                                    <span className="font-semibold">
                                      {comboItem.quantity}x
                                    </span>
                                    <span className="truncate">
                                      {comboItem.productName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="line-clamp-2 text-sm font-medium leading-6 text-gray-500">
                              Sản phẩm bán lẻ, không có danh sách thành phần đi kèm.
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                            isCombo
                              ? "bg-[#fff1f1] text-[#ff2d2f]"
                              : "bg-[#f4f5f7] text-gray-700"
                          }`}
                        >
                          {isCombo ? "Combo" : "Món lẻ"}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <p className="text-[15px] font-extrabold text-gray-900">
                          {item.price.toLocaleString("vi-VN")} đ
                        </p>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                            isActive
                              ? "bg-[#ecfdf3] text-[#16a34a]"
                              : "bg-[#fff4f4] text-[#ef4444]"
                          }`}
                        >
                          {isActive ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffd9d9] bg-[#fff5f5] text-[#ff2d2f] transition hover:bg-[#ffe9e9]"
                            title="Chỉnh sửa"
                            onClick={() => {
                              setSelectedCombo(item);
                              setEditComboModal(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </button>

                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff2d2f] text-white shadow-[0_8px_18px_rgba(255,45,47,0.18)] transition hover:bg-[#ef1f21]"
                            title="Xóa"
                            onClick={() => handleClickIconDelete(item)}
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <div className="border-t border-[#f2f3f7] bg-white px-4 py-5">
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Hiển thị{" "}
              <span style={{ fontWeight: 700, color: "#111827" }}>
                {startItem}-{endItem}
              </span>{" "}
              trên{" "}
              <span style={{ fontWeight: 700, color: "#111827" }}>
                {totalItems}
              </span>
            </Typography>

            <Pagination
              count={totalPages}
              page={Math.min(safeCurrentPage, totalPages)}
              onChange={(_, value) => updateQuery({ page: value.toString() })}
              shape="rounded"
              siblingCount={2}
              boundaryCount={1}
              renderItem={(item) => (
                <PaginationItem
                  slots={{
                    previous: KeyboardArrowLeftRoundedIcon,
                    next: KeyboardArrowRightRoundedIcon,
                  }}
                  {...item}
                />
              )}
              sx={{
                "& .MuiPagination-ul": {
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  gap: "8px",
                },
                "& .MuiPaginationItem-root": {
                  minWidth: "32px",
                  height: "32px",
                  margin: 0,
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "#fff1f1",
                  color: "#ff2d2f",
                },
                "& .MuiPaginationItem-root.Mui-selected": {
                  backgroundColor: "#ff2d2f",
                  color: "#ffffff",
                  boxShadow: "0 8px 20px rgba(255, 45, 47, 0.18)",
                },
                "& .MuiPaginationItem-root.Mui-selected:hover": {
                  backgroundColor: "#ef1f21",
                },
                "& .MuiPaginationItem-previousNext": {
                  color: "#6b7280",
                  backgroundColor: "transparent",
                },
                "& .MuiPaginationItem-previousNext:hover": {
                  backgroundColor: "#fff1f1",
                  color: "#ff2d2f",
                },
                "& .MuiPaginationItem-ellipsis": {
                  color: "#9ca3af",
                  fontWeight: 600,
                },
                "& .Mui-disabled": {
                  opacity: 0.35,
                },
              }}
            />
          </Stack>
        </div>

        <EditComboModal
          open={openEditComboModal}
          onClose={() => setEditComboModal(false)}
          refetchCombo={refetchCombo}
          combo={selectedCombo}
          type={selectedCombo?.type === "SINGLE" ? "single" : "combo"}
          comboItem={selectedCombo?.itemList || []}
        />

        <DeletePopup
          open={openDeletePopup}
          onClose={() => setOpenDeletePopup(false)}
          onConfirm={handleConfirmDelete}
          description={
            "Bạn có chắc muốn " +
            (selectedCombo?.type === "SINGLE" ? "xoá sản phẩm" : "xoá combo") +
            " này không?"
          }
        />
      </div>
    </>
  );
}