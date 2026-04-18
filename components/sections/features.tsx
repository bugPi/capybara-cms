"use client";

import "@/lib/gsap-register";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileEdit,
  Globe,
  Users,
  BarChart3,
  Shield,
  Zap,
  Layers,
  Puzzle,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: FileEdit,
    title: "智能编辑器",
    description:
      "支持Markdown、富文本、代码块等多种格式。AI辅助写作，自动生成摘要、标签和SEO优化建议。",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Globe,
    title: "多渠道发布",
    description:
      "一次创作，多端分发。支持Web、移动App、微信公众号、小程序等全渠道内容同步。",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "团队协作",
    description:
      "实时多人编辑、评论批注、任务分配。完整的版本控制与审批流程，支持自定义权限体系。",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: BarChart3,
    title: "数据洞察",
    description:
      "内容阅读量、用户停留时长、转化率追踪。可视化报表，帮助团队优化内容策略。",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    title: "企业级安全",
    description:
      "SOC 2 Type II认证，数据加密存储。支持私有化部署，满足金融、医疗等行业合规要求。",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "极致性能",
    description:
      "全球CDN加速，边缘计算渲染。平均响应时间<50ms，保证用户流畅的内容体验。",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Layers,
    title: "模块化架构",
    description:
      "灵活的内容模型设计，支持自定义字段、组件复用。API优先架构，易于集成扩展。",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Puzzle,
    title: "丰富集成",
    description:
      "无缝对接GitHub、Notion、Slack、Zapier等主流工具。开放API，构建专属工作流。",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export function Features() {
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

      tl.from(section.querySelectorAll(".motion-feat-head > *"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.07,
      })
        .from(
          section.querySelectorAll(".motion-feat-card"),
          {
            y: 44,
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.045,
          },
          "-=0.38"
        )
        .from(
          section.querySelectorAll(".motion-feat-cta > *"),
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.08,
          },
          "-=0.42"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-muted/30 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="motion-feat-head mb-16 text-center">
          <Badge className="mb-4">核心功能</Badge>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            内容团队需要的一切
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            从创作到发布，从协作到分析。Capybara CMS 为您提供完整的企业级内容解决方案。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="motion-feat-card group gradient-card border-border/40 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <CardHeader>
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="motion-feat-cta mt-16 text-center">
          <p className="mb-4 text-muted-foreground">还有更多功能等待您探索</p>
          <Button variant="outline" size="lg">
            查看全部功能
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
