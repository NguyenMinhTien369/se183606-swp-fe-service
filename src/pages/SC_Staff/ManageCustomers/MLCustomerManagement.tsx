import { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";

export default function MLCustomerManagement() {
  return (
    <div className="p-4">
      <div
        className="bg-gray-200 text-black p-4 flex justify-center gap-4 rounded-4xl
      w-3/6  align-middle mx-auto"
      >
        <NavLink
          to={RELATIVE_PATHS.VEHICLE_INFORMATION}
          className="px-3 py-2 rounded-lg hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
        >
          Vehicle Information
        </NavLink>

        <NavLink
          to={RELATIVE_PATHS.SERVICE_HISTORY}
          className="px-3 py-2 rounded-lg hover:bg-slate-950 font-bold hover:text-white transition-colors duration-200 
          "
        >
          Service History
        </NavLink>

        <NavLink
          to={RELATIVE_PATHS.PARTS_MANAGEMENT}
          className="px-3 py-2 rounded-lg hover:bg-slate-950 font-bold hover:text-white transition-colors duration-200 
          "
        >
          Parts Management
        </NavLink>
      </div>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
