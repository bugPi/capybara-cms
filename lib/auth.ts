/**
 * 会话管理（服务端）
 *
 * 会话 token 格式：`<userId>.<expiryMs>.<hmac-sha256-base64url>`
 *  - HMAC 密钥来自环境变量 SESSION_SECRET（开发环境使用内置默认值，生产必须配置）
 *  - 签名可防伪造/篡改，expiry 内置于 token 中
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type UserRow } from "@/lib/db/schema";

export const SESSION_COOKIE = "capybara_session";
/** 会话有效期：7 天 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 16) return secret;
  // 开发环境默认密钥；生产必须通过环境变量 SESSION_SECRET 覆盖
  if (process.env.NODE_ENV === "production") {
    throw new Error("生产环境必须设置 SESSION_SECRET（至少 16 字符）");
  }
  return "capybara-cms-dev-session-secret";
}

/** 签发会话 token */
export function signSession(userId: number): string {
  const payload = `${userId}.${Date.now() + SESSION_MAX_AGE_SECONDS * 1000}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

/** 校验会话 token，返回 userId；无效/过期/被篡改返回 null */
export function verifySession(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdRaw, expRaw, sig] = parts;

  const userId = Number(userIdRaw);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp <= Date.now()) return null;

  const expected = createHmac("sha256", getSecret())
    .update(`${userIdRaw}.${expRaw}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return userId;
}

export async function getSessionUser(): Promise<UserRow | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const userId = verifySession(raw);
  if (!userId) return null;
  return db.select().from(users).where(eq(users.id, userId)).get() ?? null;
}

/** 未登录时抛出；所有后台写操作调用它做鉴权闸口 */
export async function requireUser(): Promise<UserRow> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("未登录或会话已过期，请重新登录");
  }
  if (user.status !== "active") {
    throw new Error("账号已被禁用");
  }
  return user;
}

/** 仅管理员可执行 */
export async function requireAdmin(): Promise<UserRow> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("需要管理员权限");
  }
  return user;
}
