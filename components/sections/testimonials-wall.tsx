"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Quote } from "lucide-react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";

type DanmakuItem = {
  quote: string;
  who: string;
  hint: string;
};

function DanmakuRow({
  items,
  direction,
  duration,
}: {
  items: DanmakuItem[];
  direction: "left" | "right";
  duration: string;
}) {
  const doubled = [...items, ...items];

  return (
    <div className="testimonial-danmaku-mask relative py-2">
      <div
        className={cn(
          "testimonial-marquee-track",
          direction === "left" ? "testimonial-marquee-left" : "testimonial-marquee-right"
        )}
        style={
          {
            "--testimonial-dur": duration,
          } as React.CSSProperties
        }
      >
        {doubled.map((item, i) => (
          <figure
            key={`${item.who}-${item.quote.slice(0, 12)}-${i}`}
            className="flex max-w-[min(100vw-2rem,26rem)] shrink-0 items-start gap-3 rounded-2xl border border-border/55 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-sm sm:max-w-none sm:whitespace-nowrap sm:py-2.5 dark:bg-background/55"
          >
            <Quote
              className="mt-0.5 size-3.5 shrink-0 text-brand/70 sm:mt-1"
              aria-hidden
            />
            <figcaption className="min-w-0 text-left">
              <p className="text-[0.8125rem] font-medium leading-snug text-foreground sm:text-sm">
                <span className="sm:whitespace-nowrap">{item.quote}</span>
              </p>
              <p className="mt-1 font-mono text-[10px] leading-none tracking-wide text-muted-foreground">
                <span className="text-foreground/90">{item.who}</span>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span>{item.hint}</span>
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsWall() {
  const t = useTranslations("testimonials");
  const sectionRef = useRef<HTMLElement>(null);

  const rowA = t.raw("rowA") as DanmakuItem[];
  const rowB = t.raw("rowB") as DanmakuItem[];
  const rowC = t.raw("rowC") as DanmakuItem[];
  const rowD = t.raw("rowD") as DanmakuItem[];

  const rows = [
    { items: rowA, dir: "left" as const, dur: "46s" },
    { items: rowB, dir: "right" as const, dur: "54s" },
    { items: rowC, dir: "left" as const, dur: "40s" },
    { items: rowD, dir: "right" as const, dur: "50s" },
  ];

  const staticAll = rows.flatMap((r) => r.items);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-twall-head > *"), {
        y: 24,
        opacity: 0,
        duration: 0.62,
        stagger: 0.07,
        immediateRender: false,
      }).from(
        ".motion-twall-stage",
        {
          y: 32,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          immediateRender: false,
        },
        "-=0.35"
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative scroll-mt-24 overflow-hidden border-t border-border/40 bg-transparent py-24 lg:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14">
        <div className="motion-twall-head mx-auto mb-12 max-w-2xl text-center lg:mb-14">
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.32em] text-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            {t("kicker")}
          </p>
          <h2
            id="testimonials-heading"
            className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="motion-twall-stage space-y-1 md:space-y-2">
          <div className="motion-reduce:hidden">
            {rows.map((row) => (
              <DanmakuRow
                key={row.dur + row.dir + row.items[0]?.who}
                items={[...row.items]}
                direction={row.dir}
                duration={row.dur}
              />
            ))}
          </div>

          <ul className="hidden grid-cols-1 gap-4 motion-reduce:grid sm:grid-cols-2 lg:grid-cols-3">
            {staticAll.map((item) => (
              <li
                key={item.who + item.quote.slice(0, 24)}
                className="rounded-2xl border border-border/55 bg-muted/20 px-4 py-4 dark:bg-muted/10"
              >
                <p className="text-sm font-medium leading-relaxed text-foreground">{item.quote}</p>
                <p className="mt-3 font-mono text-[10px] tracking-wide text-muted-foreground">
                  <span className="text-foreground/90">{item.who}</span>
                  <span className="mx-1.5 text-border">·</span>
                  {item.hint}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
