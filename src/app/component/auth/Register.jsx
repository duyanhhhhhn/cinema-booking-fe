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

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Handle registration logic here
      console.log("Register:", formData);
    }, 1000);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <i className="ti ti-user-plus text-6xl text-teal-500"></i>
            </div>
            <Typography variant="h4" className="font-bold text-gray-900 mb-2">
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Tạo tài khoản để đặt vé nhanh chóng
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
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-user text-gray-400"></i>
                  </InputAdornment>
                ),
              }}
            />

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
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="0901234567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-phone text-gray-400"></i>
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
              placeholder="Tối thiểu 6 ký tự"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-lock text-gray-400"></i>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <i className={showPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Nhập lại mật khẩu"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <i className="ti ti-lock text-gray-400"></i>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      <i className={showConfirmPassword ? "ti ti-eye-off" : "ti ti-eye"}></i>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="flex items-start">
              <input type="checkbox" id="terms" className="mt-1 mr-2" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-teal-600 hover:underline">
                  Điều khoản & Điều kiện
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-teal-600 hover:underline">
                  Chính sách bảo mật
                </Link>
              </label>
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
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
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
              Đăng ký bằng Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              className="border-gray-300"
              startIcon={<i className="ti ti-brand-facebook text-xl"></i>}
            >
              Đăng ký bằng Facebook
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Typography variant="body2" className="text-gray-600">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-teal-600 font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </Typography>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}

