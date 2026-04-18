"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const h = headerRef.current;
      if (!h) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.from(h.querySelector(".motion-nav-brand"), {
        x: -14,
        autoAlpha: 0,
        duration: 0.55,
      })
        .from(
          h.querySelectorAll(".motion-nav-link"),
          {
            y: -10,
            autoAlpha: 0,
            duration: 0.45,
            stagger: 0.06,
          },
          "-=0.28"
        )
        .from(
          h.querySelectorAll(".motion-nav-cta"),
          {
            x: 14,
            autoAlpha: 0,
            duration: 0.48,
            stagger: 0.07,
          },
          "-=0.32"
        );
    },
    { scope: headerRef }
  );

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        <div className="flex min-w-0 flex-1 justify-start">
          <Link
            href="/"
            className="motion-nav-brand flex items-center gap-2 font-semibold"
          >
            <svg
              viewBox="0 0 100 100"
              className="h-8 w-8 text-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M25 40C25 35 60 30 75 40C85 50 85 65 75 70C60 75 30 75 25 65V40Z" />
              <path d="M70 45C72 45 72 48 70 48M30 35C30 32 35 32 35 35" />
              <path d="M78 55H85M75 62H82" />
            </svg>
            <span className="text-lg">Capybara CMS</span>
          </Link>
        </div>

        <nav
          className="motion-nav flex shrink-0 justify-center"
          aria-label="主导航"
        >
          <div className="flex items-center gap-6 sm:gap-8">
            {navLinks.map((link) => {
              const active = navLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`motion-nav-link text-xs transition-colors sm:text-sm ${
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="motion-nav-cta hidden sm:inline-flex"
          >
            登录
          </Button>
        </div>
      </div>
    </header>
  );
}
