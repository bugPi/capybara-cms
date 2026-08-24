"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, USER_ROLES, type UserRole } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { writeAudit } from "@/lib/db/audit";

export type UserFormState = { error?: string } | null;

export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "author") || "author") as UserRole;

  if (!name || !email) return { error: "姓名和邮箱不能为空" };
  if (password.length < 4) return { error: "密码至少 4 位" };
  if (!USER_ROLES.includes(role)) return { error: "角色不合法" };

  const exists = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (exists) return { error: `邮箱「${email}」已被注册` };

  db.insert(users).values({ name, email, password, role }).run();
  writeAudit({
    actor: admin.name,
    action: "user.create",
    entityType: "user",
    detail: `创建用户「${name}」(${email})`,
  });
  refresh();
  return null;
}

export async function updateUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireAdmin();
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = (String(formData.get("role") ?? "author") || "author") as UserRole;
  const status = String(formData.get("status") ?? "active") as
    | "active"
    | "disabled";
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !email) return { error: "姓名和邮箱不能为空" };
  if (!USER_ROLES.includes(role)) return { error: "角色不合法" };

  const other = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();
  if (other && other.id !== id) return { error: `邮箱「${email}」已被注册` };

  const patch: Record<string, string | typeof status> = {
    name,
    email,
    role,
    status,
  };
  if (password) patch.password = password;

  db.update(users).set(patch).where(eq(users.id, id)).run();
  writeAudit({
    actor: admin.name,
    action: "user.update",
    entityType: "user",
    entityId: id,
    detail: `更新用户「${name}」`,
  });
  refresh();
  return null;
}

export async function deleteUser(id: number) {
  const admin = await requireAdmin();
  if (admin.id === id) {
    throw new Error("不能删除当前登录账号");
  }
  const row = db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .get();
  if (!row) return;

  db.delete(users).where(eq(users.id, id)).run();
  writeAudit({
    actor: admin.name,
    action: "user.delete",
    entityType: "user",
    entityId: id,
    detail: `删除用户「${row.name}」(${row.email})`,
  });
  refresh();
}
