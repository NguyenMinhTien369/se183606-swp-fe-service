import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import LoginForm from "@/pages/Login/LoginFormt";
import Unauthorized from "@/pages/Unauthorized";
import Home from "@/pages/Home/Home";
import LOGIN_ROUTE from "@/constants/loginrouter";
import { ResetPasswordFlow } from "@/pages/Auth";

import ROUTERS_PATH from "@/constants/routers";
import { scStaffRoutes } from "./components/scStaffRoutes";
import { technicianRoutes } from "./components/technicianRoutes";
import { evmStaffRoutes } from "./components/evmStaffRoutes";
import { adminRoutes } from "./components/adminRoutes";

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

    scStaffRoutes,
    technicianRoutes,
    adminRoutes,
    evmStaffRoutes,

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
