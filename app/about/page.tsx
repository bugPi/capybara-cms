import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "Capybara CMS 专注企业内容与发布：了解我们的团队、产品理念与发展历程。",
};

const teamMembers = [
  {
    name: "张明",
    role: "创始人 & CEO",
    bio: "曾在多家科技公司担任产品负责人，深耕企业内容管理领域十余年。",
  },
  {
    name: "李华",
    role: "技术负责人",
    bio: "前大型电商平台架构师，专注于高可用系统设计与 API 工程化。",
  },
  {
    name: "王芳",
    role: "产品设计",
    bio: "十年用户体验设计经验，致力于让复杂工作流变得直观易用。",
  },
  {
    name: "陈强",
    role: "安全与合规",
    bio: "金融科技背景，负责 RBAC、审计与私有化部署方案设计。",
  },
];

const milestones = [
  {
    year: "2023",
    title: "项目启动",
    desc: "从企业内容管理的痛点出发，开始探索结构化内容与 API 的结合方案。",
  },
  {
    year: "2024",
    title: "首个版本发布",
    desc: "支持多站点、REST API 与基础审批流，首批客户完成迁移。",
  },
  {
    year: "2025",
    title: "MCP 与 SEO 增强",
    desc: "引入 Model Context Protocol 工具链，内置 SEO 元数据与结构化数据能力。",
  },
  {
    year: "2026",
    title: "私有化与合规",
    desc: "完善 RBAC 与审计日志，支持私有化部署与数据驻留合规。",
  },
];

export default function AboutPage() {
  return (
    <section className="relative scroll-mt-24 bg-transparent py-24 lg:py-32">
      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14">
        {/* 关于我们 */}
        <div className="mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
            关于我们
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Capybara CMS 成立于 2023 年，专注于企业内容与发布领域。我们相信内容系统应同时服务编辑体验与工程效率：结构化模型、清晰 API、可观测的发布流水线，以及对智能体协作（MCP）与 SEO 的原生支持。
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            我们的目标是减少「为发一篇稿改三套系统」的隐性成本，让内容团队专注于内容本身，而不是在多个后台之间来回切换。
          </p>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border/40 mb-16 lg:mb-20" aria-hidden />

        {/* 产品理念 */}
        <div className="mb-16 lg:mb-20">
          <h2 className="text-xl font-medium text-foreground mb-8">
            产品理念
          </h2>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="border-l-2 border-brand/50 pl-6">
              <h3 className="text-base font-medium text-foreground mb-2">
                内容模型先行
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                先定义结构，再填充内容。一次建模，多站点复用，避免复制粘贴十份配置。
              </p>
            </div>
            <div className="border-l-2 border-brand/50 pl-6">
              <h3 className="text-base font-medium text-foreground mb-2">
                API 与 Webhook 开放
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                内容事件可接进工单、IM、CI 或 BI，不另造黑箱。
              </p>
            </div>
            <div className="border-l-2 border-brand/50 pl-6">
              <h3 className="text-base font-medium text-foreground mb-2">
                治理与审计内置
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                权限落到栏目 / 字段，每一步有「谁、何时、做了什么」的记录。
              </p>
            </div>
            <div className="border-l-2 border-brand/50 pl-6">
              <h3 className="text-base font-medium text-foreground mb-2">
                MCP 与智能体协作
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                智能体在权限围栏内起草与发布，不会绕过审批与合规规则。
              </p>
            </div>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border/40 mb-16 lg:mb-20" aria-hidden />

        {/* 发展历程 */}
        <div className="mb-16 lg:mb-20">
          <h2 className="text-xl font-medium text-foreground mb-8">
            发展历程
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone) => (
              <div key={milestone.year} className="flex gap-6">
                <span className="font-mono text-sm text-muted-foreground/50 shrink-0 w-12">
                  {milestone.year}
                </span>
                <div>
                  <h3 className="text-base font-medium text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {milestone.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border/40 mb-16 lg:mb-20" aria-hidden />

        {/* 团队介绍 */}
        <div className="mb-16 lg:mb-20">
          <h2 className="text-xl font-medium text-foreground mb-8">
            团队介绍
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <div key={member.name}>
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center text-sm font-medium text-foreground mb-4">
                  {member.name.slice(0, 2)}
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-brand mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div className="h-px bg-border/40 mb-16 lg:mb-20" aria-hidden />

        {/* 联系方式 */}
        <div className="text-center">
          <h2 className="text-xl font-medium text-foreground mb-6">
            联系我们
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            预约演示或直接联系销售，我们会根据你的团队规模、站点数量与合规要求，提供合适的方案。
          </p>
          <div className="flex flex-col items-center gap-4">
            <a
              href="mailto:sales@capybara-cms.example.com"
              className="text-sm font-medium text-brand hover:underline"
            >
              sales@capybara-cms.example.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}