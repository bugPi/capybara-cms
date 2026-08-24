"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "@/lib/auth";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";
import { writeAudit } from "@/lib/db/audit";

export type LoginState = { error?: string } | null;

// ---------------------------------------------------------------------------
// 登录限流（进程内存；单实例开发环境够用，多实例需换 Redis 等共享存储）
// ---------------------------------------------------------------------------

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

const loginFailures = new Map<
  string,
  { count: number; lockedUntil: number | null }
>();

function isLocked(email: string): boolean {
  const entry = loginFailures.get(email);
  if (!entry) return false;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) {
    loginFailures.delete(email);
    return false;
  }
  return false;
}

function recordFailure(email: string) {
  const entry = loginFailures.get(email) ?? { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_FAILURES) {
    entry.lockedUntil = Date.now() + LOCK_MS;
    entry.count = 0;
  }
  loginFailures.set(email, entry);
}

function clearFailures(email: string) {
  loginFailures.delete(email);
}

/** 常量时间明文比较（仅用于升级旧版明文密码时的一次性校验） */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "请输入邮箱和密码" };
  }
  if (isLocked(email)) {
    return { error: "登录失败次数过多，账号已临时锁定，请 15 分钟后再试" };
  }

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user || user.status !== "active") {
    recordFailure(email);
    return { error: "邮箱或密码错误" };
  }

  // 密码校验：已哈希 → scrypt 校验；旧版明文 → 常量时间比对后升级为哈希
  let ok: boolean;
  if (isHashedPassword(user.password)) {
    ok = verifyPassword(password, user.password);
  } else {
    ok = safeEqual(password, user.password);
    if (ok) {
      db.update(users)
        .set({ password: hashPassword(password) })
        .where(eq(users.id, user.id))
        .run();
    }
  }
  if (!ok) {
    recordFailure(email);
    return { error: "邮箱或密码错误" };
  }

  clearFailures(email);

  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  db.update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id))
    .run();

  writeAudit({
    actor: user.name,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    detail: `登录成功（${user.email}）`,
  });

  redirect("/capybara/console");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/capybara/login");
}
