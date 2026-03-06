"use client"

import { ICombo, IProductData, useCreateProductMutation, useEditProductMutation } from "@/types/data/concession/combo";
import { createVoucherSchema } from "@/types/data/voucher/schema/voucher";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNotification } from "@/hooks/useNotification";

export default function SingleForm({ onClose, refetchCombo, type, combo }: {
    onClose: () => void,
    refetchCombo: () => void,
    type: "create" | "edit",
    combo?: ICombo
}) {
    const n = useNotification();
    const methods = useForm<any>({
        defaultValues: combo,
        mode: "onChange",
        resolver: yupResolver(createVoucherSchema()),
    });
    const { mutate: createCombo } = useCreateProductMutation();
    const { mutate: editProduct } = useEditProductMutation();
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
    const [previews, setPreviews] = useState<{
        banner: string | null;
    }>({
        banner: null,
    });
    const onSubmit = async (data: IProductData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === "posterFile" && value instanceof FileList && value.length > 0) {
                formData.append("posterFile", value[0]);
            } else if (key === "bannerFile" && value instanceof FileList && value.length > 0) {
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
        if (type === "create") {
            createCombo(formData, {
                onSuccess: () => {
                    onClose();
                    n.success("Success");
                    methods.reset();
                    refetchCombo();
                },
                onError: (error) => {
                    n.error(error.message);
                },
            });
        }
        else {
            editProduct({ id: Number(combo?.id), payload: formData }, {
                onSuccess: () => {
                    onClose();
                    n.success("Cập nhật sản phẩm thành công");
                    methods.reset();
                    refetchCombo();
                },
                onError: (error) => {
                    n.error(error.message);
                },
            })
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "bannerFile") => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviews((prev) => ({
                ...prev,
                "banner": url,
            }));
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
        methods.setValue(fieldName, null as any);
    };
    return <>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-dark border border-border-dark w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-6 rounded-full" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">
                                1. Thông tin cơ bản
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-8 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider">
                                        Tên Sản Phẩm
                                    </label>
                                    <input
                                        className="w-full bg-background-dark border border-border-dark rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-surface-highlight"
                                        placeholder="Ví dụ: Bắp rang bơ vị Caramel (L)"
                                        type="text"
                                        {...methods.register("name")}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider">
                                            Giá bán (VNĐ)
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full border rounded-lg pl-4 pr-12 py-3 font-bold text-primary focus:ring-1 focus:ring-primary focus:border-primary"
                                                type="number"
                                                {...methods.register("price")}
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">
                                                VND
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider">
                                            Số lượng kho
                                        </label>
                                        <input
                                            className="w-full border border-border-dark rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-surface-highlight"
                                            placeholder="Số lượng nhập kho"
                                            {...methods.register("stock")}
                                            required
                                            type="number"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-4 space-y-1.5">
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
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-6 rounded-full" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">
                                2. Mô tả chi tiết
                            </h3>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider">
                                Mô tả sản phẩm
                            </label>
                            <textarea
                                className="w-full border border-border-dark rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-surface-highlight text-sm"
                                placeholder="Nhập mô tả ngắn về sản phẩm..."
                                rows={3}
                                defaultValue={""}
                                {...methods.register("description")}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-border-dark flex items-center justify-end bg-surface-dark/80 gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border font-medium hover:bg-surface-highlight transition-colors">
                        Hủy
                    </button>
                    <button className="px-8 py-2.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-primary/20 transition-all active:scale-95">
                        Lưu món mới
                    </button>
                </div>
            </div>
        </form>
        <div className="flex h-screen w-full overflow-hidden blur-[2px] pointer-events-none select-none">
        </div>
    </>

}