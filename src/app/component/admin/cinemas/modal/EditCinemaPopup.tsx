/* eslint-disable @next/next/no-img-element */
import React, { startTransition, useEffect, useState } from "react";
import { Modal, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Roboto } from "next/font/google";
import { useForm } from "react-hook-form";
import { ICinema, useUpdateCinemaMutation } from "@/types/data/cinema";
import { toast } from "sonner";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "900"],
});

interface EditCinemaPopupProps {
  open: boolean;
  onClose: () => void;
  refetchCinemas: () => void;
  cinema: ICinema | null;
}

export default function EditCinemaPopup({
  open,
  onClose,
  refetchCinemas,
  cinema,
}: EditCinemaPopupProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const methods = useForm<Partial<ICinema>>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phone: "",
      imageUrl: null,
    },
    mode: "onChange",
  });

  const { mutate: updateCinema } = useUpdateCinemaMutation();

  useEffect(() => {
    if (open && cinema) {
      // Điền dữ liệu ban đầu
      methods.reset({
        name: cinema.name,
        description: cinema.description,
        address: cinema.address,
        phone: cinema.phone,
        imageUrl: null, // mới upload thì khác, nếu không thì dùng URL cũ
      });
      startTransition(() => {
        setPreviewImage(cinema.imageUrl || null);
      });
    } else if (!open) {
      setTimeout(() => {
        startTransition(() => {
          setPreviewImage(null);
        });
      }, 0);
      methods.reset();
    }
  }, [open, cinema, methods]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      methods.setValue("imageUrl", file as any); // store File for submission
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null);
    methods.setValue("imageUrl", null as any);
  };

  const onSubmit = async (data: Partial<ICinema>) => {
    if (!cinema) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.constructor === File) {
        formData.append(key, value as File);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    updateCinema(
      { id: cinema.id, payload: formData }, // <-- sửa data -> payload
      {
        onSuccess: () => {
          onClose();
          toast.success("Cập nhật rạp chiếu thành công", {
            description: "Thông tin rạp đã được lưu lại.",
          });
          methods.reset();
          setPreviewImage(null);
          refetchCinemas();
        },
        onError: (error: any) => {
          toast.error("Cập nhật rạp chiếu thất bại", {
            description: error?.message || "Không thể lưu thay đổi cho rạp này.",
          });
        },
      },
    );
  };

  const inputClass =
    "w-full rounded-[18px] border border-zinc-200 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-4 py-3 text-zinc-900 font-medium focus:border-[#ec131e] focus:ring-4 focus:ring-red-100 focus:outline-none placeholder-zinc-400 transition-colors";

  const labelClass =
    "mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500";

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { timeout: 500, className: "bg-black/60 backdrop-blur-sm" },
      }}
      className={`${roboto.className} flex items-center justify-center overflow-y-auto p-4`}
    >
      <Fade in={open}>
        <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(160deg,#ffffff_0%,#fbfdff_45%,#f8fafc_100%)] shadow-[0_32px_100px_rgba(15,23,42,0.16)] outline-none">
          <div className="border-b border-zinc-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-6 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                  Hệ thống rạp
                </div>
                <h3 className="mt-2 text-[28px] font-black tracking-[-0.04em] text-zinc-900">
                  Chỉnh sửa Rạp Chiếu
                </h3>
                <p className="mt-1.5 text-sm font-medium text-zinc-500">
                  Cập nhật thông tin hiển thị và hình ảnh của rạp chiếu.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-500 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form
              id="edit-cinema-form"
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6"
            >
              <div>
                <label className={labelClass}>Tên rạp</label>
                <input
                  {...methods.register("name")}
                  type="text"
                  placeholder="Nhập tên rạp"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Địa chỉ</label>
                <input
                  {...methods.register("address")}
                  type="text"
                  placeholder="Nhập địa chỉ rạp"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Số điện thoại</label>
                <input
                  {...methods.register("phone")}
                  type="text"
                  placeholder="Nhập số điện thoại"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Mô tả</label>
                <textarea
                  {...methods.register("description")}
                  rows={4}
                  placeholder="Mô tả chi tiết về rạp..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className={labelClass}>Ảnh rạp chiếu</label>
                <div className="relative h-64 w-full rounded-[24px] border-2 border-dashed border-zinc-300 bg-zinc-50/60 transition-all group cursor-pointer hover:border-[#ec131e] hover:bg-red-50/40">
                  {previewImage ? (
                    <div className="relative h-full w-full overflow-hidden rounded-[24px]">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-600 shadow-sm transition-all hover:bg-red-50"
                        title="Xóa ảnh"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="mb-3 rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110">
                        <CloudUploadIcon className="text-[#ec131e]" />
                      </div>
                      <span className="text-sm font-black text-zinc-700">
                        Tải ảnh lên
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        JPEG, PNG, WEBP
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        {...methods.register("imageUrl", {
                          onChange: handleFileChange,
                        })}
                      />
                    </label>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/80 p-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[18px] px-5 py-2.5 text-sm font-black text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="edit-cinema-form"
              className="cursor-pointer rounded-[18px] bg-[linear-gradient(135deg,#ec131e,#ff6548)] px-5 py-2.5 text-sm font-black text-white shadow-[0_18px_40px_rgba(236,19,30,0.24)] transition-colors hover:opacity-95"
            >
              Cập nhật Rạp
            </button>
          </div>
        </div>
      </Fade>
    </Modal>
  );
}
