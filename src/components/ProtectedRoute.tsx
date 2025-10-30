import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import { canAccessRoute } from "@/utils/constants"; // ← Import helper function

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  checkRouteAccess?: boolean; // ← New prop: Enable route access checking
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
  checkRouteAccess = false, // ← Default: không check route access
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasAnyRole, user } = useAuth();
  const location = useLocation(); // ← Lấy current path

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

  // ✅ Check 1: Role-based access (allowedRoles)
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    console.log("❌ User không có role phù hợp");
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Check 2: Route-based access (ROLE_ACCESSIBLE_ROUTES)
  if (checkRouteAccess && user) {
    const userRole = user.role?.roleName || "";
    const currentPath = location.pathname;

    console.log("🔍 Checking route access:", { userRole, currentPath });

    if (!canAccessRoute(userRole, currentPath)) {
      console.log("❌ User không có quyền truy cập route này");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Authenticated và có quyền → render children
  return <>{children}</>;
}
