"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";

export function HomeMarquee() {
  const t = useTranslations("marquee");
  const tags = t.raw("tags") as string[];
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const bandSkew = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tr = track.current;
      const section = root.current;
      const bandEl = band.current;
      const skewEl = bandSkew.current;
      if (!tr || !section) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(tr, { x: 0 });
        gsap.set(bandEl, { rotate: 0, autoAlpha: 1, y: 0, scale: 1 });
        if (skewEl) gsap.set(skewEl, { skewX: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let marqueeTween: gsap.core.Tween | null = null;
        const queue = gsap.delayedCall(0.08, () => {
          const half = tr.scrollWidth / 2;
          if (half > 8) {
            marqueeTween = gsap.to(tr, {
              x: -half,
              duration: 26,
              ease: "none",
              repeat: -1,
            });
          }
        });

        let bandTween: gsap.core.Tween | null = null;
        let bandEnter: gsap.core.Tween | null = null;
        if (bandEl) {
          gsap.set(bandEl, { transformOrigin: "50% 50%" });
          bandEnter = gsap.from(bandEl, {
            y: 40,
            autoAlpha: 0,
            scale: 0.94,
            rotateX: 10,
            transformPerspective: 900,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 92%",
              toggleActions: LANDING_SCROLL_TOGGLE,
            },
            immediateRender: false,
          });
        }

        if (skewEl) {
          bandTween = gsap.fromTo(
            skewEl,
            { skewX: -4 },
            {
              skewX: 4,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.2,
              },
            }
          );
        }

        return () => {
          queue.kill();
          marqueeTween?.kill();
          bandEnter?.scrollTrigger?.kill();
          bandEnter?.kill();
          bandTween?.scrollTrigger?.kill();
          bandTween?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  const doubled = [...tags, ...tags];

  return (
    <section
      ref={root}
      className="relative z-10 -my-6 overflow-x-hidden py-6 sm:-my-8 sm:py-8"
      aria-hidden
    >
      <div
        ref={band}
        className="-rotate-1 border-y border-white/10 bg-neutral-950 py-5 text-neutral-100 shadow-xl dark:bg-neutral-950"
      >
        <div ref={bandSkew} className="origin-center">
          <div className="relative overflow-hidden py-1">
            <div ref={track} className="flex w-max gap-6 pr-6 will-change-transform">
              {doubled.map((label, i) => (
                <span
                  key={`${label}-${i}`}
                  className="inline-flex shrink-0 items-center font-mono text-xs font-medium tracking-wide text-neutral-100 uppercase sm:text-sm"
                >
                  {label}
                  <span className="mx-6 text-neutral-500" aria-hidden>
                    ·
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
