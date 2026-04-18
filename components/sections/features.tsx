"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import {
  FileEdit,
  Globe,
  Users,
  Shield,
  PlugZap,
  ScanSearch,
  Cable,
  BarChart3,
  Zap,
} from "lucide-react";

/**
 * 便签：纯色纸 + 顶部图钉 + 单层阴影。不再叠格线/红边/磁条/胶带，避免「不像便签」。
 */
const bento = [
  {
    icon: PlugZap,
    title: "MCP 发博客",
    description: "智能体在围栏里干活：起草、过审、定时发，脚印全留着。",
    sheet:
      "bg-[#f5e6a3] text-stone-900 dark:bg-[#3d3518] dark:text-[#faf6e8] dark:ring-1 dark:ring-amber-900/40",
    tilt: -2,
    span: "lg:col-span-7 lg:row-span-2 min-h-[200px] lg:min-h-[280px]",
  },
  {
    icon: ScanSearch,
    title: "SEO 全链路",
    description: "标题、URL、OG、站点地图与 JSON-LD——像给页面穿上统一制服。",
    sheet:
      "bg-[#cfeffc] text-stone-900 dark:bg-[#153038] dark:text-[#e8f7fc] dark:ring-1 dark:ring-cyan-900/45",
    tilt: 1.6,
    span: "lg:col-span-5 min-h-[160px]",
  },
  {
    icon: FileEdit,
    title: "智能编辑器",
    description: "Markdown、富文本、代码块一锅端——对内对外同一支笔。",
    sheet:
      "bg-[#e2e5f5] text-stone-900 dark:bg-[#252838] dark:text-[#eef0fc] dark:ring-1 dark:ring-indigo-900/40",
    tilt: -1.4,
    span: "lg:col-span-5 min-h-[160px]",
  },
  {
    icon: Users,
    title: "协作与审批",
    description: "谁动哪一段，系统记得比人清楚——批注、任务、权限到段落。",
    sheet:
      "bg-[#edd8f5] text-stone-900 dark:bg-[#301f3d] dark:text-[#f6edfb] dark:ring-1 dark:ring-violet-900/40",
    tilt: 1.9,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    icon: Globe,
    title: "多渠道发布",
    description: "一篇稿子建一次模，Web / App、公众号各自取用，少改五遍后台。",
    sheet:
      "bg-[#cfe2ff] text-stone-900 dark:bg-[#1a2840] dark:text-[#e8f0ff] dark:ring-1 dark:ring-blue-900/40",
    tilt: -1.2,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    icon: Shield,
    title: "安全与部署",
    description: "加密、权限、审计打底；云上或私有化，按合规来。",
    sheet:
      "bg-[#c8ebd4] text-stone-900 dark:bg-[#1a3024] dark:text-[#e8f5ec] dark:ring-1 dark:ring-emerald-900/40",
    tilt: 1.4,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    icon: Cable,
    title: "REST 与 Webhook",
    description: "内容与流程可编程；事件进工单、IM 或 CI，不另造黑箱。",
    sheet:
      "bg-[#c5e7f7] text-stone-900 dark:bg-[#153040] dark:text-[#e5f4fc] dark:ring-1 dark:ring-sky-900/40",
    tilt: -1.7,
    span: "lg:col-span-6 min-h-[170px]",
  },
  {
    icon: BarChart3,
    title: "阅读与转化洞见",
    description: "曝光、停留、转化贴回栏目——下一季选题少拍脑袋。",
    sheet:
      "bg-[#fad4e8] text-stone-900 dark:bg-[#3a1f2e] dark:text-[#fcecf4] dark:ring-1 dark:ring-pink-900/40",
    tilt: 1.5,
    span: "lg:col-span-6 min-h-[170px]",
  },
  {
    icon: Zap,
    title: "性能与边缘",
    description: "静态 + CDN，缓存与失效按环境调，打开更稳。",
    sheet:
      "bg-[#ffe0c2] text-stone-900 dark:bg-[#3d2815] dark:text-[#fff5e8] dark:ring-1 dark:ring-orange-900/40",
    tilt: 0.6,
    span: "lg:col-span-12 min-h-[140px]",
  },
] as const;

