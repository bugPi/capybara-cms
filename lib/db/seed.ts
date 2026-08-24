/**
 * 种子数据：首次启动时写入演示数据
 *
 * - 用户 / 分类 / 标签 / 站点 / API Key / Webhook / MCP 工具
 * - 博客文章：从 lib/blog-posts.ts 迁移（zh 内容），作为后台文章数据源
 *
 * 幂等：users 表已有数据时直接跳过。
 */
import { eq } from "drizzle-orm";
import {
  getSortedPosts,
  getTagLabel,
  type BlogPost,
} from "@/lib/blog-posts";
import type { Db } from "./index";
import { hashPassword, isHashedPassword } from "@/lib/password";
import {
  apiKeys,
  categories,
  mcpTools,
  postCategories,
  posts,
  postTags,
  settings,
  sites,
  tags,
  users,
  webhooks,
} from "./schema";

/** 每篇文章归属的分类（slug → category slug） */
const POST_CATEGORY: Record<string, string> = {
  "mcp-workflow-guide": "product",
  "seo-best-practices": "product",
  "parallel-migration": "delivery",
  "headless-api-webhook": "engineering",
  "rbac-and-audit": "security",
  "multi-site-orchestration": "architecture",
};

const CATEGORIES: { name: string; slug: string; description: string }[] = [
  { name: "产品", slug: "product", description: "产品功能与使用指南" },
  { name: "工程", slug: "engineering", description: "工程实践与集成方案" },
  { name: "安全", slug: "security", description: "权限、审计与合规" },
  { name: "实施", slug: "delivery", description: "迁移与上线流程" },
  { name: "架构", slug: "architecture", description: "系统设计与多站点编排" },
];

const SEED_USERS = [
  {
    name: "管理员",
    email: "admin@capybara-cms.local",
    password: "demo",
    role: "admin" as const,
    status: "active" as const,
  },
  {
    name: "陈编辑",
    email: "editor@capybara-cms.local",
    password: "demo",
    role: "editor" as const,
    status: "active" as const,
  },
  {
    name: "李作者",
    email: "author@capybara-cms.local",
    password: "demo",
    role: "author" as const,
    status: "active" as const,
  },
  {
    name: "王审核",
    email: "reviewer@capybara-cms.local",
    password: "demo",
    role: "reviewer" as const,
    status: "active" as const,
  },
];

const SEED_SITES = [
  {
    name: "主站",
    slug: "main",
    url: "https://capybara-cms.local",
    locale: "zh",
    description: "中文官方网站",
    isDefault: true,
  },
  {
    name: "海外站",
    slug: "global",
    url: "https://en.capybara-cms.local",
    locale: "en",
    description: "English site",
    isDefault: false,
  },
];

const SEED_SETTINGS: Record<string, string> = {
  site_name: "Capybara CMS",
  site_description: "企业级内容与发布平台：结构化内容、工作流与 API",
  site_url: "https://capybara-cms.local",
  default_locale: "zh",
  timezone: "Asia/Shanghai",
  seo_title_template: "{title} | {siteName}",
  seo_description_length: "160",
  audit_retention_days: "730",
  media_max_size_mb: "10",
};

const SEED_MCP_TOOLS = [
  {
    name: "draft_blog_post",
    description: "在允许的栏目下创建博客草稿（不能直接发布）",
    enabled: true,
  },
  {
    name: "submit_for_review",
    description: "将草稿提交审核，进入审批链",
    enabled: true,
  },
  {
    name: "schedule_publish",
    description: "为已审核内容预约发布时间窗口",
    enabled: true,
  },
  {
    name: "publish_now",
    description: "立即发布已审核内容",
    enabled: true,
  },
  {
    name: "list_posts",
    description: "按状态查询文章列表",
    enabled: true,
  },
  {
    name: "get_post_versions",
    description: "查询文章的版本历史",
    enabled: false,
  },
];

