"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createUser,
  updateUser,
  deleteUser,
  type UserFormState,
} from "@/lib/actions/users";
import { USER_ROLES, type UserRole } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { ConfirmAction } from "@/components/confirm-action";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react";

type UserWithCount = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
  avatar: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  postCount: number;
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "管理员",
  editor: "编辑",
  author: "作者",
  reviewer: "审核员",
};

function RoleBadge({ role }: { role: UserRole }) {
  const variant =
    role === "admin"
      ? "default"
      : role === "editor"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{ROLE_LABELS[role]}</Badge>;
}

function useFormSuccess(
  pending: boolean,
  state: UserFormState,
  onSuccess?: () => void
) {
  const prevPending = useRef(pending);
  useEffect(() => {
    if (prevPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    prevPending.current = pending;
  }, [pending, state, onSuccess]);
}

function UserForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: "active" | "disabled";
  };
  onDone?: () => void;
}) {
  const action = mode === "create" ? createUser : updateUser;
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    action,
    null
  );
  useFormSuccess(pending, state, onDone);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {state?.error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="user-name">姓名</FieldLabel>
          <Input
            id="user-name"
            name="name"
            placeholder="用户姓名"
            defaultValue={initial?.name ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="user-email">邮箱</FieldLabel>
          <Input
            id="user-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            defaultValue={initial?.email ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="user-password">
            {mode === "create" ? "密码" : "重置密码（留空则不修改）"}
          </FieldLabel>
          <Input
            id="user-password"
            name="password"
            type="password"
            placeholder={mode === "create" ? "至少 4 位" : "留空保持原密码"}
            autoComplete="new-password"
            required={mode === "create"}
          />
          <FieldDescription>
            {mode === "create"
              ? "演示环境明文存储，接入真实鉴权后改为哈希。"
              : "仅当需要重置密码时填写。"}
          </FieldDescription>
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel>角色</FieldLabel>
            <Select
              name="role"
              defaultValue={initial?.role ?? "author"}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {mode === "edit" && initial ? (
            <Field>
              <FieldLabel>状态</FieldLabel>
              <Select name="status" defaultValue={initial.status}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="disabled">禁用</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
      </FieldGroup>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : mode === "create" ? "创建用户" : "保存修改"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserManager({ items }: { items: UserWithCount[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserWithCount | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={<UsersIcon />}
        title="用户管理"
        description={`共 ${items.length} 个用户，可分配不同角色与权限`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            新建用户
          </Button>
        }
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-center">文章数</TableHead>
              <TableHead>最近登录</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10">
                  <Empty title="还没有用户" description="点击右上角「新建用户」创建第一个用户" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === "active" ? "default" : "outline"}
                      className={
                        u.status === "disabled"
                          ? "text-muted-foreground line-through"
                          : undefined
                      }
                    >
                      {u.status === "active" ? "正常" : "禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {u.postCount}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(u.lastLoginAt, true)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(u)}
                      >
                        <PencilIcon data-icon="inline-start" />
                        编辑
                      </Button>
                      <ConfirmAction
                        title={`删除用户「${u.name}」？`}
                        description="用户将被永久删除，其名下文章会保留但作者信息清空。"
                        onConfirm={() => deleteUser(u.id)}
                        success="用户已删除"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2Icon data-icon="inline-start" />
                            删除
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新建用户 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建用户</DialogTitle>
            <DialogDescription>创建后该用户即可登录后台。</DialogDescription>
          </DialogHeader>
          <UserForm mode="create" onDone={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 编辑用户 */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>修改用户信息、角色或状态。</DialogDescription>
          </DialogHeader>
          {editing ? (
            <UserForm
              mode="edit"
              initial={editing}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
