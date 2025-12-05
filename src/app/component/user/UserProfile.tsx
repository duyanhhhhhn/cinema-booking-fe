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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Handle save logic
    setEditing(false);
  };

  return (
  <main className="flex flex-1 justify-center p-4 sm:p-6 md:p-8 bg-background-light dark:bg-background-dark">
    <div className="w-full max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-12">

      {/* Sidebar bên trái giống layout Tailwind */}
      <aside className="md:col-span-4 lg:col-span-3">
        <Box>
          <Card className="shadow-md">
            <CardContent className="p-6 text-center">
              <Avatar
                sx={{ width: 120, height: 120, margin: "0 auto 20px" }}
                className="bg-teal-500"
              >
                <i className="ti ti-user text-6xl"></i>
              </Avatar>

              <Typography variant="h6" className="font-bold mb-2 text-slate-900 dark:text-white">
                {formData.fullName}
              </Typography>
              <Typography variant="body2" className="text-gray-600 dark:text-slate-300 mb-4">
                {formData.email}
              </Typography>
              <Button variant="outlined" size="small" startIcon={<i className="ti ti-camera"></i>}>
                Đổi ảnh đại diện
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md mt-4">
            <CardContent className="p-4">
              <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                className="w-full"
              >
                <Tab
                  label={
                    <div className="flex items-center gap-2">
                      <i className="ti ti-user"></i>
                      <span>Thông tin cá nhân</span>
                    </div>
                  }
                  className="justify-start"
                />
                <Tab
                  label={
                    <div className="flex items-center gap-2">
                      <i className="ti ti-lock"></i>
                      <span>Đổi mật khẩu</span>
                    </div>
                  }
                  className="justify-start"
                />
                <Tab
                  label={
                    <div className="flex items-center gap-2">
                      <i className="ti ti-bell"></i>
                      <span>Thông báo</span>
                    </div>
                  }
                  className="justify-start"
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
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className="font-bold">
                  Thông tin cá nhân
                </Typography>
                {!editing ? (
                  <Button variant="outlined" onClick={() => setEditing(true)} startIcon={<i className="ti ti-edit"></i>}>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outlined" onClick={() => setEditing(false)}>
                      Hủy
                    </Button>
                    <Button variant="contained" className="bg-teal-500 hover:bg-teal-600" onClick={handleSave}>
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>

              <Divider className="mb-6" />

              {/* Form giống MUI */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Số điện thoại" name="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={!editing} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Ngày sinh" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} disabled={!editing} InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Giới tính" name="gender" select value={formData.gender} onChange={handleChange} disabled={!editing} SelectProps={{ native: true }}>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Địa chỉ" multiline rows={3} name="address" value={formData.address} onChange={handleChange} disabled={!editing} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tab 1 & Tab 2 render giữ nguyên */}
        {tabValue === 1 && ( /* ... code cũ giữ nguyên */ )}
        {tabValue === 2 && ( /* ... code cũ giữ nguyên */ )}
      </section>
    </div>
  </main>
);

}

