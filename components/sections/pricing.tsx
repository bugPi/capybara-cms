"use client";

import "@/lib/gsap-register";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { Sparkles } from "lucide-react";

const tiers = [
  {
    name: "团队版",
    blurb: "小队先跑起来，快过写 PPT",
    priceLabel: "按席位数计费",
    highlight: false,
    features: [
      "结构化内容与可视化编辑",
      "工作流与基础审批",
      "REST API 与 Webhook",
      "SEO 元数据与站点地图",
      "邮件支持",
    ],
  },
  {
    name: "企业版",
    blurb: "要 SLA，也要找得到人",
    priceLabel: "定制报价",
    highlight: true,
    features: [
      "团队版全部能力",
      "SSO / SAML、OIDC 路线",
      "细粒度 RBAC 与审计日志",
      "多环境、多区域与 SLA 选项",
      "专属客户成功与技术支持",
    ],
  },
  {
    name: "私有化",
    blurb: "数据住家里，网络听你的",
    priceLabel: "按部署规模评估",
    highlight: false,
    features: [
      "可部署于自有 VPC / 专有云",
      "Air-gapped 与离线更新路径（可议）",
      "与现有 IdP、日志与监控对接",
      "安全评估与渗透测试配合",
      "现场或远程实施支持",
    ],
  },
] as const;

