import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <div>
      //Đây là nơi để react hiển thị
      <Outlet />
    </div>
  );
}
