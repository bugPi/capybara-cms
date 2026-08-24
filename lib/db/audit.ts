/**
 * 审计日志写入辅助（追加写，不提供更新/删除）
 *
 * 所有后台写操作都应调用 writeAudit，保持「谁、何时、做了什么」可追溯。
 */
import { db } from "./index";
import { auditLogs } from "./schema";

export type AuditActor = string;

export function writeAudit(input: {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId?: number | null;
  detail?: string | null;
}) {
  db.insert(auditLogs)
    .values({
      actor: input.actor,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      detail: input.detail ?? null,
    })
    .run();
}
