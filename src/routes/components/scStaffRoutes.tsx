import { Navigate } from "react-router";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { ROLES } from "@/utils/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/NotFound";

// SC Staff Pages
import SCStaffDashboard from "@/pages/SC_Staff/SCStaffDashboard/SCStaffDashboard";

// F1 - Manage Customers
import ManageCustomer from "@/pages/SC_Staff/ManageCustomers/ManageCustomer";
import MLCustomerManagement from "@/pages/SC_Staff/ManageCustomers/MLCustomerManagement";
import VehicleInformation from "@/pages/SC_Staff/ManageCustomers/features/VehicleInformation";
import ServiceHistory from "@/pages/SC_Staff/ManageCustomers/features/ServiceHistory";
import PartsManagement from "@/pages/SC_Staff/ManageCustomers/features/PartsManagement";

// F2 - Manage Technicians
import MLInternalManagement from "@/pages/SC_Staff/ManageTechnicians/MLInternalManagement";
import TrackProgress from "@/pages/SC_Staff/ManageTechnicians/features/TrackProgress";
import AssignTechnician from "@/pages/SC_Staff/ManageTechnicians/features/AssignTechnician";
import ArchiveReports from "@/pages/SC_Staff/HistoryReports/ArchiveReports";
import WarrantyRequestList from "@/pages/SC_Staff/ManageTechnicians/features/WarrantyRequestList";
import CreateCustomerForm from "@/pages/SC_Staff/ManageCustomers/components/CreateCustomerForm";

export const scStaffRoutes = {
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
    {
      path: RELATIVE_PATHS.REGISTER_CUSTOMER,
      element: <CreateCustomerForm />,
    },
    {
      path: RELATIVE_PATHS.SERVICE_HISTORY_ALL,
      element: <ArchiveReports />,
    },
    // Manage Customer - 2 level routing
    {
      path: RELATIVE_PATHS.MANAGE_CUSTOMER,
      element: <ManageCustomer />,
    },
    {
      path: RELATIVE_PATHS.MANAGE_CUSTOMER_PARAM, // Step 2: Customer details with tabs
      element: <MLCustomerManagement />,
      children: [
        {
          index: true,
          element: <Navigate to={RELATIVE_PATHS.VEHICLE_INFORMATION} replace />,
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
      element: <MLInternalManagement />,
      children: [
        {
          index: true,
          element: <Navigate to={RELATIVE_PATHS.WARRANTY_REQUEST} replace />,
        },
        {
          path: RELATIVE_PATHS.WARRANTY_REQUEST,
          element: <WarrantyRequestList />,
        },
        {
          path: RELATIVE_PATHS.ASSIGN_TECHNICIAN,
          element: <AssignTechnician />,
        },
        {
          path: RELATIVE_PATHS.PROGRESS,
          element: <TrackProgress />,
        },
      ],
    },
    { path: "*", element: <NotFound /> },
  ],
};
