"use client";

import * as React from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type TaxonomyState,
} from "@/lib/actions/taxonomy";
import type { CategoryRow } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { ConfirmAction } from "@/components/confirm-action";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FolderTreeIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";

type CategoryWithCount = CategoryRow & { postCount: number };

/** 表单提交成功后回调（useActionState 的 pending 翻转 + 无 error 判定） */
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

function CategoryForm({
  mode,
  initial,
  onDone,
}: {
  mode: "create" | "edit";
  initial?: CategoryRow;
  onDone?: () => void;
}) {
  const action = mode === "create" ? createCategory : updateCategory;
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
          <FieldLabel htmlFor="cat-name">名称</FieldLabel>
          <Input
            id="cat-name"
            name="name"
            placeholder="分类名称"
            defaultValue={initial?.name ?? ""}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cat-slug">URL 别名（slug）</FieldLabel>
          <Input
            id="cat-slug"
            name="slug"
            placeholder="留空则根据名称自动生成"
            defaultValue={initial?.slug ?? ""}
          />
          <FieldDescription>仅使用字母、数字与连字符。</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="cat-desc">描述</FieldLabel>
          <Textarea
            id="cat-desc"
            name="description"
            placeholder="分类的简短说明（可选）"
            defaultValue={initial?.description ?? ""}
            rows={2}
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : mode === "create" ? "创建分类" : "保存修改"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryManager({ items }: { items: CategoryWithCount[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={<FolderTreeIcon />}
        title="分类管理"
        description={`共 ${items.length} 个分类，用于组织文章内容`}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            新建分类
          </Button>
        }
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>别名</TableHead>
              <TableHead>描述</TableHead>
              <TableHead className="text-center">文章数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <Empty
                    title="还没有分类"
                    description="点击右上角「新建分类」创建第一个分类"
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {cat.slug}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{cat.postCount}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(cat.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(cat)}
                      >
                        <PencilIcon data-icon="inline-start" />
                        编辑
                      </Button>
                      <ConfirmAction
                        title={`删除分类「${cat.name}」？`}
                        description="删除后文章与该分类的关联将被移除，文章本身不会删除。"
                        onConfirm={() => deleteCategory(cat.id)}
                        success="分类已删除"
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

      {/* 新建分类 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
            <DialogDescription>创建后可在文章编辑页选择该分类。</DialogDescription>
          </DialogHeader>
          <CategoryForm
            mode="create"
            onDone={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑分类 */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>修改分类名称、别名或描述。</DialogDescription>
          </DialogHeader>
          {editing ? (
            <CategoryForm
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
