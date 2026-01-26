/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { Modal, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined"; 
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; 
import { useForm } from "react-hook-form";
import { useNotification } from "@/hooks/useNotification";
import { ICinema, useCreateCinemaMutation } from "@/types/data/cinema";

interface AddCinemaModalProps {
  open: boolean;
  onClose: () => void;
  refetchCinemas: () => void;
}

export default function AddCinemaModal({
  open,
  onClose,
  refetchCinemas,
}: AddCinemaModalProps) {
  const n = useNotification();
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

  const { mutate: createCinema } = useCreateCinemaMutation();

  useEffect(() => {
    if (!open) {
      setTimeout(() => setPreviewImage(null), 0);
      methods.reset();
    }
  }, [open, methods]);

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
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.constructor === File) {
  formData.append(key, value as File);
} else if (value !== undefined && value !== null) {
  formData.append(key, String(value));
}
    });

    createCinema(formData, {
      onSuccess: () => {
        onClose();
        n.success("Thêm rạp chiếu thành công");
        methods.reset();
        setPreviewImage(null);
        refetchCinemas();
      },
      onError: (error: any) => {
        n.error(error.message);
      },
    });
  };

  const inputClass =
    "w-full rounded-lg bg-white border border-zinc-300 px-4 py-2.5 text-zinc-900 focus:border-[#ec131e] focus:ring-1 focus:ring-[#ec131e] focus:outline-none placeholder-zinc-400 transition-colors";

  const labelClass = "block text-sm font-medium text-zinc-700 mb-1.5";

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { timeout: 500, className: "bg-black/60 backdrop-blur-sm" },
      }}
      className="flex items-center justify-center p-4 overflow-y-auto"
    >
      <Fade in={open}>
        <div className="relative w-full max-w-2xl rounded-xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] outline-none font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-6 shrink-0">
            <h3 className="text-xl font-bold text-zinc-900">Thêm Rạp Chiếu</h3>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form
              id="add-cinema-form"
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-6"
            >
              {/* Tên Rạp */}
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

              {/* Địa chỉ */}
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

              {/* Số điện thoại */}
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

              {/* Mô tả */}
              <div>
                <label className={labelClass}>Mô tả</label>
                <textarea
                  {...methods.register("description")}
                  rows={4}
                  placeholder="Mô tả chi tiết về rạp..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Ảnh */}
              <div>
                <label className={labelClass}>Ảnh đại diện</label>
                <div className="relative w-full h-64 border-2 border-dashed border-zinc-300 rounded-lg hover:bg-zinc-50 hover:border-[#ec131e] transition-all group cursor-pointer bg-zinc-50/50">
                  {previewImage ? (
                    <div className="relative w-full h-full overflow-hidden rounded-lg">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-red-50 shadow-sm transition-all"
                        title="Xóa ảnh"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <CloudUploadIcon className="text-[#ec131e]" />
                      </div>
                      <span className="text-sm text-zinc-600 font-medium">
                        Tải ảnh lên
                      </span>
                      <span className="text-xs text-zinc-400 mt-1">
                        JPEG, PNG, WEBP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
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

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 p-6 bg-zinc-50 shrink-0 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="add-cinema-form"
              className="rounded-lg bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ec131e]/90 transition-colors shadow-lg shadow-red-500/30 cursor-pointer"
            >
              Thêm Rạp
            </button>
          </div>
        </div>
      </Fade>
    </Modal>
  );
}
