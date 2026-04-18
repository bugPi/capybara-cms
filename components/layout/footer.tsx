"use client";

import "@/lib/gsap-register";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const footerLinks = {
  product: [
    { href: "#features", label: "功能" },
    { href: "#pricing", label: "价格" },
    { href: "#integrations", label: "集成" },
    { href: "#changelog", label: "更新日志" },
  ],
  resources: [
    { href: "#docs", label: "文档" },
    { href: "#api", label: "API 参考" },
    { href: "#guides", label: "使用指南" },
    { href: "#blog", label: "博客" },
  ],
  company: [
    { href: "#about", label: "关于我们" },
    { href: "#careers", label: "招聘" },
    { href: "#contact", label: "联系我们" },
    { href: "#press", label: "媒体" },
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
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.07,
      }).from(
        foot.querySelectorAll(".motion-foot-bar > *"),
        {
          y: 16,
          autoAlpha: 0,
          duration: 0.55,
          stagger: 0.05,
        },
        "-=0.35"
      );
    },
    { scope: footerRef }
  );

  return (
    <footer
      ref={footerRef}
      className="border-t border-border/40 bg-muted/30"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="motion-foot-col col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <svg
                viewBox="0 0 100 100"
                className="h-6 w-6 text-foreground"
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
              <span>Capybara CMS</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              为现代企业打造的智能内容管理平台。
            </p>
          </div>

          <div className="motion-foot-col">
            <h3 className="mb-4 font-semibold">产品</h3>
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

          <div className="motion-foot-col">
            <h3 className="mb-4 font-semibold">资源</h3>
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

          <div className="motion-foot-col">
            <h3 className="mb-4 font-semibold">公司</h3>
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

        <div className="motion-foot-bar mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Capybara CMS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              隐私政策
            </Link>
            <Link
              href="#terms"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
