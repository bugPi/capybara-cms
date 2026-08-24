"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { KeyRoundIcon, LogOutIcon } from "lucide-react";
import { logout } from "@/lib/actions/auth";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [pending, startTransition] = useTransition();

  // 取邮箱第一个字符作为头像显示
  const avatarText = user.email.charAt(0).toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "退出失败");
      }
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-0"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground font-semibold">
                {avatarText}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl p-1 border-0 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground font-semibold">
                  {avatarText}
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-lg px-2 py-1.5 cursor-pointer">
              <Link href="/capybara/account" className="flex items-center gap-2">
                <KeyRoundIcon className="size-4" />
                <span>修改密码</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              disabled={pending}
              className="rounded-lg px-2 py-1.5 cursor-pointer focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOutIcon className="size-4" />
              <span>{pending ? "退出中…" : "退出登录"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}