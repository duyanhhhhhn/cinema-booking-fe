"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";

// Import Icons MUI (Thay thế cho ti-icons để đảm bảo hiển thị đẹp)
import DashboardIcon from "@mui/icons-material/Dashboard";
import PieChartIcon from "@mui/icons-material/PieChart";
import DomainIcon from "@mui/icons-material/Domain";
import MovieIcon from "@mui/icons-material/Movie";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 260;

// --- Cấu hình Menu Data (Dữ liệu mới của bạn) ---
const menuItems = [
  { text: "Tổng quan", icon: <DashboardIcon />, path: "/admin" },
  {
    text: "Thống kê",
    icon: <PieChartIcon />,
    path: "/admin/statistics",
    children: [
      { text: "Doanh thu", path: "/admin/stats/revenue" },
      { text: "Vé bán", path: "/admin/stats/tickets" },
    ],
  },
  {
    text: "Hệ thống rạp",
    icon: <DomainIcon />,
    path: "/admin/system",
    children: [
      { text: "Quản lý chi nhánh", path: "/admin/branches" },
      { text: "Quản lý rạp chiếu", path: "/admin/cinemas" },
      { text: "Quản lý phòng chiếu", path: "/admin/rooms" },
      { text: "Quản lý mẫu sơ đồ ghế", path: "/admin/seat-maps" },
    ],
  },
  {
    text: "Phim và Suất Chiếu",
    icon: <MovieIcon />,
    path: "/admin/movies-group",
    children: [
      { text: "Danh sách phim", path: "/admin/movies" },
      { text: "Suất chiếu", path: "/admin/showtimes" },
    ],
  },
  {
    text: "Dịch Vụ và ƯU ĐÃI",
    icon: <LocalActivityIcon />,
    path: "/admin/services",
    children: [
      { text: "Vé đã bán", path: "/admin/tickets" },
      { text: "Combo & Đồ ăn", path: "/admin/combos" },
      { text: "Mã giảm giá", path: "/admin/vouchers" },
    ],
  },
  {
    text: "Người dùng",
    icon: <PersonIcon />,
    path: "/admin/user-management",
    children: [
      { text: "Quản lý người dùng", path: "/admin/user-management" },
      { text: "Nhân viên và phân quyền", path: "/admin/staff-management" },
    ],
  },
  {
    text: "Nội dung",
    icon: <ArticleIcon />,
    path: "/admin/content",
    children: [
      { text: "Bài viết", path: "/admin/posts" },
      { text: "Banner", path: "/admin/banners" },
    ],
  },
];

// --- Component Sidebar Item ---
const SidebarItem = ({ item, pathname }: { item: any; pathname: string }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isParentActive = hasChildren
    ? item.children.some((child: any) => pathname === child.path)
    : pathname === item.path;

  useEffect(() => {
    if (isParentActive && hasChildren) {
      setTimeout(() => setOpen(true), 0);
    }
  }, [pathname, isParentActive, hasChildren]);

  const handleClick = () => {
    if (hasChildren) setOpen(!open);
  };

  return (
    <>
      <ListItemButton
        onClick={hasChildren ? handleClick : undefined}
        component={hasChildren ? "div" : Link}
        href={hasChildren ? undefined : item.path}
        sx={{
          py: 1.5,
          color: "white",
          "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
          <span className={isParentActive ? "text-white" : "text-gray-400"}>
            {item.icon}
          </span>
        </ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{
            fontSize: "0.95rem",
            fontWeight: isParentActive ? 600 : 400,
            color: isParentActive ? "#ffffff" : "#cbd5e1",
          }}
        />
        {hasChildren ? (
          open ? <ExpandLess sx={{ color: "gray" }} /> : <ExpandMore sx={{ color: "gray" }} />
        ) : null}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child: any) => {
              const isChildActive = pathname === child.path;
              return (
                <Link key={child.path} href={child.path} style={{ textDecoration: "none" }}>
                  <ListItemButton
                    sx={{
                      pl: 4,
                      py: 1,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <span className="flex items-center gap-3">
                          <span className="text-gray-500">-</span>
                          {child.text}
                        </span>
                      }
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        color: isChildActive ? "#ffffff" : "#94a3b8",
                        fontWeight: isChildActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </Link>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
};

// --- MAIN ADMIN LAYOUT ---
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 1. Logic Auth & Menu từ code cũ
  const { user, logout } = useAuth(); // Lấy thông tin user
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // 2. State cho Sidebar Mobile
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // --- Handlers ---
  const handleDrawerToggle = () => {
    if (!isClosing) setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => setIsClosing(false);

  // Handlers cho Profile Menu (Code cũ)
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfileNavigate = () => {
    handleMenuClose();
    router.push("/profile");
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push("/");
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#303f9f",
        color: "white",
      }}
    >
      {/* 1. Logo Section */}
      <Box sx={{ px: 3, pt: 3, textAlign: "center" }}>
        <Box sx={{ width: 100, height: 100, mx: "auto", position: 'relative' }}>
             <Image src="/logo/logo_cinema.png" alt="logo" fill style={{ objectFit: 'contain'}} />
         </Box>
      </Box>

      {/* 2. Label Menu */}
      <Box sx={{ px: 3, pb: 1, pt: 2 }}>
        <Typography variant="caption" sx={{ color: "#8fa1cc", fontWeight: "bold", letterSpacing: 1 }}>
          MENU
        </Typography>
      </Box>

      {/* 3. Danh sách Menu (Phần này sẽ cuộn nhưng không hiện thanh scroll) */}
      <List 
        component="nav" 
        sx={{ 
          px: 1, 
          // Logic để cuộn
          overflowY: "auto", 
          flex: 1,
          
          // --- CSS ĐỂ ẨN THANH CUỘN ---
          "&::-webkit-scrollbar": { display: "none" }, // Ẩn trên Chrome/Safari/Edge
          "scrollbarWidth": "none",                    // Ẩn trên Firefox
          "-ms-overflow-style": "none",                // Ẩn trên IE cũ
        }}
      >
        {menuItems.map((item) => (
          <SidebarItem key={item.text} item={item} pathname={pathname} />
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      
      {/* 1. APP BAR (HEADER) - Lấy style trắng từ code cũ */}
      <AppBar
        position="fixed"
        sx={{
          // Tính toán width để tránh đè lên Sidebar ở Desktop
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "#fff", // Màu trắng như code cũ
          color: "#000",   // Chữ đen
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Shadow nhẹ
        }}
      >
        <Toolbar>
          {/* Nút Hamburger (Chỉ hiện ở Mobile) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Tiêu đề trang */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#303f9f' }}>
            Quản trị hệ thống
          </Typography>

          {/* Phần bên phải: Notification & Profile (Code cũ) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* Notification */}
            <IconButton>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon sx={{ color: '#555' }} />
              </Badge>
            </IconButton>

            {/* User Profile */}
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={handleProfileClick}
            >
              <Avatar 
                sx={{ bgcolor: '#303f9f', width: 36, height: 36, fontSize: 16 }}
                src={user?.avatar}
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'gray' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  minWidth: 180,
                  "&:before": {
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
              <MenuItem onClick={handleProfileNavigate}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Thông tin cá nhân
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                <Typography color="error">Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 2. SIDEBAR NAVIGATION */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, border: "none" },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, borderRight: "1px solid rgba(255,255,255,0.1)" },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* 3. MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "64px", // Đẩy nội dung xuống bằng chiều cao của Header (AppBar)
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}