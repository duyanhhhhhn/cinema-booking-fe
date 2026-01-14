"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  MenuItem,
  Menu,
} from "@mui/material";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import router from "next/router";

const drawerWidth = 280;

const menuItems = [
  { text: "Dashboard", icon: "ti ti-dashboard", path: "/admin" },
  { text: "Phim", icon: "ti ti-movie", path: "/admin/movies" },
  { text: "Suất chiếu", icon: "ti ti-clock", path: "/admin/showtimes" },
  { text: "Vé đã bán", icon: "ti ti-ticket", path: "/admin/tickets" },
  { text: "Hóa đơn", icon: "ti ti-receipt", path: "/admin/invoices" },
  { text: "Combo & Đồ ăn", icon: "ti ti-shopping-cart", path: "/admin/combos" },
  { text: "Mã giảm giá", icon: "ti ti-tag", path: "/admin/vouchers" },
  { text: "Chi nhánh", icon: "ti ti-building", path: "/admin/branches" },
  { text: "Rạp chiếu", icon: "ti ti-screen", path: "/admin/cinemas" },
  { text: "Phòng chiếu", icon: "ti ti-door", path: "/admin/rooms" },
  { text: "Người dùng", icon: "ti ti-users", path: "/admin/users" },
  { text: "Bài viết", icon: "ti ti-news", path: "/admin/posts" },
  { text: "Banner", icon: "ti ti-photo", path: "/admin/banners" },
  { text: "Thống kê", icon: "ti ti-chart-bar", path: "/admin/statistics" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 2. Đóng menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // 3. Xử lý chuyển trang Profile
  const handleProfileClick = () => {
    handleClose();
    router.push("/profile"); // Thay đường dẫn của bạn vào đây
  };

  // 4. Xử lý Đăng xuất
    const handleLogout = async () => {
      handleClose();
      await logout();
      router.push("/");
    };

  const drawer = (
    <div>
      <Toolbar className="bg-teal-600">
       
          <Image src="/logo/logo_cinema.png" alt="logo" width={100} height={100} />
       
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.path} className="w-full">
              <ListItemButton
                selected={pathname === item.path}
                className={
                  pathname === item.path
                    ? "bg-teal-50 border-r-4 border-teal-500"
                    : "hover:bg-gray-50"
                }
              >
                <ListItemIcon>
                  <i
                    className={`${item.icon} text-xl ${
                      pathname === item.path ? "text-teal-500" : "text-gray-600"
                    }`}
                  ></i>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  className={
                    pathname === item.path ? "text-teal-600 font-semibold" : ""
                  }
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      className="flex"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: "#fff",
          color: "#000",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <i className="ti ti-menu-2"></i>
          </IconButton>
          <Typography variant="h6" noWrap component="div" className="flex-1">
            Quản trị hệ thống
          </Typography>
          <div className="flex items-center gap-4">
            <IconButton>
              <Badge badgeContent={4} color="error">
                <i className="ti ti-bell text-gray-700"></i>
              </Badge>
            </IconButton>
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-all"
              onClick={handleClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar className="bg-teal-500 w-10 h-10">
                {/* Hiển thị chữ cái đầu nếu có tên, ngược lại hiện icon */}
                {user?.fullName ? (
                  user.fullName.charAt(0).toUpperCase()
                ) : (
                  <i className="ti ti-user"></i>
                )}
              </Avatar>
              <div className="hidden md:block text-left">
                <Typography
                  variant="body2"
                  className="font-semibold leading-tight"
                >
                  {user?.fullName || "Khách"}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-gray-500 block text-xs"
                >
                  {user?.email || "Chưa đăng nhập"}
                </Typography>
              </div>
            </div>

            {/* Phần Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  minWidth: 180,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    // Tạo mũi tên nhỏ trỏ lên
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Option 1: Thông tin cá nhân */}
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <i className="ti ti-user-circle text-lg"></i>
                </ListItemIcon>
                Thông tin cá nhân
              </MenuItem>

              <Divider />

              {/* Option 2: Đăng xuất */}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <i className="ti ti-logout text-lg text-red-500"></i>
                </ListItemIcon>
                <Typography color="error">Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: "64px",
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
