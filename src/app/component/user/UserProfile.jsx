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
    <Box className="container mx-auto px-4 py-8">
      <Typography variant="h4" className="font-bold mb-6 text-gray-900">
        Thông tin tài khoản
      </Typography>

      <Grid container spacing={4}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Card className="shadow-md">
            <CardContent className="p-6 text-center">
              <Avatar
                sx={{ width: 120, height: 120, margin: "0 auto 20px" }}
                className="bg-teal-500"
              >
                <i className="ti ti-user text-6xl"></i>
              </Avatar>
              <Typography variant="h6" className="font-bold mb-2">
                {formData.fullName}
              </Typography>
              <Typography variant="body2" className="text-gray-600 mb-4">
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
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {tabValue === 0 && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <Typography variant="h6" className="font-bold">
                    Thông tin cá nhân
                  </Typography>
                  {!editing ? (
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(true)}
                      startIcon={<i className="ti ti-edit"></i>}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outlined" onClick={() => setEditing(false)}>
                        Hủy
                      </Button>
                      <Button
                        variant="contained"
                        className="bg-teal-500 hover:bg-teal-600"
                        onClick={handleSave}
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </div>

                <Divider className="mb-6" />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <i className="ti ti-user text-gray-400 mr-2"></i>,
                      }}
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
                      InputProps={{
                        startAdornment: <i className="ti ti-mail text-gray-400 mr-2"></i>,
                      }}
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
                      InputProps={{
                        startAdornment: <i className="ti ti-phone text-gray-400 mr-2"></i>,
                      }}
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
                      SelectProps={{
                        native: true,
                      }}
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
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: <i className="ti ti-map-pin text-gray-400 mr-2"></i>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {tabValue === 1 && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-bold mb-6">
                  Đổi mật khẩu
                </Typography>

                <Divider className="mb-6" />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu hiện tại"
                      type="password"
                      InputProps={{
                        startAdornment: <i className="ti ti-lock text-gray-400 mr-2"></i>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mật khẩu mới"
                      type="password"
                      InputProps={{
                        startAdornment: <i className="ti ti-lock text-gray-400 mr-2"></i>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu mới"
                      type="password"
                      InputProps={{
                        startAdornment: <i className="ti ti-lock text-gray-400 mr-2"></i>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      className="bg-teal-500 hover:bg-teal-600"
                      startIcon={<i className="ti ti-check"></i>}
                    >
                      Cập nhật mật khẩu
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {tabValue === 2 && (
            <Card className="shadow-md">
              <CardContent className="p-6">
                <Typography variant="h6" className="font-bold mb-6">
                  Cài đặt thông báo
                </Typography>

                <Divider className="mb-6" />

                <div className="space-y-4">
                  {[
                    { label: "Thông báo đặt vé thành công", name: "booking" },
                    { label: "Thông báo khuyến mãi", name: "promotion" },
                    { label: "Thông báo phim mới", name: "newMovie" },
                    { label: "Thông báo email", name: "email" },
                  ].map((setting) => (
                    <div
                      key={setting.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <Typography variant="body1">{setting.label}</Typography>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                  ))}
                </div>

                <Button
                  variant="contained"
                  className="bg-teal-500 hover:bg-teal-600 mt-6"
                  startIcon={<i className="ti ti-check"></i>}
                >
                  Lưu cài đặt
                </Button>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

