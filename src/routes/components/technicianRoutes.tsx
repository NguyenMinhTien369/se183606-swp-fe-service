import { Navigate } from "react-router";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { ROLES } from "@/utils/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/NotFound";

// SC Technician Pages
import TechnicianDashboard from "@/pages/SC_Technician/TechnicianDashboard/TechnicianDashboard";
import ConductWarranty from "@/pages/SC_Technician/ConductWarranty/ConductWarranty";
import MLCreateWarranty from "@/pages/SC_Technician/ManageWarranty/MLCreateWarranty";
import Warranty from "@/pages/SC_Technician/ManageWarranty/features/Warranty";
import ManufacturerResponsePanel from "@/pages/SC_Technician/ManageWarranty/features/ManufacturerResponsePanel";
import WarrantyListWithAuth from "./WarrantyListWrapper";

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
      path: RELATIVE_PATHS.MANAGE_WARRANTY,
      element: <MLCreateWarranty />,
      children: [
        {
          index: true,
          element: <Navigate to={RELATIVE_PATHS.CREATE_WARRANTY} replace />,
        },
        {
          path: RELATIVE_PATHS.CREATE_WARRANTY,
          element: <Warranty />,
        },
        {
          path: RELATIVE_PATHS.WARRANTY_LIST,
          element: <WarrantyListWithAuth />,
        },
        {
          path: RELATIVE_PATHS.MANUFACTURER_RESPONSE_PANEL,
          element: <ManufacturerResponsePanel />,
        },
      ],
    },
    {
      path: RELATIVE_PATHS.CONDUCT_WARRANTY,
      element: <ConductWarranty />,
    },
    { path: "*", element: <NotFound /> },
  ],
};
