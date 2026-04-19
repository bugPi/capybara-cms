"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  ImageIcon,
  UsersIcon,
  SettingsIcon,
  GlobeIcon,
} from "lucide-react";

const data = {
  user: {
    name: "管理员",
    email: "admin@capybara-cms.local",
    avatar: "",
  },
  navOperations: [
    {
      title: "控制面板",
      url: "/capybara/console",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "内容管理",
      url: "/capybara/content",
      icon: <FileTextIcon />,
      isActive: false,
      items: [
        { title: "文章列表", url: "/capybara/content/posts" },
        { title: "创建文章", url: "/capybara/content/posts/new" },
        { title: "分类管理", url: "/capybara/content/categories" },
        { title: "标签管理", url: "/capybara/content/tags" },
      ],
    },
    {
      title: "媒体库",
      url: "/capybara/media",
      icon: <ImageIcon />,
    },
  ],
  navSystem: [
    {
      title: "站点设置",
      url: "/capybara/sites",
      icon: <GlobeIcon />,
    },
    {
      title: "用户管理",
      url: "/capybara/users",
      icon: <UsersIcon />,
    },
    {
      title: "系统设置",
      url: "/capybara/settings",
      icon: <SettingsIcon />,
      isActive: false,
      items: [
        { title: "常规设置", url: "/capybara/settings/general" },
        { title: "API 配置", url: "/capybara/settings/api" },
        { title: "MCP 工具", url: "/capybara/settings/mcp" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Capybara CMS"
            >
              <Link href="/capybara/console">
                <div className="flex size-8 items-center justify-center rounded-lg bg-transparent">
                  <Image
                    src="/capybara.svg"
                    alt="Capybara CMS"
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Capybara CMS</span>
                  <span className="truncate text-xs text-muted-foreground">后台管理</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="运营" items={data.navOperations} />
        <NavMain label="系统" items={data.navSystem} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}