/**
 * REST API 鉴权（API Key）
 *
 * 请求头：Authorization: Bearer ck_xxxx
 * - 密钥必须存在且状态为 active
 * - scopes 逗号分隔：read / write / publish
 * - 每次调用更新 last_used_at
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";

export type ApiAuth = {
  keyId: number;
  name: string;
  scopes: string[];
};

export function authenticateApiKey(
  authorization: string | null
): ApiAuth | null {
  const header = authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const row = db.select().from(apiKeys).where(eq(apiKeys.key, token)).get();
  if (!row || row.status !== "active") return null;

  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, row.id))
    .run();

  return {
    keyId: row.id,
    name: row.name,
    scopes: row.scopes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function hasScope(auth: ApiAuth | null, scope: string): boolean {
  return !!auth && auth.scopes.includes(scope);
}

export function unauthorized(message = "无效或已吊销的 API Key") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "该 API Key 没有此操作所需的权限") {
  return Response.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(message = "资源不存在") {
  return Response.json({ error: message }, { status: 404 });
}
