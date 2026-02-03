import { UserRole } from "@/types/role";

/**
 * Route configuration type
 */
export type RouteGuardType =
  | "public"
  | "guest"
  | "auth"
  | "client"
  | "admin"
  | "admin-only";

export interface RouteConfig {
  /** Route path pattern */
  path: string;

  /** Guard type */
  guard: RouteGuardType;

  /** Redirect URL nếu không có quyền */
  fallbackUrl?: string;

  /** Mô tả (optional) */
  description?: string;
}

/**
 * Cấu hình tất cả routes trong app
 */
export const ROUTE_CONFIGS: RouteConfig[] = [
  // Public routes - Không cần đăng nhập
  {
    path: "/",
    guard: "public",
    description: "Trang chủ",
  },
  {
    path: "/not-authorized",
    guard: "public",
    description: "Không có quyền truy cập",
  },
  {
    path: "/movies",
    guard: "public",
    description: "Danh sách phim",
  },
  {
    path: "/movies/[id]",
    guard: "public",
    description: "Chi tiết phim",
  },
  {
    path: "/cinemas",
    guard: "public",
    description: "Rạp chiếu phim",
  },
  {
    path: "/news",
    guard: "public",
    description: "Tin tức",
  },
  {
    path: "/news/[id]",
    guard: "public",
    description: "Chi tiết tin tức",
  },

  // Guest routes - Chỉ cho người chưa đăng nhập
  {
    path: "/login",
    guard: "guest",
    description: "Đăng nhập",
  },
  {
    path: "/register",
    guard: "guest",
    description: "Đăng ký",
  },

  // Client routes - Chỉ cho CLIENT role
  {
    path: "/profile",
    guard: "client",
    fallbackUrl: "/admin",
    description: "Thông tin cá nhân",
  },
  {
    path: "/my-tickets",
    guard: "client",
    fallbackUrl: "/admin",
    description: "Vé của tôi",
  },
  {
    path: "/booking",
    guard: "client",
    fallbackUrl: "/admin",
    description: "Đặt vé",
  },
  {
    path: "/booking/[movieId]",
    guard: "client",
    fallbackUrl: "/admin",
    description: "Đặt vé phim",
  },
  {
    path: "/booking-success",
    guard: "client",
    fallbackUrl: "/admin",
    description: "Đặt vé thành công",
  },

  // Admin routes - Cho ADMIN và STAFF
  {
    path: "/admin",
    guard: "admin",
    fallbackUrl: "/",
    description: "Trang quản trị",
  },

  {
    path: "/admin/cinemas",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý rạp chiếu",
  },

  {
    path: "/admin/users",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý người dùng",
  },
  {
    path: "/admin/movies",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý phim",
  },
  {
    path: "/admin/movies/[id]",
    guard: "admin",
    fallbackUrl: "/",
    description: "Chi tiết & chỉnh sửa phim",
  },
  {
    path: "/admin/showtimes",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý suất chiếu",
  },
  {
    path: "/admin/branches",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý chi nhánh",
  },
  {
    path: "/admin/tickets",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý vé",
  },
  {
    path: "/admin/invoices",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý hóa đơn",
  },
  {
    path: "/admin/content",
    guard: "admin",
    fallbackUrl: "/",
    description: "Quản lý nội dung",
  },
];

/**
 * Helper function: Tìm route config dựa trên pathname
 */
export function getRouteConfig(pathname: string): RouteConfig | null {
  // Exact match trước
  const exactMatch = ROUTE_CONFIGS.find((config) => config.path === pathname);
  if (exactMatch) return exactMatch;

  // Pattern match (cho dynamic routes như /movies/[id])
  const patternMatch = ROUTE_CONFIGS.find((config) => {
    const pattern = config.path.replace(/\[.*?\]/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });

  return patternMatch || null;
}

/**
 * Helper function: Kiểm tra route có phải public không
 */
export function isPublicRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.guard === "public";
}

/**
 * Helper function: Kiểm tra route có phải guest only không
 */
export function isGuestRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config?.guard === "guest";
}

/**
 * Helper function: Kiểm tra route có cần auth không
 */
export function requiresAuth(pathname: string): boolean {
  const config = getRouteConfig(pathname);
  return config ? !["public", "guest"].includes(config.guard) : false;
}

/**
 * Helper function: Get redirect URL cho user dựa trên role
 */
export function getRedirectUrlByRole(role: UserRole | string): string {
  switch (role) {
    case UserRole.ADMIN:
    case UserRole.STAFF:
      return "/admin";
    case UserRole.CLIENT:
    default:
      return "/";
  }
}
