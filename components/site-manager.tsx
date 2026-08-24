"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createSite,
  updateSite,
  deleteSite,
  type SiteState,
} from "@/lib/actions/sites";
import type { SiteRow } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { ConfirmAction } from "@/components/confirm-action";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  GlobeIcon,
  TriangleAlertIcon,
} from "lucide-react";

function useFormSuccess(
  pending: boolean,
  state: SiteState,
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

function SiteForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: SiteRow;
  onDone?: () => void;
}) {
  const action = mode === "create" ? createSite : updateSite;
  const [state, formAction, pending] = useActionState<SiteState, FormData>(
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
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="site-name">站点名称</FieldLabel>
            <Input
              id="site-name"
              name="name"
              placeholder="站点名称"
              defaultValue={initial?.name ?? ""}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="site-slug">别名（slug）</FieldLabel>
            <Input
              id="site-slug"
              name="slug"
              placeholder="留空自动生成"
              defaultValue={initial?.slug ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="site-url">站点 URL</FieldLabel>
          <Input
            id="site-url"
            name="url"
            type="url"
            placeholder="https://example.com"
            defaultValue={initial?.url ?? ""}
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel>默认语言</FieldLabel>
            <Select name="locale" defaultValue={initial?.locale ?? "zh"}>
              <SelectTrigger>
                <SelectValue placeholder="选择语言" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文（zh）</SelectItem>
                <SelectItem value="en">English（en）</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="site-default">设为默认站点</FieldLabel>
            <Switch
              id="site-default"
              name="isDefault"
              defaultChecked={initial?.isDefault ?? false}
            />
            <FieldDescription>
              设置为默认后其他站点的默认标记会被取消。
            </FieldDescription>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="site-desc">描述</FieldLabel>
          <Textarea
            id="site-desc"
            name="description"
            placeholder="站点用途说明（可选）"
            defaultValue={initial?.description ?? ""}
            rows={2}
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : mode === "create" ? "创建站点" : "保存修改"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SiteManager({ items }: { items: SiteRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SiteRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={<GlobeIcon />}
        title="站点管理"
        description={`共 ${items.length} 个站点，支持多语言/多品牌站点`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            新建站点
          </Button>
        }
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>站点</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>语言</TableHead>
              <TableHead>默认</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <Empty title="还没有站点" description="点击右上角「新建站点」创建第一个站点" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <GlobeIcon className="size-3.5 text-muted-foreground" />
                        {s.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        /{s.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                    {s.url || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.locale}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.isDefault ? <Badge>默认</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(s)}
                      >
                        <PencilIcon data-icon="inline-start" />
                        编辑
                      </Button>
                      <ConfirmAction
                        title={`删除站点「${s.name}」？`}
                        description="默认站点不可删除；删除后相关配置将被移除。"
                        onConfirm={() => deleteSite(s.id)}
                        success="站点已删除"
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

      {/* 新建站点 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新建站点</DialogTitle>
            <DialogDescription>创建一个新的独立站点。</DialogDescription>
          </DialogHeader>
          <SiteForm mode="create" onDone={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 编辑站点 */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑站点</DialogTitle>
            <DialogDescription>修改站点信息或默认标记。</DialogDescription>
          </DialogHeader>
          {editing ? (
            <SiteForm
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
