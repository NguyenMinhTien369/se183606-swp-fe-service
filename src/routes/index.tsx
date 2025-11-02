import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import ManageCustomer from "@/pages/SC_Staff/manageCustomer/ManageCustomer";
import InternalManagement from "@/pages/SC_Staff/InternalManagement/InternalManagement";
import ConductWarranty from "@/pages/SC_Staff/ConductWarranty/ConductWarranty";
import CreateWarranty from "@/pages/SC_Staff/CreateWarranty/CreateWarranty";
import LoginForm from "@/pages/Login/LoginFormt";
import Unauthorized from "@/pages/Unauthorized";
import ROUTERS_PATH from "@/constants/routers";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import LOGIN_ROUTE from "@/constants/loginrouter";
import { ROLES } from "@/utils/constants";
import { ResetPasswordFlow } from "@/pages/Auth";
import {
  AdminDashboard,
  UserManagement,
  RolePermissions,
  ProductManagement,
  WarrantyApproval
} from "@/pages/Admin";
import { EVMDashboard, CampaignManagement, WarrantyClaims } from "@/pages/EVM_Staff";
import { SCStaffDashboard } from "@/pages/SC_Staff";
import { TechnicianDashboard } from "@/pages/SC_Technician";// Nơi để mình cấu hình các routes cho ứng dụng
function Routers() {
  const routers = createBrowserRouter([
    // ============================================
    // 🔐 PUBLIC ROUTES (không cần authentication)
    // ============================================
    {
      path: LOGIN_ROUTE,
      element: <LoginForm />,
    },
    {
      path: ROUTERS_PATH.RESET_PASSWORD,
      element: <ResetPasswordFlow />,
    },
    {
      path: ROUTERS_PATH.UNAUTHORIZED,
      element: <Unauthorized />,
    },

    // ============================================
    // 🔒 SC_STAFF ROUTES (chỉ SC_STAFF)
    // ============================================
    {
      path: "/sc-staff",
      element: (
        <ProtectedRoute allowedRoles={[ROLES.SC_STAFF]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/sc-staff/dashboard" replace /> },
        { path: "dashboard", element: <SCStaffDashboard /> },
        { path: "manage-customer", element: <ManageCustomer /> },
        { path: "internal-management", element: <InternalManagement /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 🔧 TECHNICIAN ROUTES (chỉ SC_TECHNICIAN)
    // ============================================
    {
      path: "/technician",
      element: (
        <ProtectedRoute allowedRoles={[ROLES.SC_TECHNICIAN]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/technician/dashboard" replace /> },
        { path: "dashboard", element: <TechnicianDashboard /> },
        { path: "create-warranty", element: <CreateWarranty /> },
        { path: "conduct-warranty", element: <ConductWarranty /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 👑 ADMIN ROUTES (chỉ ADMIN)
    // ============================================
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to={ROUTERS_PATH.ADMIN_DASHBOARD} replace /> },
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "role-permissions", element: <RolePermissions /> },
        { path: "products", element: <ProductManagement /> },
        { path: "warranty-approval", element: <WarrantyApproval /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 🚗 EVM STAFF ROUTES (chỉ EVM_STAFF)
    // ============================================
    {
      path: "/evm",
      element: (
        <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="/evm/dashboard" replace /> },
        { path: "dashboard", element: <EVMDashboard /> },
        { path: "campaigns", element: <CampaignManagement /> },
        { path: "warranty-claims", element: <WarrantyClaims /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 🚗 DEFAULT ROUTES
    // ============================================
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "*",
      element: <Navigate to="/login" replace />,
    },
  ]);
  return <RouterProvider router={routers} />;
}

export default Routers;
