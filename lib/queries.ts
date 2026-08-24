/**
 * 后台数据查询（服务端专用）
 *
 * 把页面里重复的「文章 + 作者 + 分类 + 标签」组装逻辑收敛到这里。
 */
import { and, desc, eq, inArray, isNotNull, isNull, like, sql } from "drizzle-orm";
import { db } from "./db";
import {
  apiKeys,
  auditLogs,
  categories,
  media,
  mcpTools,
  postCategories,
  postRevisions,
  posts,
  postTags,
  settings,
  sites,
  tags,
  users,
  webhooks,
  type PostStatus,
} from "./db/schema";

export type PostListItem = {
  id: number;
  slug: string;
  title: string;
  status: PostStatus;
  featured: boolean;
  excerpt: string | null;
  content?: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  categories: string[];
  tags: string[];
  categoryIds: number[];
  tagIds: number[];
};

export type PostsPageResult = {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function getPostsPage(input: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: PostStatus | "";
  categoryId?: number;
  tagId?: number;
  deleted?: boolean;
}): PostsPageResult {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 10));

  const conds = [];
  if (input.deleted) {
    conds.push(isNotNull(posts.deletedAt));
  } else {
    conds.push(isNull(posts.deletedAt));
  }
  if (input.q) {
    conds.push(like(posts.title, `%${input.q}%`));
  }
  if (input.status) {
    conds.push(eq(posts.status, input.status));
  }
  if (input.categoryId) {
    const ids = db
      .select({ postId: postCategories.postId })
      .from(postCategories)
      .where(eq(postCategories.categoryId, input.categoryId))
      .all()
      .map((r) => r.postId);
    conds.push(inArray(posts.id, ids.length ? ids : [-1]));
  }
  if (input.tagId) {
    const ids = db
      .select({ postId: postTags.postId })
      .from(postTags)
      .where(eq(postTags.tagId, input.tagId))
      .all()
      .map((r) => r.postId);
    conds.push(inArray(posts.id, ids.length ? ids : [-1]));
  }

  const where = conds.length ? and(...conds) : undefined;

  const totalRow = db
    .select({ n: sql<number>`count(*)` })
    .from(posts)
    .where(where)
    .get();
  const total = totalRow?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const rows = db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      featured: posts.featured,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(where)
    .orderBy(desc(posts.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  const items = attachRelations(rows);
  return { items, total, page, pageSize, totalPages };
}

export function getPostDetail(id: number): PostListItem | null {
  const row = db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      featured: posts.featured,
      excerpt: posts.excerpt,
      content: posts.content,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .get();
  if (!row) return null;
  return attachRelations([row])[0];
}

// ---------------------------------------------------------------------------
// 版本历史
// ---------------------------------------------------------------------------

export type PostRevisionListItem = {
  id: number;
  postId: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  authorName: string | null;
  createdAt: Date;
};

export function getPostRevisions(postId: number): PostRevisionListItem[] {
  return db
    .select({
      id: postRevisions.id,
      postId: postRevisions.postId,
      title: postRevisions.title,
      slug: postRevisions.slug,
      excerpt: postRevisions.excerpt,
      content: postRevisions.content,
      status: postRevisions.status,
      authorName: users.name,
      createdAt: postRevisions.createdAt,
    })
    .from(postRevisions)
    .leftJoin(users, eq(postRevisions.authorId, users.id))
    .where(eq(postRevisions.postId, postId))
    .orderBy(desc(postRevisions.createdAt), desc(postRevisions.id))
    .all();
}

/** 为文章行批量附加分类名/标签名与关联 id */
function attachRelations<T extends { id: number }>(
  rows: T[]
): (T & {
  categories: string[];
  tags: string[];
  categoryIds: number[];
  tagIds: number[];
})[] {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const catRows = db
    .select({
      postId: postCategories.postId,
      categoryId: postCategories.categoryId,
      name: categories.name,
    })
    .from(postCategories)
    .innerJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(inArray(postCategories.postId, ids))
    .all();

  const tagRows = db
    .select({
      postId: postTags.postId,
      tagId: postTags.tagId,
      name: tags.name,
    })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, ids))
    .all();

  const catMap = new Map<number, { names: string[]; ids: number[] }>();
  const tagMap = new Map<number, { names: string[]; ids: number[] }>();
  for (const c of catRows) {
    const cur = catMap.get(c.postId) ?? { names: [], ids: [] };
    cur.names.push(c.name);
    cur.ids.push(c.categoryId);
    catMap.set(c.postId, cur);
  }
  for (const t of tagRows) {
    const cur = tagMap.get(t.postId) ?? { names: [], ids: [] };
    cur.names.push(t.name);
    cur.ids.push(t.tagId);
    tagMap.set(t.postId, cur);
  }

  return rows.map((r) => ({
    ...r,
    categories: catMap.get(r.id)?.names ?? [],
    tags: tagMap.get(r.id)?.names ?? [],
    categoryIds: catMap.get(r.id)?.ids ?? [],
    tagIds: tagMap.get(r.id)?.ids ?? [],
  }));
}

// ---------------------------------------------------------------------------
// 仪表盘
// ---------------------------------------------------------------------------

