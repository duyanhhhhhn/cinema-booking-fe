"use client";

import { useState } from "react";
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
} from "@mui/material";

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar className="bg-teal-600">
        <Typography
          variant="h6"
          className="text-white font-bold flex items-center gap-2"
        >
          <i className="ti ti-ticket"></i>
          Admin Panel
        </Typography>
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
    <Box className="flex">
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
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="bg-teal-500">
                <i className="ti ti-user"></i>
              </Avatar>
              <div className="hidden md:block">
                <Typography variant="body2" className="font-semibold">
                  Admin
                </Typography>
                <Typography variant="caption" className="text-gray-600">
                  admin@cinema.com
                </Typography>
              </div>
            </div>
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
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
