"use client";

import { useNotification } from "@/hooks/useNotification";
import { CartItem, Combo, ICombo, IComboData, initialComboData, useCreateComboMutation } from "@/types/data/concession/combo";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { yupResolver } from "@hookform/resolvers/yup";
import { Backdrop, Box, Fade, Modal } from "@mui/material";
import { useMemo, useState } from "react";
import { set, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { createVoucherSchema } from "@/types/data/voucher/schema/voucher";

export default function AddConcessionModal({ open, onClose, refetchCombo }: {
    open: boolean, onClose: () => void,
    refetchCombo: () => void
}) {
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
    const queryParams = useMemo(() => {
        return {
            page: 1,
            size: 10
        }
    }, [])
    const [previews, setPreviews] = useState<{
        banner: string | null;
    }>({
        banner: null,
    });
    const [cart, setCart] = useState<CartItem[]>([]);
    const { data } = useQuery({ ...Combo.objects.paginateQueryFactory(queryParams) });
    const product = data?.data;
    const product1 = product?.filter((item) => item.type === "SINGLE") || [];
    const n = useNotification();
    const { mutate: createCombo } = useCreateComboMutation();
    const methods = useForm<any>({
        defaultValues: initialComboData,
        mode: "onChange",
        resolver: yupResolver(createVoucherSchema()),
    });
    const increase = (id: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decrease = (id: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                        : item
                )
        );
    };
    const HandleAdd = (product: ICombo) => {
        setCart((prev) => {
            const index = prev.findIndex((p) => p.id === product.id);

            if (index !== -1) {
                return prev.map((item, i) =>
                    i === index
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    }
    const removeItem = (id: number) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };
    const onSubmit = async (data: IComboData) => {
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
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const price = 0;
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
                <div className="relative w-full max-w-4xl rounded-xl bg-white border border-zinc-200 flex flex-col max-h-[90vh] font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 p-6 shrink-0">
                        <h3 className="text-xl font-bold text-zinc-900">Add New Combo</h3>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100"
                        >
                            <CloseIcon />
                        </button>
                    </div>


                    {/* Form Body */}
                    <div className="bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <form
                            method="post"
                            onSubmit={methods.handleSubmit(onSubmit)}
                            className="bg-surface-dark border w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                            <div className="px-6 pt-4">
                                <div className="flex p-1 rounded-lg border border-border-dark">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm transition-all">
                                        Sản phẩm lẻ
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-bold shadow-sm  hover:text-white text-sm font-medium transition-all">
                                        Combo
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-6 border-b shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                                        Thêm Món Mới
                                    </h2>
                                    <p className="text-text-secondary text-sm">
                                        Cấu hình gói combo ưu đãi dành cho khách hàng
                                    </p>
                                </div>
                                <button className="text-white hover:text-black transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest">
                                            1. Thông tin cơ bản
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-8 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                                    Tên Combo
                                                </label>
                                                <input
                                                    className="w-full bg-dark border border-black rounded-lg px-4 py-3 text-black focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-surface-highlight"
                                                    placeholder="Ví dụ: Combo Solo Tiết Kiệm"
                                                    type="text"
                                                    id="combo_name"
                                                    {...methods.register("name")}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                                                        Giá bán ưu đãi (VNĐ)
                                                    </label>
                                                    <div className="relative">
                                                        <input min={0}
                                                            max={total}
                                                            className="w-full bg-dark border border-black rounded-lg pl-4 pr-12 py-3 text-black font-bold text-primary focus:ring-1 focus:ring-primary focus:border-primary" type="number"
                                                            id="combo_price"
                                                            {...methods.register("price")}
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-black">
                                                            VND
                                                        </span>
                                                    </div>
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
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest">
                                            2. Thành phần Combo
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                                        <div className="flex flex-col bg-background-dark/50 border border-black rounded-xl overflow-hidden">
                                            <div className="p-3 border-b border-black flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="material-symbols-outlined text-[18px]">
                                                            search
                                                        </span>
                                                    </span>
                                                    <input
                                                        className="w-full bg-surface-dark border border-border-dark rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:ring-primary focus:border-primary placeholder:text-text-secondary/50"
                                                        placeholder="Tìm sản phẩm..."
                                                        type="text"
                                                    />
                                                </div>
                                                <select className="bg-surface-dark border border-border-dark rounded-lg px-2 py-1.5 text-[11px] text-text-secondary focus:ring-primary outline-none">
                                                    <option>Tất cả</option>
                                                    <option>Bắp rang</option>
                                                    <option>Nước ngọt</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                                {
                                                    product1.map((item) => (
                                                        <div key={"pro1" + item.id} className="flex items-center justify-between p-2 hover:bg-surface-highlight/30 rounded-lg group transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-surface-highlight flex items-center justify-center shrink-0">
                                                                    <span className="material-symbols-outlined text-sm">
                                                                        <Box
                                                                            component="div"
                                                                            sx={{
                                                                                width: 48,
                                                                                height: 64,
                                                                                backgroundImage: `url(${urlImage}${item.imageUrl})`,
                                                                                backgroundSize: "cover",
                                                                                backgroundPosition: "center",
                                                                                borderRadius: 1,
                                                                            }}
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold">
                                                                        {item.name}
                                                                    </p>
                                                                    <p className="text-[10px]">
                                                                        {item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })} - {item.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => HandleAdd(item)}
                                                                className="w-7 h-7 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 rounded-md transition-all">
                                                                <span className="text-sm">
                                                                    add
                                                                </span>
                                                            </button>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="flex flex-col bg-background-dark/50 border border-border-dark rounded-xl overflow-hidden">
                                            <div className="p-3 border-b border-border-dark flex justify-between items-center bg-surface-highlight/10">
                                                <span className="text-xs font-bold text-black uppercase tracking-wider">
                                                    Sản phẩm đã chọn
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold">
                                                    {cart.length || 0} MÓN
                                                </span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                                {cart.map((item) => (
                                                    <div key={"cart" + item.id} className="bg-surface-dark/60 border border-border-dark/50 p-2.5 rounded-lg flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-background-dark flex items-center justify-center shrink-0 border border-border-dark">
                                                                <span className="material-symbols-outlined">
                                                                    <Box
                                                                        component="div"
                                                                        sx={{
                                                                            width: 48,
                                                                            height: 64,
                                                                            backgroundImage: `url(${urlImage}${item.imageUrl})`,
                                                                            backgroundSize: "cover",
                                                                            backgroundPosition: "center",
                                                                            borderRadius: 1,
                                                                        }}
                                                                    />
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold leading-tight">
                                                                    {item.name}
                                                                </p>
                                                                <p className="text-[10px]">
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center bg-background-dark border border-border-dark rounded overflow-hidden">
                                                                <button
                                                                    onClick={() => { decrease(item.id) }}
                                                                    className="w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-surface-highlight transition-colors">
                                                                    <span className="material-symbols-outlined text-xs">
                                                                        -
                                                                    </span>
                                                                </button>
                                                                <input
                                                                    className="w-8 bg-transparent text-center text-xs font-bold text-black p-0 focus:ring-0"
                                                                    type="text"
                                                                    value={item.quantity}
                                                                    readOnly
                                                                />
                                                                <button
                                                                    onClick={() => { increase(item.id) }}
                                                                    className="w-6 h-6 flex items-center justify-center text-text-secondary hover:bg-surface-highlight transition-colors">
                                                                    <span className="material-symbols-outlined text-xs">
                                                                        +
                                                                    </span>
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => { removeItem(item.id) }}
                                                                className="bg-red-500 hover:bg-red-600 transition-colors">
                                                                <span className="material-symbols-outlined text-white text-[18px]">
                                                                    remove
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 border-t border-border-dark bg-background-dark/80">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold text-text-secondary uppercase">
                                                        Tổng tiền lẻ cộng dồn
                                                    </span>
                                                    <span className="text-xs font-bold text-black">{total.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold uppercase">
                                                        Ưu đãi combo
                                                    </span>
                                                    <span className="text-xs font-bold">- {price.toLocaleString()}đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-border-dark flex items-center justify-between bg-surface-dark shrink-0">
                                <div className="hidden md:block">
                                    <p className="text-xs text-text-secondary italic">
                                        Các sản phẩm lẻ trong combo sẽ được trừ tồn kho khi bán.
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-red-500 border text-white font-medium hover:bg-surface-highlight transition-colors">
                                        Hủy
                                    </button>
                                    <button type="submit" className="flex-1 md:flex-none px-10 py-2.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-primary/20 transition-all active:scale-95">
                                        Lưu món mới
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="flex h-screen w-full overflow-hidden blur-[4px] pointer-events-none select-none">
                        <aside className="hidden w-64 flex-col bg-background-dark border-r border-border-dark lg:flex shrink-0">
                            <div className="flex h-full flex-col justify-between p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3 items-center pb-4 border-b border-border-dark">
                                        <div
                                            className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDlSCxDP50sM2DnE56TVE5Ka9ysqNGnVRptwX6XPFuWuDoLe7NW_uYA6D-VK8WTFw50MpyrwacRKAoRX3MlpVudwzW8U4G8bFjfy1qfb5dZazsiJT50lLFZIX_1PFXlKzjzXzw-JMEmrnBZJZGF7j8y6YSrmSk3YChbGxemJEAsWuYIk1lTTH36ABFjdf8oBAwEH8XJp1P_CsoIm7cD2nghmus_ahOUeRJFl9EXq0KCo4O6ymb10O3_LNGsDEERTyjm07fRXG5EiLh-")'
                                            }}
                                        />
                                        <div className="flex flex-col">
                                            <h1 className="text-white text-base font-bold">Cinema Admin</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                        <main className="flex-1 flex flex-col h-full bg-background-dark relative">
                            <header className="border-b border-border-dark p-6">
                                <h1 className="text-white text-3xl font-bold">Quản lý F&amp;B</h1>
                            </header>
                        </main>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}