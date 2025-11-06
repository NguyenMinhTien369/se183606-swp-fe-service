import * as React from "react";
import {
  Users, ClipboardPlus, Building2, Wrench,
  LayoutDashboard, Package,
  CheckCircle, Megaphone
} from "lucide-react";
import { NavLink } from "react-router";
import ROUTERS_PATH from "@/constants/routers";
import { useAuth } from "@/pages/Login/feature/AuthContext";
import { ROLES } from "@/utils/constants";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // 🧩 Danh sách menu theo role
  const getMenuItems = () => {
    const roleName = user?.role?.roleName;

    // Ensure we have a valid roleName
    if (!roleName) {
      return [];
    }

    // Admin menu
    if (roleName === ROLES.ADMIN) {
      return [
        {
          title: "Dashboard",
          icon: <LayoutDashboard className="size-4" />,
          to: ROUTERS_PATH.ADMIN_DASHBOARD,
        },
        {
          title: "Quản Lý Người Dùng",
          icon: <Users className="size-4" />,
          to: ROUTERS_PATH.ADMIN_USERS,
        },
        {
          title: "Quản Lý Sản Phẩm",
          icon: <Package className="size-4" />,
          to: ROUTERS_PATH.ADMIN_PRODUCTS,
        },
        {
          title: "Quản Lý Đơn Bảo Hành",
          icon: <CheckCircle className="size-4" />,
          to: ROUTERS_PATH.ADMIN_WARRANTY_APPROVAL,
        },
      ];
    }

    // EVM Staff menu
    if (roleName === ROLES.EVM_STAFF) {
      return [
        {
          title: "Dashboard",
          icon: <LayoutDashboard className="size-4" />,
          to: ROUTERS_PATH.EVM_DASHBOARD,
        },
        {
          title: "Quản Lý Sản Phẩm",
          icon: <Package className="size-4" />,
          to: "/evm/products",
        },
        {
          title: "Quản Lý Chiến Dịch",
          icon: <Megaphone className="size-4" />,
          to: ROUTERS_PATH.EVM_CAMPAIGNS,
        },
        {
          title: "Quản Lý Đơn Bảo Hành",
          icon: <CheckCircle className="size-4" />,
          to: ROUTERS_PATH.EVM_WARRANTY_CLAIMS,
        },
      ];
    }

    // SC Staff menu
    if (roleName === ROLES.SC_STAFF) {
      return [
        {
          title: "Dashboard",
          icon: <LayoutDashboard className="size-4" />,
          to: ROUTERS_PATH.SC_STAFF_DASHBOARD,
        },
        {
          title: "Quản Lí Khách Hàng",
          icon: <Users className="size-4" />,
          to: ROUTERS_PATH.MANAGE_CUSTOMER,
        },
        {
          title: "Quản Lí Nội Bộ",
          icon: <Building2 className="size-4" />,
          to: ROUTERS_PATH.INTERNAL_MANAGEMENT,
        },
        {
          title: "Tạo Bảo Hành",
          icon: <ClipboardPlus className="size-4" />,
          to: ROUTERS_PATH.CREATE_WARRANTY,
        },
        {
          title: "Thực Hiện Bảo Hành",
          icon: <Wrench className="size-4" />,
          to: ROUTERS_PATH.CONDUCT_WARRANTY,
        },
      ];
    }

    // Technician menu
    if (roleName === ROLES.SC_TECHNICIAN) {
      return [
        {
          title: "Dashboard",
          icon: <LayoutDashboard className="size-4" />,
          to: ROUTERS_PATH.SC_TECHNICIAN_DASHBOARD,
        },
        {
          title: "Tạo Bảo Hành",
          icon: <ClipboardPlus className="size-4" />,
          to: ROUTERS_PATH.CREATE_WARRANTY,
        },
        {
          title: "Thực Hiện Bảo Hành",
          icon: <Wrench className="size-4" />,
          to: ROUTERS_PATH.CONDUCT_WARRANTY,
        },
      ];
    }

    // Default menu (fallback)
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar variant="floating" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink
                to={ROUTERS_PATH.HOME}
                className="flex items-center gap-2"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Wrench className="size-4" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-medium">Bảo Hành Pro</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nội dung menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 font-medium rounded-md px-3 py-2 transition-colors ${isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.fullName || user.username,
              email: user.email || '',
              avatar: '/avatars/default.jpg'
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
