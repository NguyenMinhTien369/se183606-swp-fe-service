import { Navigate } from "react-router";
import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { ROLES } from "@/utils/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "@/pages/NotFound";

// Admin Pages
import {
    AdminDashboard,
    UserManagement,
    ProductManagement,
    WarrantyApproval,
} from "@/pages/Admin";

export const adminRoutes = {
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
};
