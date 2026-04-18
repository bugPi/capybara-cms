"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Braces, Workflow, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";

/** 紧接 Hero：三条与 CMS 强相关的产品主张 */
const items = [
  {
    icon: Braces,
    title: "结构化内容与 API",
    description:
      "统一内容模型、REST 与 Webhook，站点和业务系统共用一套契约，少做重复对接。",
  },
  {
    icon: Workflow,
    title: "发布流程可追溯",
    description:
      "审批、版本、权限能落到段落；谁在什么时间改了什么，有据可查，不靠群聊兜底。",
  },
  {
    icon: PlugZap,
    title: "MCP 与 SEO 原生一体",
    description:
      "智能体按工具在权限内参与起草与发布；元数据、站点地图与结构化数据跟着内容走，少临上线补洞。",
  },
] as const;

export function ValueStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      gsap.from(section.querySelectorAll(".motion-value-head > *"), {
        y: 22,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        immediateRender: false,
      });

      gsap.from(section.querySelectorAll(".motion-value-card"), {
        y: 36,
        x: (i) => (i % 2 === 0 ? -10 : 10),
        autoAlpha: 0,
        duration: 0.68,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        immediateRender: false,
      });

      const cards = gsap.utils.toArray<HTMLElement>(
        section.querySelectorAll(".motion-value-card")
      );
      const cleaners: Array<() => void> = [];
      cards.forEach((card) => {
        const enter = () => {
          gsap.to(card, {
            y: -6,
            scale: 1.015,
            duration: 0.35,
            ease: "power2.out",
          });
        };
        const leave = () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "power3.out",
          });
        };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        cleaners.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      return () => cleaners.forEach((fn) => fn());
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="value"
      className="scroll-mt-24 border-b border-border/40 bg-transparent py-14 lg:py-20"
      aria-labelledby="value-heading"
    >
      <div className="mx-auto max-w-[min(100%,76rem)] px-5 sm:px-8 lg:px-14">
        <header className="motion-value-head mb-10 max-w-2xl lg:mb-14">
          <p className="mb-2 font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
            产品主张
          </p>
          <h2
            id="value-heading"
            className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl"
          >
            为「内容进生产」而造，不是另一套摆设后台
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            下面三条都是 Capybara CMS 实际在解决的问题：模型与接口、流程与审计、智能体与
            SEO——和下面九块能力里的各条相呼应。
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, i) => (
            <li
              key={item.title}
              className={cn(
                "motion-value-card flex flex-col rounded-2xl border border-border/55 bg-card/60 p-5 shadow-sm backdrop-blur-sm dark:border-border/45 dark:bg-card/40",
                i === 2 && "sm:col-span-2 lg:col-span-1"
              )}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-brand dark:bg-brand/18">
                <item.icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
