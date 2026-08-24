import Link from "next/link";
import {
  FileTextIcon,
  ImageIcon,
  UsersIcon,
  CheckCircle2Icon,
  Clock3Icon,
  PenLineIcon,
  PlusIcon,
  ScrollTextIcon,
  SettingsIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentAudit,
  getRecentPosts,
  getPostsTrend,
  getAuditActivity,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { auditActionLabel } from "@/lib/audit-labels";
import { formatRelative } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { PostsTrendChart } from "@/components/charts/posts-trend-chart";
import { StatusDonut, type StatusDatum } from "@/components/charts/status-donut";
import { CategoryBarsChart } from "@/components/charts/category-bars-chart";
import { AuditActivityChart } from "@/components/charts/audit-activity-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "控制面板",
};

/** 统计卡图标块配色（浅色底 + 同色图标） */
const STAT_THEMES = [
  "bg-brand/10 text-brand",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  "bg-rose-500/10 text-rose-600 dark:text-rose-300",
];

export default function ConsolePage() {
  const stats = getDashboardStats();
  const recentPosts = getRecentPosts(5);
  const recentAudit = getRecentAudit(8);
  const trend = getPostsTrend(12);
  const activity = getAuditActivity(7);
  const categoryCounts = getCategoriesWithCounts();

  const statusData: StatusDatum[] = [
    { name: "已发布", value: stats.published, color: "oklch(0.72 0.17 162)" },
    { name: "草稿", value: stats.drafts, color: "oklch(0.68 0 0)" },
    { name: "待审核", value: stats.review, color: "oklch(0.8 0.15 85)" },
    { name: "已归档", value: stats.archived, color: "oklch(0.55 0.19 278)" },
  ];

  const statCards = [
    {
      label: "全部文章",
      value: stats.total,
      href: "/capybara/content/posts",
      icon: <FileTextIcon />,
    },
    {
      label: "已发布",
      value: stats.published,
      href: "/capybara/content/posts?status=published",
      icon: <CheckCircle2Icon />,
    },
    {
      label: "待审核",
      value: stats.review,
      href: "/capybara/content/posts?status=review",
      icon: <Clock3Icon />,
    },
    {
      label: "草稿",
      value: stats.drafts,
      href: "/capybara/content/posts?status=draft",
      icon: <PenLineIcon />,
    },
    {
      label: "媒体文件",
      value: stats.mediaCount,
      href: "/capybara/media",
      icon: <ImageIcon />,
    },
    {
      label: "用户",
      value: stats.userCount,
      href: "/capybara/users",
      icon: <UsersIcon />,
    },
  ];

  const quickActions = [
    { label: "创建文章", href: "/capybara/content/posts/new", icon: <PlusIcon /> },
    { label: "上传媒体", href: "/capybara/media", icon: <ImageIcon /> },
    { label: "查看审计", href: "/capybara/audit", icon: <ScrollTextIcon /> },
    { label: "系统设置", href: "/capybara/settings/general", icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="anim-fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-7 tracking-tight">概览</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            内容、发布与协作的全局视图
          </p>
        </div>
        <Button asChild>
          <Link href="/capybara/content/posts/new">
            <PlusIcon data-icon="inline-start" />
            新建文章
          </Link>
        </Button>
      </div>

      {/* 统计卡片：Arco 风格白卡，交错入场 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className="anim-fade-up group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[13px] text-muted-foreground">
                    {card.label}
                  </span>
                  <span className="text-2xl font-semibold tabular-nums tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md",
                    STAT_THEMES[i % STAT_THEMES.length]
                  )}
                >
                  <span className="[&>svg]:size-[18px]">{card.icon}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 图表区：发布趋势 + 状态分布 */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="anim-fade-up xl:col-span-2" style={{ animationDelay: "120ms" }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">发布趋势</CardTitle>
              <CardDescription>最近 12 个月创建的文章</CardDescription>
            </CardHeader>
            <CardContent>
              <PostsTrendChart data={trend} />
            </CardContent>
          </Card>
        </div>
        <div className="anim-fade-up" style={{ animationDelay: "180ms" }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">文章状态</CardTitle>
              <CardDescription>当前各状态分布</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusDonut data={statusData} total={stats.total} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 图表区：最近操作 + 分类文章数 */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="anim-fade-up" style={{ animationDelay: "240ms" }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">最近操作</CardTitle>
              <CardDescription>最近 7 天审计日志</CardDescription>
            </CardHeader>
            <CardContent>
              <AuditActivityChart data={activity} />
            </CardContent>
          </Card>
        </div>
        <div className="anim-fade-up xl:col-span-2" style={{ animationDelay: "300ms" }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">分类文章数</CardTitle>
              <CardDescription>各分类下的文章数量</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBarsChart
                data={categoryCounts.map((c) => ({ name: c.name, count: c.postCount }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="anim-fade-up" style={{ animationDelay: "360ms" }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">快捷操作</CardTitle>
            <CardDescription>常用入口，一步直达</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button key={action.label} variant="outline" asChild>
                <Link href={action.href}>
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近文章 */}
        <div className="anim-fade-up" style={{ animationDelay: "420ms" }}>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">最近更新</CardTitle>
                <CardDescription>最近编辑的文章</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/capybara/content/posts">
                  全部文章
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {recentPosts.length === 0 ? (
                <Empty
                  title="还没有文章"
                  description="点击右上角「新建文章」开始创作"
                />
              ) : (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/capybara/content/posts/${post.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-brand/5"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium">
                        {post.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.authorName ?? "未署名"} · {formatRelative(post.updatedAt)}
                      </span>
                    </div>
                    <StatusBadge status={post.status} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 最近活动 */}
        <div className="anim-fade-up" style={{ animationDelay: "480ms" }}>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">最近活动</CardTitle>
                <CardDescription>来自审计日志</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/capybara/audit">
                  全部日志
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {recentAudit.length === 0 ? (
                <Empty title="暂无活动记录" />
              ) : (
                recentAudit.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-brand/5"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm">
                        <span className="font-medium">{log.actor}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          {auditActionLabel(log.action)}
                        </span>
                        {log.detail ? (
                          <span className="text-muted-foreground"> · {log.detail}</span>
                        ) : null}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {formatRelative(log.createdAt)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
