"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";
import { slugify } from "@/lib/slug";

export type SiteState = { error?: string } | null;

export async function createSite(
  _prev: SiteState,
  formData: FormData
): Promise<SiteState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const url = String(formData.get("url") ?? "").trim();
  const locale = String(formData.get("locale") ?? "zh").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!name) return { error: "站点名称不能为空" };
  const exists = db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.slug, slug))
    .get();
  if (exists) return { error: `slug「${slug}」已存在` };

  if (isDefault) {
    db.update(sites).set({ isDefault: false }).run();
  }
  db.insert(sites).values({ name, slug, url, locale, description, isDefault }).run();

  writeAudit({
    actor: user.name,
    action: "site.create",
    entityType: "site",
    detail: `创建站点「${name}」`,
  });
  refresh();
  return null;
}

export async function updateSite(
  _prev: SiteState,
  formData: FormData
): Promise<SiteState> {
  const user = await requireUser();
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const url = String(formData.get("url") ?? "").trim();
  const locale = String(formData.get("locale") ?? "zh").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!name) return { error: "站点名称不能为空" };
  const other = db
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.slug, slug))
    .get();
  if (other && other.id !== id) return { error: `slug「${slug}」已存在` };

  if (isDefault) {
    db.update(sites).set({ isDefault: false }).run();
  }
  db.update(sites)
    .set({ name, slug, url, locale, description, isDefault })
    .where(eq(sites.id, id))
    .run();

  writeAudit({
    actor: user.name,
    action: "site.update",
    entityType: "site",
    entityId: id,
    detail: `更新站点「${name}」`,
  });
  refresh();
  return null;
}

export async function deleteSite(id: number) {
  const user = await requireUser();
  const row = db
    .select({ name: sites.name, isDefault: sites.isDefault })
    .from(sites)
    .where(eq(sites.id, id))
    .get();
  if (!row) return;
  if (row.isDefault) throw new Error("不能删除默认站点");

  db.delete(sites).where(eq(sites.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "site.delete",
    entityType: "site",
    entityId: id,
    detail: `删除站点「${row.name}」`,
  });
  refresh();
}