export function getDashboardStats() {
  const countPosts = (where?: ReturnType<typeof and>) =>
    db.select({ n: sql<number>`count(*)` }).from(posts).where(where).get()?.n ?? 0;

  const total = countPosts(isNull(posts.deletedAt));
  const published = countPosts(and(isNull(posts.deletedAt), eq(posts.status, "published")));
  const drafts = countPosts(and(isNull(posts.deletedAt), eq(posts.status, "draft")));
  const review = countPosts(and(isNull(posts.deletedAt), eq(posts.status, "review")));
  const archived = countPosts(and(isNull(posts.deletedAt), eq(posts.status, "archived")));
  const trashed = countPosts(isNotNull(posts.deletedAt));

  const mediaCount =
    db.select({ n: sql<number>`count(*)` }).from(media).get()?.n ?? 0;
  const userCount =
    db.select({ n: sql<number>`count(*)` }).from(users).get()?.n ?? 0;
  const categoryCount =
    db.select({ n: sql<number>`count(*)` }).from(categories).get()?.n ?? 0;
  const tagCount =
    db.select({ n: sql<number>`count(*)` }).from(tags).get()?.n ?? 0;

  return {
    total,
    published,
    drafts,
    review,
    archived,
    trashed,
    mediaCount,
    userCount,
    categoryCount,
    tagCount,
  };
}

export function getRecentPosts(limit = 5): PostListItem[] {
  const rows = db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      featured: posts.featured,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(isNull(posts.deletedAt))
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .all();
  return attachRelations(rows);
}

export function getRecentAudit(limit = 8) {
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .all();
}

// ---------------------------------------------------------------------------
// 分类 / 标签（带文章数）
// ---------------------------------------------------------------------------

export function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      createdAt: categories.createdAt,
      postCount: sql<number>`(select count(*) from post_categories pc where pc.category_id = categories.id)`,
    })
    .from(categories)
    .orderBy(desc(categories.createdAt))
    .all();
}

export function getTagsWithCounts() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      postCount: sql<number>`(select count(*) from post_tags pt where pt.tag_id = tags.id)`,
    })
    .from(tags)
    .orderBy(desc(tags.createdAt))
    .all();
}

export function getAllCategories() {
  return db.select().from(categories).orderBy(categories.name).all();
}

export function getAllTags() {
  return db.select().from(tags).orderBy(tags.name).all();
}

// ---------------------------------------------------------------------------
// 用户 / 站点 / 媒体
// ---------------------------------------------------------------------------

export function getUsersList() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      avatar: users.avatar,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      postCount: sql<number>`(select count(*) from posts p where p.author_id = users.id and p.deleted_at is null)`,
    })
    .from(users)
    .orderBy(users.createdAt)
    .all();
}

export function getSitesList() {
  return db.select().from(sites).orderBy(sites.createdAt).all();
}

export function getMediaList() {
  return db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .all();
}

// ---------------------------------------------------------------------------
// 审计日志（分页 + 筛选）
// ---------------------------------------------------------------------------

export type AuditLogsPageResult = {
  items: (typeof auditLogs.$inferSelect)[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function getAuditLogsPage(input: {
  page?: number;
  pageSize?: number;
  action?: string;
  actor?: string;
}): AuditLogsPageResult {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20));

  const conds = [];
  if (input.action) conds.push(eq(auditLogs.action, input.action));
  if (input.actor) conds.push(eq(auditLogs.actor, input.actor));

  const where = conds.length ? and(...conds) : undefined;

  const totalRow = db
    .select({ n: sql<number>`count(*)` })
    .from(auditLogs)
    .where(where)
    .get();
  const total = totalRow?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  return { items, total, page, pageSize, totalPages };
}

/** 审计筛选用：出现过的操作类型（去重，按最新排序） */
export function getAuditActionOptions(): string[] {
  return db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .orderBy(auditLogs.action)
    .all()
    .map((r) => r.action);
}

/** 审计筛选用：出现过的操作者（去重） */
export function getAuditActorOptions(): string[] {
  return db
    .selectDistinct({ actor: auditLogs.actor })
    .from(auditLogs)
    .orderBy(auditLogs.actor)
    .all()
    .map((r) => r.actor);
}

/** 键值设置 → 对象 */
export function getSettingsMap(): Record<string, string> {
  const rows = db.select().from(settings).all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** MCP 工具列表 */
export function getMcpToolsList() {
  return db.select().from(mcpTools).orderBy(mcpTools.name).all();
}

/** API Key 列表 */
export function getApiKeysList() {
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt)).all();
}

/** Webhook 列表 */
export function getWebhooksList() {
  return db.select().from(webhooks).orderBy(desc(webhooks.createdAt)).all();
}

// ---------------------------------------------------------------------------
// 仪表盘图表数据
// ---------------------------------------------------------------------------

/** 最近 N 个月每月创建文章数（含空月补 0） */
export function getPostsTrend(months = 12): { month: string; count: number }[] {
  const now = new Date();
  const result: { month: string; count: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({ month: key, count: 0 });
  }

  const monthSql = sql<string>`strftime('%Y-%m', created_at / 1000, 'unixepoch')`;
  const rows = db
    .select({ month: monthSql, count: sql<number>`count(*)` })
    .from(posts)
    .where(isNull(posts.deletedAt))
    .groupBy(monthSql)
    .all();

  const map = new Map(rows.map((r) => [r.month, r.count]));
  return result.map((r) => ({ ...r, count: map.get(r.month) ?? 0 }));
}

/** 最近 N 天每天操作次数（审计日志） */
export function getAuditActivity(days = 7): { date: string; count: number }[] {
  const now = new Date();
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    result.push({ date: key, count: 0 });
  }

  const daySql = sql<string>`strftime('%Y-%m-%d', created_at / 1000, 'unixepoch')`;
  const rows = db
    .select({ date: daySql, count: sql<number>`count(*)` })
    .from(auditLogs)
    .groupBy(daySql)
    .all();

  const map = new Map(rows.map((r) => [r.date, r.count]));
  return result.map((r) => ({ ...r, count: map.get(r.date) ?? 0 }));
}
