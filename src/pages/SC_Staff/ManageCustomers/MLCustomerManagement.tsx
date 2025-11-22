import ROUTERS_PATH, { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import { CircleArrowLeft } from "lucide-react";
import { getNavLinkClass } from "@/layouts/style";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

export default function MLCustomerManagement() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header name="Quản Lý Khách Hàng" />
      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="relative bg-gray-200/80 backdrop-blur-sm p-1.5 rounded-full flex justify-center gap-2 shadow-inner">
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <NavLink
                to={ROUTERS_PATH.MANAGE_CUSTOMER}
                className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-slate-900 flex items-center"
                title="Quay lại"
              >
                <CircleArrowLeft className="w-6 h-6" />
              </NavLink>
            </div>

            <NavLink
              to={RELATIVE_PATHS.VEHICLE_INFORMATION}
              className={getNavLinkClass}
            >
              <span>Thông Tin Chi Tiết</span>
            </NavLink>

            <NavLink
              to={RELATIVE_PATHS.SERVICE_HISTORY}
              className={getNavLinkClass}
            >
              <span>Lịch Sử Dịch Vụ</span>
            </NavLink>

            <NavLink
              to={RELATIVE_PATHS.PARTS_MANAGEMENT}
              className={getNavLinkClass}
            >
              <span>Quản Lý Phụ Tùng</span>
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
