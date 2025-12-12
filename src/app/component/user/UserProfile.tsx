"use client";

import Head from "next/head";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "Nguyen Van A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    dateOfBirth: "1995-08-15",
    gender: "male",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBU9_GeKTb6bZJzJV3Gc6V0yReaJm8q9iLUL95Hj3M4Ey9Jh6yxIojnEokEaFJsIAR5ZJbaMAweawXF7gPNeEwxJKIlKP1SKXSyVunztvDP3gCFV0Lt9QVW8AQWvoq8R25fsUZJ-hATz4VCxtNNBeGPTVRC0nkk746DzcyBglZjj5tcIqUWY7B7hqzBIo8fBEhCebu_WV3xvfvP31wp6jKT_d8OYwVxacYlYM20tMfOr1ukn78ShH8eUjWk8hw8qTlyztWnq8JfTtOZ",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call your API here
    alert("Đã lưu (demo). Thay bằng call API của bạn");
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Profile Khách hàng</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24}`}</style>
      </Head>

      <div className="font-display bg-background-light dark:bg-background-dark min-h-screen">
        

        <main className="flex justify-center p-6">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Sidebar */}
              <aside className="md:col-span-4 lg:col-span-3">
                <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12"
                          style={{ backgroundImage: `url(${profile.avatar})` }}
                        />
                      </div>

                      <div>
                        <h1 className="text-base font-medium text-slate-900 dark:text-white">{profile.fullName}</h1>
                        <p className="text-sm text-primary cursor-pointer">Thay đổi ảnh</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <a className="flex items-center gap-3 rounded-md bg-primary/10 px-3 py-2 text-primary" href="#">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' 1` }}>person</span>
                        <p className="text-sm font-medium">Thông tin tài khoản</p>
                      </a>

                      <a className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" href="#">
                        <span className="material-symbols-outlined text-xl">history</span>
                        <p className="text-sm font-medium">Lịch sử đặt vé</p>
                      </a>

                      <a className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" href="#">
                        <span className="material-symbols-outlined text-xl">confirmation_number</span>
                        <p className="text-sm font-medium">Thẻ thành viên</p>
                      </a>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <a className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" href="#">
                      <span className="material-symbols-outlined text-xl">logout</span>
                      <p className="text-sm font-medium">Đăng xuất</p>
                    </a>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div className="md:col-span-8 lg:col-span-9">
                <div className="flex flex-col gap-8 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5 sm:p-6 md:p-8">
                  <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold">Thông tin tài khoản</p>
                    <p className="text-sm text-slate-500">Quản lý thông tin của bạn để chúng tôi phục vụ tốt hơn.</p>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <label className="flex flex-col sm:col-span-2">
                      <p className="pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Họ và Tên</p>
                      <input
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleChange}
                        className="form-input h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-white/20 dark:text-white"
                      />
                    </label>

                    <label className="flex flex-col">
                      <p className="pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Email</p>
                      <input
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        disabled
                        className="form-input h-11 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 focus:outline-none dark:border-white/20 dark:bg-white/5 dark:text-slate-400"
                      />
                    </label>

                    <label className="flex flex-col">
                      <p className="pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại</p>
                      <input
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="form-input h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-white/20 dark:text-white"
                      />
                    </label>

                    <label className="flex flex-col">
                      <p className="pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Ngày sinh</p>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleChange}
                        className="form-input h-11 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-white/20 dark:text-white"
                      />
                    </label>

                    <div className="flex flex-col">
                      <p className="pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Giới tính</p>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={profile.gender === "male"}
                            onChange={handleChange}
                            className="form-radio h-4 w-4"
                          />
                          <span className="text-sm">Nam</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={profile.gender === "female"}
                            onChange={handleChange}
                            className="form-radio h-4 w-4"
                          />
                          <span className="text-sm">Nữ</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={profile.gender === "other"}
                            onChange={handleChange}
                            className="form-radio h-4 w-4"
                          />
                          <span className="text-sm">Khác</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2 mt-2 flex gap-3 justify-end border-t border-slate-200 pt-6 dark:border-white/10">
                      <button type="button" className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-slate-200 px-6 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-white">Hủy</button>
                      <button type="submit" className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white">Lưu thay đổi</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
