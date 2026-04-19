"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Braces, Workflow, PlugZap } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";

const itemIcons = [Braces, Workflow, PlugZap] as const;

export function ValueStrip() {
  const t = useTranslations("valueStrip");
  const items = t.raw("items") as { title: string; description: string }[];
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
            {t("kicker")}
          </p>
          <h2
            id="value-heading"
            className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl"
          >
            {t("title")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, i) => {
            const Icon = itemIcons[i];
            return (
            <li
              key={item.title}
              className={cn(
                "motion-value-card flex flex-col rounded-2xl border border-border/55 bg-card/60 p-5 shadow-sm backdrop-blur-sm dark:border-border/45 dark:bg-card/40",
                i === 2 && "sm:col-span-2 lg:col-span-1"
              )}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/12 text-brand dark:bg-brand/18">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold leading-snug text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
