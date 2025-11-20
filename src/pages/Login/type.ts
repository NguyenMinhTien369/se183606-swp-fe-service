// ============================================
// 🔷 TYPE DEFINITIONS
// ============================================

export interface UserRole {
  roleName: string;
}

export interface User {
  userId?: number;
  username: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  serviceCenterID?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: string;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResult>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<ResetPasswordResult>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}
