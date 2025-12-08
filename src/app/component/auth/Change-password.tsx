"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const baseInputClass =
  "w-full rounded-xl border border-[#3a2225] bg-[#1b0d10] px-4 py-3 text-sm text-slate-50 placeholder:text-[#b3a6aa] focus:outline-none focus:ring-2 focus:ring-[#f97373]/80 focus:border-[#f97373]/80 transition";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    // TODO: call API đổi mật khẩu
  };

  return (
    <div className="flex-1 flex justify-center px-4 sm:px-8 lg:px-24 py-10">
      <div className="w-full max-w-6xl">
        <main className="pt-2">
          {/* Breadcrumb */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#9b8e93]">
            <a href="#" className="hover:text-slate-50 transition">
              Trang chủ
            </a>
            <span>/</span>
            <a href="#" className="hover:text-slate-50 transition">
              Tài khoản của tôi
            </a>
            <span>/</span>
            <span className="text-slate-50">Đổi mật khẩu</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-[32px] font-black leading-tight tracking-tight text-slate-50">
              Đổi Mật khẩu
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#b0a5a8]">
              Để bảo vệ tài khoản của bạn, vui lòng không chia sẻ mật khẩu cho
              người khác.
            </p>
          </div>

          {/* Card form – căn giữa và rộng hơn */}
          <div className="w-full max-w-[960px] mx-auto mt-10">
            <div className="rounded-2xl border border-[#2b171a] bg-[#12090b] px-4 py-6 sm:px-8 sm:py-8 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mật khẩu hiện tại */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-50">
                    Mật khẩu hiện tại
                  </span>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại của bạn"
                      className={`${baseInputClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((prev) => !prev)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#a89a9e] hover:text-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showCurrentPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </label>

                {/* Mật khẩu mới */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-50">
                    Mật khẩu mới
                  </span>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      className={`${baseInputClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#a89a9e] hover:text-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showNewPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </label>

                {/* Xác nhận mật khẩu mới */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-50">
                    Xác nhận mật khẩu mới
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) =>
                        setConfirmNewPassword(e.target.value)
                      }
                      placeholder="Nhập lại mật khẩu mới của bạn"
                      className={`${baseInputClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmNewPassword((prev) => !prev)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#a89a9e] hover:text-slate-50 transition"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirmNewPassword
                          ? "visibility"
                          : "visibility_off"}
                      </span>
                    </button>
                  </div>
                </label>

                {error && (
                  <p className="text-sm text-[#f97373] pt-1">{error}</p>
                )}

                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg bg-[#f04438] px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_8px_24px_rgba(240,68,56,0.45)] hover:bg-[#f25544] focus:outline-none focus:ring-2 focus:ring-[#f97373] focus:ring-offset-2 focus:ring-offset-[#12090b] transition disabled:opacity-60"
                  >
                    {loading ? "Đang đổi mật khẩu..." : "Lưu Thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
