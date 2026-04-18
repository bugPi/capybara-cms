import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "博客",
  description: "Capybara CMS 产品更新、内容与工程实践。",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="text-foreground underline-offset-4 hover:underline">
          首页
        </Link>
        <span aria-hidden className="mx-2 text-border">
          /
        </span>
        博客
      </p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">博客</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        文章与更新即将发布。若你希望了解产品与集成能力，欢迎回到首页查看功能与常见问题，或直接联系销售。
      </p>
    </div>
  );
}
