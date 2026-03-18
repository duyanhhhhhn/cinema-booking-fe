"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
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
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import { Html5Qrcode } from "html5-qrcode";
import { UserRole } from "@/types/role";

const SCANNER_ELEMENT_ID = "admin-qr-scanner";

const drawerWidth = 260;
const collapsedWidth = 72;

// --- Cấu hình Menu Data (Dữ liệu mới của bạn) ---
const menuItems = [
  {
    text: "Tổng quan",
    icon: <DashboardIcon />,
    path: "/admin",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
  },
  {
    text: "Thống kê",
    icon: <PieChartIcon />,
    path: "/admin/statistics",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      {
        text: "Doanh thu",
        path: "/admin/stats/revenue",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Vé bán",
        path: "/admin/stats/tickets",
        oles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    text: "Hệ thống rạp",
    icon: <DomainIcon />,
    path: "/admin/system",
    roles: [UserRole.ADMIN],
    children: [
      {
        text: "Quản lý chi nhánh",
        path: "/admin/branches",
        roles: [UserRole.ADMIN],
      },
      {
        text: "Quản lý rạp chiếu",
        path: "/admin/cinemas",
        roles: [UserRole.ADMIN],
      },
      {
        text: "Quản lý phòng chiếu",
        path: "/admin/rooms",
        roles: [UserRole.ADMIN],
      },
      {
        text: "Quản lý mẫu sơ đồ ghế",
        path: "/admin/seat-maps",
        roles: [UserRole.ADMIN],
      },
    ],
  },
  {
    text: "Phim và Suất Chiếu",
    icon: <MovieIcon />,
    path: "/admin/movies-group",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      {
        text: "Danh sách phim",
        path: "/admin/movies",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Suất chiếu",
        path: "/admin/showtime-scheduler",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Đánh giá",
        path: "/admin/movie-reviews",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    text: "Dịch Vụ và ƯU ĐÃI",
    icon: <LocalActivityIcon />,
    path: "/admin/services",
    children: [
      {
        text: "Vé đã bán",
        path: "/admin/tickets",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Bán vé",
        path: "/admin/sell-tickets",
        roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF],
      },
      {
        text: "Combo & Đồ ăn",
        path: "/admin/combos",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Mã giảm giá",
        path: "/admin/vouchers",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Quản lý cấu hình giá",
        path: "/admin/pricing",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    text: "Người dùng",
    icon: <PersonIcon />,
    path: "/admin/user-management",
    roles: [UserRole.ADMIN, UserRole.MANAGER],

    children: [
      {
        text: "Quản lý người dùng",
        path: "/admin/users",
        roles: [UserRole.ADMIN],
      },
      {
        text: "Nhân viên và phân quyền",
        path: "/admin/staffs",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
  {
    text: "Nội dung",
    icon: <ArticleIcon />,
    path: "/admin/content",
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    children: [
      {
        text: "Bài viết",
        path: "/admin/posts",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
      {
        text: "Banner",
        path: "/admin/banners",
        roles: [UserRole.ADMIN, UserRole.MANAGER],
      },
    ],
  },
];

// --- Component Sidebar Item ---
const SidebarItem = ({
  item,
  pathname,
  collapsed,
  onOpenScanDialog,
}: {
  item: any;
  pathname: string;
  collapsed?: boolean;
  onOpenScanDialog?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const firstChildPath = hasChildren
    ? (item.children.find((c: any) => !c.isDialog) ?? item.children[0])?.path
    : item.path;

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

  if (collapsed) {
    return (
      <ListItemButton
        component={Link}
        href={hasChildren ? firstChildPath : item.path}
        sx={{
          py: 1.5,
          justifyContent: "center",
          color: "white",
          "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            color: isParentActive ? "#fff" : "rgba(255,255,255,0.7)",
            justifyContent: "center",
          }}
        >
          {item.icon}
        </ListItemIcon>
      </ListItemButton>
    );
  }

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
          open ? (
            <ExpandLess sx={{ color: "gray" }} />
          ) : (
            <ExpandMore sx={{ color: "gray" }} />
          )
        ) : null}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child: any) => {
              const isChildActive = !child.isDialog && pathname === child.path;
              if (child.isDialog) {
                return (
                  <ListItemButton
                    key="scan-dialog"
                    onClick={onOpenScanDialog}
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
                        color: "#94a3b8",
                        fontWeight: 400,
                      }}
                    />
                  </ListItemButton>
                );
              }
              return (
                <Link
                  key={child.path}
                  href={child.path}
                  style={{ textDecoration: "none" }}
                >
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

// --- Scan Dialog (popup quét QR / nhập mã vé) ---
function ScanDialogContent({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (_code: string) => void;
}) {
  const [mode, setMode] = useState<"menu" | "camera" | "manual">("menu");
  const [code, setCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedRef = useRef(false);

  const playBeep = useCallback(() => {
    try {
      const audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 1200;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15,
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      /* ignore */
    }
  }, []);

  const stopCamera = useCallback(() => {
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
      scanner
        .stop()
        .then(() => {
          scanner.clear();
          scannerRef.current = null;
        })
        .catch(() => {});
    }
    setCameraActive(false);
    scannedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
      setMode("menu");
      setCode("");
      setScanError(null);
      queueMicrotask(() => setCameraActive(false));
    }
  }, [open]);

  const handleSubmitCode = useCallback(() => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onSuccess(trimmed);
  }, [code, onSuccess]);

  const startCamera = useCallback(() => {
    setScanError(null);
    setCameraActive(true);
  }, []);

  const openCameraMode = useCallback(() => {
    setMode("camera");
    startCamera();
  }, [startCamera]);

  const openManualMode = useCallback(() => {
    stopCamera();
    setMode("manual");
  }, [stopCamera]);

  const backToMenu = useCallback(() => {
    stopCamera();
    setMode("menu");
    setScanError(null);
  }, [stopCamera]);

  useEffect(() => {
    if (!cameraActive || !open) return;
    const el = document.getElementById(SCANNER_ELEMENT_ID);
    if (!el) return;

    scannedRef.current = false;
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    const config = {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1,
    };

    scanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (scannedRef.current) return;
          scannedRef.current = true;
          playBeep();
          scanner
            .stop()
            .then(() => {
              scanner.clear();
              scannerRef.current = null;
              setCameraActive(false);
              onSuccess(decodedText);
            })
            .catch(() => {
              setCameraActive(false);
              onSuccess(decodedText);
            });
        },
        () => {},
      )
      .catch((_err) => {
        setScanError("Không thể mở camera. Vui lòng nhập mã vé bên dưới.");
        setCameraActive(false);
        scannerRef.current = null;
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive, open, onSuccess, playBeep]);

  if (mode === "menu") {
    return (
      <Box sx={{ maxWidth: 560, pb: 1 }}>
        <Box
          component="button"
          type="button"
          onClick={openCameraMode}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            color: "#0f172a",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#cbd5e1",
              bgcolor: "#f8fafc",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                bgcolor: "#fee2e2",
                color: "#e11d48",
                display: "grid",
                placeItems: "center",
              }}
            >
              <QrCodeScannerIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                Quét mã QR
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                Sử dụng camera để quét mã QR trên vé.
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
        </Box>

        <Box
          component="button"
          type="button"
          onClick={openManualMode}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
            p: 2,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            color: "#0f172a",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#cbd5e1",
              bgcolor: "#f8fafc",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                bgcolor: "#f1f5f9",
                color: "#64748b",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ConfirmationNumberIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                Nhập mã vé
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                Nhập thủ công mã vé
              </Typography>
            </Box>
          </Box>
          <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
        </Box>
      </Box>
    );
  }

  if (mode === "camera") {
    return (
      <Box sx={{ maxWidth: 560, pb: 1 }}>
        <Typography sx={{ color: "#64748b", mb: 1.5, fontSize: 14 }}>
          Hướng camera về phía mã QR trên vé để quét. Đảm bảo bạn đã cấp quyền
        </Typography>
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
            "& video": { minHeight: 280 },
          }}
        >
          <div id={SCANNER_ELEMENT_ID} style={{ minHeight: 280 }} />
        </Box>
        {scanError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1.5, display: "block" }}
          >
            {scanError}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={backToMenu}
            sx={{ borderColor: "#cbd5e1", color: "#334155" }}
          >
            Quay lại
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ borderColor: "#cbd5e1", color: "#334155" }}
          >
            Đóng
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 560, pb: 1 }}>
      <Typography sx={{ color: "#64748b", mb: 1.5, fontSize: 14 }}>
        Nhập mã đặt vé để xác thực vé.
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Mã đặt vé"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmitCode()}
          sx={{
            flex: "1 1 240px",
            "& .MuiOutlinedInput-root": {
              bgcolor: "#ffffff",
              color: "#0f172a",
              "& fieldset": { borderColor: "#cbd5e1" },
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: "#f43f5e" },
            },
            "& input::placeholder": { color: "#94a3b8", opacity: 1 },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmitCode}
          disabled={!code.trim()}
          sx={{ bgcolor: "#f43f5e", "&:hover": { bgcolor: "#e11d48" } }}
        >
          Xác thực
        </Button>
      </Box>
      <Button
        variant="text"
        onClick={backToMenu}
        sx={{ mt: 1.5, color: "#64748b" }}
      >
        Quay lại
      </Button>
    </Box>
  );
}

