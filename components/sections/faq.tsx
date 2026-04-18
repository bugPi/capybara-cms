"use client";

import "@/lib/gsap-register";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ChevronRight } from "lucide-react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "MCP 和直接调 API 有什么区别？",
    a: "API 面向系统集成与自动化脚本。MCP 把「起草、提交审核、预约发布」等步骤封装成工具，方便接进智能体工作流；权限与审计规则不变，不会绕过治理。",
  },
  {
    q: "SEO 能力包含哪些？",
    a: "标题与描述模板、规范 URL、Open Graph / Twitter Card、站点地图与 JSON-LD 等；可按渠道、环境覆盖，便于多站点统一维护。",
  },
  {
    q: "支持私有化吗？数据能否不出境？",
    a: "支持私有化或专有云部署，网络与安全策略可与贵司基础设施对齐。驻留范围与合规要求建议在售前阶段书面确认。",
  },
  {
    q: "与现有 CMS 并行迁移怎么做？",
    a: "通常按内容模型与 URL 策略分阶段推进：关键栏目先并行同步，再切换流量与 301；配合脚本化导入与双写期校验，降低一次性切换风险。",
  },
  {
    q: "如何申请试用或 POC？",
    a: "通过「联系销售」或关于页的入口，说明团队规模、站点数量与合规要求；可安排演示、沙箱环境或限定范围的 POC。",
  },
] as const;

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const answerInnerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const baseId = useId().replace(/:/g, "");
  const skipAnswerMotionRef = useRef(true);

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

      tl.from(section.querySelectorAll(".motion-faq-head > *"), {
        y: 26,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        immediateRender: false,
      })
        .from(
          ".motion-faq-item",
          {
            y: 22,
            opacity: 0,
            duration: 0.5,
            stagger: 0.055,
            immediateRender: false,
          },
          "-=0.38"
        )
        .from(
          ".motion-faq-reveal",
          {
            y: 28,
            opacity: 0,
            duration: 0.55,
            ease: "power2.out",
            immediateRender: false,
          },
          "-=0.32"
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const el = answerInnerRef.current;
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(el, { clearProps: "opacity,transform" });
        return;
      }

      if (skipAnswerMotionRef.current) {
        skipAnswerMotionRef.current = false;
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" }
      );
    },
    { dependencies: [active], scope: sectionRef }
  );

  useEffect(() => {
    const group = sectionRef.current?.querySelector('[role="radiogroup"]');
    if (!group?.contains(document.activeElement)) return;
    document.getElementById(`${baseId}-q-${active}`)?.focus();
  }, [active, baseId]);

  const onRadioKeyDown = useCallback((e: React.KeyboardEvent) => {
    const n = faqs.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setActive((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    }
  }, []);

  const current = faqs[active];

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative scroll-mt-24 overflow-hidden border-t border-border/40 bg-transparent py-24 lg:py-32"
      aria-labelledby="faq-heading"
    >
      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14">
        <div className="motion-faq-head mx-auto mb-14 max-w-2xl text-center lg:mb-16">
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.32em] text-muted-foreground uppercase">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            FAQ · 问答索引
          </p>
          <h2
            id="faq-heading"
            className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            选型与落地前，常被问到这些
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            左侧点选问题，右侧阅读完整说明；移动端上下排布。键盘方向键可在问题间切换。
          </p>
        </div>

        <div className="motion-faq-shell grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div
            className="motion-faq-list lg:col-span-5"
            role="radiogroup"
            aria-label="常见问题，单选查看答案"
            onKeyDown={onRadioKeyDown}
          >
            <div className="flex flex-col overflow-hidden border-y border-border/50 md:rounded-2xl md:border md:border-border/45">
              {faqs.map((item, i) => {
                const on = active === i;
                return (
                  <button
                    key={item.q}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    id={`${baseId}-q-${i}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    className={cn(
                      "motion-faq-item group relative flex w-full items-start gap-3 border-b border-border/40 px-2 py-3.5 text-left transition-[background-color,color,transform] duration-300 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3 sm:py-4",
                      on
                        ? "bg-muted/30 text-foreground"
                        : "text-muted-foreground hover:bg-muted/15 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 font-mono text-[10px] tabular-nums tracking-[0.18em] transition-colors duration-300",
                        on ? "text-brand" : "text-muted-foreground/80"
                      )}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 text-[0.9375rem] font-medium leading-snug tracking-tight sm:text-[0.9625rem]">
                      {item.q}
                    </span>
                    <ChevronRight
                      className={cn(
                        "mt-0.5 size-4 shrink-0 transition-transform duration-300",
                        on ? "translate-x-0.5 text-brand" : "text-muted-foreground/50 group-hover:translate-x-0.5"
                      )}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="motion-faq-reveal lg:col-span-7"
            role="region"
            aria-live="polite"
            aria-labelledby={`${baseId}-q-${active}`}
            id={`${baseId}-answer`}
          >
            <div className="lg:sticky lg:top-28">
              <div
                ref={answerInnerRef}
                className="motion-faq-answer-inner border-t border-dashed border-border/55 pt-10 lg:border-t-0 lg:border-none lg:pt-0"
              >
                <p className="font-mono text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
                  答复
                </p>
                <p className="mt-4 text-pretty text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                  {current.q}
                </p>
                <p className="mt-8 max-w-3xl text-[0.975rem] leading-[1.8] text-muted-foreground sm:text-lg sm:leading-[1.75]">
                  {current.a}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
