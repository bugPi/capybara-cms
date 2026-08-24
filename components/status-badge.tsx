import { cn } from "@/lib/utils";
import type { PostStatus } from "@/lib/db/schema";

/** Arco 色板：圆点 + 浅色底标签 */
const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "草稿", color: "var(--arco-text-3, #86909c)" },
  review: { label: "待审核", color: "var(--arco-orange, #ff7d00)" },
  published: { label: "已发布", color: "var(--arco-green, #00b42a)" },
  archived: { label: "已归档", color: "var(--arco-blue, #165dff)" },
};

export function StatusBadge({ status }: { status: PostStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs font-medium leading-5"
      style={{
        color: meta.color,
        background: `color-mix(in oklch, ${meta.color} 10%, transparent)`,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ background: meta.color }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "管理员",
  editor: "编辑",
  author: "作者",
  reviewer: "审核人",
};

/** 角色标签：Arco 多色系浅色标签 */
const ROLE_COLORS: Record<string, string> = {
  admin: "var(--arco-blue, #165dff)",
  editor: "#0fc6c2",
  author: "#722ed1",
  reviewer: "var(--arco-orange, #ff7d00)",
};

export function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? "var(--arco-text-3, #86909c)";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm px-1.5 py-0.5 text-xs font-medium leading-5"
      )}
      style={{
        color,
        background: `color-mix(in oklch, ${color} 10%, transparent)`,
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}
