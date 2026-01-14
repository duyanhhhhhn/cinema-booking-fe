'use client';

import React, { useState, ChangeEvent } from 'react';

type Gender = 'male' | 'female' | 'other';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
}

const baseInputClass =
  'w-full rounded-md border border-[#3a2225] bg-[#14080a] px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition disabled:cursor-not-allowed disabled:opacity-70';

export default function AccountProfilePage() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormState>({
    fullName: 'Nguyễn Văn A',
    email: 'nguyen.vana@example.com',
    phone: '0901234567',
    dateOfBirth: '1995-11-08',
    gender: 'male',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: gọi API lưu dữ liệu
    setEditing(false);
  };

  return (
    <main className="min-h-200 bg-[#120608] flex items-center justify-center px-4 py-6 text-slate-100">
      <div className="w-full max-w-7xl min-h-[450px] flex flex-col gap-6 md:flex-row">
        {/* SIDEBAR */}
        <aside className="w-full md:w-64 lg:w-72">
          <div className="flex h-full flex-col rounded-xl border border-[#3a2225] bg-[#1b0b0d] px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">
            {/* User block */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#f5dba8] to-[#c2955b] text-sm font-semibold text-[#4a2b10]">
                  NA
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">
                    Nguyễn Văn A
                  </span>
                  <button className="mt-1 w-max rounded-full bg-[#f97373] px-2.5 py-0.5 text-[11px] font-medium text-white">
                    Thay đổi ảnh
                  </button>
                </div>
              </div>

              {/* Nav list */}
              <nav className="mt-8 space-y-1 text-[13px]">
                <button className="flex w-full items-center gap-2 rounded-md bg-[#b91c1c] px-3 py-2 text-left text-[13px] font-medium text-[#fee2e2] shadow-inner shadow-red-900/40 transition hover:bg-[#dc2626]">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-red-900/80">
                    <i className="ti ti-user text-[11px]" />
                  </span>
                  <span>Thông tin tài khoản</span>
                </button>

                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-slate-200/80 transition hover:bg-[#261013] hover:text-slate-50">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-500/60">
                    <i className="ti ti-ticket text-[11px]" />
                  </span>
                  <span>Lịch sử đặt vé</span>
                </button>

                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-slate-200/80 transition hover:bg-[#261013] hover:text-slate-50">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-500/60">
                    <i className="ti ti-credit-card text-[11px]" />
                  </span>
                  <span>Thẻ thành viên</span>
                </button>
              </nav>
            </div>

            {/* Logout */}
            <button className="mt-10 flex items-center gap-2 text-[13px] text-slate-400 transition hover:text-slate-100">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-slate-600">
                <i className="ti ti-logout-2 text-[11px]" />
              </span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">
          <div className="h-full rounded-xl border border-[#3a2225] bg-[#1f1012] px-6 py-6 sm:px-8 sm:py-7 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-wide text-slate-50">
                  Thông tin tài khoản
                </h1>
                <p className="mt-1 text-xs text-slate-300/80">
                  Quản lý thông tin cá nhân để chúng tôi phục vụ tốt hơn.
                </p>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center justify-center rounded-md border border-slate-500/70 bg-transparent px-4 py-1.5 text-xs font-medium text-slate-100 transition hover:border-slate-300 hover:bg-slate-500/10"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-transparent px-4 py-1.5 text-xs font-medium text-slate-100 transition hover:border-slate-300 hover:bg-slate-500/10"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center rounded-md bg-[#e31b23] px-4 py-1.5 text-xs font-medium text-white shadow-[0_10px_30px_rgba(248,113,113,0.45)] transition hover:bg-[#f04349]"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mb-6 h-px bg-[#3a2225]" />

            {/* Form */}
            <form className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-slate-100">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!editing}
                  className={baseInputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-100">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className={baseInputClass}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-100">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    className={baseInputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-slate-100">
                    Ngày đăng ký
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled
                    className={baseInputClass}
                  />
                </div>

                <div>
                  <span className="mb-1 block text-[12px] font-medium text-slate-100">
                    Giới tính
                  </span>
                  <div className="mt-1 flex items-center gap-6 text-xs text-slate-200">
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleChange}
                        disabled={!editing}
                        className="h-3.5 w-3.5 border border-slate-500 bg-transparent text-[#e31b23] focus:ring-1 focus:ring-[#e31b23]"
                      />
                      <span>Nam</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleChange}
                        disabled={!editing}
                        className="h-3.5 w-3.5 border border-slate-500 bg-transparent text-[#e31b23] focus:ring-1 focus:ring-[#e31b23]"
                      />
                      <span>Nữ</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleChange}
                        disabled={!editing}
                        className="h-3.5 w-3.5 border border-slate-500 bg-transparent text-[#e31b23] focus:ring-1 focus:ring-[#e31b23]"
                      />
                      <span>Khác</span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}