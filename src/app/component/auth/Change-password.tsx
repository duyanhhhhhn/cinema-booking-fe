'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import AccountSidebar from "@/app/component/account-sidebar/AccountSidebar";
import { ChangePassword } from "@/types/data/user/changePassword";

interface FormData {
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ChangePasswordPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  const form = useForm<FormData>({
    defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" },
  });

  /** ====================== SEND OTP ====================== */
  const { mutate: sendOtp } = useMutation({
    mutationFn: () => ChangePassword.sendOtp(),
    onSuccess: () => {
      toast.success("OTP đã được gửi tới email!");
      setOtpSent(true);
      setResendCountdown(60);
    },
    onError: () => toast.error("Gửi OTP thất bại, vui lòng thử lại"),
  });

  const handleSendOtp = () => {
    setSendingOtp(true);
    sendOtp(undefined, { onSettled: () => setSendingOtp(false) });
  };

  /** ====================== COUNTDOWN ====================== */
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  /** ====================== CHANGE PASSWORD ====================== */
  const { mutate: changePassword, isLoading: isChanging } = useMutation({
    mutationFn: (data: { otp: string; newPassword: string }) =>
      ChangePassword.verify(data),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      form.reset();
      setOtpSent(false);
    },
    onError: () => toast.error("Đổi mật khẩu thất bại, vui lòng thử lại"),
  });

  const onSubmit = (data: FormData) => {
    if (!otpSent) return toast.error("Vui lòng gửi OTP trước khi đổi mật khẩu");
    if (data.newPassword !== data.confirmNewPassword)
      return toast.error("Mật khẩu mới không khớp");
    if (data.newPassword.length < 6)
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự");

    changePassword({ otp: data.otp, newPassword: data.newPassword });
  };

  const inputClass =
    "w-full rounded-md border border-[#3a2225] bg-[#14080a] px-3 py-2 text-slate-100";

  /** ====================== RENDER ====================== */
  return (
    <main className="min-h-screen bg-[#120608] flex justify-center">
      <div className="w-full max-w-7xl flex gap-6">
        <AccountSidebar />

        <section className="flex-1">
          <div className="rounded-xl border border-[#3a2225] bg-[#1f1012] px-6 py-6 shadow text-slate-100">
            <h1 className="text-xl font-semibold mb-4">Đổi mật khẩu</h1>

            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="rounded-md bg-[#e31b23] px-6 py-2 text-white hover:bg-[#f04349]"
              >
                {sendingOtp ? "Đang gửi OTP..." : "Gửi mã xác nhận đến email"}
              </button>
            )}

            {otpSent && (
              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-sm mb-1">OTP</label>
                  <input
                    {...form.register("otp")}
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendCountdown > 0}
                  className={`text-sm ${
                    resendCountdown > 0
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-[#e31b23] hover:underline"
                  }`}
                >
                  {resendCountdown > 0
                    ? `Gửi lại OTP (${resendCountdown}s)`
                    : sendingOtp
                    ? "Đang gửi lại..."
                    : "Gửi lại OTP"}
                </button>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  {...form.register("newPassword")}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  {...form.register("confirmNewPassword")}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isChanging}
                className="rounded-md bg-[#e31b23] px-6 py-2 text-white hover:bg-[#f04349]"
              >
                {isChanging ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