/** 与 FAQ / 评价墙同系的极低饱和环境光，避免整块「换肤色」 */
const tierGlow = [
  "bg-[oklch(0.55_0.12_278/0.055)] dark:bg-[oklch(0.62_0.1_278/0.07)]",
  "bg-[oklch(0.52_0.11_285/0.05)] dark:bg-[oklch(0.58_0.09_285/0.065)]",
  "bg-[oklch(0.52_0.1_250/0.05)] dark:bg-[oklch(0.58_0.08_250/0.06)]",
] as const;

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(1);
  const uid = useId().replace(/:/g, "");

  const current = tiers[active];

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-price-head > *"), {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        immediateRender: false,
      })
        .from(
          ".motion-price-rail",
          { y: 28, opacity: 0, duration: 0.55, ease: "power2.out", immediateRender: false },
          "-=0.3"
        )
        .from(
          ".motion-price-col",
          { y: 36, opacity: 0, duration: 0.5, stagger: 0.1, ease: "back.out(0.85)", immediateRender: false },
          "-=0.4"
        )
        .from(
          ".motion-price-body",
          { y: 40, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
          "-=0.35"
        );

      let sectionScrub: gsap.core.Tween | null = null;
      sectionScrub = gsap.fromTo(
        section.querySelector(".motion-price-glow"),
        { opacity: 0.2, scale: 0.96 },
        {
          opacity: 0.45,
          scale: 1.02,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 35%",
            scrub: 1,
          },
        }
      );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        sectionScrub?.scrollTrigger?.kill();
        sectionScrub?.kill();
      };
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const title = section.querySelector(".motion-price-title");
      const blurb = section.querySelector(".motion-price-blurb");
      const price = section.querySelector(".motion-price-label");
      const lines = section.querySelectorAll(".motion-price-line");

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set([title, blurb, price, ...lines], { clearProps: "all" });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (title) {
        tl.fromTo(
          title,
          { opacity: 0, y: 28, filter: "blur(12px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55 },
          0
        );
      }
      if (blurb) {
        tl.fromTo(blurb, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, 0.08);
      }
      if (price) {
        tl.fromTo(
          price,
          { opacity: 0, scale: 0.92, letterSpacing: "0.2em" },
          { opacity: 1, scale: 1, letterSpacing: "0.02em", duration: 0.5, ease: "back.out(1.2)" },
          0.12
        );
      }
      if (lines.length) {
        tl.fromTo(
          lines,
          { opacity: 0, x: -28 },
          { opacity: 1, x: 0, duration: 0.38, stagger: 0.055, ease: "power2.out" },
          0.18
        );
      }

      return () => {
        tl.kill();
      };
    },
    { scope: sectionRef, dependencies: [active] }
  );

  useEffect(() => {
    const rail = sectionRef.current?.querySelector('[role="tablist"]');
    if (!rail?.contains(document.activeElement)) return;
    document.getElementById(`${uid}-tab-${active}`)?.focus();
  }, [active, uid]);

  const onTabListKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => Math.min(tiers.length - 1, i + 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(tiers.length - 1);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden border-t border-border/40 bg-transparent py-24 lg:py-32"
      aria-labelledby="pricing-heading"
    >
      <div
        className="motion-price-glow pointer-events-none absolute left-1/2 top-[40%] size-[min(120%,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.16_278/0.07),transparent_72%)] blur-3xl dark:bg-[radial-gradient(closest-side,oklch(0.68_0.14_278/0.1),transparent_72%)]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
        {tiers.map((_, i) => (
          <div
            key={i}
            className={cn(
              "relative flex-1 transition-all duration-700 ease-out",
              active === i ? "opacity-100" : "opacity-0"
            )}
          >
            <div
              className={cn(
                "absolute inset-x-[-18%] top-1/2 h-[min(65%,24rem)] -translate-y-1/2 rounded-full blur-3xl",
                tierGlow[i % tierGlow.length]
              )}
            />
          </div>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14">
        <div className="motion-price-head mx-auto mb-14 max-w-2xl text-center lg:mb-16">
          <p className="mb-3 inline-flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.32em] text-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            定价 · Pricing
          </p>
          <h2
            id="pricing-heading"
            className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            价签跟着现状走，不靠官网装统一价
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            席位、站点、合规、部署——差一格拼图，数字就变。点下面一栏换档位，看内容与说明怎么跟过来。
          </p>
        </div>

        <div className="motion-price-shell mx-auto max-w-3xl lg:max-w-232">
          <div
            className="motion-price-rail relative"
            role="tablist"
            aria-label="选择方案"
            onKeyDown={onTabListKeyDown}
          >
            <div className="grid grid-cols-3 gap-px bg-border/35 sm:gap-0 sm:bg-transparent">
              {tiers.map((tier, i) => {
                const on = active === i;
                return (
                  <button
                    key={tier.name}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    aria-controls={`${uid}-panel`}
                    aria-selected={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    className={cn(
                      "motion-price-col relative min-h-30 px-2 py-8 transition-[background-color,transform] duration-500 sm:min-h-36 sm:px-4",
                      "bg-background/90 sm:bg-transparent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50",
                      on ? "z-10 sm:scale-[1.03]" : "sm:scale-100 hover:bg-muted/20"
                    )}
                  >
                    <div className="flex flex-col items-center text-center">
                      {tier.highlight ? (
                        <span className="mb-2 inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                          <Sparkles className="size-3" aria-hidden />
                          推荐
                        </span>
                      ) : (
                        <span className="mb-2 font-mono text-[10px] tabular-nums tracking-widest text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                      <span
                        className={cn(
                          "block max-w-[8ch] text-base font-semibold leading-tight tracking-tight transition-all duration-500 sm:max-w-none sm:text-lg lg:text-xl",
                          on
                            ? "text-gradient-brand text-3xl sm:text-4xl lg:text-5xl"
                            : "text-muted-foreground"
                        )}
                      >
                        {tier.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id={`${uid}-panel`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${active}`}
            className="motion-price-body relative pt-14 sm:pt-16 lg:pt-20"
          >
            <div
              className="pointer-events-none absolute left-1/2 top-0 w-full max-w-4xl -translate-x-1/2 font-mono text-[clamp(5rem,22vw,12rem)] font-bold tabular-nums leading-none text-foreground/3.5 dark:text-white/5"
              aria-hidden
            >
              {String(active + 1).padStart(2, "0")}
            </div>

            <div className="relative mx-auto max-w-3xl text-center">
              <h3 className="motion-price-title text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {current.name}
              </h3>
              <p className="motion-price-blurb mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {current.blurb}
              </p>
              <p className="motion-price-label mx-auto mt-8 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                {current.priceLabel}
              </p>

              <ul className="motion-price-list mx-auto mt-12 max-w-2xl space-y-4 text-left">
                {current.features.map((f) => (
                  <li
                    key={f}
                    className="motion-price-line flex gap-4 text-[0.9375rem] leading-relaxed text-foreground/90 sm:text-base"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-sm text-muted-foreground" aria-hidden>
                      —
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="motion-price-cta mt-14 flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-10 text-base"
                  variant={current.highlight ? "default" : "outline"}
                >
                  联系销售
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  聊完现状再报价 · 不塞冷冰冰的 PDF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
