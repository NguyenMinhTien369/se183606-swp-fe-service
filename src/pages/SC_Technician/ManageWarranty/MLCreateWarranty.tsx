import { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import { Bell, Car, FileText } from "lucide-react";

export default function MLCustomerManagement() {
  return (
    <>
      <Header name="Hệ Thống Quản Lý Bảo Hành" />
      <div className="p-4">
        <div
          className="bg-gray-200 pt-1 pb-1 text-black  flex justify-center gap-6 rounded-4xl
      w-3/6  align-middle mx-auto  "
        >
          <NavLink
            to={RELATIVE_PATHS.CREATE_WARRANTY}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            <Car className="h-4 w-4" /> Tra cứu xe
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.WARRANTY_LIST}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            <FileText className="h-4 w-4" />
            Theo dõi yêu cầu
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.MANUFACTURER_RESPONSE_PANEL}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            <Bell className="h-4 w-4" />
            Phản hồi hãng
          </NavLink>
        </div>

        <main className="p-4">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
}
