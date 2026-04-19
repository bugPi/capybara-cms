"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
] as const;

function navLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-transparent">
      <nav
        className="mx-auto flex h-14 max-w-[min(100%,82rem)] items-center justify-between px-5 sm:px-8 lg:px-14"
        aria-label="主导航"
      >
        {/* 左侧 Logo */}
        <Link
          href="/"
          className="flex items-center font-medium text-foreground transition-opacity hover:opacity-70"
          aria-label="Capybara CMS"
        >
          <svg
            viewBox="0 0 100 100"
            className="h-9 w-9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M25 40C25 35 60 30 75 40C85 50 85 65 75 70C60 75 30 75 25 65V40Z" />
            <path d="M70 45C72 45 72 48 70 48M30 35C30 32 35 32 35 35" />
            <path d="M78 55H85M75 62H82" />
          </svg>
        </Link>

        {/* 中间导航链接 */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = navLinkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "px-4 py-2 text-sm font-medium text-foreground"
                    : "px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* 右侧按钮 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex h-8 px-3 text-sm"
          >
            登录
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 text-sm rounded-full"
          >
            开始使用
          </Button>
        </div>
      </nav>
    </header>
  );
}