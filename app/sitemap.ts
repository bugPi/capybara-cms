import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getPublishedPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  const posts = getPublishedPosts();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 已发布文章（zh/en 两个语言版本）
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((p) => {
    const lastModified = p.date ? new Date(p.date) : now;
    const entry = {
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    };
    return [
      { url: `${base}/zh/blog/${p.slug}`, ...entry },
      { url: `${base}/en/blog/${p.slug}`, ...entry },
    ];
  });

  return [...staticEntries, ...postEntries];
}
