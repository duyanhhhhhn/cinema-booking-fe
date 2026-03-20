"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster, toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar as AvatarModel } from "@/types/data/user/avatar";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700", "800"],
});

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isProfile =
    pathname.includes("/account/profile") || pathname === "/profile";
  const isChangePassword =
    pathname.includes("/account/change-password") ||
    pathname === "/change-password";

  const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  const baseBtn =
    "group flex w-full items-center gap-3 rounded-[18px] border px-4 py-3 text-left transition-all duration-200";
  const activeBtn =
    "border-[#5b1d22] bg-[#1a1415] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)]";
  const inactiveBtn =
    "border-[#242424] bg-[#161616] text-[#d1d5db] hover:border-[#3a2a2c] hover:bg-[#1b1718] hover:text-white";

  const iconWrap = (active: boolean) =>
    active
      ? "border-[#7b222a] bg-[#2a1719] text-[#ef4444]"
      : "border-[#2e2e2e] bg-[#1b1b1b] text-[#9ca3af] group-hover:border-[#503033] group-hover:bg-[#221718] group-hover:text-[#f3f4f6]";

  const handleChangeAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 1MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsUploading(true);
      await AvatarModel.uploadAvatar(file);
      toast.success("Cập nhật avatar thành công");
      await refreshUser?.();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật avatar thất bại");
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const avatarSrc = avatarPreview
    ? avatarPreview
    : user?.avatar
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.avatar}`
      : null;

  return (
    <aside className={`${beVietnam.className} w-full md:w-[300px] lg:w-[320px]`}>
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

      <div className="flex h-full flex-col rounded-[26px] border border-[#242424] bg-[#151515] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
        <div className="rounded-[22px] border border-[#2a2a2a] bg-[#121212] p-4">
          <div className="flex items-start gap-4">
            <div
              className="group relative h-[72px] w-[72px] shrink-0 cursor-pointer overflow-hidden rounded-[20px] border border-[#333333] bg-[#1a1a1a]"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className={`h-full w-full object-cover transition-all duration-300 ${
                    isUploading ? "opacity-60" : "group-hover:scale-110"
                  }`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#f0cf99,#cfa067)] text-lg font-extrabold text-[#3d2713]">
                  {getInitials(user?.fullName)}
                </div>
              )}

              {!isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-all duration-200 group-hover:opacity-100">
                  <CameraAltOutlinedIcon sx={{ fontSize: 20 }} className="text-white" />
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <CloudUploadRoundedIcon sx={{ fontSize: 20 }} className="text-white" />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChangeAvatar}
                disabled={isUploading}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-extrabold tracking-tight text-white">
                {user?.fullName || "Chưa cập nhật"}
              </p>
              <p className="mt-1 break-all text-[13px] font-medium leading-5 text-[#9ca3af]">
                {user?.email || "Chưa có email"}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-[14px] border border-[#342124] bg-[#1b1415] px-3 py-1.5 text-[12px] font-semibold text-[#fca5a5]">
                <CloudUploadRoundedIcon sx={{ fontSize: 15 }} />
                {isUploading ? "Đang tải ảnh lên" : "Nhấn ảnh để đổi avatar"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-[#2a2a2a] bg-[#121212] p-3">
          <p className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c7c7c]">
            Tài khoản
          </p>

          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className={`${baseBtn} ${isProfile ? activeBtn : inactiveBtn}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-200 ${iconWrap(isProfile)}`}
              >
                <PersonOutlineRoundedIcon sx={{ fontSize: 19 }} />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-bold">Thông tin tài khoản</span>
                <span className="mt-0.5 text-[12px] font-medium text-[#8f8f8f]">
                  Hồ sơ và dữ liệu cá nhân
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/change-password")}
              className={`${baseBtn} ${isChangePassword ? activeBtn : inactiveBtn}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-200 ${iconWrap(isChangePassword)}`}
              >
                <LockOutlinedIcon sx={{ fontSize: 19 }} />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[14px] font-bold">Thay đổi mật khẩu</span>
                <span className="mt-0.5 text-[12px] font-medium text-[#8f8f8f]">
                  Cập nhật bảo mật tài khoản
                </span>
              </span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
