"use client";

import { Link, usePathname } from "@/i18n/routing";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/blog", labelKey: "blog" as const },
  { href: "/about", labelKey: "about" as const },
];

function navLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-transparent backdrop-blur-sm"
          : "bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-14 max-w-[min(100%,82rem)] items-center justify-between px-5 sm:px-8 lg:px-14"
        aria-label={t("mainNav")}
      >
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
                    ? "px-4 py-2 text-sm font-medium text-brand"
                    : "px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                }
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button asChild size="sm" className="h-8 px-4 text-sm rounded-full">
            <NextLink href="/capybara/login">{t("login")}</NextLink>
          </Button>
        </div>
      </nav>
    </header>
  );
}
