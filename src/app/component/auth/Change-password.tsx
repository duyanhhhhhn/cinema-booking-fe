"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            {/* ====== MAIN ====== */}
            <main className="flex-1 px-4 py-8 sm:px-10">

              {/* Breadcrumb */}
              <div className="flex flex-wrap gap-2 mb-8">
                <a className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal" href="#">Trang chủ</a>
                <span className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">/</span>
                <a className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal" href="#">Tài khoản của tôi</a>
                <span className="text-gray-600 dark:text-gray-400 text-base font-medium leading-normal">/</span>
                <span className="text-black dark:text-white text-base font-medium leading-normal">Đổi mật khẩu</span>
              </div>

              {/* Title */}
              <div className="mb-10">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-black dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                      Đổi Mật khẩu
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-base font-normal leading-normal">
                      Để bảo vệ tài khoản của bạn, vui lòng không chia sẻ mật khẩu cho người khác.
                    </p>
                  </div>
                </div>
              </div>

              {/* Box Form */}
              <div className="bg-white dark:bg-black/20 p-6 sm:p-8 rounded-xl border border-black/10 dark:border-white/10">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="flex flex-col w-full gap-6">

                    {/* ----- Mật khẩu hiện tại ----- */}
                    <label className="flex flex-col w-full">
                      <p className="text-black dark:text-white text-base font-medium leading-normal pb-2">
                        Mật khẩu hiện tại
                      </p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Nhập mật khẩu hiện tại của bạn"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/20 dark:border-white/20 bg-transparent focus:border-primary h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                          required
                        />
                        <div
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="text-gray-500 dark:text-gray-400 flex border border-black/20 dark:border-white/20 bg-transparent items-center justify-center px-[15px] rounded-r-lg border-l-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                            {showCurrentPassword ? "visibility" : "visibility_off"}
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* ----- Mật khẩu mới ----- */}
                    <label className="flex flex-col w-full">
                      <p className="text-black dark:text-white text-base font-medium leading-normal pb-2">
                        Mật khẩu mới
                      </p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/20 dark:border-white/20 bg-transparent focus:border-primary h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                          required
                        />
                        <div
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="text-gray-500 dark:text-gray-400 flex border border-black/20 dark:border-white/20 bg-transparent items-center justify-center px-[15px] rounded-r-lg border-l-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                            {showNewPassword ? "visibility" : "visibility_off"}
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* ----- Xác nhận mật khẩu ----- */}
                    <label className="flex flex-col w-full">
                      <p className="text-black dark:text-white text-base font-medium leading-normal pb-2">
                        Xác nhận mật khẩu mới
                      </p>
                      <div className="flex w-full flex-1 items-stretch rounded-lg">
                        <input
                          type={showConfirmNewPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới của bạn"
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/20 dark:border-white/20 bg-transparent focus:border-primary h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                          required
                        />
                        <div
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          className="text-gray-500 dark:text-gray-400 flex border border-black/20 dark:border-white/20 bg-transparent items-center justify-center px-[15px] rounded-r-lg border-l-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                            {showConfirmNewPassword ? "visibility" : "visibility_off"}
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  {/* Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center rounded-lg h-12 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] px-8 py-3 w-full sm:w-auto disabled:opacity-50"
                    >
                      {loading ? "Đang đổi mật khẩu..." : "Lưu Thay đổi"}
                    </button>
                  </div>
                </form>
              </div>

            </main>

          </div>
        </div>
      </div>
    </div>
  );
}
