"use server";

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";
import { sanitizeFilename } from "@/lib/slug";

export type MediaState = { error?: string } | null;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadMedia(
  _prev: MediaState,
  formData: FormData
): Promise<MediaState> {
  const user = await requireUser();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "请选择要上传的文件" };
  }
  if (file.size > MAX_SIZE) {
    return { error: "文件超过 10MB 限制" };
  }

  const safeName = sanitizeFilename(file.name);
  const filename = `${Date.now()}-${safeName}`;
  const url = `/uploads/${filename}`;

  try {
    mkdirSync(UPLOAD_DIR, { recursive: true });
    writeFileSync(
      path.join(UPLOAD_DIR, filename),
      Buffer.from(await file.arrayBuffer())
    );
  } catch {
    return { error: "文件写入失败，请检查磁盘权限" };
  }

  db.insert(media)
    .values({
      name: file.name,
      filename,
      url,
      mimeType: file.type || null,
      size: file.size,
      alt: alt || null,
    })
    .run();

  writeAudit({
    actor: user.name,
    action: "media.upload",
    entityType: "media",
    detail: `上传文件「${file.name}」(${(file.size / 1024).toFixed(1)} KB)`,
  });
  refresh();
  return null;
}

export async function deleteMedia(id: number) {
  const user = await requireUser();
  const row = db.select().from(media).where(eq(media.id, id)).get();
  if (!row) return;

  // 尝试删除磁盘文件；失败不阻塞记录删除
  try {
    const fs = await import("node:fs");
    fs.unlinkSync(path.join(UPLOAD_DIR, row.filename));
  } catch {
    // ignore
  }

  db.delete(media).where(eq(media.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "media.delete",
    entityType: "media",
    entityId: id,
    detail: `删除媒体「${row.name}」`,
  });
  refresh();
}
