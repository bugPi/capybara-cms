"use client";

import "@/lib/gsap-register";
import { useState, useMemo, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";
import {
  getAllTagIds,
  getSortedPosts,
  getTagLabel,
  type BlogPost,
} from "@/lib/blog-posts";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

function formatBlogDate(date: string, locale: string) {
  const d = new Date(date);
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  mcp: "text-violet-600 dark:text-violet-400",
  workflow: "text-indigo-600 dark:text-indigo-400",
  agents: "text-fuchsia-600 dark:text-fuchsia-400",
  seo: "text-cyan-600 dark:text-cyan-400",
  jsonLd: "text-sky-600 dark:text-sky-400",
  metadata: "text-teal-600 dark:text-teal-400",
  migration: "text-orange-600 dark:text-orange-400",
  implementation: "text-amber-600 dark:text-amber-400",
  script: "text-rose-600 dark:text-rose-400",
  api: "text-blue-600 dark:text-blue-400",
  webhook: "text-violet-600 dark:text-violet-400",
  integration: "text-sky-600 dark:text-sky-400",
  rbac: "text-emerald-600 dark:text-emerald-400",
  audit: "text-amber-600 dark:text-amber-400",
  security: "text-emerald-600 dark:text-emerald-400",
  multiSite: "text-pink-600 dark:text-pink-400",
  orchestration: "text-purple-600 dark:text-purple-400",
  reuse: "text-lime-600 dark:text-lime-400",
};

const MAX_VISIBLE_CATEGORIES = 6;

/** 根据 slug 生成稳定的装饰渐变（无封面图时的视觉锚点） */
function cardGradientClass(slug: string): string {
  const palettes = [
    "from-violet-500/25 via-fuchsia-500/10 to-transparent dark:from-violet-400/20",
    "from-cyan-500/20 via-sky-500/10 to-transparent dark:from-cyan-400/15",
    "from-indigo-500/25 via-blue-500/10 to-transparent dark:from-indigo-400/18",
    "from-emerald-500/20 via-teal-500/10 to-transparent dark:from-emerald-400/15",
    "from-amber-500/15 via-orange-500/8 to-transparent dark:from-amber-400/12",
  ];
  let n = 0;
  for (let i = 0; i < slug.length; i++) n += slug.charCodeAt(i);
  return palettes[n % palettes.length];
}

/** 列表模式：左栏分类 + 日期，右栏标题 + 摘要（参考极简新闻列表排版） */
function PostListItem({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const primaryTag = post.tags[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "motion-blog-item group block py-8 sm:py-10",
        "transition-colors duration-200",
        "hover:bg-muted/25 sm:-mx-4 sm:rounded-lg sm:px-4"
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10 lg:gap-16">
        <div className="shrink-0 sm:w-36 lg:w-44">
          <p className="text-[15px] font-semibold leading-snug text-foreground">
            {primaryTag}
          </p>
          <p className="mt-1.5 text-sm leading-normal text-muted-foreground">
            <time dateTime={post.date}>
              {formatBlogDate(post.date, locale)}
            </time>
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-pretty text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors sm:text-xl sm:leading-snug group-hover:text-brand">
            {post.title}
          </h2>
          <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-[15px] sm:leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * 新闻索引卡片：上图下文，仅标题 + 一行分类/日期；无摘要、无 CTA（参考 OpenAI News 一类极简列表，非像素级还原）。
 */
function PostNewsCard({ post }: { post: BlogPost }) {
  const locale = useLocale();
  const primaryTag = post.tags[0];
  const colorClass =
    categoryColors[post.tagIds[0] ?? ""] || "text-brand";
  const gradient = cardGradientClass(post.slug);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "motion-blog-item group block h-full min-h-0 overflow-hidden rounded-none bg-transparent",
        "transition-[opacity,transform] duration-300 ease-out",
        "hover:opacity-90 active:opacity-85"
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br to-background",
          gradient,
          "aspect-[5/4] w-full"
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_25%_15%,oklch(0.99_0.03_280/0.12),transparent_58%)] dark:bg-[radial-gradient(ellipse_85%_65%_at_25%_15%,oklch(0.42_0.1_280/0.18),transparent_52%)]" />
        <div className="absolute inset-0 opacity-30 dark:opacity-20 [background-image:linear-gradient(to_right,oklch(0.5_0.02_264/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.02_264/0.05)_1px,transparent_1px)] bg-size-[22px_22px]" />
      </div>

      <div className="pt-4 sm:pt-5">
        <h2
          className={cn(
            "text-pretty font-semibold tracking-tight text-foreground transition-colors group-hover:text-brand",
            "text-[1.0625rem] leading-snug sm:text-lg"
          )}
        >
          {post.title}
        </h2>
        <p className="mt-2.5 text-[13px] leading-snug text-muted-foreground sm:text-sm">
          <span className={cn("font-medium", colorClass)}>{primaryTag}</span>
          <span className="text-muted-foreground/40" aria-hidden>
            {" "}
            ·{" "}
          </span>
          <time dateTime={post.date} className="text-muted-foreground">
            {formatBlogDate(post.date, locale)}
          </time>
        </p>
      </div>
    </Link>
  );
}

function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  startIndex,
  onStartIndexChange,
  viewMode,
  onViewModeChange,
}: {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  startIndex: number;
  onStartIndexChange: (index: number) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const totalCategories = categories.length;

  const visibleCategories = useMemo(() => {
    if (totalCategories <= MAX_VISIBLE_CATEGORIES) {
      return categories;
    }
    const result: string[] = [];
    for (let i = 0; i < MAX_VISIBLE_CATEGORIES; i++) {
      const idx = (startIndex + i) % totalCategories;
      result.push(categories[idx]);
    }
    return result;
  }, [categories, startIndex, totalCategories]);

  const handleCategoryClick = useCallback(
    (category: string, clickedIndex: number) => {
      if (
        clickedIndex >= 2 &&
        clickedIndex <= 4 &&
        totalCategories > MAX_VISIBLE_CATEGORIES
      ) {
        const actualIndex = categories.indexOf(category);
        const newStartIndex =
          (actualIndex - 2 + totalCategories) % totalCategories;
        onStartIndexChange(newStartIndex);
      }

      if (selectedCategory === category) {
        onSelectCategory(null);
      } else {
        onSelectCategory(category);
      }
    },
    [
      categories,
      selectedCategory,
      onSelectCategory,
      onStartIndexChange,
      totalCategories,
    ]
  );

  const scrollLeft = useCallback(() => {
    const newStartIndex =
      (startIndex - 1 + totalCategories) % totalCategories;
    onStartIndexChange(newStartIndex);
  }, [startIndex, totalCategories, onStartIndexChange]);

  const scrollRight = useCallback(() => {
    const newStartIndex = (startIndex + 1) % totalCategories;
    onStartIndexChange(newStartIndex);
  }, [startIndex, totalCategories, onStartIndexChange]);

  return (
    <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={cn(
            "text-sm font-medium transition-colors",
            selectedCategory === null
              ? "text-brand"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t("filter.all")}
        </button>

        <span className="text-muted-foreground/30" aria-hidden>
          |
        </span>

        {totalCategories > MAX_VISIBLE_CATEGORIES && (
          <button
            type="button"
            onClick={scrollLeft}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("a11y.scrollLeft")}
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {visibleCategories.map((category, index) => {
            const colorClass = categoryColors[category] || "text-brand";
            return (
              <button
                type="button"
                key={`${category}-${startIndex}-${index}`}
                onClick={() => handleCategoryClick(category, index)}
                className={cn(
                  "min-w-16 text-center text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? colorClass
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {getTagLabel(category, locale)}
              </button>
            );
          })}
        </div>

        {totalCategories > MAX_VISIBLE_CATEGORIES && (
          <button
            type="button"
            onClick={scrollRight}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("a11y.scrollRight")}
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-2 transition-colors",
            viewMode === "list"
              ? "text-brand"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={t("a11y.listView")}
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-2 transition-colors",
            viewMode === "grid"
              ? "text-brand"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={t("a11y.gridView")}
        >
          <LayoutGrid className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const t = useTranslations("blog");
  const posts = useMemo(() => getSortedPosts(locale), [locale]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  const categories = useMemo(() => getAllTagIds(posts), [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter((post) => post.tagIds.includes(selectedCategory));
  }, [posts, selectedCategory]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.from(".motion-blog-item", {
        y: 12,
        opacity: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        immediateRender: false,
      });

      return () => {
        gsap.killTweensOf(".motion-blog-item");
      };
    },
    { scope: sectionRef, dependencies: [filteredPosts.length, viewMode] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative scroll-mt-24 bg-transparent"
    >
      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 py-24 sm:px-8 lg:px-14 lg:py-32">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          startIndex={startIndex}
          onStartIndexChange={setStartIndex}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="mb-8 h-px bg-border/40" aria-hidden />

        {filteredPosts.length > 0 ? (
          viewMode === "list" ? (
            <div className="divide-y divide-border/50">
              {filteredPosts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
              {filteredPosts.map((post) => (
                <PostNewsCard key={post.slug} post={post} />
              ))}
            </div>
          )
        ) : (
          <Empty
            icon={Newspaper}
            title={
              posts.length === 0
                ? t("empty.noPostsTitle")
                : t("empty.filteredTitle")
            }
            description={
              posts.length === 0
                ? t("empty.noPostsDescription")
                : t("empty.filteredDescription")
            }
          >
            {posts.length > 0 && selectedCategory ? (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setSelectedCategory(null)}
              >
                {t("empty.clearFilter")}
              </Button>
            ) : null}
          </Empty>
        )}
      </div>
    </section>
  );
}
