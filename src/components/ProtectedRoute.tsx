import { Navigate } from "react-router";
import { useAuth } from "@/pages/Login/feature/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component - Bảo vệ routes yêu cầu authentication
 *
 * @param children - Component con được render nếu user đã authenticated
 * @param allowedRoles - Mảng các roles được phép truy cập (optional)
 *
 * @example
 * <ProtectedRoute allowedRoles={['ADMIN']}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasAnyRole } = useAuth();

  // Đang loading → hiển thị loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa login → redirect về /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Có yêu cầu role nhưng user không có role phù hợp → redirect về /unauthorized
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated và có quyền → render children
  return <>{children}</>;
}
