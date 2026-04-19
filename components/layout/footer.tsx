"use client";

import "@/lib/gsap-register";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const footerLinks = {
  product: [
    { href: "/#features", label: "产品能力" },
    { href: "/#pricing", label: "定价" },
  ],
  resources: [
    { href: "/blog", label: "博客" },
    { href: "/#faq", label: "常见问题" },
  ],
  company: [
    { href: "/about", label: "关于" },
    { href: "/privacy", label: "隐私政策" },
    { href: "/terms", label: "服务条款" },
  ],
};

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const foot = footerRef.current;
      if (!foot) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: foot,
          start: "top 88%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(foot.querySelectorAll(".motion-foot-col"), {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        immediateRender: false,
      }).from(
        foot.querySelectorAll(".motion-foot-bar > *"),
        {
          y: 16,
          opacity: 0,
          duration: 0.55,
          stagger: 0.05,
          immediateRender: false,
        },
        "-=0.35"
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="border-t border-border/40 bg-transparent"
    >
      <div className="mx-auto max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14 py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo */}
          <div className="motion-foot-col col-span-2 md:col-span-1">
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              从草稿到上线，每一跳都留痕。编辑、工程与智能体同一节拍的内容中台。
            </p>
          </div>

          {/* 产品 */}
          <div className="motion-foot-col">
            <h3 className="mb-4 text-sm font-medium text-foreground">产品</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 资源 */}
          <div className="motion-foot-col">
            <h3 className="mb-4 text-sm font-medium text-foreground">资源</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司 */}
          <div className="motion-foot-col">
            <h3 className="mb-4 text-sm font-medium text-foreground">公司</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部 */}
        <div className="motion-foot-bar mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Capybara CMS
          </p>
          <a
            href="mailto:sales@capybara-cms.example.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            sales@capybara-cms.example.com
          </a>
        </div>
      </div>
    </footer>
  );
}