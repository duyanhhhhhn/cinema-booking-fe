"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  UserRole,
  Role,
  isAdmin,
  isStaff,
  isClient,
  isManagementRole,
} from "@/types/role";
import { Auth, useLoginMutation } from "@/types/data/auth/auth";

/**
 * Interface cho User
 */
export interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: Role;
  avatar?: string;
}

/**
 * Interface cho AuthContext
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Role checks
  isAdmin: boolean;
  isStaff: boolean;
  isClient: boolean;
  isManagement: boolean;

  // Refresh user data
  refreshUser: () => Promise<void>;

  // Loading states from mutations
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode JWT token để lấy thông tin user
 */
function decodeToken(token: string): User | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const decoded = JSON.parse(jsonPayload);

    return {
      id: decoded.id || decoded.sub || decoded.userId,
      email: decoded.email,
      fullName: decoded.fullName || decoded.full_name || decoded.name,
      phone: decoded.phone,
      role: decoded.role || UserRole.CLIENT,
      avatar: decoded.avatar,
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sử dụng useLoginMutation có sẵn
  const loginMutation = useLoginMutation();

  /**
   * Khởi tạo auth state từ localStorage
   */
  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Kiểm tra token còn hạn không
      const isValid = Auth.checkValidToken();

      if (!isValid) {
        // Thử refresh token
        const refreshed = await Auth.refreshAccessToken();
        if (!refreshed) {
          Auth.handleLogout();
          setUser(null);
          setLoading(false);
          return;
        }
      }

      // Gọi API user/me để lấy thông tin user
      try {
        const response = await Auth.getMe();
        const userData = response.data?.data || response.data;

        if (userData) {
          setUser({
            id: userData.id || userData.userId,
            email: userData.email,
            fullName: userData.fullName || userData.full_name || userData.name,
            phone: userData.phone,
            role: userData.role || UserRole.CLIENT,
            avatar: userData.avatar,
          });
        } else {
          // Fallback: decode token nếu API thất bại
          const currentToken = localStorage.getItem("accessToken");
          if (currentToken) {
            const decodedUser = decodeToken(currentToken);
            setUser(decodedUser);
          }
        }
      } catch (apiError: any) {
        // Nếu API fail với 401 (Unauthorized), thử refresh token và retry
        if (apiError?.response?.status === 401) {
          const refreshed = await Auth.refreshAccessToken();

          if (refreshed) {
            try {
              const retryResponse = await Auth.getMe();
              const retryData = retryResponse.data?.data || retryResponse.data;

              if (retryData) {
                setUser({
                  id: retryData.id || retryData.userId,
                  email: retryData.email,
                  fullName:
                    retryData.fullName || retryData.full_name || retryData.name,
                  phone: retryData.phone,
                  role: retryData.role || UserRole.CLIENT,
                  avatar: retryData.avatar,
                });
                return;
              }
            } catch (retryError) {
              console.error("Retry after refresh failed:", retryError);
            }
          }

          // Nếu refresh thất bại hoặc retry fail, logout
          Auth.handleLogout();
          setUser(null);
        } else {
          // Lỗi khác (không phải 401), fallback decode token
          console.warn("API /user/me failed with non-401 error:", apiError);
          const currentToken = localStorage.getItem("accessToken");
          if (currentToken) {
            const decodedUser = decodeToken(currentToken);
            setUser(decodedUser);
          }
        }
      }
    } catch (error) {
      Auth.handleLogout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Login wrapper
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      const data = response?.data || response;

      if (data?.accessToken) {
        Auth.handleLoginSuccess(data);
        const userData = decodeToken(data.accessToken);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: "Đăng nhập thất bại" };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Đăng nhập thất bại",
      };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await Auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Auth.handleLogout();
      setUser(null);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    await initializeAuth();
  };

  // Computed values
  const isAuthenticated = !!user;
  const userIsAdmin = user ? isAdmin(user.role) : false;
  const userIsStaff = user ? isStaff(user.role) : false;
  const userIsClient = user ? isClient(user.role) : false;
  const userIsManagement = user ? isManagementRole(user.role) : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        isAdmin: userIsAdmin,
        isStaff: userIsStaff,
        isClient: userIsClient,
        isManagement: userIsManagement,
        refreshUser,
        isLoggingIn: loginMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
