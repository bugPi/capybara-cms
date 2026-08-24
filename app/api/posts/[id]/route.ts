import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, type PostStatus } from "@/lib/db/schema";
import {
  authenticateApiKey,
  hasScope,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
} from "@/lib/api-auth";
import { writeAudit } from "@/lib/db/audit";
import { slugify } from "@/lib/slug";
import { dispatchWebhook } from "@/lib/webhooks";

export const runtime = "nodejs";

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

type Params = Promise<{ id: string }>;

/** GET /api/posts/:id */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const auth = authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return unauthorized();
  if (!hasScope(auth, "read")) return forbidden();

  const { id } = await params;
  const row = db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)))
    .get();
  if (!row || row.deletedAt) return notFound("文章不存在");
  return Response.json(serializePost(row));
}

/** PATCH /api/posts/:id */
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const auth = authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return unauthorized();
  if (!hasScope(auth, "write")) return forbidden();

  const { id } = await params;
  const existing = db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)))
    .get();
  if (!existing || existing.deletedAt) return notFound("文章不存在");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("请求体必须是合法 JSON");
  }

  const patch: Partial<typeof existing> = {};
  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) return badRequest("title 不能为空");
    patch.title = title;
  }
  if (body.slug !== undefined) {
    const slug = String(body.slug).trim() || slugify(patch.title ?? existing.title);
    const other = db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).get();
    if (other && other.id !== existing.id) return badRequest(`slug「${slug}」已被占用`);
    patch.slug = slug;
  }
  if (body.excerpt !== undefined) patch.excerpt = String(body.excerpt);
  if (body.content !== undefined) patch.content = String(body.content);
  if (body.featured !== undefined) patch.featured = Boolean(body.featured);
  if (body.status !== undefined) {
    const status = String(body.status) as PostStatus;
    if (!["draft", "review", "published", "archived"].includes(status)) {
      return badRequest("status 不合法");
    }
    patch.status = status;
    patch.publishedAt =
      status === "published"
        ? new Date()
        : existing.publishedAt;
  }
  patch.updatedAt = new Date();

  db.update(posts).set(patch).where(eq(posts.id, existing.id)).run();
  const row = db.select().from(posts).where(eq(posts.id, existing.id)).get()!;

  writeAudit({
    actor: `${auth.name} (API)`,
    action: "post.update",
    entityType: "post",
    entityId: row.id,
    detail: `API 更新文章「${row.title}」`,
  });

  dispatchWebhook("post.updated", serializePost(row));
  if (
    row.status === "published" &&
    existing.status !== "published"
  ) {
    dispatchWebhook("post.published", serializePost(row));
  }

  return Response.json(serializePost(row));
}

/** DELETE /api/posts/:id（软删除，移入回收站） */
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const auth = authenticateApiKey(req.headers.get("authorization"));
  if (!auth) return unauthorized();
  if (!hasScope(auth, "write")) return forbidden();

  const { id } = await params;
  const row = db
    .select()
    .from(posts)
    .where(eq(posts.id, Number(id)))
    .get();
  if (!row || row.deletedAt) return notFound("文章不存在");

  db.update(posts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, row.id))
    .run();

  writeAudit({
    actor: `${auth.name} (API)`,
    action: "post.trash",
    entityType: "post",
    entityId: row.id,
    detail: `API 将「${row.title}」移入回收站`,
  });
  dispatchWebhook("post.deleted", serializePost(row));

  return Response.json({ ok: true });
}
