/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Link from "next/link";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  };

  return (
    <div className=" bg-black flex">
      <div className="w-full lg:w-1/2 flex md:items-center md:justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center ">
            <div className="  rounded-lg flex items-center justify-center">
              <img
                src="/logo/logo_cinema.png"
                alt="Cinema"
                className="w-40 h-40"
              />
            </div>
          </div>

          <h1 className="text-white text-4xl font-bold text-center mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-400 text-center mb-8">Chào mừng trở lại!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium block mb-2">
                Email hoặc Tên đăng nhập
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc tên đăng nhập"
                className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white text-sm font-medium">
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-gray-400 text-sm hover:text-white"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 placeholder:text-gray-600"
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

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-red-600 hover:text-red-500 font-semibold"
              >
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/auth/login.png"
          alt="Cinema"
          className="w-full h-auto object-cover"
        />
      </div>
    </div>
  );
}
