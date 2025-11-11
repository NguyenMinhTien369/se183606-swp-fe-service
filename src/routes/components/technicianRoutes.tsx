import { Navigate } from "react-router";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { ROLES } from "@/utils/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/NotFound";

// SC Technician Pages
import {
  TechnicianDashboard,
  CreateWarranty,
  ConductWarranty,
} from "@/pages/SC_Technician";

export const technicianRoutes = {
  path: ROUTERS_PATH.TECHNICIAN_BASE,
  element: (
    <ProtectedRoute allowedRoles={[ROLES.SC_TECHNICIAN, ROLES.SC_STAFF]}>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={ROUTERS_PATH.SC_TECHNICIAN_DASHBOARD} replace />,
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
};
