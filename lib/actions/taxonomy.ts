"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, tags } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";
import { slugify } from "@/lib/slug";

export type TaxonomyState = { error?: string } | null;

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

export async function createCategory(
  _prev: TaxonomyState,
  formData: FormData
): Promise<TaxonomyState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "分类名称不能为空" };
  const exists = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();
  if (exists) return { error: `slug「${slug}」已存在` };

  db.insert(categories).values({ name, slug, description }).run();
  writeAudit({
    actor: user.name,
    action: "category.create",
    entityType: "category",
    detail: `创建分类「${name}」`,
  });
  refresh();
  return null;
}

export async function updateCategory(
  _prev: TaxonomyState,
  formData: FormData
): Promise<TaxonomyState> {
  const user = await requireUser();
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "分类名称不能为空" };
  const other = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();
  if (other && other.id !== id) return { error: `slug「${slug}」已存在` };

  db.update(categories)
    .set({ name, slug, description })
    .where(eq(categories.id, id))
    .run();
  writeAudit({
    actor: user.name,
    action: "category.update",
    entityType: "category",
    entityId: id,
    detail: `更新分类「${name}」`,
  });
  refresh();
  return null;
}

export async function deleteCategory(id: number) {
  const user = await requireUser();
  const row = db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, id))
    .get();
  db.delete(categories).where(eq(categories.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "category.delete",
    entityType: "category",
    entityId: id,
    detail: row ? `删除分类「${row.name}」` : `删除分类 #${id}`,
  });
  refresh();
}

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------

export async function createTag(
  _prev: TaxonomyState,
  formData: FormData
): Promise<TaxonomyState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name) return { error: "标签名称不能为空" };
  const exists = db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, slug))
    .get();
  if (exists) return { error: `slug「${slug}」已存在` };

  db.insert(tags).values({ name, slug }).run();
  writeAudit({
    actor: user.name,
    action: "tag.create",
    entityType: "tag",
    detail: `创建标签「${name}」`,
  });
  refresh();
  return null;
}

export async function updateTag(
  _prev: TaxonomyState,
  formData: FormData
): Promise<TaxonomyState> {
  const user = await requireUser();
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name) return { error: "标签名称不能为空" };
  const other = db
    .select({ id: tags.id })
    .from(tags)
    .where(eq(tags.slug, slug))
    .get();
  if (other && other.id !== id) return { error: `slug「${slug}」已存在` };

  db.update(tags).set({ name, slug }).where(eq(tags.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "tag.update",
    entityType: "tag",
    entityId: id,
    detail: `更新标签「${name}」`,
  });
  refresh();
  return null;
}

export async function deleteTag(id: number) {
  const user = await requireUser();
  const row = db
    .select({ name: tags.name })
    .from(tags)
    .where(eq(tags.id, id))
    .get();
  db.delete(tags).where(eq(tags.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "tag.delete",
    entityType: "tag",
    entityId: id,
    detail: row ? `删除标签「${row.name}」` : `删除标签 #${id}`,
  });
  refresh();
}
