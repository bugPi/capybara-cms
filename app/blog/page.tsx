"use client";

import "@/lib/gsap-register";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LANDING_SCROLL_TOGGLE } from "@/lib/landing-motion";
import { cn } from "@/lib/utils";
import { getSortedPosts, type BlogPost } from "@/lib/blog-posts";

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}

function formatYear(date: string) {
  const d = new Date(date);
  return d.getFullYear().toString();
}

const categoryStyles: Record<string, { text: string; bg: string }> = {
  MCP: {
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  SEO: {
    text: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  API: {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  安全: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  迁移: {
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  多站点: {
    text: "text-pink-700 dark:text-pink-300",
    bg: "bg-pink-100 dark:bg-pink-900/30",
  },
};

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const primaryTag = post.tags[0];
  const style = categoryStyles[primaryTag] || {
    text: "text-brand",
    bg: "bg-brand/10 dark:bg-brand/20",
  };
  const isFirst = index === 0;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "motion-blog-card group relative block",
        "py-8 transition-all duration-300",
        isFirst ? "pt-0" : "",
        "border-t border-border/30 first:border-t-0"
      )}
    >
      <div className="flex items-start gap-4">
        {/* 左侧日期 */}
        <div className="hidden sm:flex flex-col items-center justify-center text-right w-16 shrink-0">
          <span className="text-2xl font-light tabular-nums text-foreground/40 dark:text-white/30">
            {formatDate(post.date).split("月")[0]}
          </span>
          <span className="text-xs text-muted-foreground/60 mt-0.5">
            {formatDate(post.date).split("月")[1]}
          </span>
        </div>

        {/* 主内容 */}
        <div className="flex-1 min-w-0">
          {/* 分类标签 */}
          <div className="mb-3 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex px-2 py-0.5 rounded text-xs font-medium",
                style.bg,
                style.text
              )}
            >
              {primaryTag}
            </span>
            <span className="text-xs text-muted-foreground/50 sm:hidden">
              {formatDate(post.date)}
            </span>
          </div>

          {/* 标题 */}
          <h2
            className={cn(
              "text-xl sm:text-2xl font-medium leading-snug tracking-tight text-foreground",
              "group-hover:text-brand transition-colors duration-200",
              isFirst && "text-2xl sm:text-3xl"
            )}
          >
            {post.title}
          </h2>

          {/* 摘要（仅第一篇显示） */}
          {isFirst && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* hover 底线动画 */}
      <div
        className={cn(
          "absolute bottom-0 left-16 right-0 h-px",
          "bg-brand/50 scale-x-0 origin-left",
          "group-hover:scale-x-100 transition-transform duration-400",
          "sm:left-20"
        )}
        aria-hidden
      />
    </Link>
  );
}

export default function BlogPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const posts = getSortedPosts();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.from(".motion-blog-card", {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          toggleActions: LANDING_SCROLL_TOGGLE,
        },
        immediateRender: false,
      });

      return () => {
        gsap.killTweensOf(".motion-blog-card");
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative scroll-mt-24 bg-transparent py-20 lg:py-28"
    >
      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-10">
        {/* 年份分隔（可选） */}
        <div className="mb-8 pb-6 border-b border-border/20">
          <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground/50 uppercase">
            2026
          </span>
        </div>

        {/* 文章列表 */}
        <div>
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}