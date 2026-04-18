"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Braces, Play, ShieldCheck, Workflow } from "lucide-react";

const highlights = [
  { icon: ShieldCheck, label: "治理与合规" },
  { icon: Braces, label: "API 优先" },
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
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-reveal", {
        y: 32,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.07,
      }).from(
        panel.current,
        {
          y: 48,
          autoAlpha: 0,
          rotateX: 10,
          scale: 0.96,
          duration: 1,
          ease: "power4.out",
        },
        "-=0.55"
      );

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

      const el = root.current;
      const p = panel.current;
      if (!el || !p) return;

      const xTo = gsap.quickTo(p, "x", { duration: 0.65, ease: "power3" });
      const yTo = gsap.quickTo(p, "y", { duration: 0.65, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        xTo(px * 14);
        yTo(py * 10);
      };

      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="hero-enterprise relative overflow-hidden border-b border-border/60 [perspective:1400px]"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.28]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.55 0.02 264 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.55 0.02 264 / 0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Soft vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_-10%,oklch(0.72_0.12_278/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_75%_60%_at_50%_-10%,oklch(0.45_0.14_278/0.18),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 xl:gap-16">
          <div className="text-center lg:text-left">
            <div className="hero-reveal mb-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Badge
                variant="outline"
                className="border-border/80 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                企业内容与发布
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Image
                  src="/capybara.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="opacity-90 dark:invert"
                  priority
                />
                <span className="font-medium text-foreground">Capybara CMS</span>
              </div>
            </div>

            <h1
              id="hero-heading"
              className="hero-reveal text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1] lg:text-[2.75rem] lg:leading-[1.08]"
            >
              企业级内容与发布平台
              <span className="mt-1 block bg-linear-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent sm:mt-1.5 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-400">
                治理、集成、交付在一处完成
              </span>
            </h1>

            <p className="hero-reveal mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              结构化内容模型与工作流，搭配 API 与 Webhook——适合官网矩阵、投关与产品文档；云端或私有化可选，便于对接现有身份体系。
            </p>

            <div className="hero-reveal mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 lg:mx-0 lg:justify-start">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-center gap-2 text-sm text-foreground sm:justify-start"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    <item.icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="hero-reveal mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Button size="lg" className="h-11 px-7 text-base shadow-sm">
                预约演示
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 border-border/80 bg-background/80 px-7 text-base backdrop-blur-sm"
              >
                <Play className="mr-2 size-4 shrink-0" aria-hidden />
                了解产品
              </Button>
            </div>

            <p className="hero-reveal mt-4 text-center text-xs text-muted-foreground lg:text-left">
              企业方案含 SLA 与安全评估支持；也可先安排集成可行性沟通。
            </p>
          </div>

          {/* Right: layered product canvas */}
          <div
            className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:ml-auto lg:mr-0 lg:max-w-none"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              ref={glow}
              className="pointer-events-none absolute -inset-10 rounded-[2rem] bg-linear-to-br from-indigo-500/25 via-violet-500/15 to-sky-500/20 blur-3xl dark:from-indigo-500/20 dark:via-violet-500/12 dark:to-sky-500/15"
              aria-hidden
            />

            {/* Back plate — depth */}
            <div
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-4 scale-[0.97] rounded-3xl border border-border/30 bg-muted/40 opacity-70 dark:bg-muted/25"
              aria-hidden
            />

            <div
              ref={panel}
              className="relative will-change-transform [transform-style:preserve-3d]"
            >
              {/* Animated ring */}
              <div
                className="pointer-events-none absolute -inset-[2px] overflow-hidden rounded-[1.35rem]"
                aria-hidden
              >
                <div
                  ref={orbit}
                  className="absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,oklch(0.55_0.2_278),oklch(0.62_0.18_300),oklch(0.58_0.16_250),oklch(0.55_0.2_278))] opacity-35 dark:opacity-25"
                />
              </div>

              <div className="relative overflow-hidden rounded-[1.25rem] border border-border/60 bg-card/85 shadow-[0_28px_90px_-28px_oklch(0.35_0.1_264/0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-card/50 dark:shadow-[0_28px_90px_-28px_oklch(0_0_0/0.55)]">
                {/* Window chrome */}
                <div className="flex h-11 items-center gap-2 border-b border-border/50 bg-muted/40 px-4 dark:bg-muted/25">
                  <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
                  <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
                  <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                    capybara-cms / production
                  </span>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  {/* Hero metric + sparkline */}
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
                          <stop offset="0%" stopColor="oklch(0.55 0.2 278)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="oklch(0.55 0.2 278)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 42 L40 38 L72 44 L108 28 L140 34 L176 18 L208 26 L244 12 L280 20 L280 56 L0 56 Z"
                        fill="url(#hero-spark-fill)"
                      />
                      <path
                        ref={spark}
                        d="M0 42 L40 38 L72 44 L108 28 L140 34 L176 18 L208 26 L244 12 L280 20"
                        stroke="oklch(0.52 0.19 278)"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Bento row */}
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
                        <span className="h-1 flex-1 rounded-full bg-indigo-500/80" />
                        <span className="h-1 flex-1 rounded-full bg-indigo-500/35" />
                        <span className="h-1 flex-1 rounded-full bg-border" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 dark:bg-muted/10">
                    <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                      <span className="text-indigo-600 dark:text-indigo-400">GET</span>{" "}
                      /v1/content/pages?locale=zh-CN
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
