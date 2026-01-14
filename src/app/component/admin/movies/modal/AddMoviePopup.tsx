/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { Modal, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined"; 
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"; 
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createMovieSchema } from "@/types/data/movie/schema/movie";
import {
  initialData,
  MovieFormData,
  useCreateMovieMutation,
} from "@/types/data/movie";
import { useNotification } from "@/hooks/useNotification";

export default function AddMovieModal({
  open,
  onClose,
  refetchMovies,
}: {
  open: boolean;
  onClose: () => void;
  refetchMovies: () => void;
}) {
  const n = useNotification();
  const [previews, setPreviews] = useState<{
    poster: string | null;
    banner: string | null;
  }>({
    poster: null,
    banner: null,
  });

  const methods = useForm<any>({
    defaultValues: initialData,
    mode: "onChange",
    resolver: yupResolver(createMovieSchema()),
  });

  const { mutate: createMovie } = useCreateMovieMutation();

  
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPreviews({ poster: null, banner: null });
      }, 0);
      methods.reset();
    }
  }, [open, methods]);

  
  useEffect(() => {
    return () => {
      if (previews.poster) URL.revokeObjectURL(previews.poster);
      if (previews.banner) URL.revokeObjectURL(previews.banner);
    };
  }, [previews]);

  const onSubmit = async (data: MovieFormData) => {
    const payload = {
      ...data,
      durationMinutes: Number(data.durationMinutes),
    };
    createMovie(payload, {
      onSuccess: () => {
        onClose();
        n.success("Thêm phim thành công");
        methods.reset();
        refetchMovies();
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "posterFile" | "bannerFile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [fieldName === "posterFile" ? "poster" : "banner"]: url,
      }));
    }
  };

  const removeImage = (
    e: React.MouseEvent,
    fieldName: "posterFile" | "bannerFile"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviews((prev) => ({
      ...prev,
      [fieldName === "posterFile" ? "poster" : "banner"]: null,
    }));
    methods.setValue(fieldName, null as any); 
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
        backdrop: {
          timeout: 500,
          className: "bg-black/60 backdrop-blur-sm",
        },
      }}
      className="flex items-center justify-center p-4 overflow-y-auto"
    >
      <Fade in={open}>
        <div className="relative w-full max-w-4xl rounded-xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] outline-none font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 p-6 shrink-0">
            <h3 className="text-xl font-bold text-zinc-900">Thêm Phim Mới</h3>
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
              id="add-movie-form"
              onSubmit={methods.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Title */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Tiêu đề phim</label>
                <input
                  name="title"
                  {...methods.register("title")}
                  type="text"
                  placeholder="Nhập tên phim"
                  className={inputClass}
                />
              </div>

              {/* URL Poster & Banner Section (Custom UI) */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster Upload - Tỉ lệ dọc */}
                <div>
                  <label className={labelClass}>Poster (Dọc)</label>
                  <div className="relative w-full h-64 border-2 border-dashed border-zinc-300 rounded-lg hover:bg-zinc-50 hover:border-[#ec131e] transition-all group cursor-pointer bg-zinc-50/50">
                    {previews.poster ? (
                      <div className="relative w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={previews.poster}
                          alt="Poster Preview"
                          className="w-full h-full object-contain bg-zinc-900"
                        />
                        <button
                          onClick={(e) => removeImage(e, "posterFile")}
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
                          Tải Poster lên
                        </span>
                        <span className="text-xs text-zinc-400 mt-1">
                          JPEG, PNG, WEBP
                        </span>

                        {/* Hidden Input */}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...methods.register("posterFile", {
                            onChange: (e) => handleFileChange(e, "posterFile"),
                          })}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Banner Upload - Tỉ lệ ngang */}
                <div>
                  <label className={labelClass}>Banner (Ngang)</label>
                  <div className="relative w-full h-64 border-2 border-dashed border-zinc-300 rounded-lg hover:bg-zinc-50 hover:border-[#ec131e] transition-all group cursor-pointer bg-zinc-50/50">
                    {previews.banner ? (
                      <div className="relative w-full h-full overflow-hidden rounded-lg">
                        <img
                          src={previews.banner}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => removeImage(e, "bannerFile")}
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
                          Tải Banner lên
                        </span>
                        <span className="text-xs text-zinc-400 mt-1">
                          JPEG, PNG, WEBP
                        </span>

                        {/* Hidden Input */}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...methods.register("bannerFile", {
                            onChange: (e) => handleFileChange(e, "bannerFile"),
                          })}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Trailer URL - Đưa xuống dưới hoặc để riêng */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>
                  URL Trailer (Youtube/Video)
                </label>
                <div className="relative">
                  <input
                    name="trailerUrl"
                    {...methods.register("trailerUrl")}
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={`${inputClass} pl-10`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-zinc-400 text-lg">📺</span>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Mô tả ngắn</label>
                <textarea
                  name="shortDescription"
                  {...methods.register("shortDescription")}
                  rows={2}
                  placeholder="Mô tả ngắn gọn về phim..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Full Description */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Mô tả chi tiết</label>
                <textarea
                  name="description"
                  {...methods.register("description")}
                  rows={4}
                  placeholder="Nội dung chi tiết..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Other inputs... */}
              <div>
                <label className={labelClass}>Thời lượng (phút)</label>
                <input
                  name="durationMinutes"
                  {...methods.register("durationMinutes")}
                  type="number"
                  placeholder="VD: 120"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Thể loại</label>
                <input
                  name="genre"
                  {...methods.register("genre")}
                  type="text"
                  placeholder="Hành động, Hài..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ngôn ngữ</label>
                <input
                  name="language"
                  {...methods.register("language")}
                  type="text"
                  placeholder="Tiếng Việt, Tiếng Anh..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Định dạng</label>
                <input
                  name="format"
                  {...methods.register("format")}
                  type="text"
                  placeholder="2D, 3D, IMAX..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Đạo diễn</label>
                <input
                  name="director"
                  {...methods.register("director")}
                  type="text"
                  placeholder="Tên đạo diễn"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Diễn viên</label>
                <input
                  name="cast"
                  {...methods.register("cast")}
                  type="text"
                  placeholder="Danh sách diễn viên"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ngày khởi chiếu</label>
                <input
                  name="releaseDate"
                  {...methods.register("releaseDate")}
                  type="date"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ngày kết thúc</label>
                <input
                  name="endDate"
                  {...methods.register("endDate")}
                  type="date"
                  className={inputClass}
                />
              </div>

              {/* Status Select */}
              <div className="col-span-1 md:col-span-2">
                <label className={labelClass}>Trạng thái</label>
                <div className="relative">
                  <select
                    name="status"
                    {...methods.register("status")}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="COMING_SOON">Sắp chiếu</option>
                    <option value="NOW_SHOWING">Đang chiếu</option>
                    <option value="ENDED">Ngừng chiếu</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
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
              form="add-movie-form"
              className="rounded-lg bg-[#ec131e] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#ec131e]/90 transition-colors shadow-lg shadow-red-500/30 cursor-pointer"
            >
              Thêm Phim
            </button>
          </div>
        </div>
      </Fade>
    </Modal>
  );
}
