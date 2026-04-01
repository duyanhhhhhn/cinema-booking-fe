"use client";

import {
  ICombo,
  useDeleteComboMutation,
  useDeleteProductMutation,
  useUpdateComboActiveMutation,
  useUpdateProductActiveMutation,
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
import ConcessionDeleteDialog from "./ConcessionDeleteDialog";
import { useRouteQuery } from "@/hooks/useRouteQuery";

interface IConcessionTableProps {
  combo: ICombo[];
  refetchCombo: () => Promise<unknown> | void;
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
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { mutate: deleteCombo } = useDeleteComboMutation();
  const { mutate: deleteProduct } = useDeleteProductMutation();
  const updateComboActiveMutation = useUpdateComboActiveMutation();
  const updateProductActiveMutation = useUpdateProductActiveMutation();

  const handleOpenEditModal = (item: ICombo) => {
    setSelectedCombo(item);
    setEditComboModal(true);
  };

  const handleCloseEditModal = () => {
    setEditComboModal(false);
    setSelectedCombo(null);
  };

  const handleClickIconDelete = (item: ICombo) => {
    setSelectedCombo(item);
    setOpenDeletePopup(true);
  };

  const handleCloseDeletePopup = () => {
    setOpenDeletePopup(false);
    setSelectedCombo(null);
  };

  const showDeleteSuccessToast = (type: "COMBO" | "SINGLE") => {
    toast.success(
      type === "COMBO" ? "Xóa combo thành công" : "Xóa sản phẩm thành công",
      {
        description:
          type === "COMBO"
            ? "Combo đã được gỡ khỏi danh sách F&B."
            : "Sản phẩm đã được gỡ khỏi danh sách F&B.",
        duration: 3200,
      },
    );
  };

  const showDeleteErrorToast = (message?: string) => {
    toast.error("Xóa thất bại", {
      description:
        message || "Đã xảy ra lỗi trong quá trình xóa. Vui lòng thử lại.",
      duration: 4200,
    });
  };

  const isDeleteBlockedByCombo = (item: ICombo | null, message?: string) => {
    if (!item || item.type !== "SINGLE" || !message) {
      return false;
    }

    const normalizedMessage = message.toLowerCase();

    return (
      normalizedMessage.includes("combo") ||
      normalizedMessage.includes("đang được sử dụng") ||
      normalizedMessage.includes("dang duoc su dung") ||
      normalizedMessage.includes("cannot delete") ||
      normalizedMessage.includes("in use") ||
      normalizedMessage.includes("used by")
    );
  };

  const showDeleteBlockedToast = (item: ICombo, message?: string) => {
    toast.warning("Sản phẩm đang nằm trong combo", {
      description:
        `${item.name} hiện đang được dùng trong một hoặc nhiều combo. ` +
        `Hãy gỡ sản phẩm này khỏi combo trước khi xóa.` +
        (message ? ` ${message}` : ""),
      duration: 5200,
    });
  };

  const showToggleSuccessToast = (item: ICombo) => {
    const isCombo = item.type === "COMBO";
    const nextAction = item.isActive ? "Ẩn" : "Bật lại";

    toast.success(
      `${nextAction} ${isCombo ? "combo" : "sản phẩm"} thành công`,
      {
        description: item.isActive
          ? `${item.name} đã được ẩn khỏi phía người dùng.`
          : `${item.name} đã được bật lại cho phía người dùng.`,
        duration: 3200,
      },
    );
  };

  const showToggleErrorToast = (message?: string) => {
    toast.error("Cập nhật trạng thái thất bại", {
      description:
        message || "Không thể thay đổi trạng thái bán. Vui lòng thử lại.",
      duration: 4200,
    });
  };

  const getToggleBlockedMessage = (item: ICombo) => {
    if (item.isActive === true) {
      return null;
    }

    if (item.type === "SINGLE") {
      if (Number(item.stock || 0) <= 0) {
        return `${item.name} đã hết hàng, chưa thể mở bán.`;
      }

      return null;
    }

    if (!item.itemList || item.itemList.length === 0) {
      return "Combo chưa có sản phẩm thành phần nên chưa thể mở bán.";
    }

    const unavailableItems = item.itemList.flatMap((comboItem) => {
      const resolvedName =
        String(comboItem.productName || "").trim() ||
        `sản phẩm #${Number(comboItem.productId || 0)}`;

      if (comboItem.is_active === false) {
        return [`${resolvedName} đang ngừng bán.`];
      }

      if (comboItem.stock == null || Number.isNaN(Number(comboItem.stock))) {
        return [`Không xác định được tồn kho của ${resolvedName}.`];
      }

      if (Number(comboItem.stock || 0) < Number(comboItem.quantity || 0)) {
        return [
          `${resolvedName} chỉ còn ${comboItem.stock}, cần ${comboItem.quantity}.`,
        ];
      }

      return [];
    });

    if (unavailableItems.length === 0) {
      return null;
    }

    if (unavailableItems.length === 1) {
      return unavailableItems[0];
    }

    return `${unavailableItems[0]} Và ${unavailableItems.length - 1} sản phẩm khác cũng không đủ số lượng.`;
  };

  const showToggleWarningToast = (item: ICombo, message: string) => {
    toast.warning("Chưa thể mở bán", {
      description:
        item.type === "COMBO"
          ? `Combo ${item.name} chưa đủ điều kiện mở bán. ${message}`
          : message,
      duration: 4200,
    });
  };

  const handleConfirmDelete = () => {
    if (selectedCombo && selectedCombo.type === "COMBO") {
      deleteCombo(selectedCombo.id, {
        onSuccess: async () => {
          handleCloseDeletePopup();
          await Promise.resolve(refetchCombo());
          showDeleteSuccessToast("COMBO");
        },
        onError: (error) => {
          showDeleteErrorToast(error.message);
        },
      });
    } else if (selectedCombo && selectedCombo.type === "SINGLE") {
      deleteProduct(selectedCombo.id, {
        onSuccess: async () => {
          handleCloseDeletePopup();
          await Promise.resolve(refetchCombo());
          showDeleteSuccessToast("SINGLE");
        },
        onError: (error) => {
          if (isDeleteBlockedByCombo(selectedCombo, error.message)) {
            handleCloseDeletePopup();
            showDeleteBlockedToast(selectedCombo, error.message);
            return;
          }

          showDeleteErrorToast(error.message);
        },
      });
    }
  };

  const handleToggleStatus = (item: ICombo) => {
    const currentItem = item;
    const blockedMessage = getToggleBlockedMessage(currentItem);

    if (blockedMessage) {
      showToggleWarningToast(currentItem, blockedMessage);
      return;
    }

    const isActive = currentItem.isActive === true;
    const nextIsActive = !isActive;
    setTogglingId(currentItem.id);

    const mutation =
      currentItem.type === "COMBO"
        ? updateComboActiveMutation
        : updateProductActiveMutation;

    mutation.mutate(
      { id: currentItem.id, nextIsActive },
      {
        onSuccess: async () => {
          await Promise.resolve(refetchCombo());
          showToggleSuccessToast(currentItem);
        },
        onError: (error) => {
          showToggleErrorToast(error.message);
        },
        onSettled: () => {
          setTogglingId(null);
        },
      },
    );
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
                  Tồn Kho
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
                        Hiện chưa có dữ liệu để hiển thị. Hãy thêm sản phẩm mới
                        để bắt đầu quản lý F&amp;B.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item) => {
                  const imageUrl = item.imageUrl
                    ? `${urlImage}${item.imageUrl}`
                    : "";
                  const isCombo = item.type === "COMBO";
                  const isActive = item.isActive === true;
                  const isToggling = togglingId === item.id;
                  const blockedMessage = getToggleBlockedMessage(item);
                  const isToggleBlocked = Boolean(blockedMessage);
                  const toggleLabel = `${isActive ? "Ẩn" : "Bật lại"} ${
                    isCombo ? "combo" : "sản phẩm"
                  }`;

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
                              backgroundImage: imageUrl
                                ? `url(${imageUrl})`
                                : "none",
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
                          {isCombo &&
                          item.itemList != null &&
                          item.itemList.length > 0 ? (
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
                              Sản phẩm bán lẻ, không có danh sách thành phần đi
                              kèm.
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
                          {Number(item.stock || 0)}
                        </p>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <p className="text-[15px] font-extrabold text-gray-900">
                          {Number(item.price || 0).toLocaleString("vi-VN")} đ
                        </p>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <div className="flex items-center">
                          <div className="group relative inline-flex">
                            {isToggleBlocked ? (
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 w-max max-w-[240px] -translate-x-1/2 translate-y-1 rounded-2xl bg-[#111827] px-3 py-2 text-[11px] font-semibold leading-5 text-white opacity-0 shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                                {blockedMessage}
                                <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 bg-[#111827]" />
                              </div>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              disabled={isToggling}
                              aria-label={toggleLabel}
                              aria-pressed={isActive}
                              aria-disabled={isToggleBlocked || isToggling}
                              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition duration-200 ${
                                isActive
                                  ? "border-[#22c55e] bg-[#22c55e]"
                                  : "border-[#d1d5db] bg-[#e5e7eb]"
                              } ${
                                isToggleBlocked
                                  ? "cursor-not-allowed opacity-40 saturate-50"
                                  : ""
                              } ${
                                isToggling
                                  ? "cursor-not-allowed opacity-70"
                                  : ""
                              }`}
                            >
                              <span className="sr-only">{toggleLabel}</span>
                              <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow-[0_3px_10px_rgba(15,23,42,0.18)] transition duration-200 ${
                                  isActive ? "translate-x-6" : "translate-x-1"
                                } ${isToggling ? "scale-90" : ""}`}
                              />
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffd9d9] bg-[#fff5f5] text-[#ff2d2f] transition hover:bg-[#ffe9e9]"
                            title="Chỉnh sửa"
                            onClick={() => handleOpenEditModal(item)}
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
          onClose={handleCloseEditModal}
          refetchCombo={refetchCombo}
          combo={selectedCombo}
          type={selectedCombo?.type === "SINGLE" ? "single" : "combo"}
          comboItem={selectedCombo?.itemList || []}
        />

        <ConcessionDeleteDialog
          open={openDeletePopup}
          onClose={handleCloseDeletePopup}
          onConfirm={handleConfirmDelete}
          item={selectedCombo}
          imageBaseUrl={urlImage}
        />
      </div>
    </>
  );
}
