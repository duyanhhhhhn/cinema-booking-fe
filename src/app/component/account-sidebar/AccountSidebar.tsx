'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';

import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/data/user/user';

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isProfile = pathname.includes('/account/profile');
  const isChangePassword = pathname.includes('/account/change-password');

  const baseBtn =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium transition';

  const activeBtn =
    'bg-[#b91c1c] text-[#fee2e2] shadow-inner shadow-red-900/40';

  const inactiveBtn =
    'text-slate-200 hover:bg-[#dc2626] hover:text-[#fee2e2]';

  /** ===== HELPER ===== */
  const getInitials = (name?: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .slice(-2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  /** ===== UPLOAD AVATAR ===== */
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => Profile.uploadAvatar(file),
    onSuccess: (res) => {
      toast.success('Cập nhật avatar thành công');
      updateUser({ avatarUrl: res.data });
    },
    onError: () => {
      toast.error('Upload avatar thất bại');
    },
  });

  const handleChangeAvatar = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 2MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatarMutation.mutate(file);
  };

  const avatarSrc =
    avatarPreview ||
    (user?.avatarUrl
      ? process.env.NEXT_PUBLIC_IMAGE_URL + user.avatarUrl
      : null);

  return (
    <aside className="w-full md:w-64 lg:w-72">
      <div className="flex h-full flex-col rounded-xl border border-[#3a2225] bg-[#1b0b0d] px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">

        {/* USER INFO */}
        <div>
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div className="relative group h-12 w-12 rounded-full overflow-hidden cursor-pointer border border-[#3a2225]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#f5dba8] to-[#c2955b] text-sm font-semibold text-[#4a2b10]">
                  {getInitials(user?.fullName)}
                </div>
              )}

              {/* OVERLAY */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
              >
                <CloudUploadIcon
                  fontSize="small"
                  className="text-white"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChangeAvatar}
              />
            </div>

            {/* USER NAME */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">
                {user?.fullName || 'Chưa cập nhật'}
              </span>
              <span className="text-xs text-slate-400">
                {user?.email}
              </span>
            </div>
          </div>

          {/* NAV */}
          <nav className="mt-8 space-y-1 text-[13px]">
            <button
              type="button"
              onClick={() => router.push('/account/profile')}
              className={`${baseBtn} ${
                isProfile ? activeBtn : inactiveBtn
              }`}
            >
              <i className="ti ti-user text-[13px]" />
              <span>Thông tin tài khoản</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/account/change-password')}
              className={`${baseBtn} ${
                isChangePassword ? activeBtn : inactiveBtn
              }`}
            >
              <i className="ti ti-lock text-[13px]" />
              <span>Thay đổi mật khẩu</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
