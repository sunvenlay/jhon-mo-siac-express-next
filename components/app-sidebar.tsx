"use client";

import * as React from "react";
import {
  Brain,
  LayoutDashboard,
  Map as MapIcon,
  Settings,
  Truck,
  Users,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Operacional",
      items: [
        {
          title: "Panel Principal",
          url: "/",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Flota (Vehículos)",
          url: "/dashboard/fleet",
          icon: Truck,
        },
        {
          title: "Conductores",
          url: "/dashboard/fleet?tab=drivers",
          icon: Users,
        },
        {
          title: "Viajes",
          url: "/dashboard/trips",
          icon: MapIcon,
        },
      ],
    },
    {
      title: "Analítica",
      items: [
        {
          title: "Insights IA",
          url: "/dashboard/analytics",
          icon: Brain,
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Configuración",
          url: "/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Truck className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Jhon Mo S.I.A.C.</span>
            <span className="truncate text-xs">Gestión de Flotas</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="py-4 text-xs text-muted-foreground px-2">
          &copy; 2025 Jhon Mo S.A.C.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
