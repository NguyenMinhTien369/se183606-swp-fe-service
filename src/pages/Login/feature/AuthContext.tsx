import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/utility/index";
import { ROLES, ROLE_PERMISSIONS } from "@/utils/constants";
import type {
  AuthContextValue,
  User,
  LoginCredentials,
  LoginResult,
  ForgotPasswordResult,
  ResetPasswordResult,
} from "@/pages/Login/type";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Helper function: Decode JWT token to get user info
  const decodeJWT = (token: string): any => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Decode JWT để lấy thông tin user
        const decodedToken = decodeJWT(token);

        if (decodedToken) {
          // Kiểm tra token có hết hạn không
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp && decodedToken.exp < currentTime) {
            console.log("Token đã hết hạn");
            localStorage.clear();
            return;
          }

          const userData = {
            userId: decodedToken?.userID || decodedToken?.userId, // Backend dùng "userID" (viết hoa)
            username: decodedToken?.sub,
            email: decodedToken?.email,
            fullName: decodedToken?.fullName,
            role: {
              roleName: decodedToken?.role || decodedToken?.scope,
            },
            serviceCenterID:
              decodedToken?.serviceCenterID || decodedToken?.serviceCenterId, // ✅ Added
          };
          setUser(userData);
        } else {
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error("Check auth error:", error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };
  /*
credentials: là 1 tham số kiểu LoginCredentials chứa thông tin đăng nhập của người dùng (username và password).
:Promise<LoginResult>: hàm trả về một Promise chứa kết quả đăng nhập kiểu LoginResult, bao gồm thông tin về việc đăng nhập có thành công hay không, thông tin người dùng nếu thành công, hoặc thông báo lỗi nếu thất bại.
*/
  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      console.log("Đang gửi request login...", credentials);
      const response = await authAPI.login(credentials);
      console.log("Login response:", response.data);

      // Backend trả về: { code: 0, result: { token, authenticated } }  !!!
      const result = response.data?.result;
      const token = result?.token;

      if (!token) {
        console.error("❌ Không có token trong response:", response.data);
        throw new Error("No access token received");
      }

      console.log("Token nhận được, length:", token.length);
      localStorage.setItem("accessToken", token);

      // Decode JWT để lấy thông tin user từ token
      const decodedToken = decodeJWT(token);
      console.log("Decoded token:", decodedToken);

      // Tạo object user từ thông tin trong token
      const userData: User = {
        userId: decodedToken?.userID || decodedToken?.userId, // Backend dùng "userID" (viết hoa)
        username: decodedToken?.sub,
        email: decodedToken?.email,
        fullName: decodedToken?.fullName,
        role: {
          roleName: decodedToken?.role || decodedToken?.scope,
        },
        serviceCenterID:
          decodedToken?.serviceCenterID || decodedToken?.serviceCenterId,
      };

      setUser(userData);

      return { success: true, user: userData };
    } catch (error: any) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại",
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Gọi API logout từ backend để invalidate token
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
      // Vẫn tiếp tục logout ở frontend ngay cả khi API thất bại
    } finally {
      // Luôn xóa localStorage và reset user state
      localStorage.clear();
      setUser(null);
    }
  };

  const forgotPassword = async (
    email: string
  ): Promise<ForgotPasswordResult> => {
    try {
      // TODO: Implement when backend API is ready
      console.log("Forgot password for:", email);
      // await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResult> => {
    try {
      // TODO: Implement when backend API is ready
      console.log(
        "Reset password with token:",
        token,
        "New password length:",
        newPassword.length
      );
      // await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message };
    }
  };

  const hasPermission = (p: string): boolean => {
    const roleName =
      typeof user?.role === "string" ? user.role : user?.role?.roleName;
    return roleName ? ROLE_PERMISSIONS[roleName]?.includes(p) || false : false;
  };

  const hasRole = (r: string): boolean => {
    const roleName =
      typeof user?.role === "string" ? user.role : user?.role?.roleName;
    return roleName === r;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    const roleName =
      typeof user?.role === "string" ? user.role : user?.role?.roleName;
    return roles.some((r) => roleName === r);
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    // Backend trả về "ROLE_ADMIN", loại bỏ prefix "ROLE_"
    role: (() => {
      const roleName =
        typeof user?.role === "string" ? user.role : user?.role?.roleName;
      return typeof roleName === "string" ? roleName.replace("ROLE_", "") : "";
    })(),
    login,
    logout,
    forgotPassword,
    resetPassword,
    hasPermission,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { ROLES };
