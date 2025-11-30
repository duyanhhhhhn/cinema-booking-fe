"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Handle login logic here
      console.log("Login:", formData);
    }, 1000);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <i className="ti ti-ticket text-6xl text-teal-500"></i>
            </div>
            <Typography variant="h4" className="font-bold text-gray-900 mb-2">
              Đăng nhập
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Chào mừng bạn quay trở lại!
            </Typography>
          </div>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-mail text-gray-400"></i>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Nhập mật khẩu"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-lock text-gray-400"></i>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      <i
                        className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}
                      ></i>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-teal-600 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              className="bg-teal-500 hover:bg-teal-600 py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="ti ti-loader-2 animate-spin mr-2"></i>
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <Divider className="my-6">
            <Typography variant="body2" className="text-gray-500">
              Hoặc
            </Typography>
          </Divider>

          <div className="space-y-3">
            <Button
              variant="outlined"
              fullWidth
              className="border-gray-300"
              startIcon={<i className="ti ti-brand-google text-xl"></i>}
            >
              Đăng nhập bằng Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              className="border-gray-300"
              startIcon={<i className="ti ti-brand-facebook text-xl"></i>}
            >
              Đăng nhập bằng Facebook
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Typography variant="body2" className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-teal-600 font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
