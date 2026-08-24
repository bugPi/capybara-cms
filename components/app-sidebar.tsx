"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  ScrollTextIcon,
} from "lucide-react";

type SidebarUser = {
  name: string;
  email: string;
  avatar?: string;
};

const navData = {
  navOperations: [
    {
      title: "控制面板",
      url: "/capybara/console",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "内容管理",
      url: "/capybara/content",
      icon: <FileTextIcon />,
      items: [
        { title: "文章列表", url: "/capybara/content/posts" },
        { title: "创建文章", url: "/capybara/content/posts/new" },
        { title: "分类管理", url: "/capybara/content/categories" },
        { title: "标签管理", url: "/capybara/content/tags" },
        { title: "回收站", url: "/capybara/content/posts?deleted=1" },
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
      title: "站点管理",
      url: "/capybara/sites",
      icon: <GlobeIcon />,
    },
    {
      title: "用户管理",
      url: "/capybara/users",
      icon: <UsersIcon />,
    },
    {
      title: "审计日志",
      url: "/capybara/audit",
      icon: <ScrollTextIcon />,
    },
    {
      title: "系统设置",
      url: "/capybara/settings",
      icon: <SettingsIcon />,
      items: [
        { title: "常规设置", url: "/capybara/settings/general" },
        { title: "API 配置", url: "/capybara/settings/api" },
        { title: "MCP 工具", url: "/capybara/settings/mcp" },
      ],
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Capybara CMS">
              <Link href="/capybara/console" className="gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand">
                  <Image
                    src="/capybara.svg"
                    alt="Capybara CMS"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold tracking-tight">
                    Capybara CMS
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    内容与发布平台
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          label="运营"
          items={navData.navOperations}
          activePath={pathname}
        />
        <NavMain
          label="系统"
          items={navData.navSystem}
          activePath={pathname}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