function PushPin() {
  return (
    <div
      className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 select-none"
      aria-hidden
    >
      <span className="block text-[1.65rem] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
        📌
      </span>
    </div>
  );
}

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const setupInteractions = () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll(".motion-feat-card")
        );
        const cleaners: Array<() => void> = [];

        cards.forEach((hull) => {
          const inner = hull.querySelector<HTMLElement>(".feat-note-tilt");
          const tilt = Number.parseFloat(hull.dataset.tilt ?? "0");
          gsap.set(hull, { rotation: tilt, transformPerspective: 1000 });

          const enter = () => {
            gsap.to(hull, {
              y: -12,
              scale: 1.02,
              rotation: 0,
              zIndex: 20,
              duration: 0.4,
              ease: "back.out(1.25)",
            });
            inner &&
              gsap.to(inner, { z: 20, duration: 0.35, ease: "power2.out" });
          };

          const leave = () => {
            gsap.to(hull, {
              y: 0,
              scale: 1,
              rotation: tilt,
              zIndex: 0,
              duration: 0.48,
              ease: "power3.out",
            });
            inner &&
              gsap.to(inner, {
                rotateX: 0,
                rotateY: 0,
                z: 0,
                duration: 0.5,
                ease: "power3.out",
              });
          };

          let rxTo: ReturnType<typeof gsap.quickTo> | null = null;
          let ryTo: ReturnType<typeof gsap.quickTo> | null = null;
          if (inner) {
            gsap.set(inner, { transformOrigin: "50% 50%", force3D: true });
            rxTo = gsap.quickTo(inner, "rotateX", {
              duration: 0.45,
              ease: "power3",
            });
            ryTo = gsap.quickTo(inner, "rotateY", {
              duration: 0.45,
              ease: "power3",
            });
          }

          const onMove = (e: PointerEvent) => {
            if (!inner || !rxTo || !ryTo) return;
            const r = hull.getBoundingClientRect();
            ryTo(((e.clientX - r.left) / r.width - 0.5) * 10);
            rxTo((-(e.clientY - r.top) / r.height + 0.5) * 8);
          };

          const onLeavePointer = () => {
            rxTo?.(0);
            ryTo?.(0);
          };

          hull.addEventListener("mouseenter", enter);
          hull.addEventListener("mouseleave", leave);
          hull.addEventListener("pointermove", onMove);
          hull.addEventListener("pointerleave", onLeavePointer);
          cleaners.push(() => {
            hull.removeEventListener("mouseenter", enter);
            hull.removeEventListener("mouseleave", leave);
            hull.removeEventListener("pointermove", onMove);
            hull.removeEventListener("pointerleave", onLeavePointer);
          });
        });

        return () => cleaners.forEach((fn) => fn());
      };

      const cardEls = section.querySelectorAll(".motion-feat-card");
      if (!reduceMotion) {
        gsap.set(cardEls, {
          rotation: (_i, el) =>
            Number.parseFloat((el as HTMLElement).dataset.tilt ?? "0"),
        });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-feat-head > *"), {
        y: 24,
        x: -14,
        autoAlpha: 0,
        duration: 0.62,
        stagger: 0.06,
        immediateRender: false,
      });

      if (reduceMotion) {
        tl.from(
          cardEls,
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.45,
            stagger: 0.05,
            immediateRender: false,
          },
          "-=0.3"
        );
      } else {
        tl.from(
          cardEls,
          {
            y: 56,
            autoAlpha: 0,
            rotation: () => gsap.utils.random(-5, 5),
            duration: 0.75,
            stagger: { each: 0.07, from: "random" },
            ease: "back.out(1.1)",
            immediateRender: false,
          },
          "-=0.3"
        );
      }

      let removeInteractions = reduceMotion ? () => {} : setupInteractions();
      const head = section.querySelector(".motion-feat-head");
      let headParallax: gsap.core.Tween | null = null;
      if (head) {
        headParallax = gsap.to(head, {
          y: -36,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9,
          },
        });
      }

      return () => {
        removeInteractions();
        tl.scrollTrigger?.kill();
        tl.kill();
        headParallax?.scrollTrigger?.kill();
        headParallax?.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="scroll-mt-24 bg-transparent py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[min(100%,76rem)] px-5 sm:px-8 lg:px-14">
        <div className="motion-feat-head mb-12 max-w-3xl text-left lg:mb-16">
          <h2 className="text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]">
            九块能力，一块一事
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            MCP 发博客、SEO、编辑器、协作与审批、多渠道发布、REST/Webhook、阅读洞见、性能边缘，再加安全与部署——各管一摊，按需跳读，不堆成一篇「全能说明书」。
          </p>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-7">
          {bento.map((item, index) => (
            <div
              key={item.title}
              data-tilt={item.tilt}
              className={cn(
                "motion-feat-card feat-note-hull group relative isolate cursor-default perspective-[1000px]",
                item.span
              )}
            >
              <div className="feat-note-tilt h-full transform-3d will-change-transform pt-3">
                <article
                  className={cn(
                    "relative flex min-h-full flex-col overflow-visible rounded-[3px] pt-6 pb-5 pl-5 pr-5 transition-[box-shadow,transform] duration-300 sm:px-6 sm:pb-6",
                    "shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-6px_rgba(0,0,0,0.14)]",
                    "group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_16px_40px_-8px_rgba(0,0,0,0.18)]",
                    "dark:shadow-[0_2px_8px_rgba(0,0,0,0.35),0_12px_28px_-6px_rgba(0,0,0,0.45)]",
                    "dark:group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_20px_48px_-8px_rgba(0,0,0,0.5)]",
                    item.sheet
                  )}
                >
                  <PushPin />

                  <div className="flex items-start justify-between gap-3 border-b border-stone-900/10 pb-3 dark:border-white/15">
                    <span className="font-mono text-[11px] tabular-nums text-stone-600/80 dark:text-white/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-stone-900/10 text-current dark:bg-white/12">
                      <item.icon className="size-4.5" strokeWidth={2} aria-hidden />
                    </div>
                    <h3 className="min-w-0 pt-0.5 text-base font-semibold leading-snug tracking-tight sm:text-lg">
                      {item.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed opacity-90">
                    {item.description}
                  </p>
                </article>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
