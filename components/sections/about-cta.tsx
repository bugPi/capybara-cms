"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export function AboutCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-about > *"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.08,
        immediateRender: false,
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="scroll-mt-24 border-t border-border/40 bg-background py-20 lg:py-28"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="motion-about rounded-2xl border border-border/50 bg-linear-to-br from-card via-card to-muted/40 p-8 shadow-sm md:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <Badge className="mb-4" variant="outline">
              关于
            </Badge>
            <h2
              id="about-heading"
              className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            >
              Capybara CMS 专注企业内容与发布
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              我们相信内容系统应同时服务编辑体验与工程效率：结构化模型、清晰 API、可观测的发布流水线，以及对智能体协作（MCP）与
              SEO 的原生支持，减少「为发一篇稿改三套系统」的隐性成本。
            </p>
          </div>
          <div
            id="contact"
            className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col"
          >
            <Button size="lg" className="h-11 px-8">
              预约演示
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
            <Button variant="outline" size="lg" className="h-11 px-8">
              <Mail className="mr-2 size-4" aria-hidden />
              联系销售
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
