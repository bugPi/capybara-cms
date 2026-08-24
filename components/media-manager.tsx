"use client";

import * as React from "react";
import { useActionState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  uploadMedia,
  deleteMedia,
  type MediaState,
} from "@/lib/actions/media";
import type { MediaRow } from "@/lib/db/schema";
import { formatBytes, formatDate } from "@/lib/format";
import { ConfirmAction } from "@/components/confirm-action";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Empty } from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CopyIcon,
  FileIcon,
  ImageIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react";

function isImage(mime: string | null): boolean {
  return !!mime && mime.startsWith("image/");
}

export function MediaManager({ items }: { items: MediaRow[] }) {
  const [state, formAction, pending] = useActionState<MediaState, FormData>(
    uploadMedia,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL 已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={<ImageIcon />}
        title="媒体库"
        description={`共 ${items.length} 个文件，支持常见图片与文档（单个文件 ≤ 10MB）`}
      />

      {/* 上传表单 */}
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border p-4"
      >
        {state?.error ? (
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>上传失败</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup>
          <Field orientation="responsive">
            <FieldLabel htmlFor="media-file">选择文件</FieldLabel>
            <Input
              id="media-file"
              name="file"
              type="file"
              required
              className="file:text-muted-foreground"
            />
          </Field>
          <Field orientation="responsive">
            <FieldLabel htmlFor="media-alt">替代文本</FieldLabel>
            <Input
              id="media-alt"
              name="alt"
              placeholder="图片的简短描述（可选）"
            />
            <FieldDescription>用于无障碍访问与 SEO。</FieldDescription>
          </Field>
          <div>
            <Button type="submit" disabled={pending}>
              <UploadIcon data-icon="inline-start" />
              {pending ? "上传中…" : "上传文件"}
            </Button>
          </div>
        </FieldGroup>
      </form>

      {/* 媒体网格 */}
      {items.length === 0 ? (
        <Empty
          title="媒体库是空的"
          description="使用上方表单上传第一个文件"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((m) => (
            <div
              key={m.id}
              className="group flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="relative flex aspect-square items-center justify-center bg-muted/40">
                {isImage(m.mimeType) ? (
                  <Image
                    src={m.url}
                    alt={m.alt ?? m.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <FileIcon className="size-8" />
                    <span className="max-w-[90%] truncate px-2 text-xs">
                      {m.mimeType ?? "未知类型"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 p-3">
                <span className="truncate text-sm font-medium" title={m.name}>
                  {m.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(m.size)} · {formatDate(m.createdAt)}
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyUrl(m.url)}
                  >
                    <CopyIcon data-icon="inline-start" />
                    复制 URL
                  </Button>
                  <ConfirmAction
                    title={`删除文件「${m.name}」？`}
                    description="将从服务器磁盘与媒体库中永久删除。"
                    onConfirm={() => deleteMedia(m.id)}
                    success="文件已删除"
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="删除"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2Icon />
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
