"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  posts,
  postCategories,
  postRevisions,
  postTags,
  type PostRow,
  type PostStatus,
  type UserRow,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";
import { slugify } from "@/lib/slug";
import {
  dispatchWebhook,
  postWebhookPayload,
  type WebhookEvent,
} from "@/lib/webhooks";

/** 按 id 取文章并派发 webhook 事件（行不存在时静默跳过） */
function dispatchPostEvent(event: WebhookEvent, id: number) {
  const row = db.select().from(posts).where(eq(posts.id, id)).get();
  if (row) dispatchWebhook(event, postWebhookPayload(row));
}

/** 每篇文章最多保留的版本快照数，超出删除最旧的 */
const MAX_REVISIONS_PER_POST = 30;

/** 保存当前文章状态为一个版本快照，并清理超出上限的旧版本 */
function snapshotRevision(user: UserRow, post: PostRow) {
  db.insert(postRevisions)
    .values({
      postId: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status,
      authorId: user.id,
    })
    .run();

  const rows = db
    .select({ id: postRevisions.id })
    .from(postRevisions)
    .where(eq(postRevisions.postId, post.id))
    .orderBy(desc(postRevisions.createdAt), desc(postRevisions.id))
    .all();
  if (rows.length > MAX_REVISIONS_PER_POST) {
    const toDelete = rows.slice(MAX_REVISIONS_PER_POST).map((r) => r.id);
    db.delete(postRevisions).where(inArray(postRevisions.id, toDelete)).run();
  }
}

export type PostFormState = { error?: string } | null;

type PostFormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  featured: boolean;
  categoryId: number | null;
  tagIds: number[];
};

function parsePostForm(formData: FormData): PostFormData {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const status = (String(formData.get("status") ?? "draft") ||
    "draft") as PostStatus;
  const categoryId = Number(formData.get("categoryId") ?? 0) || null;
  const tagIds = formData
    .getAll("tagIds")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);

  return {
    title,
    slug: rawSlug || slugify(title),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    status,
    featured: formData.get("featured") === "on",
    categoryId,
    tagIds,
  };
}

function replaceRelations(
  postId: number,
  categoryId: number | null,
  tagIds: number[]
) {
  db.delete(postCategories).where(eq(postCategories.postId, postId)).run();
  db.delete(postTags).where(eq(postTags.postId, postId)).run();

  if (categoryId) {
    db.insert(postCategories).values({ postId, categoryId }).run();
  }
  if (tagIds.length > 0) {
    db.insert(postTags)
      .values(tagIds.map((tagId) => ({ postId, tagId })))
      .run();
  }
}

function isPublished(status: PostStatus) {
  return status === "published";
}

export async function createPost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const user = await requireUser();
  const data = parsePostForm(formData);

  if (!data.title) return { error: "标题不能为空" };
  if (!data.slug) return { error: "slug 不能为空" };

  const exists = db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, data.slug))
    .get();
  if (exists) return { error: `slug「${data.slug}」已被占用，请更换` };

  const res = db
    .insert(posts)
    .values({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      featured: data.featured,
      authorId: user.id,
      publishedAt: isPublished(data.status) ? new Date() : null,
    })
    .run();
  const postId = Number(res.lastInsertRowid);

  replaceRelations(postId, data.categoryId, data.tagIds);
  const created = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (created) snapshotRevision(user, created);
  writeAudit({
    actor: user.name,
    action: "post.create",
    entityType: "post",
    entityId: postId,
    detail: `创建文章「${data.title}」`,
  });
  dispatchPostEvent("post.created", postId);

  refresh();
  redirect(`/capybara/content/posts/${postId}`);
}

export async function updatePost(
  _prev: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const user = await requireUser();
  const id = Number(formData.get("id") ?? 0);
  if (!Number.isInteger(id) || id <= 0) return { error: "参数错误" };

  const data = parsePostForm(formData);
  if (!data.title) return { error: "标题不能为空" };
  if (!data.slug) return { error: "slug 不能为空" };

  const existing = db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .get();
  if (!existing) return { error: "文章不存在" };

  const slugTaken = db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, data.slug), eq(posts.id, id)))
    .get();
  if (!slugTaken) {
    const other = db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, data.slug))
      .get();
    if (other) return { error: `slug「${data.slug}」已被占用，请更换` };
  }

  db.update(posts)
    .set({
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      status: data.status,
      featured: data.featured,
      updatedAt: new Date(),
      publishedAt: isPublished(data.status) ? new Date() : existing.publishedAt,
    })
    .where(eq(posts.id, id))
    .run();

  replaceRelations(id, data.categoryId, data.tagIds);
  const updated = db.select().from(posts).where(eq(posts.id, id)).get();
  if (updated) snapshotRevision(user, updated);
  writeAudit({
    actor: user.name,
    action: "post.update",
    entityType: "post",
    entityId: id,
    detail: `更新文章「${data.title}」`,
  });
  dispatchPostEvent("post.updated", id);
  if (isPublished(data.status) && !isPublished(existing.status)) {
    dispatchPostEvent("post.published", id);
  }

  refresh();
  redirect(`/capybara/content/posts/${id}`);
}

