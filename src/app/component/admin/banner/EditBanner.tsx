"use client"
import DashboardIcon from "@mui/icons-material/Dashboard";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Banner, BannerFormData, useUpdateBannerMutation } from "@/types/data/home/banner";
import { useForm } from "react-hook-form";

export default function EditBanner() {
    const { id } = useParams();
    const { data: bannerData } = useQuery({
        ...Banner.getBannerDetail(Number(id)),
    });
    const n = useNotification();
    const { mutate: updateBanner } = useUpdateBannerMutation();
    const [previews, setPreviews] = useState<{
        poster: string | null;
        banner: string | null;
    }>({
        poster: null,
        banner: null,
    });
    const method = useForm<BannerFormData>({
        defaultValues: {
            title: "",
            image_url: "",
            link_url: "",
            is_active: false,
            position: "HOME",
            bannerFile: null
        },
        mode: "onChange",
    });
    useEffect(() => {
        method.reset({
            title: bannerData?.data.title,
            image_url: bannerData?.data.imageUrl,
            link_url: bannerData?.data.linkUrl,
            is_active: bannerData?.data.isActive,
            position: bannerData?.data.position,
        });
    }, [id, method, bannerData]);
    const onSubmit = (data: BannerFormData) => {
        const payload = {
            ...data,
        };
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (
                key === "bannerFile" &&
                value instanceof FileList &&
                value.length > 0
            ) {
                formData.append("bannerFile", value[0]);
            } else if (value !== undefined && value !== null) {
                if (typeof value === "object") {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            }
        });
        formData.delete("bannerUrl");
        updateBanner(
            { id: Number(id), payload: formData },
            {
                onSuccess: () => {
                    n.success("Cập nhật Banner thành công");
                },
                onError: (error) => {
                    n.error(error.message);
                },
            }
        );
    };
    const urlPoster = process.env.NEXT_PUBLIC_IMAGE_URL
    const inputClass =
        "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all duration-200 outline-none placeholder:text-gray-400";

    const labelClass =
        "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1";

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: "bannerFile"
    ) => {
        const file = e.target.files;
        if (file) {
            const url = URL.createObjectURL(file[0]);
            setPreviews((prev) => ({
                ...prev,
                "banner": url,
            }));
            // Lưu file vào form
            method.setValue(fieldName, file);
        }
    };

    const removeImage = (
        e: React.MouseEvent,
        fieldName: "bannerFile"
    ) => {
        e.preventDefault();
        e.stopPropagation();
        setPreviews((prev) => ({
            ...prev,
            "banner": null,
        }));
        (method.setValue as any)(fieldName, null);
    };

    // Cleanup preview URLs
    useEffect(() => {
        return () => {
            if (previews.banner) URL.revokeObjectURL(previews.banner);
        };
    }, [previews]);



    return (
        <div className="min-h-screen  font-sans text-gray-900">
            {/* HEADER BREADCRUMB (Thay thế Header cũ) */}
            <div className="bg-white border-b border-gray-200  py-4 mb-8">
                <div className=" flex items-center gap-2 text-sm text-gray-500">
                    <span className="hover:text-red-600 cursor-pointer flex items-center gap-1">
                        <DashboardIcon fontSize="small" /> Dashboard
                    </span>
                    <NavigateNextIcon fontSize="small" />
                    <span className="hover:text-red-600 cursor-pointer">Banner</span>
                    <NavigateNextIcon fontSize="small" />
                    <span className="text-gray-900 font-semibold">
                        Detail & Edit
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className=" pb-10">
                <form className=" w-full" onSubmit={method.handleSubmit(onSubmit)}>
                    {/* TITLE & ACTIONS */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-5">
                            <a
                                href="/admin/movies"
                                className="size-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                            >
                                <ArrowBackIcon />
                            </a>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                    Title:{" "}
                                    <span className="text-red-600">
                                        {bannerData?.data.title}
                                    </span>
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => method.reset()}
                                className="cursor-pointer px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all bg-white"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="cursor-pointer px-8 py-3 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 hover:scale-[1.02] transition-all">
                                Save Change
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        {/* LEFT COLUMN: FORM */}
                        <div className="xl:col-span-8 space-y-8">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-gray-900">
                                    <span className="size-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                        <DescriptionIcon fontSize="small" />
                                    </span>
                                    Detail
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Title</label>
                                        <input
                                            {...method.register("title")}
                                            className={inputClass}
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                            <span className="text-gray-500">
                                                <ImageIcon fontSize="small" />
                                            </span>
                                            Banner
                                        </h3>
                                    </div>
                                    <div className="relative group aspect-2/3 w-full max-w-[580px] mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-red-500 transition-all cursor-pointer bg-gray-50">
                                        {previews.poster ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    alt="Poster Preview"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    src={previews.poster}
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
                                                <img
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    src={urlPoster + bannerData?.data.imageUrl}
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                                                    <span className="text-white mb-2">
                                                        <CloudUploadIcon fontSize="large" />
                                                    </span>
                                                    <span className="text-sm font-bold text-white uppercase tracking-tighter">
                                                        Upload new Image
                                                    </span>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, "bannerFile")}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-400 text-center mt-4 italic">
                                        Định dạng 2:3 (1000x1500px), JPG/PNG
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );

}