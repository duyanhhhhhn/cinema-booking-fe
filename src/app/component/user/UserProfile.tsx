"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";

export default function UserProfile() {
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    dateOfBirth: "1990-01-01",
    gender: "male",
    address: "123 Đường ABC, Quận 1, TP.HCM",
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Handle save logic
    setEditing(false);
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "#e5e7eb",
      backgroundColor: "rgba(15,23,42,0.75)",
      backdropFilter: "blur(14px)",
      "& fieldset": {
        borderColor: "rgba(148,163,184,0.6)",
      },
      "&:hover fieldset": {
        borderColor: "#f97373",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ef4444",
        boxShadow: "0 0 0 1px rgba(248,113,113,0.7)",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(148,163,184,0.9)",
      "&.Mui-focused": {
        color: "#fecaca",
      },
    },
  };

  const glassCardSx = {
    backgroundColor: "rgba(15,23,42,0.9)",
    backdropFilter: "blur(18px)",
    borderRadius: 18,
    border: "1px solid rgba(248,250,252,0.08)",
  };

  return (
    <main className="relative flex flex-1 justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-gradient-to-br from-black via-slate-950 to-red-950">
      {/* Glow đỏ mờ phía sau */}
      <div className="pointer-events-none absolute -top-40 right-[-120px] h-72 w-72 rounded-full bg-red-500/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-80px] h-80 w-80 rounded-full bg-red-700/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-12 text-slate-100">
        {/* Sidebar bên trái */}
        <aside className="md:col-span-4 lg:col-span-3">
          <Box className="space-y-4">
            {/* Card avatar */}
            <Card
              sx={glassCardSx}
              className="relative overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.9)] hover:border-red-500/80"
            >
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-500 via-red-400 to-rose-500 shadow-[0_0_40px_rgba(248,113,113,0.75)]">
                  <Avatar
                    sx={{
                      width: 112,
                      height: 112,
                      backgroundColor: "rgba(15,23,42,0.9)",
border: "2px solid rgba(248,250,252,0.18)",
                    }}
                  >
                    <i className="ti ti-user text-5xl text-red-400" />
                  </Avatar>
                </div>

                <Typography
                  variant="h6"
                  className="font-semibold mb-1 text-slate-50 tracking-wide"
                >
                  {formData.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-slate-300/80 mb-4 text-sm"
                >
                  {formData.email}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<i className="ti ti-camera" />}
                  className="border-red-500/70 text-red-300 hover:border-red-400 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
                >
                  Đổi ảnh đại diện
                </Button>
              </CardContent>
            </Card>

            {/* Card Tabs */}
            <Card
              sx={glassCardSx}
              className="relative overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.9)] hover:border-red-500/80"
            >
              <CardContent className="p-4">
                <Tabs
                  orientation="vertical"
                  value={tabValue}
                  onChange={(e, v) => setTabValue(v)}
                  sx={{
                    "& .MuiTabs-flexContainer": {
                      gap: 6,
                    },
                    "& .MuiTabs-indicator": {
                      left: 0,
                      width: 3,
                      borderRadius: 9999,
                      backgroundColor: "#ef4444",
                    },
                  }}
                >
                  <Tab
                    disableRipple
                    label={
                      <div className="flex items-center gap-2">
                        <i className="ti ti-user text-sm" />
                        <span className="text-sm">Thông tin cá nhân</span>
                      </div>
                    }
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      alignItems: "center",
                      color: "rgba(248,250,252,0.7)",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 9999,
                      paddingInline: 14,
                      minHeight: 44,
                      "&:hover": {
                        backgroundColor: "rgba(248,113,113,0.12)",
                        color: "#fecaca",
                      },
                      "&.Mui-selected": {
                        color: "#fca5a5",
backgroundColor: "rgba(248,113,113,0.2)",
                      },
                    }}
                  />
                  <Tab
                    disableRipple
                    label={
                      <div className="flex items-center gap-2">
                        <i className="ti ti-lock text-sm" />
                        <span className="text-sm">Đổi mật khẩu</span>
                      </div>
                    }
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      alignItems: "center",
                      color: "rgba(248,250,252,0.7)",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 9999,
                      paddingInline: 14,
                      minHeight: 44,
                      "&:hover": {
                        backgroundColor: "rgba(248,113,113,0.12)",
                        color: "#fecaca",
                      },
                      "&.Mui-selected": {
                        color: "#fca5a5",
                        backgroundColor: "rgba(248,113,113,0.2)",
                      },
                    }}
                  />
                  <Tab
                    disableRipple
                    label={
                      <div className="flex items-center gap-2">
                        <i className="ti ti-bell text-sm" />
                        <span className="text-sm">Thông báo</span>
                      </div>
                    }
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      alignItems: "center",
                      color: "rgba(248,250,252,0.7)",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 9999,
                      paddingInline: 14,
                      minHeight: 44,
                      "&:hover": {
                        backgroundColor: "rgba(248,113,113,0.12)",
                        color: "#fecaca",
                      },
                      "&.Mui-selected": {
                        color: "#fca5a5",
                        backgroundColor: "rgba(248,113,113,0.2)",
                      },
                    }}
                  />
                </Tabs>
              </CardContent>
            </Card>
          </Box>
        </aside>

        {/* Nội dung chính bên phải */}
        <section className="md:col-span-8 lg:col-span-9">
          {/* Tab 0 */}
          {tabValue === 0 && (
            <Card
              sx={glassCardSx}
              className="relative overflow-hidden shadow-[0_18px_45px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.9)] hover:border-red-500/80"
            >
              <CardContent className="p-6 sm:p-7">
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div>
                    <Typography
                      variant="h6"
                      className="font-semibold tracking-wide text-slate-50"
                    >
                      Thông tin cá nhân
                    </Typography>
                    <p className="mt-1 text-xs text-slate-300/70">
                      Cập nhật thông tin để bảo mật và đồng bộ tài khoản.
                    </p>
                  </div>

                  {!editing ? (
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(true)}
                      startIcon={<i className="ti ti-edit" />}
                      className="border-red-500/70 text-red-300 hover:border-red-400 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outlined"
                        onClick={() => setEditing(false)}
                        className="border-slate-500/60 text-slate-200 hover:bg-slate-500/10 hover:border-slate-300/80 transition-all duration-200"
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        className="bg-red-600 hover:bg-red-500 shadow-[0_10px_30px_rgba(248,113,113,0.4)] normal-case"
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </div>

                <Divider className="mb-6 border-slate-700/80" />

                {/* Form */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
label="Số điện thoại"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                      sx={textFieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Giới tính"
                      name="gender"
                      select
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={!editing}
                      SelectProps={{ native: true }}
                      sx={textFieldSx}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      multiline
                      rows={3}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      sx={textFieldSx}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {tabValue === 1 && (
            <>
              {/* ... code cũ giữ nguyên */}
            </>
          )}

          {tabValue === 2 && (
            <>
              {/* ... code cũ giữ nguyên */}
            </>
          )}
        </section>
      </div>
    </main>
  );
}