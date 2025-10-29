import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "../pages/Home/Home";
import ManageCustomer from "@/pages/manageCustomer/ManageCustomer";
import InternalManagement from "@/pages/InternalManagement/InternalManagement";
import ConductWarranty from "@/pages/ConductWarranty/ConductWarranty";
import CreateWarranty from "@/pages/CreateWarranty/CreateWarranty";
import LoginForm from "@/pages/Login/LoginFormt";
import Unauthorized from "@/pages/Unauthorized";
import ROUTERS_PATH from "@/constants/routers";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import LOGIN_ROUTE from "@/constants/loginrouter";

// Nơi để mình cấu hình các routes cho ứng dụng
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
      path: "/unauthorized",
      element: <Unauthorized />,
    },

    // ============================================
    // 🔒 PROTECTED ROUTES (yêu cầu authentication)
    // ============================================
    {
      path: ROUTERS_PATH.HOME,
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <Home /> },
        {
          path: ROUTERS_PATH.MANAGE_CUSTOMER,
          element: <ManageCustomer />,
        },
        {
          path: ROUTERS_PATH.CREATE_WARRANTY,
          element: <CreateWarranty />,
        },
        {
          path: ROUTERS_PATH.INTERNAL_MANAGEMENT,
          element: <InternalManagement />,
        },
        { path: ROUTERS_PATH.CONDUCT_WARRANTY, element: <ConductWarranty /> },
        { path: "*", element: <NotFound /> },
      ],
    },

    // ============================================
    // 👑 ADMIN ROUTES (chỉ ADMIN)
    // ============================================
    // TODO: Thêm admin routes khi có dashboard
    // {
    //   path: "/admin",
    //   element: (
    //     <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
    //       <AdminLayout />
    //     </ProtectedRoute>
    //   ),
    //   children: [...]
    // },

    // ============================================
    // 🚗 DEFAULT ROUTE
    // ============================================
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
  ]);
  return <RouterProvider router={routers} />;
}

export default Routers;
