"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, webhooks, mcpTools, settings } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";

export type SettingsState = { error?: string } | null;

// ---------------------------------------------------------------------------
// 常规设置
// ---------------------------------------------------------------------------

export async function updateGeneralSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireUser();
  const entries: [string, string][] = [
    ["site_name", "站点名称"],
    ["site_description", "站点描述"],
    ["site_url", "站点 URL"],
    ["default_locale", "默认语言"],
    ["timezone", "时区"],
    ["seo_title_template", "SEO 标题模板"],
    ["seo_description_length", "SEO 描述长度"],
    ["audit_retention_days", "审计日志保留天数"],
    ["media_max_size_mb", "媒体上传大小限制"],
  ];

  for (const [key, label] of entries) {
    const value = String(formData.get(key) ?? "").trim();
    const existing = db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, key))
      .get();
    if (existing) {
      db.update(settings).set({ value }).where(eq(settings.key, key)).run();
    } else {
      db.insert(settings).values({ key, value }).run();
    }
    if (!value) {
      return { error: `${label}不能为空` };
    }
  }

  writeAudit({
    actor: user.name,
    action: "settings.update",
    entityType: "settings",
    detail: "更新常规设置",
  });
  refresh();
  return null;
}

// ---------------------------------------------------------------------------
// API Key
// ---------------------------------------------------------------------------

export type ApiKeyResult = SettingsState & { createdKey?: string } | null;

export async function createApiKey(
  _prev: ApiKeyResult,
  formData: FormData
): Promise<ApiKeyResult> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const scopes = String(formData.get("scopes") ?? "read").trim();

  if (!name) return { error: "Key 名称不能为空" };
  const key = `ck_${randomBytes(24).toString("hex")}`;

  db.insert(apiKeys).values({ name, key, scopes }).run();
  writeAudit({
    actor: user.name,
    action: "apikey.create",
    entityType: "apikey",
    detail: `创建 API Key「${name}」`,
  });
  refresh();
  // 密钥仅此一次展示
  return { createdKey: key };
}

export async function revokeApiKey(id: number) {
  const user = await requireUser();
  db.update(apiKeys)
    .set({ status: "revoked" })
    .where(eq(apiKeys.id, id))
    .run();
  writeAudit({
    actor: user.name,
    action: "apikey.revoke",
    entityType: "apikey",
    entityId: id,
    detail: "吊销 API Key",
  });
  refresh();
}

// ---------------------------------------------------------------------------
// Webhook
// ---------------------------------------------------------------------------

export async function createWebhook(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const events = formData.getAll("events").map(String);

  if (!name) return { error: "Webhook 名称不能为空" };
  if (!/^https?:\/\//.test(url)) return { error: "URL 必须以 http(s):// 开头" };
  if (events.length === 0) return { error: "至少选择一个触发事件" };

  db.insert(webhooks)
    .values({
      name,
      url,
      events: JSON.stringify(events),
      secret: `whsec_${randomBytes(16).toString("hex")}`,
    })
    .run();

  writeAudit({
    actor: user.name,
    action: "webhook.create",
    entityType: "webhook",
    detail: `创建 Webhook「${name}」→ ${url}`,
  });
  refresh();
  return null;
}

export async function toggleWebhook(id: number, enabled: boolean) {
  const user = await requireUser();
  db.update(webhooks)
    .set({ status: enabled ? "active" : "disabled" })
    .where(eq(webhooks.id, id))
    .run();
  writeAudit({
    actor: user.name,
    action: "webhook.toggle",
    entityType: "webhook",
    entityId: id,
    detail: `${enabled ? "启用" : "停用"} Webhook #${id}`,
  });
  refresh();
}

export async function deleteWebhook(id: number) {
  const user = await requireUser();
  db.delete(webhooks).where(eq(webhooks.id, id)).run();
  writeAudit({
    actor: user.name,
    action: "webhook.delete",
    entityType: "webhook",
    entityId: id,
    detail: `删除 Webhook #${id}`,
  });
  refresh();
}

// ---------------------------------------------------------------------------
// MCP 工具
// ---------------------------------------------------------------------------

export async function toggleMcpTool(id: number, enabled: boolean) {
  const user = await requireUser();
  db.update(mcpTools)
    .set({ enabled })
    .where(eq(mcpTools.id, id))
    .run();
  writeAudit({
    actor: user.name,
    action: "mcp.toggle",
    entityType: "mcp_tool",
    entityId: id,
    detail: `${enabled ? "启用" : "停用"} MCP 工具 #${id}`,
  });
  refresh();
}
