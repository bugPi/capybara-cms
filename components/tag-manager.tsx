"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createTag,
  updateTag,
  deleteTag,
  type TaxonomyState,
} from "@/lib/actions/taxonomy";
import type { TagRow } from "@/lib/db/schema";
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
  TagsIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";

type TagWithCount = TagRow & { postCount: number };

function useFormSuccess(
  pending: boolean,
  state: TaxonomyState,
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

function TagForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: TagRow;
  onDone?: () => void;
}) {
  const action = mode === "create" ? createTag : updateTag;
  const [state, formAction, pending] = useActionState<TaxonomyState, FormData>(
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
          <FieldLabel htmlFor="tag-name">名称</FieldLabel>
          <Input
            id="tag-name"
            name="name"
            placeholder="标签名称"
            defaultValue={initial?.name ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="tag-slug">URL 别名（slug）</FieldLabel>
          <Input
            id="tag-slug"
            name="slug"
            placeholder="留空则根据名称自动生成"
            defaultValue={initial?.slug ?? ""}
          />
          <FieldDescription>仅使用字母、数字与连字符。</FieldDescription>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : mode === "create" ? "创建标签" : "保存修改"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TagManager({ items }: { items: TagWithCount[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TagRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={<TagsIcon />}
        title="标签管理"
        description={`共 ${items.length} 个标签，可在一篇文章上打多个标签`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            新建标签
          </Button>
        }
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>别名</TableHead>
              <TableHead className="text-center">文章数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <Empty
                    title="还没有标签"
                    description="点击右上角「新建标签」创建第一个标签"
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">#{tag.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{tag.postCount}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(tag.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(tag)}
                      >
                        <PencilIcon data-icon="inline-start" />
                        编辑
                      </Button>
                      <ConfirmAction
                        title={`删除标签「${tag.name}」？`}
                        description="删除后文章与该标签的关联将被移除，文章本身不会删除。"
                        onConfirm={() => deleteTag(tag.id)}
                        success="标签已删除"
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

      {/* 新建标签 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建标签</DialogTitle>
            <DialogDescription>创建后可在文章编辑页选择该标签。</DialogDescription>
          </DialogHeader>
          <TagForm mode="create" onDone={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* 编辑标签 */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>修改标签名称或别名。</DialogDescription>
          </DialogHeader>
          {editing ? (
            <TagForm
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