export function seedIfEmpty(db: Db) {
  const existing = db.select({ id: users.id }).from(users).limit(1).all();
  if (existing.length > 0) return;

  const now = Date.now();
  const nowDate = new Date(now);

  // 1. users
  const userIds = new Map<string, number>();
  for (const u of SEED_USERS) {
    const res = db
      .insert(users)
      .values({
        ...u,
        password: hashPassword(u.password),
        createdAt: nowDate,
      })
      .run();
    userIds.set(u.email, Number(res.lastInsertRowid));
  }
  const adminId = userIds.get("admin@capybara-cms.local")!;

  // 2. settings
  db.insert(settings)
    .values(Object.entries(SEED_SETTINGS).map(([key, value]) => ({ key, value })))
    .run();

  // 3. sites
  db.insert(sites)
    .values(
      SEED_SITES.map((s) => ({
        ...s,
        createdAt: nowDate,
      }))
    )
    .run();

  // 4. categories
  const categoryIds = new Map<string, number>();
  for (const c of CATEGORIES) {
    const res = db
      .insert(categories)
      .values({ ...c, createdAt: nowDate })
      .run();
    categoryIds.set(c.slug, Number(res.lastInsertRowid));
  }

  // 5. tags（从博客文章提取）
  const tagIds = new Map<string, number>();
  const sortedPosts = getSortedPosts("zh");
  for (const tagId of collectTagIds(sortedPosts)) {
    const res = db
      .insert(tags)
      .values({ name: getTagLabel(tagId, "zh"), slug: tagId, createdAt: nowDate })
      .run();
    tagIds.set(tagId, Number(res.lastInsertRowid));
  }

  // 6. posts（迁移博客文章）
  for (const post of sortedPosts) {
    const res = db
      .insert(posts)
      .values({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: "published",
        featured: post.featured ?? false,
        authorId: adminId,
        publishedAt: new Date(post.date),
        createdAt: new Date(post.date),
        updatedAt: new Date(post.date),
      })
      .run();
    const postId = Number(res.lastInsertRowid);

    for (const tagId of post.tagIds) {
      const tagRow = tagIds.get(tagId);
      if (tagRow) {
        db.insert(postTags).values({ postId, tagId: tagRow }).run();
      }
    }

    const catSlug = POST_CATEGORY[post.slug];
    const catId = catSlug ? categoryIds.get(catSlug) : undefined;
    if (catId) {
      db.insert(postCategories).values({ postId, categoryId: catId }).run();
    }
  }

  // 7. api keys / webhooks / mcp tools
  db.insert(apiKeys)
    .values({
      name: "示例只读 Key",
      key: "ck_live_demo_readonly",
      scopes: "read",
      status: "active",
      createdAt: nowDate,
    })
    .run();

  db.insert(webhooks)
    .values({
      name: "内容发布通知",
      url: "https://hooks.example.com/content-published",
      events: JSON.stringify(["post.published"]),
      secret: "whsec_demo",
      status: "disabled",
      createdAt: nowDate,
    })
    .run();

  db.insert(mcpTools)
    .values(SEED_MCP_TOOLS.map((t) => ({ ...t, createdAt: nowDate })))
    .run();
}

function collectTagIds(postsList: BlogPost[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const p of postsList) {
    for (const id of p.tagIds) {
      if (!seen.has(id)) {
        seen.add(id);
        order.push(id);
      }
    }
  }
  return order;
}

/**
 * 存量明文密码迁移：把历史遗留的明文密码升级为 scrypt 哈希（幂等）。
 * 在 seedIfEmpty 之后调用，保证已存在的数据库也会被迁移。
 */
export function upgradeLegacyPasswords(db: Db) {
  const rows = db.select().from(users).all();
  let upgraded = 0;
  for (const row of rows) {
    if (!row.password || isHashedPassword(row.password)) continue;
    db.update(users)
      .set({ password: hashPassword(row.password) })
      .where(eq(users.id, row.id))
      .run();
    upgraded += 1;
  }
  if (upgraded > 0) {
    console.log(`[db] 已升级 ${upgraded} 个用户的明文密码为 scrypt 哈希`);
  }
}
