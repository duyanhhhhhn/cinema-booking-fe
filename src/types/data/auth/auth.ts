import { IHttpError, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { useMutation } from "@tanstack/react-query";

export interface ILoginPayload {
  email: string;
  password: string;
}
export interface IRegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  otp: string;
}
export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}
export class Auth extends Model {
  static login(payload: ILoginPayload) {
    return this.api.post<
      IResponse<//ILoginResponse
      any>
    >({
      url: "/auth/login",
      data: payload,
    });
  }

  static logout() {
    return this.api.post({
      url: "auth/logout",
    });
  }

  static getMe() {
    return this.api.get<IResponse<any>>({
      url: "/users/me",
    });
  }

  static sendOtp({email}: {email: string}) {
    return this.api.post({
      url: "/auth/register/send-otp",
    data: {
      email
    }
    })
  }
 
 

  static handleLoginSuccess(
    response: //ILoginResponse
    any
  ) {
    localStorage.removeItem("accessToken");
    localStorage.setItem("accessToken", response.accessToken);

    // Lấy expiresIn từ response hoặc decode từ token
    let expiresInSeconds = response.expiresIn;
    
    // Nếu không có expiresIn, decode token để lấy exp
    if (!expiresInSeconds && response.accessToken) {
      try {
        const base64Url = response.accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        
        // exp là timestamp (seconds), tính expiresIn
        if (decoded.exp) {
          expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
        }
      } catch (e) {
        console.warn('Could not decode token exp:', e);
      }
    }
    
    // Mặc định 24 giờ nếu không có expiresIn
    if (!expiresInSeconds || expiresInSeconds <= 0) {
      expiresInSeconds = 24 * 60 * 60; // 24 hours
    }

    const expiresTime = {
      value: expiresInSeconds,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    };

    localStorage.setItem("expiresIn", JSON.stringify(expiresTime));

    if (response.refreshToken)
      localStorage.setItem("refreshToken", response.refreshToken);
  }

  static handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("refreshToken");
  }

  static checkValidToken() {
    const token = localStorage.getItem("expiresIn");


    if (!token) return null;

    const item = JSON.parse(token);
    const now = Date.now();

    if (now > item.expiresAt) {
      return null;
    }

    return item.value;
  }

  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("No refreshToken found");
        return false;
      }

      console.log("🔄 Attempting to refresh token...");
      const response = await this.api.post<IResponse<any>>({
        url: "/auth/refresh",
        data: {
          refreshToken: refreshToken
        }
      });

      // Kiểm tra nhiều cấu trúc response
      const fullData = response.data;
      const nestedData = fullData?.data;
      const data = nestedData || fullData || response.data;
      
      console.log("Refresh response structure:", {
        hasData: !!data,
        hasAccessToken: !!data?.accessToken,
        hasRefreshToken: !!data?.refreshToken,
        keys: data ? Object.keys(data) : [],
      });
      
      if (data?.accessToken) {
        console.log("✅ Refresh token successful, saving...");
        this.handleLoginSuccess(data);
        return true;
      }
      
      console.warn("⚠️ No accessToken in refresh response");
      return false;
    } catch (error: any) {
      console.error("❌ Failed to refresh token:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Chỉ logout nếu lỗi 401/403, không logout cho lỗi network
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        this.handleLogout();
      }
      return false;
    }
  }
  static registerOtp({email}: {email: string}) {
    return this.api.post<IResponse<any>>({
      url: "/auth/register/send-otp",
    data: {
      email
    }
    })
  }
  static register({payload}: {payload: IRegisterPayload}) {
    return this.api.post<IResponse<any>>({
      url: "/auth/register/verify",
    data: payload
    })
  }
}

Auth.setup();

export function useLoginMutation() {
  return useMutation<
    IResponse<//ILoginResponse
    any>,
    IHttpError,
    ILoginPayload
  >({
    mutationFn: (payload) => {
      return Auth.login(payload).then((r) => r.data);
    },
  });
}
export function useRegisterOtpMutation() {
  return useMutation<
    IResponse<any>,
    IHttpError,
    {email: string}
  >({
    mutationFn: (payload) => {
      return Auth.registerOtp(payload).then((r) => r.data);
    },
  });
}
export function useRegisterMutation() {
  return useMutation<
    IResponse<any>,
    IHttpError,
    IRegisterPayload
  >({
    mutationFn: (payload) => {
      return Auth.register({payload}).then((r) => r.data);
    },
  });
}