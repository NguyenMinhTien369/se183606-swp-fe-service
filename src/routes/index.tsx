import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "../pages/Home/Home";
import ManageCustomer from "@/pages/manageCustomer/ManageCustomer";
import CreateWarranty from "@/pages/CreateWarranty/CreateWarranty";
import InternalManagement from "@/pages/InternalManagement/InternalManagement";
import ConductWarranty from "@/pages/ConductWarranty/ConductWarranty";
import ROUTERS_PATH from "@/constants/routers";
import NotFound from "@/pages/NotFound";
import CustomerSearch from "@/pages/manageCustomer/features/CustomerSearch";

// Nơi để mình cấu hình các routes cho ứng dụng
function Routers() {
  const routers = createBrowserRouter([
    {
      path: ROUTERS_PATH.HOME,
      element: <MainLayout />,
      children: [
        { index: true, element: <Home /> },
        {
          path: ROUTERS_PATH.MANAGE_CUSTOMER,
          element: <ManageCustomer />,
        },
        { path: ROUTERS_PATH.CUSTOMER_SEARCH, element: <CustomerSearch /> },
        { path: ROUTERS_PATH.CREATE_WARRANTY, element: <CreateWarranty /> },
        {
          path: ROUTERS_PATH.INTERNAL_MANAGEMENT,
          element: <InternalManagement />,
        },
        { path: ROUTERS_PATH.CONDUCT_WARRANTY, element: <ConductWarranty /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);
  return <RouterProvider router={routers} />;
}

export default Routers;
