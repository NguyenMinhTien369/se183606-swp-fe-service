import { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import { getNavLinkClass } from "@/layouts/style";

import { ClipboardList, UserCog, Activity } from "lucide-react";

export default function MLInternalManagement() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header name="Quản Lí Nội Bộ" />

      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-gray-200/80 backdrop-blur-sm p-1.5 rounded-full flex justify-center gap-2 shadow-inner">
            <NavLink
              to={RELATIVE_PATHS.WARRANTY_REQUEST}
              className={getNavLinkClass}
            >
              <ClipboardList className="h-4 w-4" />
              <span>Yêu Cầu Bảo Hành</span>
            </NavLink>

            <NavLink
              to={RELATIVE_PATHS.ASSIGN_TECHNICIAN}
              className={getNavLinkClass}
            >
              <UserCog className="h-4 w-4" />
              <span>Phân Công</span>
            </NavLink>

            <NavLink to={RELATIVE_PATHS.PROGRESS} className={getNavLinkClass}>
              <Activity className="h-4 w-4" />
              <span>Tiến Độ</span>
            </NavLink>
          </div>
        </div>

        <main className="w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
