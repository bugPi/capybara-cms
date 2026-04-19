import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getSortedPosts } from "@/lib/blog-posts";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getSortedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "文章未找到" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

function formatDateFull(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getSortedPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  const primaryTag = post.tags[0];
  const style = categoryStyles[primaryTag] || {
    text: "text-brand",
    bg: "bg-brand/10 dark:bg-brand/20",
  };

  return (
    <article className="relative scroll-mt-24 bg-transparent">
      {/* 顶部装饰线 */}
      <div className="h-px bg-border/30" aria-hidden />

      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-10 pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* 元信息 */}
        <div className="mb-10 flex items-center gap-3">
          <span
            className={cn(
              "inline-flex px-2.5 py-1 rounded text-xs font-medium",
              style.bg,
              style.text
            )}
          >
            {primaryTag}
          </span>
          <span className="text-sm text-muted-foreground/70">
            {formatDateFull(post.date)}
          </span>
        </div>

        {/* 标题 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">
          {post.title}
        </h1>

        {/* 摘要 */}
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
          {post.excerpt}
        </p>

        {/* 分隔线 */}
        <div className="mt-12 mb-12 h-px bg-border/30" aria-hidden />

        {/* 正文 */}
        <div
          className={cn(
            "prose prose-stone dark:prose-invert max-w-none",
            "prose-lg",
            "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
            "prose-h2:scroll-mt-24 prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border/25 prose-h2:pb-3 prose-h2:first:mt-0",
            "prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4 prose-h3:font-medium",
            "prose-p:text-foreground/90 prose-p:leading-[1.75] prose-p:mb-5",
            "prose-a:text-brand prose-a:font-medium prose-a:underline-offset-4 prose-a:hover:underline",
            "prose-code:text-foreground prose-code:bg-muted/30 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
            "prose-pre:bg-muted/25 prose-pre:border prose-pre:border-border/30 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto",
            "prose-strong:text-foreground prose-strong:font-semibold",
            "prose-ul:my-6 prose-ol:my-6 prose-ul:pl-4 prose-ol:pl-4",
            "prose-li:text-foreground/85 prose-li:leading-relaxed prose-li:my-1.5",
            "prose-blockquote:not-italic prose-blockquote:text-foreground/80 prose-blockquote:border-l-brand/30 prose-blockquote:pl-6 prose-blockquote:my-8",
            "prose-img:rounded-xl prose-img:border prose-img:border-border/30"
          )}
        >
          {post.content.split("\n").map((paragraph, i) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={i} id={paragraph.slice(3).toLowerCase().replace(/\s+/g, "-")}>
                  {paragraph.slice(3)}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={i} id={paragraph.slice(4).toLowerCase().replace(/\s+/g, "-")}>
                  {paragraph.slice(4)}
                </h3>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <ul key={i}>
                  <li>{paragraph.slice(2)}</li>
                </ul>
              );
            }
            if (paragraph.trim() === "") {
              return null;
            }
            return <p key={i}>{paragraph}</p>;
          })}
        </div>

        {/* 标签 */}
        <div className="mt-14 pt-10 border-t border-border/25">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => {
              const tagStyle = categoryStyles[tag] || style;
              return (
                <span
                  key={tag}
                  className={cn(
                    "inline-flex px-3 py-1.5 rounded text-xs font-medium",
                    tagStyle.bg,
                    tagStyle.text
                  )}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* 作者 */}
        <div className="mt-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center text-sm font-medium text-foreground">
            {post.author.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{post.author}</p>
            <p className="text-xs text-muted-foreground">Capybara CMS</p>
          </div>
        </div>

        {/* 相关阅读 */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border/25">
            <p className="mb-6 text-xs font-mono tracking-[0.18em] text-muted-foreground/50 uppercase">
              相关阅读
            </p>
            <div className="grid gap-8 sm:grid-cols-2">
              {relatedPosts.map((related) => {
                const relStyle = categoryStyles[related.tags[0]] || style;
                return (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group py-4"
                  >
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-xs font-medium mb-3",
                        relStyle.bg,
                        relStyle.text
                      )}
                    >
                      {related.tags[0]}
                    </span>
                    <h3 className="text-base font-medium text-foreground group-hover:text-brand transition-colors leading-snug">
                      {related.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 返回列表 */}
        <div className="mt-16 pt-10 border-t border-border/25">
          <Link
            href="/blog"
            className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors"
          >
            查看所有文章 →
          </Link>
        </div>
      </div>
    </article>
  );
}