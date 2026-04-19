"use client";

import "@/lib/gsap-register";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";
import { getSortedPosts, type BlogPost } from "@/lib/blog-posts";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  MCP: "text-violet-600",
  SEO: "text-cyan-600",
  API: "text-blue-600",
  安全: "text-emerald-600",
  迁移: "text-orange-600",
  多站点: "text-pink-600",
  工作流: "text-indigo-600",
  集成: "text-sky-600",
  审计: "text-amber-600",
};

const MAX_VISIBLE_CATEGORIES = 6;

function getAllCategories(posts: BlogPost[]): string[] {
  const categories = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => categories.add(tag));
  });
  return Array.from(categories);
}

function PostListItem({ post }: { post: BlogPost }) {
  const primaryTag = post.tags[0];
  const colorClass = categoryColors[primaryTag] || "text-brand";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "motion-blog-item group flex items-center gap-4 py-3",
        "transition-opacity duration-150 hover:opacity-50"
      )}
    >
      {/* 左侧：分类 + 日期 */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-sm font-medium", colorClass)}>
          {primaryTag}
        </span>
        <span className="text-sm text-muted-foreground/50">
          {formatDate(post.date)}
        </span>
      </div>
      {/* 分隔 */}
      <span className="text-muted-foreground/25 shrink-0" aria-hidden>·</span>
      {/* 标题 */}
      <h2 className="text-sm text-foreground flex-1">
        {post.title}
      </h2>
    </Link>
  );
}

function PostCardItem({ post }: { post: BlogPost }) {
  const primaryTag = post.tags[0];
  const colorClass = categoryColors[primaryTag] || "text-brand";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "motion-blog-item group flex flex-col py-4 px-4",
        "transition-opacity duration-150 hover:opacity-60"
      )}
    >
      {/* 分类 + 日期 */}
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className={cn("font-medium", colorClass)}>
          {primaryTag}
        </span>
        <span className="text-muted-foreground/50">
          {formatDate(post.date)}
        </span>
      </div>
      {/* 标题 */}
      <h2 className="text-sm font-medium text-foreground leading-snug">
        {post.title}
      </h2>
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
  const totalCategories = categories.length;

  // 获取当前显示的分类
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

  // 点击分类时的处理
  const handleCategoryClick = useCallback((category: string, clickedIndex: number) => {
    // 如果点击的是中间位置（索引 2, 3, 4），则滚动
    if (clickedIndex >= 2 && clickedIndex <= 4 && totalCategories > MAX_VISIBLE_CATEGORIES) {
      const actualIndex = categories.indexOf(category);
      const newStartIndex = (actualIndex - 2 + totalCategories) % totalCategories;
      onStartIndexChange(newStartIndex);
    }

    // 选择/取消选择分类
    if (selectedCategory === category) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category);
    }
  }, [categories, selectedCategory, onSelectCategory, onStartIndexChange, totalCategories]);

  // 左右箭头滚动
  const scrollLeft = useCallback(() => {
    const newStartIndex = (startIndex - 1 + totalCategories) % totalCategories;
    onStartIndexChange(newStartIndex);
  }, [startIndex, totalCategories, onStartIndexChange]);

  const scrollRight = useCallback(() => {
    const newStartIndex = (startIndex + 1) % totalCategories;
    onStartIndexChange(newStartIndex);
  }, [startIndex, totalCategories, onStartIndexChange]);

  return (
    <div className="flex items-center justify-between mb-8">
      {/* 左侧：分类筛选 */}
      <div className="flex items-center gap-4">
        {/* 全部 */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "text-sm font-medium transition-colors",
            selectedCategory === null
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          全部
        </button>

        {/* 分隔 */}
        <span className="text-muted-foreground/30" aria-hidden>|</span>

        {/* 左箭头 */}
        {totalCategories > MAX_VISIBLE_CATEGORIES && (
          <button
            onClick={scrollLeft}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="向左滚动"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        {/* 分类标签 */}
        <div className="flex items-center gap-4">
          {visibleCategories.map((category, index) => {
            const colorClass = categoryColors[category] || "text-brand";
            return (
              <button
                key={`${category}-${startIndex}-${index}`}
                onClick={() => handleCategoryClick(category, index)}
                className={cn(
                  "text-sm font-medium transition-colors min-w-[4rem] text-center",
                  selectedCategory === category
                    ? colorClass
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 右箭头 */}
        {totalCategories > MAX_VISIBLE_CATEGORIES && (
          <button
            onClick={scrollRight}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="向右滚动"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      {/* 右侧：视图切换 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange("list")}
          className={cn(
            "p-2 rounded transition-colors",
            viewMode === "list"
              ? "bg-muted/30 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="列表视图"
        >
          <List className="size-4" />
        </button>
        <button
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "p-2 rounded transition-colors",
            viewMode === "grid"
              ? "bg-muted/30 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="卡片视图"
        >
          <LayoutGrid className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const posts = getSortedPosts();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);

  // 获取所有分类
  const categories = useMemo(() => getAllCategories(posts), [posts]);

  // 根据分类筛选文章
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter((post) => post.tags.includes(selectedCategory));
  }, [posts, selectedCategory]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.from(".motion-blog-item", {
        y: 8,
        opacity: 0,
        duration: 0.3,
        stagger: 0.025,
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
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative scroll-mt-24 bg-transparent"
    >
      <div className="relative mx-auto w-full max-w-[min(100%,82rem)] px-5 sm:px-8 lg:px-14 py-24 lg:py-32">
        {/* 分类筛选 + 视图切换 */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          startIndex={startIndex}
          onStartIndexChange={setStartIndex}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* 分隔线 */}
        <div className="mb-6 h-px bg-border/40" aria-hidden />

        {/* 文章列表 */}
        {filteredPosts.length > 0 ? (
          viewMode === "list" ? (
            <div className="divide-y divide-border/40">
              {filteredPosts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-border/40 md:divide-y-0 md:divide-x divide-border/40">
              {filteredPosts.map((post) => (
                <PostCardItem key={post.slug} post={post} />
              ))}
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground py-8">
            暂无该分类的文章
          </p>
        )}
      </div>
    </section>
  );
}