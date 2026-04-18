"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Capybara CMS 让我们的内容团队效率提升了3倍。从策划到发布的时间从一周缩短到两天。",
    author: "张明",
    role: "内容总监",
    company: "TechFlow",
    avatar: "T",
  },
  {
    quote:
      "API设计非常优雅，我们的工程师在一周内就完成了与现有系统的集成。文档清晰，支持响应迅速。",
    author: "李华",
    role: "技术负责人",
    company: "GlobalPress",
    avatar: "G",
  },
  {
    quote:
      "作为跨国企业，我们需要一个能支持多语言、多时区协作的平台。Capybara CMS 完美满足了我们的需求。",
    author: "王芳",
    role: "运营经理",
    company: "FinanceHub",
    avatar: "F",
  },
];

const clients = [
  { name: "TechFlow", industry: "科技", size: "500人" },
  { name: "GlobalPress", industry: "媒体", size: "200人" },
  { name: "EduLearn", industry: "教育", size: "1000人" },
  { name: "FinanceHub", industry: "金融", size: "300人" },
  { name: "HealthPlus", industry: "医疗", size: "150人" },
  { name: "RetailMax", industry: "零售", size: "800人" },
];

export function Clients() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      tl.from(section.querySelectorAll(".motion-cli-head-a > *"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.07,
      })
        .from(
          section.querySelectorAll(".motion-cli-quote"),
          {
            y: 40,
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.08,
          },
          "-=0.35"
        )
        .from(section.querySelectorAll(".motion-cli-head-b > *"), {
          y: 24,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.06,
        })
        .from(
          section.querySelectorAll(".motion-cli-logo"),
          {
            y: 32,
            autoAlpha: 0,
            scale: 0.96,
            duration: 0.65,
            stagger: 0.05,
          },
          "-=0.4"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-muted/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-24">
          <div className="motion-cli-head-a mb-12 text-center">
            <Badge className="mb-4">客户评价</Badge>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              来自真实用户的声音
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              各行业的内容团队都在使用 Capybara CMS 提升工作效率。
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.author}
                className="motion-cli-quote gradient-card border-border/40"
              >
                <CardContent className="p-6">
                  <p className="mb-6 leading-relaxed text-foreground">
                    「{testimonial.quote}」
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} · {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="motion-cli-head-b mb-12 text-center">
            <h3 className="mb-2 text-2xl font-bold">受信赖于行业领先企业</h3>
            <p className="text-muted-foreground">
              从初创公司到跨国集团，各规模企业都在使用我们的服务
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {clients.map((client) => (
              <div
                key={client.name}
                className="motion-cli-logo flex flex-col items-center justify-center rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-border hover:shadow-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-primary/80 to-primary">
                  <span className="text-lg font-bold text-primary-foreground">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">{client.name}</span>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">
                    {client.industry}
                  </Badge>
                  <span>{client.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
