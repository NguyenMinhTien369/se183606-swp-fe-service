import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../pages/Home/Home";
import ManageCustomer from "@/pages/manageCustomer/ManageCustomer";

function Routers() {
  const routers = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/ManageCustomer", element: <ManageCustomer /> },
  ]);
  return <RouterProvider router={routers} />;
}

export default Routers;
