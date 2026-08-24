"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type User = { name: string; email: string; avatar?: string };

/** 路径 → 面包屑（第一部分链接到栏目根，第二部分为当前页） */
const BREADCRUMB_MAP: Record<string, { section: string; href: string; page: string }> = {
  "/capybara/console": { section: "控制面板", href: "/capybara/console", page: "概览" },
  "/capybara/content/posts": { section: "内容管理", href: "/capybara/content", page: "文章列表" },
  "/capybara/content/posts/new": { section: "内容管理", href: "/capybara/content", page: "创建文章" },
  "/capybara/content/categories": { section: "内容管理", href: "/capybara/content", page: "分类管理" },
  "/capybara/content/tags": { section: "内容管理", href: "/capybara/content", page: "标签管理" },
  "/capybara/media": { section: "媒体库", href: "/capybara/media", page: "全部媒体" },
  "/capybara/sites": { section: "站点管理", href: "/capybara/sites", page: "站点列表" },
  "/capybara/users": { section: "用户管理", href: "/capybara/users", page: "用户列表" },
  "/capybara/audit": { section: "审计日志", href: "/capybara/audit", page: "操作记录" },
  "/capybara/settings": { section: "系统设置", href: "/capybara/settings", page: "设置" },
  "/capybara/settings/general": { section: "系统设置", href: "/capybara/settings", page: "常规设置" },
  "/capybara/settings/api": { section: "系统设置", href: "/capybara/settings", page: "API 配置" },
  "/capybara/settings/mcp": { section: "系统设置", href: "/capybara/settings", page: "MCP 工具" },
};

function resolveBreadcrumb(pathname: string) {
  // 文章编辑页：/capybara/content/posts/[id]
  const editMatch = pathname.match(/^\/capybara\/content\/posts\/\d+$/);
  if (editMatch) {
    return { section: "内容管理", href: "/capybara/content", page: "编辑文章" };
  }
  return BREADCRUMB_MAP[pathname] ?? {
    section: "控制面板",
    href: "/capybara/console",
    page: "概览",
  };
}

/** 沉浸式编辑路由：隐藏全局页头，由编辑器自带极简顶栏接管 */
function isImmersiveRoute(pathname: string) {
  return (
    pathname === "/capybara/content/posts/new" ||
    /^\/capybara\/content\/posts\/\d+$/.test(pathname)
  );
}

export function ConsoleShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const crumb = resolveBreadcrumb(pathname);
  const immersive = isImmersiveRoute(pathname);

  return (
    <div className="arco contents">
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="console-surface">
          {immersive ? null : (
            <header className="console-header sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-4 md:px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="text-muted-foreground transition-colors hover:text-foreground">
                        {crumb.section}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{crumb.page}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
          )}
          {immersive ? (
            /* 沉浸模式：编辑器自带顶栏，内容占满全宽 */
            <main key={pathname} className="flex min-h-svh flex-1 flex-col">
              {children}
            </main>
          ) : (
            /* key=pathname：路由切换时重新触发入场动画 */
            <main key={pathname} className="anim-page flex-1 p-4 md:p-6">
              {children}
            </main>
          )}
        </SidebarInset>
        <Toaster position="top-center" richColors />
      </SidebarProvider>
    </div>
  );
}
