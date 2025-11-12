import { RELATIVE_PATHS } from "@/constants/routers";
import { NavLink, Outlet } from "react-router";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";

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
            to={RELATIVE_PATHS.WARRANTY_REQUEST}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            Yêu Cầu Bảo Hành
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.ASSIGN_TECHNICIAN}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            Phân Công
          </NavLink>

          <NavLink
            to={RELATIVE_PATHS.PROGRESS}
            className="px-3 py-2 rounded-4xl hover:bg-slate-950 font-bold  hover:text-white transition-colors duration-200 
          "
          >
            Tiến Độ
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