// --- MAIN ADMIN LAYOUT ---
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // 1. Logic Auth & Menu từ code cũ
  const { user, logout } = useAuth(); // Lấy thông tin user
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // 2. State Sidebar: mobile = drawer, desktop = thu gọn + hover mở rộng
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [sidebarHover, setSidebarHover] = useState(false);

  // 3. Popup quét vé (QR)
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScanDialogOpen(true);
    window.addEventListener("open-scan-dialog", handler);
    return () => window.removeEventListener("open-scan-dialog", handler);
  }, []);

  const desktopExpanded = desktopSidebarOpen || sidebarHover;
  const desktopSidebarWidth = desktopExpanded ? drawerWidth : collapsedWidth;

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
  const authorizedMenuItems = useMemo(() => {
    // Nếu chưa có user (đang tải), trả về mảng rỗng
    if (!user?.role) return [];

    return menuItems
      .map((item) => {
        // 1. Lọc menu con (children) trước
        if (item.children) {
          const filteredChildren = item.children.filter(
            (child) =>
              // Trả về true nếu child không set roles HOẶC user.role nằm trong mảng roles
              !child.roles || child.roles.includes(user.role),
          );
          // Trả về item cha với danh sách con đã được lọc
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter((item) => {
        // 2. Kiểm tra quyền truy cập của menu cha
        const hasParentAccess = !item.roles || item.roles.includes(user.role);

        // 3. Đảm bảo: Nếu menu cha có menu con, thì phải còn ít nhất 1 menu con mới hiển thị
        const hasValidChildren = !item.children || item.children.length > 0;

        return hasParentAccess && hasValidChildren;
      });
  }, [user?.role]);

  const renderDrawerContent = (collapsed: boolean) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#303f9f",
        color: "white",
      }}
    >
      {/* 1. Logo: thu gọn thì chỉ icon nhỏ */}
      <Box
        sx={{
          px: collapsed ? 1.5 : 3,
          pt: 2,
          pb: collapsed ? 1 : 0,
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: collapsed ? 40 : 100,
            height: collapsed ? 40 : 100,
            position: "relative",
          }}
        >
          <Image
            src="/logo/logo_cinema.png"
            alt="logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>

      {!collapsed && (
        <Box sx={{ px: 3, pb: 1, pt: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: "#8fa1cc", fontWeight: "bold", letterSpacing: 1 }}
          >
            MENU
          </Typography>
        </Box>
      )}

      {/* 3. Danh sách Menu */}
      <List
        component="nav"
        sx={{
          px: collapsed ? 0 : 1,
          overflowY: "auto",
          flex: 1,
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
        }}
      >
        {authorizedMenuItems.map((item) => (
          <SidebarItem
            key={item.text}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onOpenScanDialog={() => setScanDialogOpen(true)}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: "100%", md: `calc(100% - ${desktopSidebarWidth}px)` },
          ml: { md: desktopSidebarWidth },
          transition: "width 0.2s ease, margin 0.2s ease",
          bgcolor: "#fff",
          color: "#000",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          {/* Nút đóng/mở sidebar: Mobile = drawer, Desktop = thu gọn/mở rộng */}
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={() =>
              isDesktop
                ? setDesktopSidebarOpen((prev) => !prev)
                : handleDrawerToggle()
            }
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Tiêu đề trang */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold", color: "#303f9f" }}
          >
            Quản trị hệ thống
          </Typography>

          {/* Phần bên phải: Quét vé, Notification & Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Quét vé - mở popup quét QR */}
            <IconButton
              color="inherit"
              aria-label="Quét vé"
              onClick={() => setScanDialogOpen(true)}
              sx={{ color: "#555" }}
            >
              <QrCodeScannerIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                p: 0.5,
                borderRadius: 1,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
              onClick={handleProfileClick}
            >
              <Avatar
                sx={{ bgcolor: "#303f9f", width: 36, height: 36, fontSize: 16 }}
                src={user?.avatar}
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "A"}
              </Avatar>
              <Box
                sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, lineHeight: 1.2 }}
                >
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
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
                  <LogoutIcon fontSize="small" sx={{ color: "error.main" }} />
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
        onMouseEnter={() => !desktopSidebarOpen && setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
        sx={{
          width: { xs: "auto", md: desktopSidebarWidth },
          flexShrink: 0,
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
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
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          {renderDrawerContent(false)}
        </Drawer>

        {/* Desktop: thu gọn = chỉ icon, hover = mở rộng */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: desktopSidebarWidth,
              borderRight: "1px solid rgba(255,255,255,0.1)",
              transition: "width 0.2s ease",
              overflow: "hidden",
            },
          }}
          open
        >
          {renderDrawerContent(!desktopExpanded)}
        </Drawer>
      </Box>

      {/* 3. MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${desktopSidebarWidth}px)` },
          mt: "64px",
          overflowX: "hidden",
          transition: "width 0.2s ease",
        }}
      >
        {children}
      </Box>

      {/* Popup quét vé (QR / nhập mã) */}
      <Dialog
        open={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            color: "#0f172a",
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5, pr: 6 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}
          >
            Quét vé & Xác thực
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.75, fontSize: 15 }}>
            Chọn phương thức quét vé: sử dụng camera để quét mã QR hoặc nhập mã
            vé thủ công.
          </Typography>
          <IconButton
            aria-label="close scan dialog"
            onClick={() => setScanDialogOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12, color: "#94a3b8" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: "6px !important", pb: 2.5 }}>
          <ScanDialogContent
            open={scanDialogOpen}
            onClose={() => setScanDialogOpen(false)}
            onSuccess={(code) => {
              setScanDialogOpen(false);
              router.push(`/admin/tickets/${encodeURIComponent(code)}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
