"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import { useMutation } from "@tanstack/react-query";
import {
  EmailOutlined,
  PersonOutline,
  PhoneIphoneOutlined,
  CalendarMonthOutlined,
  EditOutlined,
  SaveOutlined,
  CloseRounded,
} from "@mui/icons-material";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster, toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { IUser } from "@/types/data/auth/auth";
import { Profile } from "@/types/data/user/user";
import AccountSidebar from "@/app/component/account-sidebar/AccountSidebar";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700", "800"],
});

const inputClass =
  "w-full rounded-[16px] border border-[#2a2a2a] bg-[#161616] px-4 py-3 text-sm font-medium text-[#f5f5f5] outline-none transition-all duration-200 placeholder:text-[#737373] focus:border-[#5b1d22] focus:bg-[#1a1718] disabled:cursor-not-allowed disabled:bg-[#141414] disabled:text-[#bfbfbf]";

const labelClass =
  "mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a9a9a]";

const statCardClass =
  "rounded-[18px] border border-[#2a2a2a] bg-[#161616] px-5 py-4 transition-all duration-200 hover:border-[#3a2a2c] hover:bg-[#1b1718]";

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const form = useForm<IUser>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      createdAt: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    form.reset({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.createdAt
        ? dayjs(user.createdAt).format("YYYY-MM-DD")
        : "",
    });
  }, [user, form]);

  const editProfileMutation = useMutation({
    mutationFn: (data: Partial<IUser>) => Profile.editProfile(data),
    onSuccess: async () => {
      await refreshUser?.();
      toast.success("Cập nhật thông tin thành công");
      setEditing(false);
    },
    onError: () => {
      toast.error("Cập nhật thất bại, vui lòng thử lại");
    },
  });

  const onSubmit = (data: IUser) => {
    editProfileMutation.mutate({
      fullName: data.fullName,
      phone: data.phone,
    });
  };

  const initials =
    user?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(-2)
      .map((item) => item.charAt(0).toUpperCase())
      .join("") || "U";

  const joinedDate = user?.createdAt
    ? dayjs(user.createdAt).format("DD/MM/YYYY")
    : "--/--/----";

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.avatar}`
    : null;

  return (
    <main className={`${beVietnam.className} min-h-screen bg-[#121212] px-4 py-6 text-slate-100`}>
      <Toaster
        position="top-right"
        closeButton
        expand={false}
        visibleToasts={4}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "flex w-full items-start gap-3 rounded-2xl border border-[#2f2f2f] bg-[#171717] px-4 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.42)]",
            success: "border-[#275b39] bg-[#141a16]",
            error: "border-[#5b1d22] bg-[#1a1415]",
            warning: "border-[#6b4d1f] bg-[#1b1813]",
            info: "border-[#3b3b3b] bg-[#171717]",
            title: "text-sm font-bold leading-5 text-white",
            description: "text-sm leading-5 text-[#d4d4d4]",
            icon: "mt-0.5 shrink-0",
            closeButton:
              "rounded-lg border border-[#303030] bg-[#202020] text-[#d4d4d4] transition-colors hover:bg-[#2a2a2a] hover:text-white",
            actionButton:
              "rounded-lg bg-[#b91c1c] px-3 py-2 text-sm font-semibold text-white",
            cancelButton:
              "rounded-lg border border-[#303030] bg-[#202020] px-3 py-2 text-sm font-semibold text-white",
          },
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:flex-row">
        <AccountSidebar />

        <section className="flex-1">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[26px] border border-[#242424] bg-[#151515] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_390px]">
                <div className="border-b border-[#242424] px-6 py-6 sm:px-8 xl:border-b-0 xl:border-r">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-[#333333] bg-[#1a1a1a]">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#f0cf99,#cfa067)] text-[30px] font-black text-[#3d2713]">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#7c7c7c]">
                        Hồ sơ cá nhân
                      </p>
                      <h1 className="mt-2 text-[34px] font-black leading-none tracking-tight text-white">
                        {user?.fullName || "Người dùng"}
                      </h1>
                      <p className="mt-3 w-fit rounded-[14px] border border-[#2d2d2d] bg-[#121212] px-3 py-1.5 text-sm font-medium text-[#d4d4d4]">
                        {user?.email || "Chưa có email"}
                      </p>
                      <div className="mt-3 inline-flex rounded-[14px] border border-[#3d2528] bg-[#1b1415] px-3 py-1.5 text-sm font-bold text-[#fca5a5]">
                        Tài khoản đang hoạt động
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 border-t border-[#242424] p-4 sm:grid-cols-3 sm:gap-4 xl:border-t-0 xl:grid-cols-1 xl:gap-3">
                  <div className={statCardClass}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                      Thành viên từ
                    </p>
                    <p className="mt-3 text-[24px] font-black text-white">{joinedDate}</p>
                  </div>

                  <div className={statCardClass}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                      Liên hệ
                    </p>
                    <p className="mt-3 text-[24px] font-black text-white">
                      {user?.phone || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className={statCardClass}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                      Trạng thái chỉnh sửa
                    </p>
                    <p
                      className={`mt-3 text-[24px] font-black ${
                        editing ? "text-[#fca5a5]" : "text-white"
                      }`}
                    >
                      {editing ? "Đang sửa" : "Chế độ xem"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-[26px] border border-[#242424] bg-[#151515] px-6 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.32)] sm:px-8 sm:py-8"
            >
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#8f8f8f]">
                    Quản lý tài khoản
                  </p>
                  <h2 className="mt-3 text-[36px] font-black leading-none tracking-tight text-white">
                    Thông tin tài khoản
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">
                    Cập nhật thông tin cá nhân để hồ sơ của bạn luôn chính xác và đồng bộ trên hệ thống.
                  </p>
                </div>

                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#363636] bg-[#1a1a1a] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-[#4a2b2f] hover:bg-[#211819]"
                  >
                    <EditOutlined fontSize="small" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        form.reset();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#363636] bg-[#1a1a1a] px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:border-[#4a2b2f] hover:bg-[#211819]"
                    >
                      <CloseRounded fontSize="small" />
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={editProfileMutation.isPending}
                      className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#7b222a] bg-[#b91c1c] px-5 py-3 text-sm font-black text-white transition-all duration-200 hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <SaveOutlined fontSize="small" />
                      {editProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-8 h-px bg-[#262626]" />

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="xl:col-span-2">
                  <label className={labelClass}>
                    <PersonOutline sx={{ fontSize: 16 }} />
                    Họ và tên
                  </label>
                  <input
                    {...form.register("fullName")}
                    disabled={!editing}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <EmailOutlined sx={{ fontSize: 16 }} />
                    Email
                  </label>
                  <input
                    {...form.register("email")}
                    disabled
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <PhoneIphoneOutlined sx={{ fontSize: 16 }} />
                    Số điện thoại
                  </label>
                  <input
                    {...form.register("phone")}
                    disabled={!editing}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <CalendarMonthOutlined sx={{ fontSize: 16 }} />
                    Ngày đăng ký
                  </label>
                  <input
                    {...form.register("createdAt")}
                    type="date"
                    disabled
                    className={inputClass}
                  />
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
