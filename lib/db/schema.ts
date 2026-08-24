/**
 * Capybara CMS 数据库 Schema（Drizzle ORM + SQLite）
 *
 * 表结构一览：
 * - users          用户
 * - posts          文章（含软删除回收站、状态机 draft/review/published/archived）
 * - categories     分类
 * - tags           标签
 * - post_categories / post_tags  文章-分类 / 文章-标签 多对多关联
 * - media          媒体库
 * - audit_logs     审计日志（追加写，不可变）
 * - settings       键值设置
 * - sites          多站点
 * - api_keys       API 密钥
 * - webhooks       Webhook 订阅
 * - mcp_tools      MCP 工具开关
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** 文章状态机 */
export const POST_STATUSES = [
  "draft",
  "review",
  "published",
  "archived",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

/** 用户角色 */
export const USER_ROLES = ["admin", "editor", "author", "reviewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** 用户状态 */
export const USER_STATUSES = ["active", "disabled"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  /** 演示环境明文存储，接入真实鉴权后改为 bcrypt/argon2 哈希 */
  password: text("password").notNull(),
  role: text("role", { enum: USER_ROLES }).notNull().default("author"),
  status: text("status", { enum: USER_STATUSES })
    .notNull()
    .default("active"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
});

// ---------------------------------------------------------------------------
// posts
// ---------------------------------------------------------------------------
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    /** Markdown 正文 */
    content: text("content").notNull().default(""),
    status: text("status", { enum: POST_STATUSES })
      .notNull()
      .default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    /** 软删除：非空表示已移入回收站 */
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex("posts_slug_idx").on(table.slug),
    uniqueIndex("posts_title_idx").on(table.title),
  ]
);

// ---------------------------------------------------------------------------
// categories / tags
// ---------------------------------------------------------------------------
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ---------------------------------------------------------------------------
// post_revisions（版本历史：每次保存的内容快照）
// ---------------------------------------------------------------------------
export const postRevisions = sqliteTable(
  "post_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    /** 快照正文（富文本 HTML） */
    content: text("content").notNull().default(""),
    status: text("status", { enum: POST_STATUSES }).notNull(),
    authorId: integer("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    index("post_revisions_post_idx").on(table.postId, table.createdAt),
  ]
);

// ---------------------------------------------------------------------------
// post_categories / post_tags（多对多）
// ---------------------------------------------------------------------------
export const postCategories = sqliteTable(
  "post_categories",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("pc_pk").on(table.postId, table.categoryId)]
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("pt_pk").on(table.postId, table.tagId)]
);

// ---------------------------------------------------------------------------
// media
// ---------------------------------------------------------------------------
export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  /** 磁盘文件名（public/uploads 下） */
  filename: text("filename").notNull(),
  /** 公开访问 URL */
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  alt: text("alt"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ---------------------------------------------------------------------------
// audit_logs（追加写，不提供更新/删除）
// ---------------------------------------------------------------------------
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** 操作者：用户名 / API / MCP */
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ---------------------------------------------------------------------------
// settings（键值对）
// ---------------------------------------------------------------------------
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// ---------------------------------------------------------------------------
// sites（多站点）
// ---------------------------------------------------------------------------
export const sites = sqliteTable("sites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  url: text("url"),
  locale: text("locale").notNull().default("zh"),
  description: text("description"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ---------------------------------------------------------------------------
// api_keys
// ---------------------------------------------------------------------------
export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  /** 密钥明文仅创建时展示一次 */
  key: text("key").notNull().unique(),
  /** 逗号分隔的权限范围：read,write,publish */
  scopes: text("scopes").notNull().default("read"),
  status: text("status", { enum: ["active", "revoked"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
});

// ---------------------------------------------------------------------------
// webhooks
// ---------------------------------------------------------------------------
export const webhooks = sqliteTable("webhooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  /** JSON 数组字符串：["post.published","post.updated"] */
  events: text("events").notNull().default("[]"),
  secret: text("secret"),
  status: text("status", { enum: ["active", "disabled"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ---------------------------------------------------------------------------
// mcp_tools
// ---------------------------------------------------------------------------
export const mcpTools = sqliteTable("mcp_tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type UserRow = typeof users.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type PostRevisionRow = typeof postRevisions.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type TagRow = typeof tags.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type SiteRow = typeof sites.$inferSelect;
export type ApiKeyRow = typeof apiKeys.$inferSelect;
export type WebhookRow = typeof webhooks.$inferSelect;
export type McpToolRow = typeof mcpTools.$inferSelect;
