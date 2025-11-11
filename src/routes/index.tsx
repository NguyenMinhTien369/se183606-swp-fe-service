import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import MainLayout from "@/layouts/MainLayout";
// import ManageCustomer from "@/pages/SC_Staff/manageCustomer/ManageCustomer";
import InternalManagement from "@/pages/SC_Staff/InternalManagement/InternalManagement";
import LoginForm from "@/pages/Login/LoginFormt";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import { SCStaffDashboard } from "@/pages/SC_Staff";
import {
  TechnicianDashboard,
  ConductWarranty,
  CreateWarranty,
} from "@/pages/SC_Technician";
//Thêm constant & cái mới
import ManageCustomer from "@/pages/SC_Staff/ManageCustomers/ManageCustomer";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import Home from "@/pages/Home/Home";
// import index from "@/pages/NotFound";
// import MLCustomerManagement from "@/pages/SC_Staff/ManageCustomers/MLCustomerManagement";
// import VehicleInformation from "@/pages/SC_Staff/ManageCustomers/VehicleInformation";
// import ServiceHistory from "@/pages/SC_Staff/ManageCustomers/ServiceHistory";
// import PartsManagement from "@/pages/SC_Staff/ManageCustomers/PartsManagement";

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
    {
      path: ROUTERS_PATH.SC_STAFF_BASE,
      element: (
        <ProtectedRoute allowedRoles={[ROLES.SC_STAFF]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Navigate to={ROUTERS_PATH.SC_STAFF_DASHBOARD} replace />,
        },
        {
          path: RELATIVE_PATHS.DASHBOARD,
          element: <SCStaffDashboard />,
        },
        // Manage Customer - 2 level routing
        {
          path: RELATIVE_PATHS.MANAGE_CUSTOMER,
          element: <ManageCustomer />, // Step 1: Customer search table
        },
        {
          path: RELATIVE_PATHS.MANAGE_CUSTOMER_PARAM, // Step 2: Customer details with tabs
          element: <MLCustomerManagement />,
          children: [
            {
              index: true,
              element: (
                <Navigate to={RELATIVE_PATHS.VEHICLE_INFORMATION} replace />
              ),
            },
            {
              path: RELATIVE_PATHS.VEHICLE_INFORMATION,
              element: <VehicleInformation />,
            },
            {
              path: RELATIVE_PATHS.SERVICE_HISTORY,
              element: <ServiceHistory />,
            },
            {
              path: RELATIVE_PATHS.PARTS_MANAGEMENT,
              element: <PartsManagement />,
            },
          ],
        },
        {
          path: RELATIVE_PATHS.INTERNAL_MANAGEMENT,
          element: <InternalManagement />,
        },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 🔧 TECHNICIAN ROUTES (SC_TECHNICIAN + SC_STAFF)
    // ============================================
    {
      path: ROUTERS_PATH.TECHNICIAN_BASE,
      element: (
        <ProtectedRoute allowedRoles={[ROLES.SC_TECHNICIAN, ROLES.SC_STAFF]}>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: (
            <Navigate to={ROUTERS_PATH.SC_TECHNICIAN_DASHBOARD} replace />
          ),
        },
        {
          path: RELATIVE_PATHS.DASHBOARD,
          element: <TechnicianDashboard />,
        },
        {
          path: RELATIVE_PATHS.CREATE_WARRANTY,
          element: <CreateWarranty />,
        },
        {
          path: RELATIVE_PATHS.CONDUCT_WARRANTY,
          element: <ConductWarranty />,
        },
        { path: "*", element: <NotFound /> },
      ],
    },

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
