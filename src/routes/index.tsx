import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import LoginForm from "@/pages/Login/LoginFormt";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home/Home";
import LOGIN_ROUTE from "@/constants/loginrouter";
import { ROLES } from "@/utils/constants";
import { ResetPasswordFlow } from "@/pages/Auth";
import {
  AdminDashboard,
  UserManagement,
  ProductManagement,
  WarrantyApproval,
} from "@/pages/Admin";
import {
  EVMDashboard,
  CampaignManagement,
  WarrantyClaims,
} from "@/pages/EVM_Staff";

import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { scStaffRoutes } from "./components/scStaffRoutes";
import { technicianRoutes } from "./components/technicianRoutes";

function Routers() {
  const routers = createBrowserRouter([
    // ============================================
    // 🔐 PUBLIC ROUTES (không cần authentication)
    // ============================================
    {
      path: ROUTERS_PATH.HOME,
      element: <Home />,
    },
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
    scStaffRoutes,

    // ============================================
    // 🔧 TECHNICIAN ROUTES (SC_TECHNICIAN + SC_STAFF)
    // ============================================
    technicianRoutes,

    // ============================================
    // 👑 ADMIN ROUTES (chỉ ADMIN)
    // ============================================
    {
      path: ROUTERS_PATH.ADMIN_BASE,
      element: (
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={ROUTERS_PATH.ADMIN_DASHBOARD} replace />,
        },
        {
          path: RELATIVE_PATHS.DASHBOARD,
          element: <AdminDashboard />,
        },
        {
          path: RELATIVE_PATHS.USERS,
          element: <UserManagement />,
        },
        {
          path: RELATIVE_PATHS.PRODUCTS,
          element: <ProductManagement />,
        },
        {
          path: RELATIVE_PATHS.WARRANTY_APPROVAL,
          element: <WarrantyApproval />,
        },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 🚗 EVM STAFF ROUTES (chỉ EVM_STAFF)
    // ============================================
    {
      path: ROUTERS_PATH.EVM_BASE,
      element: (
        <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={ROUTERS_PATH.EVM_DASHBOARD} replace />,
        },
        {
          path: RELATIVE_PATHS.DASHBOARD,
          element: <EVMDashboard />,
        },
        {
          path: RELATIVE_PATHS.PRODUCTS,
          element: <ProductManagement />,
        },
        {
          path: RELATIVE_PATHS.CAMPAIGNS,
          element: <CampaignManagement />,
        },
        {
          path: RELATIVE_PATHS.WARRANTY_CLAIMS,
          element: <WarrantyClaims />,
        },
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
