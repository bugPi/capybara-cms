"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Braces,
  Play,
  PlugZap,
  ScanSearch,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const highlights = [
  { icon: ShieldCheck, label: "治理与合规" },
  { icon: Braces, label: "API 优先" },
  { icon: PlugZap, label: "MCP 发博客" },
  { icon: ScanSearch, label: "SEO 就绪" },
  { icon: Workflow, label: "多站点编排" },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const orbit = useRef<HTMLDivElement>(null);
  const spark = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const p = panel.current;
      if (!el || !p) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ".hero-title-inner, .hero-reveal-block, .hero-hl, .hero-reveal-cta, .hero-eyebrow",
          {
            autoAlpha: 1,
            y: 0,
            yPercent: 0,
            filter: "none",
          }
        );
        gsap.set(p, {
          autoAlpha: 1,
          y: 0,
          x: 0,
          rotateX: 0,
          scale: 1,
          rotation: 0,
        });
        gsap.set(".hero-watermark", { autoAlpha: 0.35 });
        gsap.set(".hero-scroll-fade", { autoAlpha: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hero-eyebrow", {
          y: 16,
          autoAlpha: 0,
          duration: 0.5,
        })
          .from(
            ".hero-title-inner",
            {
              yPercent: 108,
              autoAlpha: 0,
              rotateX: -42,
              stagger: 0.12,
              duration: 0.72,
              ease: "power4.out",
            },
            "-=0.2"
          )
          .from(
            ".hero-reveal-block",
            {
              y: 26,
              autoAlpha: 0,
              duration: 0.65,
            },
            "-=0.38"
          )
          .from(
            ".hero-hl",
            {
              y: 14,
              autoAlpha: 0,
              duration: 0.4,
              stagger: 0.06,
            },
            "-=0.32"
          )
          .from(
            ".hero-reveal-cta",
            {
              y: 18,
              autoAlpha: 0,
              duration: 0.48,
              stagger: 0.1,
            },
            "-=0.25"
          )
          .from(
            p,
            {
              y: 64,
              autoAlpha: 0,
              rotateX: 8,
              rotation: -2,
              scale: 0.94,
              duration: 1.05,
              ease: "power4.out",
              immediateRender: false,
            },
            "-=0.65"
          );

        gsap.to(".hero-parallax-grid", {
          y: 120,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: 0.85,
          },
        });

        gsap.to(".hero-watermark", {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(".hero-scroll-fade", {
          y: -52,
          autoAlpha: 0.42,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: 0.7,
          },
        });

        gsap.to(".hero-float-a", {
          y: "+=22",
          x: "+=10",
          duration: 4.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(".hero-float-b", {
          y: "-=20",
          x: "-=14",
          duration: 6.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(".hero-float-c", {
          scale: 1.06,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      if (glow.current) {
        gsap.to(glow.current, {
          y: -18,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orbit.current) {
        gsap.to(orbit.current, {
          rotation: 360,
          duration: 28,
          repeat: -1,
          ease: "none",
        });
      }

      if (spark.current) {
        const len = spark.current.getTotalLength?.() ?? 0;
        if (len > 0) {
          gsap.set(spark.current, {
            strokeDasharray: len,
            strokeDashoffset: len,
          });
          gsap.to(spark.current, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: "power2.inOut",
            delay: 0.35,
          });
        }
      }

      const xTo = gsap.quickTo(p, "x", { duration: 0.65, ease: "power3" });
      const yTo = gsap.quickTo(p, "y", { duration: 0.65, ease: "power3" });
      const rotTo = gsap.quickTo(p, "rotation", { duration: 0.75, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        xTo(px * 18);
        yTo(py * 12);
        rotTo(-2 + px * 3);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
        rotTo(-2);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        mm.revert();
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="hero-slice-bottom relative min-h-[min(100svh,56rem)] overflow-hidden border-b border-border/50 bg-transparent perspective-[1400px]"
      aria-labelledby="hero-heading"
    >
      <div
        className="hero-watermark pointer-events-none absolute left-1/2 top-[18%] z-0 -translate-x-1/2 sm:top-[12%]"
        aria-hidden
      >
        <span className="text-mega-watermark block text-center">CONTENT</span>
      </div>

      <div className="hero-scroll-fade relative z-10 mx-auto max-w-[min(100%,90rem)] px-5 pb-24 pt-24 sm:px-8 sm:pb-28 sm:pt-28 lg:px-14 lg:pb-32 lg:pt-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16">
          <div className="lg:col-span-7">
            <p className="hero-eyebrow mb-6 font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase sm:text-xs">
              企业内容 · 像列车时刻表一样准
            </p>
            <h1
              id="hero-heading"
              className="max-w-[18ch] text-4xl font-semibold tracking-tighter text-foreground sm:text-5xl sm:leading-[1.05] lg:text-6xl lg:leading-[1.02] xl:text-7xl perspective-[900px]"
            >
              <span className="hero-title-line block overflow-hidden pb-1">
                <span className="hero-title-inner inline-block origin-[50%_100%]">
                  从草稿到上线，
                </span>
              </span>
              <span className="hero-title-line block overflow-hidden pb-1">
                <span className="hero-title-inner text-gradient-brand inline-block origin-[50%_100%]">
                  每一跳都留痕
                </span>
              </span>
            </h1>
          </div>

          <div className="flex flex-col justify-end lg:col-span-5 lg:pl-2">
            <p className="hero-reveal-block max-w-sm text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              编辑点发布，工程接 API，智能体过闸机——同一套节拍，谁也不掉拍。
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="hero-hl inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm sm:text-sm"
                >
                  <item.icon className="size-3.5 shrink-0 text-brand" aria-hidden />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="hero-reveal-cta w-full sm:w-auto">
                <Button size="lg" className="h-12 rounded-full px-8 text-base">
                  预约演示
                  <ArrowRight className="ml-2 size-4" aria-hidden />
                </Button>
              </div>
              <div className="hero-reveal-cta w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-border/80 bg-background/70 px-8 text-base backdrop-blur-sm"
                >
                  <Play className="mr-2 size-4 shrink-0" aria-hidden />
                  了解产品
                </Button>
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-7 lg:col-start-6">
            <div
              ref={glow}
              className="pointer-events-none absolute -inset-12 rounded-[2rem] blur-3xl"
              style={{
                background:
                  "linear-gradient(to bottom right, var(--hero-glow-from), var(--hero-glow-via), var(--hero-glow-to))",
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 translate-x-4 translate-y-6 scale-[0.96] rounded-3xl border border-border/25 bg-muted/35 opacity-80 dark:bg-muted/20"
              aria-hidden
            />

            <div
              ref={panel}
              className="relative -rotate-2 transform-3d will-change-transform lg:-translate-y-4"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="pointer-events-none absolute -inset-[2px] overflow-hidden rounded-[1.35rem]"
                aria-hidden
              >
                <div
                  ref={orbit}
                  className="absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 opacity-35 dark:opacity-25"
                  style={{
                    background:
                      "conic-gradient(from 0deg, var(--hero-orbit-1), var(--hero-orbit-2), var(--hero-orbit-3), var(--hero-orbit-1))",
                  }}
                />
              </div>

              <div className="relative overflow-hidden rounded-[1.25rem] border border-border/60 bg-card/90 shadow-[0_28px_90px_-28px_var(--hero-panel-shadow)] backdrop-blur-xl dark:border-white/10 dark:bg-card/55">
                <div className="flex h-11 items-center gap-2 border-b border-border/50 bg-muted/40 px-4 dark:bg-muted/25">
                  <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
                  <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                    capybara-cms / production
                  </span>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  <div className="rounded-2xl border border-border/50 bg-background/70 p-4 dark:bg-background/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">本周发布</p>
                        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                          1,248
                        </p>
                      </div>
                      <Badge className="shrink-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        +12%
                      </Badge>
                    </div>
                    <svg
                      className="mt-3 h-14 w-full"
                      viewBox="0 0 280 56"
                      fill="none"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--hero-spark-fill)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="var(--hero-spark-fill)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 42 L40 38 L72 44 L108 28 L140 34 L176 18 L208 26 L244 12 L280 20 L280 56 L0 56 Z"
                        fill="url(#hero-spark-fill)"
                      />
                      <path
                        ref={spark}
                        d="M0 42 L40 38 L72 44 L108 28 L140 34 L176 18 L208 26 L244 12 L280 20"
                        stroke="var(--hero-spark)"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/50 bg-muted/25 p-3 dark:bg-muted/15">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        API p95
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">48ms</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">边缘节点</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-muted/25 p-3 dark:bg-muted/15">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        工作流
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">复核中</p>
                      <div className="mt-2 flex gap-1">
                        <span className="bg-brand/80 h-1 flex-1 rounded-full" />
                        <span className="bg-brand/35 h-1 flex-1 rounded-full" />
                        <span className="h-1 flex-1 rounded-full bg-border" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 dark:bg-muted/10">
                    <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                      <span style={{ color: "var(--hero-mcp-label)" }}>MCP</span>{" "}
                      tools/publish_post · draft → review
                    </p>
                    <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                      <span style={{ color: "var(--hero-api-label)" }}>GET</span>{" "}
                      /v1/seo/pages/meta?locale=zh-CN
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
