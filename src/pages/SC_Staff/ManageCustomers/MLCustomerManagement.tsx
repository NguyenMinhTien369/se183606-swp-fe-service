import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import { CircleArrowLeft } from "lucide-react";

export default function MLCustomerManagement() {
  return (
    <div className="p-4">
      <div className="relative bg-gray-200 pt-0.5 pb-0.5 text-black rounded-4xl w-full mx-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <NavLink to={ROUTERS_PATH.MANAGE_CUSTOMER} className="px-3 py-2 ">
            <CircleArrowLeft />
          </NavLink>
        </div>

        <div className="flex justify-center gap-6">
          <NavLink
            to={RELATIVE_PATHS.VEHICLE_INFORMATION}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold hover:text-white transition-colors duration-200"
          >
            Thông Tin Chi Tiết
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.SERVICE_HISTORY}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold hover:text-white transition-colors duration-200"
          >
            Lịch Sử Dịch Vụ
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.PARTS_MANAGEMENT}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold hover:text-white transition-colors duration-200"
          >
            Quản Lý Phụ Tùng
          </NavLink>
        </div>
      </div>

      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
