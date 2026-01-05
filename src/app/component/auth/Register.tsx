/* eslint-disable react-hooks/incompatible-library */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import {
  useRegisterMutation,
  useRegisterOtpMutation,
  IRegisterPayload,
} from "@/types/data/auth/auth";
import { useNotification } from "@/hooks/useNotification";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const n = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [time, setTime] = useState(120); // 2 phút = 120 giây
  const [otpSent, setOtpSent] = useState(false);
  
  useEffect(() => {
    if (otpSent && time > 0) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, time]);
  
  const router = useRouter();

  
  const method = useForm<IRegisterPayload>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      otp: "",
    },
  });
  const handleOtp = async (email: string) => {
    registerOtp(
      { email },
      {
        onSuccess: () => {
          n.success("Mã OTP đã được gửi đến email của bạn");
          setOtpSent(true);
          setTime(120); // Reset về 2 phút
        },
        onError: (error) => {
          n.error(error.message || "Gửi mã OTP thất bại");
        },
      }
    );
  };

  const { mutate: registerOtp, isPending: isRegisterOtpPending } =
    useRegisterOtpMutation();
  const { mutate: register, isPending: isRegisterPending } =
    useRegisterMutation();
  const email = method.watch("email");
  const handleRegister = async (payload: IRegisterPayload) => {
    register(payload, {
      onSuccess: () => {
        n.success("Đăng ký thành công");
        router.push("/login");
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  };


  return (
    <div className=" from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-800">
          <h1 className="text-white text-3xl font-bold text-center mb-2">
            Đăng ký
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Tạo tài khoản mới để trải nghiệm những bộ phim hay nhất.
          </p>

          <form
            onSubmit={method.handleSubmit(handleRegister)}
            className="space-y-5"
          >
            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                {...method.register("fullName")}
                placeholder="Nhập họ và tên của bạn"
                className="w-full bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => method.setValue("email", e.target.value)}
                placeholder="Nhập địa chỉ email"
                className="w-full bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Số điện thoại
              </label>
              <input
                {...method.register("phone")}
                type="tel"
                placeholder="Nhập số điện thoại"
                className="w-full bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...method.register("password")}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? (
                    <VisibilityOff className="w-5 h-5" />
                  ) : (
                    <Visibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...method.register("confirmPassword")}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <VisibilityOff className="w-5 h-5" />
                  ) : (
                    <Visibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Mã OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  {...method.register("otp")}
                  placeholder="------"
                  maxLength={6}
                  className="flex-1 bg-[#0f0f1e] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent placeholder:text-gray-600 text-center tracking-widest"
                />
                <button
                  type="button"
                  disabled={!email || isRegisterOtpPending || (otpSent && time > 0)}
                  onClick={() => handleOtp(email ?? "")}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 cursor-pointer"
                >
                  {isRegisterOtpPending 
                    ? "Đang gửi mã OTP..." 
                    : otpSent && time > 0
                    ? `Gửi lại (${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')})`
                    : "Gửi mã OTP"}
                </button>
              </div>
              {otpSent && time > 0 && (
                <div className="flex justify-center mt-2">
                  <p className="text-gray-400 text-sm">
                    Có thể gửi lại sau {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
                  </p>
                </div>
              )}
             
            </div>

            <button
              type="submit"
              disabled={isRegisterOtpPending || isRegisterPending}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegisterPending ? "Đang đăng ký..." : "Đăng ký"}
            </button>
            <p className="text-center text-gray-400 text-sm">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-red-600 hover:text-red-500 font-semibold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
