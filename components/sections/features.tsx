"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import { useTranslations } from "next-intl";
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
    id: "mcp" as const,
    icon: PlugZap,
    sheet:
      "bg-[#f5e6a3] text-stone-900 dark:bg-[#3d3518] dark:text-[#faf6e8] dark:ring-1 dark:ring-amber-900/40",
    tilt: -2,
    span: "lg:col-span-7 lg:row-span-2 min-h-[200px] lg:min-h-[280px]",
  },
  {
    id: "seo" as const,
    icon: ScanSearch,
    sheet:
      "bg-[#cfeffc] text-stone-900 dark:bg-[#153038] dark:text-[#e8f7fc] dark:ring-1 dark:ring-cyan-900/45",
    tilt: 1.6,
    span: "lg:col-span-5 min-h-[160px]",
  },
  {
    id: "editor" as const,
    icon: FileEdit,
    sheet:
      "bg-[#e2e5f5] text-stone-900 dark:bg-[#252838] dark:text-[#eef0fc] dark:ring-1 dark:ring-indigo-900/40",
    tilt: -1.4,
    span: "lg:col-span-5 min-h-[160px]",
  },
  {
    id: "collaboration" as const,
    icon: Users,
    sheet:
      "bg-[#edd8f5] text-stone-900 dark:bg-[#301f3d] dark:text-[#f6edfb] dark:ring-1 dark:ring-violet-900/40",
    tilt: 1.9,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    id: "multiChannel" as const,
    icon: Globe,
    sheet:
      "bg-[#cfe2ff] text-stone-900 dark:bg-[#1a2840] dark:text-[#e8f0ff] dark:ring-1 dark:ring-blue-900/40",
    tilt: -1.2,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    id: "security" as const,
    icon: Shield,
    sheet:
      "bg-[#c8ebd4] text-stone-900 dark:bg-[#1a3024] dark:text-[#e8f5ec] dark:ring-1 dark:ring-emerald-900/40",
    tilt: 1.4,
    span: "lg:col-span-4 min-h-[180px]",
  },
  {
    id: "api" as const,
    icon: Cable,
    sheet:
      "bg-[#c5e7f7] text-stone-900 dark:bg-[#153040] dark:text-[#e5f4fc] dark:ring-1 dark:ring-sky-900/40",
    tilt: -1.7,
    span: "lg:col-span-6 min-h-[170px]",
  },
  {
    id: "analytics" as const,
    icon: BarChart3,
    sheet:
      "bg-[#fad4e8] text-stone-900 dark:bg-[#3a1f2e] dark:text-[#fcecf4] dark:ring-1 dark:ring-pink-900/40",
    tilt: 1.5,
    span: "lg:col-span-6 min-h-[170px]",
  },
  {
    id: "performance" as const,
    icon: Zap,
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
  const t = useTranslations("features");
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
            if (inner) {
              gsap.to(inner, { z: 20, duration: 0.35, ease: "power2.out" });
            }
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
            if (inner) {
              gsap.to(inner, {
                rotationX: 0,
                rotationY: 0,
                z: 0,
                duration: 0.5,
                ease: "power3.out",
              });
            }
          };

          let rxTo: ReturnType<typeof gsap.quickTo> | null = null;
          let ryTo: ReturnType<typeof gsap.quickTo> | null = null;
          if (inner) {
            gsap.set(inner, { transformOrigin: "50% 50%", force3D: true });
            rxTo = gsap.quickTo(inner, "rotationX", {
              duration: 0.45,
              ease: "power3",
            });
            ryTo = gsap.quickTo(inner, "rotationY", {
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

      const removeInteractions = reduceMotion ? () => {} : setupInteractions();
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
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-12 lg:gap-7">
          {bento.map((item, index) => (
            <div
              key={item.id}
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
                      {t(`${item.id}.title`)}
                    </h3>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed opacity-90">
                    {t(`${item.id}.description`)}
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
