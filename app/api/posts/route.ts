import { NextRequest } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import {
  authenticateApiKey,
  hasScope,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";
import { writeAudit } from "@/lib/db/audit";
import { slugify } from "@/lib/slug";
import { dispatchWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

type PostBody = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: "draft" | "review" | "published" | "archived";
  featured?: boolean;
};

function serializePost(row: (typeof posts.$inferSelect)) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    status: row.status,
    featured: row.featured,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** GET /api/posts?page=&pageSize=&status= */
export async function GET(req: NextRequest) {
  const auth = authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return unauthorized();
  if (!hasScope(auth, "read")) return forbidden();

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize")) || 10));
  const status = sp.get("status");

  const where = and(
    isNull(posts.deletedAt),
    status ? eq(posts.status, status as never) : undefined
  );

  const total = db
    .select({ n: posts.id })
    .from(posts)
    .where(where)
    .all().length;
  const rows = db
    .select()
    .from(posts)
    .where(where)
    .orderBy(desc(posts.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  return Response.json({
    items: rows.map(serializePost),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

/** POST /api/posts */
export async function POST(req: NextRequest) {
  const auth = authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return unauthorized();
  if (!hasScope(auth, "write")) return forbidden();

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return badRequest("请求体必须是合法 JSON");
  }

  const title = String(body.title ?? "").trim();
  if (!title) return badRequest("title 不能为空");

  const status = body.status ?? "draft";
  const slug = String(body.slug ?? "").trim() || slugify(title);
  const exists = db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).get();
  if (exists) return badRequest(`slug「${slug}」已被占用`);

  const res = db
    .insert(posts)
    .values({
      slug,
      title,
      excerpt: body.excerpt ?? null,
      content: body.content ?? "",
      status,
      featured: body.featured ?? false,
      publishedAt: status === "published" ? new Date() : null,
    })
    .run();
  const postId = Number(res.lastInsertRowid);
  const row = db.select().from(posts).where(eq(posts.id, postId)).get()!;

  writeAudit({
    actor: `${auth.name} (API)`,
    action: "post.create",
    entityType: "post",
    entityId: postId,
    detail: `API 创建文章「${title}」`,
  });
  dispatchWebhook("post.created", serializePost(row));

  return Response.json(serializePost(row), { status: 201 });
}
