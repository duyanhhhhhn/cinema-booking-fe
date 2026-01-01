import React from "react";
import { Modal, Fade, Backdrop } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createMovieSchema } from "@/types/data/movie/schema/movie";
import { initialData, MovieFormData, useCreateMovieMutation } from "@/types/data/movie";
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
  const methods = useForm<any>({
    defaultValues: initialData,
    mode: "onChange",
    resolver: yupResolver(createMovieSchema()),
  });
    const { mutate: createMovie } = useCreateMovieMutation();
    const onSubmit =  async(data: MovieFormData) => {
        const payload = {
            ...data,
            durationMinutes: Number(data.durationMinutes),
        }
        createMovie(payload, {
            onSuccess: () => {
                onClose();
                n.success('Thêm phim thành công');
                methods.reset();
                refetchMovies();
            },
            onError: (error) => {
                n.error(error.message);
            }
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
        backdrop: {
          timeout: 500,
          className: "bg-black/60 backdrop-blur-sm",
        },
      }}
      className="flex items-center justify-center p-4 overflow-y-auto"
    >
      <Fade in={open}>
        {/* Main Container: Đổi bg thành white */}
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

          {/* Form Body - Scrollable */}
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

              {/* Row 1 inputs */}
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

              {/* Row 2 inputs */}
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

              {/* Row 3 inputs */}
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

              {/* Dates - Bỏ color-scheme:dark để lịch hiện màu sáng */}
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

              {/* URLs */}
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>URL Poster</label>
                  <input
                    name="posterUrl"
                    {...methods.register("posterUrl")}
                    type="file"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>URL Banner</label>
                  <input
                    name="bannerUrl"
                    {...methods.register("bannerUrl")}
                    type="file"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>URL Trailer</label>
                  <input
                    name="trailerUrl"
                    {...methods.register("trailerUrl")}
                    type="url"
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
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
                  {/* Custom Arrow for select - đổi màu icon sang tối */}
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

          {/* Footer Actions - Nền xám nhạt */}
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
