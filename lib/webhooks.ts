/**
 * Webhook 派发（服务端）
 *
 * 内容事件发生时，向所有「启用」且订阅了该事件的 Webhook 发送
 * HTTP POST 请求，携带 HMAC-SHA256 签名（X-Capybara-Signature）。
 * 派发为 fire-and-forget：失败仅记录日志，不阻塞主流程。
 */
import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { webhooks, type PostRow } from "@/lib/db/schema";

export const WEBHOOK_EVENTS = [
  "post.created",
  "post.updated",
  "post.published",
  "post.deleted",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** 文章 → 事件载荷（纯 JSON 可序列化） */
export function postWebhookPayload(post: PostRow) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status,
    featured: post.featured,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function dispatchWebhook(event: WebhookEvent, payload: unknown) {
  const subs = db
    .select()
    .from(webhooks)
    .where(eq(webhooks.status, "active"))
    .all();
  const matched = subs.filter((w) =>
    (JSON.parse(w.events) as string[]).includes(event)
  );

  for (const w of matched) {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });
    const signature = w.secret
      ? createHmac("sha256", w.secret).update(body).digest("hex")
      : undefined;

    void fetch(w.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "capybara-cms-webhook/1.0",
        ...(signature ? { "x-capybara-signature": `sha256=${signature}` } : {}),
      },
      body,
    }).catch((err) => {
      // 派发失败不阻塞主流程，仅控制台记录
      console.error(`[webhook] 派发失败 ${w.name} → ${w.url}`, err);
    });
  }
}
