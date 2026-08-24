/**
 * 前台博客数据查询（服务端专用）
 *
 * 只暴露「已发布且未删除」的文章，前台不接触草稿/回收站数据。
 * 内容格式兼容两种：富文本编辑器输出的 HTML、历史种子数据的 Markdown。
 */
import { and, desc, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  posts,
  postTags,
  tags,
  users,
} from "@/lib/db/schema";

export type BlogPostItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  /** publishedAt 的 ISO 字符串 */
  date: string;
  author: string | null;
  /** 标签 slug（用于筛选与配色） */
  tagIds: string[];
  /** 标签展示名 */
  tags: string[];
  featured: boolean;
};

/** 已发布且未删除 */
const PUBLISHED = and(eq(posts.status, "published"), isNull(posts.deletedAt));

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured: boolean;
  publishedAt: Date | null;
  authorName: string | null;
};

function toBlogPost(row: PostRow): BlogPostItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.publishedAt ? row.publishedAt.toISOString() : "",
    author: row.authorName,
    tagIds: [],
    tags: [],
    featured: row.featured,
  };
}

function selectPublished(extra?: SQL) {
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      featured: posts.featured,
      publishedAt: posts.publishedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(extra ? and(PUBLISHED, extra) : PUBLISHED);
}

/** 批量附加标签（slug + 名称）并转换为前台结构 */
function attachTags(rows: PostRow[]): BlogPostItem[] {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const tagRows = db
    .select({
      postId: postTags.postId,
      slug: tags.slug,
      name: tags.name,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, ids))
    .all();

  const map = new Map<number, { slugs: string[]; names: string[] }>();
  for (const t of tagRows) {
    const cur = map.get(t.postId) ?? { slugs: [], names: [] };
    cur.slugs.push(t.slug);
    cur.names.push(t.name);
    map.set(t.postId, cur);
  }

  return rows.map((r) => ({
    ...toBlogPost(r),
    tagIds: map.get(r.id)?.slugs ?? [],
    tags: map.get(r.id)?.names ?? [],
  }));
}

/** 全部已发布文章（按发布时间倒序） */
export function getPublishedPosts(): BlogPostItem[] {
  const rows = selectPublished().orderBy(desc(posts.publishedAt), desc(posts.id)).all();
  return attachTags(rows);
}

/** 按 slug 取单篇已发布文章 */
export function getPublishedPostBySlug(slug: string): BlogPostItem | null {
  const row = selectPublished(eq(posts.slug, slug)).get();
  if (!row) return null;
  return attachTags([row])[0];
}

/** 相关阅读：共享任一标签的已发布文章（排除自身） */
export function getRelatedPosts(post: BlogPostItem, limit = 2): BlogPostItem[] {
  if (post.tagIds.length === 0) return [];

  const tagRows = db
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.slug, post.tagIds))
    .all();
  if (tagRows.length === 0) return [];
  const tagIds = tagRows.map((r) => r.id);

  const relatedIds = db
    .select({ postId: postTags.postId })
    .from(postTags)
    .where(inArray(postTags.tagId, tagIds))
    .all()
    .map((r) => r.postId);

  const unique = [...new Set(relatedIds)].filter((id) => id !== post.id);
  if (unique.length === 0) return [];

  const rows = selectPublished(inArray(posts.id, unique))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit)
    .all();
  return attachTags(rows);
}
