'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { useAuth } from '@/contexts/AuthContext';
import { IUser } from '@/types/data/auth/auth';
import { Profile } from '@/types/data/user/user';
import AccountSidebar from '@/app/component/account-sidebar/AccountSidebar';

const baseInputClass =
  'w-full rounded-md border border-[#3a2225] bg-[#14080a] px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition disabled:cursor-not-allowed disabled:opacity-70';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const form = useForm<IUser>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      createdAt: '',
    },
  });

  /** ======================
   * RESET FORM KHI USER THAY ĐỔI
   ====================== */
  useEffect(() => {
    if (!user) return;

    form.reset({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      createdAt: user.createdAt
        ? dayjs(user.createdAt).format('YYYY-MM-DD')
        : '',
    });
  }, [user, form]);

  /** ======================
   * EDIT PROFILE MUTATION
   ====================== */
  const editProfileMutation = useMutation({
    mutationFn: (data: Partial<IUser>) => Profile.editProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật thông tin thành công');
      setEditing(false);
    },
    onError: () => {
      toast.error('Cập nhật thất bại, vui lòng thử lại');
    },
  });

  const onSubmit = (data: IUser) => {
    editProfileMutation.mutate({
      fullName: data.fullName,
      phone: data.phone,
    });
  };

  return (
    <main className="min-h-screen bg-[#120608] flex justify-center">
    <div className="w-full max-w-7xl flex gap-6">
      {/* SIDEBAR */}
      <AccountSidebar />

      {/* MAIN CONTENT */}
      <section className="flex-1">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="h-full rounded-xl border border-[#3a2225] bg-[#1f1012] px-6 py-6 sm:px-8 sm:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.75)]"
        >
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-50">
                Thông tin tài khoản
              </h1>
              <p className="mt-1 text-xs text-slate-300/80">
                Quản lý thông tin cá nhân để chúng tôi phục vụ tốt hơn.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md border border-slate-500/70 px-4 py-1.5 text-xs text-slate-100 hover:bg-slate-500/10"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    form.reset();
                  }}
                  className="rounded-md border border-slate-600 px-4 py-1.5 text-xs text-slate-100 hover:bg-slate-500/10"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editProfileMutation.isLoading}
                  className="rounded-md bg-[#e31b23] px-4 py-1.5 text-xs text-white hover:bg-[#f04349] disabled:opacity-70"
                >
                  {editProfileMutation.isLoading
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>

          <div className="mb-6 h-px bg-[#3a2225]" />

          {/* FORM */}
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium mb-1">
                Họ và Tên
              </label>
              <input
                {...form.register('fullName')}
                disabled={!editing}
                className={baseInputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Email
                </label>
                <input
                  {...form.register('email')}
                  disabled
                  className={baseInputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Số điện thoại
                </label>
                <input
                  {...form.register('phone')}
                  disabled={!editing}
                  className={baseInputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Ngày đăng ký
                </label>
                <input
                  {...form.register('createdAt')}
                  type="date"
                  disabled
                  className={baseInputClass}
                />
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
    </main>
  );
}