// ---------------------------------------------------------------------------
// 状态流转（列表页操作）
// ---------------------------------------------------------------------------

async function transitionStatus(id: number, status: PostStatus, action: string) {
  const user = await requireUser();
  const post = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return;

  db.update(posts)
    .set({
      status,
      updatedAt: new Date(),
      publishedAt: isPublished(status) ? new Date() : post.publishedAt,
    })
    .where(eq(posts.id, id))
    .run();

  writeAudit({
    actor: user.name,
    action,
    entityType: "post",
    entityId: id,
    detail: `「${post.title}」状态 → ${status}`,
  });
  dispatchPostEvent(
    isPublished(status) ? "post.published" : "post.updated",
    id
  );
  refresh();
}

export async function publishPost(id: number) {
  await transitionStatus(id, "published", "post.publish");
}

export async function moveToReview(id: number) {
  await transitionStatus(id, "review", "post.review");
}

export async function archivePost(id: number) {
  await transitionStatus(id, "archived", "post.archive");
}

export async function moveToDraft(id: number) {
  await transitionStatus(id, "draft", "post.draft");
}

// ---------------------------------------------------------------------------
// 回收站
// ---------------------------------------------------------------------------

export async function softDeletePost(id: number) {
  const user = await requireUser();
  const post = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return;

  db.update(posts)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, id))
    .run();

  writeAudit({
    actor: user.name,
    action: "post.trash",
    entityType: "post",
    entityId: id,
    detail: `「${post.title}」移入回收站`,
  });
  dispatchPostEvent("post.deleted", id);
  refresh();
}

export async function restorePost(id: number) {
  const user = await requireUser();
  const post = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return;

  db.update(posts)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .run();

  writeAudit({
    actor: user.name,
    action: "post.restore",
    entityType: "post",
    entityId: id,
    detail: `「${post.title}」从回收站恢复`,
  });
  dispatchPostEvent("post.updated", id);
  refresh();
}

export async function hardDeletePost(id: number) {
  const user = await requireUser();
  const post = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!post) return;

  db.delete(posts).where(eq(posts.id, id)).run();

  writeAudit({
    actor: user.name,
    action: "post.delete",
    entityType: "post",
    entityId: id,
    detail: `彻底删除「${post.title}」`,
  });
  dispatchPostEvent("post.deleted", id);
  refresh();
}

// ---------------------------------------------------------------------------
// 版本历史：恢复
// ---------------------------------------------------------------------------

/**
 * 将文章恢复到某个历史版本（标题/摘要/正文；slug 仅在其未被其他文章占用时恢复）。
 * 恢复前会先快照当前状态，保证恢复操作本身可回退。
 */
export async function restoreRevision(postId: number, revisionId: number) {
  const user = await requireUser();

  const rev = db
    .select()
    .from(postRevisions)
    .where(
      and(
        eq(postRevisions.id, revisionId),
        eq(postRevisions.postId, postId)
      )
    )
    .get();
  if (!rev) return;

  const post = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (!post) return;

  // 恢复前快照当前状态（可撤销）
  snapshotRevision(user, post);

  const patch: Partial<PostRow> = {
    title: rev.title,
    excerpt: rev.excerpt,
    content: rev.content,
    updatedAt: new Date(),
  };
  // slug 仅当未被其他文章占用时恢复
  const clash = db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, rev.slug))
    .get();
  if (!clash || clash.id === postId) patch.slug = rev.slug;

  db.update(posts).set(patch).where(eq(posts.id, postId)).run();

  writeAudit({
    actor: user.name,
    action: "post.restore_revision",
    entityType: "post",
    entityId: postId,
    detail: `从版本 #${rev.id} 恢复「${rev.title}」`,
  });
  dispatchPostEvent("post.updated", postId);
  refresh();
}
