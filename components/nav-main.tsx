"use client";

import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** 判断路径是否命中（支持子路径前缀） */
function isPathActive(pathname: string, url: string): boolean {
  if (url === "/capybara/console") return pathname === url;
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({
  label,
  items,
  activePath,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  /** 当前路径，用于自动高亮 */
  activePath?: string;
}) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => {
          const parentActive = activePath
            ? isPathActive(activePath, item.url)
            : !!item.isActive;

          if (item.items?.length) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={parentActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      data-active={parentActive}
                      className={cn(
                        parentActive &&
                          "data-[active=true]:bg-brand/10 data-[active=true]:text-brand data-[active=true]:hover:bg-brand/10 data-[active=true]:hover:text-brand"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const subActive = activePath
                          ? isPathActive(activePath, subItem.url)
                          : false;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              data-active={subActive}
                              className={cn(
                                subActive &&
                                  "data-[active=true]:bg-brand/10 data-[active=true]:text-brand data-[active=true]:font-medium data-[active=true]:hover:bg-brand/10 data-[active=true]:hover:text-brand"
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                data-active={parentActive}
                className={cn(
                  parentActive &&
                    "data-[active=true]:bg-brand/10 data-[active=true]:text-brand data-[active=true]:hover:bg-brand/10 data-[active=true]:hover:text-brand"
                )}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
