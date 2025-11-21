import { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import { Bell, Car, FileText } from "lucide-react";
import { getNavLinkClass } from "@/layouts/style";

export default function MLCustomerManagement() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header name="Hệ Thống Quản Lý Bảo Hành" />

      <div className="flex-1 p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-gray-200/80 backdrop-blur-sm p-1.5 rounded-full flex justify-between sm:justify-center gap-2 shadow-inner">
            <NavLink
              to={RELATIVE_PATHS.CREATE_WARRANTY}
              className={getNavLinkClass}
            >
              <Car className="h-4 w-4" />
              <span>Tra cứu xe</span>
            </NavLink>

            <NavLink
              to={RELATIVE_PATHS.WARRANTY_LIST}
              className={getNavLinkClass}
            >
              <FileText className="h-4 w-4" />
              <span>Theo dõi yêu cầu</span>
            </NavLink>

            <NavLink
              to={RELATIVE_PATHS.MANUFACTURER_RESPONSE_PANEL}
              className={getNavLinkClass}
            >
              <Bell className="h-4 w-4" />
              <span>Phản hồi hãng</span>
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
