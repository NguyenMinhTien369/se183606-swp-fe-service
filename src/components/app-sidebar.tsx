import * as React from "react";
import { Users, ClipboardPlus, Building2, Wrench } from "lucide-react";
import { NavLink } from "react-router";
import ROUTERS_PATH from "@/constants/routers";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 🧩 Danh sách menu chính
  const menuItems = [
    {
      title: "Quản Lí Khách Hàng",
      icon: <Users className="size-4" />,
      to: ROUTERS_PATH.MANAGE_CUSTOMER,
    },
    {
      title: "Tạo Bảo Hành",
      icon: <ClipboardPlus className="size-4" />,
      to: ROUTERS_PATH.CREATE_WARRANTY,
    },
    {
      title: "Quản Lí Nội Bộ",
      icon: <Building2 className="size-4" />,
      to: ROUTERS_PATH.INTERNAL_MANAGEMENT,
    },
    {
      title: "Thực Hiện Bảo Hành",
      icon: <Wrench className="size-4" />,
      to: ROUTERS_PATH.CONDUCT_WARRANTY,
    },
  ];

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
                      `flex items-center gap-2 font-medium rounded-md px-3 py-2 transition-colors ${
                        isActive
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
    </Sidebar>
  );
}
