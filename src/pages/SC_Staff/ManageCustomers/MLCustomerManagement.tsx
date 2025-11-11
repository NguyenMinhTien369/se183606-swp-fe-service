import React from "react";
import ROUTERS_PATH from "@/constants/routers";
import { NavLink, Outlet } from "react-router";

export default function MLCustomerManagement() {
  return (
    <div>
      <div className="bg-blue-200">
        <NavLink to={ROUTERS_PATH.VEHICLE_INFORMATION}>
          Vehicle Information
        </NavLink>
        <NavLink to={ROUTERS_PATH.SERVICE_HISTORY}>Service History</NavLink>
        <NavLink to={ROUTERS_PATH.PARTS_MANAGEMENT}>Parts Management</NavLink>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
