"use server";

import { refresh } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { writeAudit } from "@/lib/db/audit";

export type ChangePasswordState = { error?: string; success?: boolean } | null;

const MIN_PASSWORD_LENGTH = 8;

export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await requireUser();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next) return { error: "请填写当前密码和新密码" };
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { error: `新密码至少 ${MIN_PASSWORD_LENGTH} 位` };
  }
  if (next !== confirm) return { error: "两次输入的新密码不一致" };

  // 校验当前密码（兼容尚未迁移的旧明文）
  let ok: boolean;
  if (user.password.startsWith("scrypt$")) {
    ok = verifyPassword(current, user.password);
  } else {
    ok = current === user.password;
  }
  if (!ok) return { error: "当前密码不正确" };
  if (current === next) return { error: "新密码不能与当前密码相同" };

  db.update(users)
    .set({ password: hashPassword(next) })
    .where(eq(users.id, user.id))
    .run();

  writeAudit({
    actor: user.name,
    action: "user.change_password",
    entityType: "user",
    entityId: user.id,
    detail: "修改了自己的密码",
  });
  refresh();
  return { success: true };
}
