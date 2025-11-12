import { Navigate } from "react-router";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { ROLES } from "@/utils/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/NotFound";

// EVM Staff Pages
import {
    EVMDashboard,
    CampaignManagement,
    WarrantyClaims,
} from "@/pages/EVM_Staff";

export const evmStaffRoutes = {
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
            path: RELATIVE_PATHS.CAMPAIGNS,
            element: <CampaignManagement />,
        },
        {
            path: RELATIVE_PATHS.WARRANTY_CLAIMS,
            element: <WarrantyClaims />,
        },
        { path: "*", element: <NotFound /> },
    ],
};
