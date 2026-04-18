"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const stats = [
  {
    value: "100+",
    label: "企业客户",
    sublabel: "覆盖科技、金融、教育等行业",
  },
  {
    value: "500K+",
    label: "内容发布",
    sublabel: "每月新增超过50万篇内容",
  },
  {
    value: "99.99%",
    label: "系统可用性",
    sublabel: "SLA保障，全年无故障运行",
  },
  {
    value: "<50ms",
    label: "响应时间",
    sublabel: "全球边缘节点，极速响应",
  },
];

const trustItems = [
  "SOC 2 Type II 认证",
  "GDPR 合规",
  "ISO 27001",
  "24/7 技术支持",
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-stats-head > *"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.07,
      })
        .from(
          section.querySelectorAll(".motion-stat-item"),
          {
            y: 36,
            autoAlpha: 0,
            duration: 0.75,
            stagger: 0.08,
          },
          "-=0.35"
        )
        .from(
          section.querySelectorAll(".motion-trust-item"),
          {
            y: 18,
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.06,
          },
          "-=0.4"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="motion-stats-head mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">用数据证明价值</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            我们持续为企业客户创造价值，帮助内容团队提升效率、降低成本。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="motion-stat-item group text-center">
              <div className="mb-2 text-4xl font-bold tracking-tight text-foreground transition-transform group-hover:scale-105 sm:text-5xl lg:text-6xl">
                {stat.value}
              </div>
              <div className="mb-1 text-base font-medium text-foreground">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border/40 pt-12">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            {trustItems.map((label, i) => (
              <div key={label} className="motion-trust-item flex items-center gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
