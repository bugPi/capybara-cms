"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
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

/** 虚构客户评价，用于营销展示 */
const ROW_A: DanmakuItem[] = [
  {
    quote: "审批链路和 MCP 工具对齐后，运营同学几乎不用学新后台。",
    who: "李某",
    hint: "增长负责人 · 消费品牌",
  },
  {
    quote: "多站点 SEO 模板一次配置，发布节奏终于敢加快了。",
    who: "陈某",
    hint: "市场技术 · B2B SaaS",
  },
  {
    quote: "审计日志按跳追溯，合规评审省了好几轮来回。",
    who: "赵某",
    hint: "安全架构 · 金融科技",
  },
];

const ROW_B: DanmakuItem[] = [
  {
    quote: "Headless + 治理闸口，智能体只能做「被允许」的事。",
    who: "周某",
    hint: "平台工程 · 互联网",
  },
  {
    quote: "私有化部署按我们网络分区走，数据驻留写进合同条款。",
    who: "吴某",
    hint: "IT 总监 · 制造业",
  },
  {
    quote: "JSON-LD 与站点地图生成自动化，搜索同事直接点赞。",
    who: "郑某",
    hint: "SEO 负责人 · 教育",
  },
];

const ROW_C: DanmakuItem[] = [
  {
    quote: "并行迁移那套脚本化导入，比一次性切换安心太多。",
    who: "孙某",
    hint: "研发经理 · 媒体",
  },
  {
    quote: "Webhook 接内部工单后，内容上线像流水线一样可追踪。",
    who: "马某",
    hint: "运维开发 · 电商",
  },
  {
    quote: "沙箱里跑通 POC，再扩到生产，决策成本很低。",
    who: "朱某",
    hint: "产品负责人 · 医疗信息化",
  },
];

const ROW_D: DanmakuItem[] = [
  {
    quote: "渠道覆盖和环境变量这套，终于不用复制粘贴十份配置。",
    who: "胡某",
    hint: "前端负责人 · 出行",
  },
  {
    quote: "销售演示时直接拉 MCP 工具链，客户能「看见」治理。",
    who: "林某",
    hint: "售前架构 · 云厂商",
  },
  {
    quote: "多语言与规范 URL 一套模型管，区域站点少了很多扯皮。",
    who: "罗某",
    hint: "国际化 · 硬件品牌",
  },
];

const ROWS = [
  { items: ROW_A, dir: "left" as const, dur: "46s" },
  { items: ROW_B, dir: "right" as const, dur: "54s" },
  { items: ROW_C, dir: "left" as const, dur: "40s" },
  { items: ROW_D, dir: "right" as const, dur: "50s" },
];

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
        {doubled.map((t, i) => (
          <figure
            key={`${t.who}-${t.quote.slice(0, 12)}-${i}`}
            className="flex max-w-[min(100vw-2rem,26rem)] shrink-0 items-start gap-3 rounded-2xl border border-border/55 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-sm sm:max-w-none sm:whitespace-nowrap sm:py-2.5 dark:bg-background/55"
          >
            <Quote
              className="mt-0.5 size-3.5 shrink-0 text-brand/70 sm:mt-1"
              aria-hidden
            />
            <figcaption className="min-w-0 text-left">
              <p className="text-[0.8125rem] font-medium leading-snug text-foreground sm:text-sm">
                <span className="sm:whitespace-nowrap">{t.quote}</span>
              </p>
              <p className="mt-1 font-mono text-[10px] leading-none tracking-wide text-muted-foreground">
                <span className="text-foreground/90">{t.who}</span>
                <span className="mx-1.5 text-border" aria-hidden>
                  ·
                </span>
                <span>{t.hint}</span>
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsWall() {
  const sectionRef = useRef<HTMLElement>(null);

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

  const staticAll = ROWS.flatMap((r) => r.items);

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
            客户评价墙
          </p>
          <h2
            id="testimonials-heading"
            className="text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem]"
          >
            滚动弹幕里，是他们说过的话
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            四路横向循环，方向与速度略有不同；若系统开启「减少动态效果」，将改为静态列表，避免干扰阅读。
          </p>
        </div>

        <div className="motion-twall-stage space-y-1 md:space-y-2">
          <div className="motion-reduce:hidden">
            {ROWS.map((row) => (
              <DanmakuRow
                key={row.dur + row.dir + row.items[0].who}
                items={row.items}
                direction={row.dir}
                duration={row.dur}
              />
            ))}
          </div>

          <ul className="hidden grid-cols-1 gap-4 motion-reduce:grid sm:grid-cols-2 lg:grid-cols-3">
            {staticAll.map((t) => (
              <li
                key={t.who + t.quote.slice(0, 24)}
                className="rounded-2xl border border-border/55 bg-muted/20 px-4 py-4 dark:bg-muted/10"
              >
                <p className="text-sm font-medium leading-relaxed text-foreground">{t.quote}</p>
                <p className="mt-3 font-mono text-[10px] tracking-wide text-muted-foreground">
                  <span className="text-foreground/90">{t.who}</span>
                  <span className="mx-1.5 text-border">·</span>
                  {t.hint}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
