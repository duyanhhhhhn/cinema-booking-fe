'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  LockOutlined,
  PasswordOutlined,
  MarkEmailReadOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { Be_Vietnam_Pro } from "next/font/google";
import { Toaster, toast } from "sonner";

import AccountSidebar from "@/app/component/account-sidebar/AccountSidebar";
import { ChangePassword } from "@/types/data/user/changePassword";

interface FormData {
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

const beVietnam = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700", "800"],
});

export default function ChangePasswordPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  const form = useForm<FormData>({
    defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" },
  });

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

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const { mutate: changePassword, isPending: isChanging } = useMutation({
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
    "w-full rounded-[16px] border border-[#2a2a2a] bg-[#161616] px-4 py-3 text-sm font-medium text-[#f5f5f5] outline-none transition-all duration-200 placeholder:text-[#737373] focus:border-[#5b1d22] focus:bg-[#1a1718]";

  const labelClass =
    "mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a9a9a]";

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
          <div className="overflow-hidden rounded-[26px] border border-[#242424] bg-[#151515] shadow-[0_18px_50px_rgba(0,0,0,0.32)]">
            <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="border-b border-[#242424] px-6 py-6 sm:px-8 xl:border-b-0 xl:border-r">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-[#3a2a2c] bg-[#1b1415] text-[#f87171]">
                    <ShieldOutlined sx={{ fontSize: 28 }} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#7c7c7c]">
                      Bảo mật tài khoản
                    </p>
                    <h1 className="mt-2 text-[34px] font-black leading-none tracking-tight text-white">
                      Đổi mật khẩu
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a3a3a3]">
                      Nhập mã xác nhận từ email và đặt lại mật khẩu mới để bảo vệ tài khoản của bạn an toàn hơn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 border-t border-[#242424] p-4 sm:grid-cols-3 sm:gap-4 xl:border-t-0 xl:grid-cols-1 xl:gap-3">
                <div className="rounded-[18px] border border-[#2a2a2a] bg-[#161616] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                    Xác thực
                  </p>
                  <p className="mt-3 text-[22px] font-black text-white">
                    {otpSent ? "Đã gửi OTP" : "Chưa gửi OTP"}
                  </p>
                </div>

                <div className="rounded-[18px] border border-[#2a2a2a] bg-[#161616] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                    Gửi lại mã
                  </p>
                  <p className="mt-3 text-[22px] font-black text-white">
                    {resendCountdown > 0 ? `${resendCountdown}s` : "Sẵn sàng"}
                  </p>
                </div>

                <div className="rounded-[18px] border border-[#2a2a2a] bg-[#161616] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f8f8f]">
                    Trạng thái
                  </p>
                  <p className={`mt-3 text-[22px] font-black ${isChanging ? "text-[#fca5a5]" : "text-white"}`}>
                    {isChanging ? "Đang xử lý" : "Sẵn sàng"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#242424] px-6 py-6 sm:px-8 sm:py-8">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#8f8f8f]">
                    Xác minh qua email
                  </p>
                  <h2 className="mt-3 text-[30px] font-black leading-none tracking-tight text-white">
                    Gửi mã OTP
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendCountdown > 0}
                  className={`inline-flex items-center justify-center gap-2 rounded-[16px] border px-5 py-3 text-sm font-bold transition-all duration-200 ${
                    sendingOtp || resendCountdown > 0
                      ? "cursor-not-allowed border-[#303030] bg-[#1a1a1a] text-[#7d7d7d]"
                      : "border-[#7b222a] bg-[#b91c1c] text-white hover:bg-[#991b1b]"
                  }`}
                >
                  <MarkEmailReadOutlined sx={{ fontSize: 18 }} />
                  {sendingOtp
                    ? "Đang gửi OTP..."
                    : otpSent && resendCountdown > 0
                    ? `Gửi lại OTP (${resendCountdown}s)`
                    : otpSent
                    ? "Gửi lại OTP"
                    : "Gửi mã xác nhận đến email"}
                </button>
              </div>

              <div className="mb-8 h-px bg-[#262626]" />

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <PasswordOutlined sx={{ fontSize: 16 }} />
                    Mã xác nhận OTP
                  </label>
                  <input {...form.register("otp")} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>
                    <LockOutlined sx={{ fontSize: 16 }} />
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    {...form.register("newPassword")}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <LockOutlined sx={{ fontSize: 16 }} />
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    {...form.register("confirmNewPassword")}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isChanging}
                    className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#7b222a] bg-[#b91c1c] px-6 py-3 text-sm font-black text-white transition-all duration-200 hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <ShieldOutlined sx={{ fontSize: 18 }} />
                    {isChanging ? "Đang xử lý..." : "Đổi mật khẩu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
