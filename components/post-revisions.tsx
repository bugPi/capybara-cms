"use client";

import * as React from "react";
import { restoreRevision } from "@/lib/actions/posts";
import type { PostRevisionListItem } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty } from "@/components/ui/empty";
import { EyeIcon, RotateCcwIcon } from "lucide-react";

/**
 * 文章版本历史列表（无外壳，嵌在抽屉/面板中使用）：
 * 支持「查看」（渲染快照内容）与「恢复」。
 * 恢复后由服务端 action 触发路由刷新，编辑器会重新挂载以载入恢复的内容。
 */
export function PostRevisions({
  postId,
  revisions,
}: {
  postId: number;
  revisions: PostRevisionListItem[];
}) {
  if (revisions.length === 0) {
    return (
      <Empty
        title="暂无版本"
        description="保存文章后会自动生成第一个版本快照"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {revisions.map((rev, index) => (
        <div
          key={rev.id}
          className="flex items-center gap-3 rounded-md border px-3 py-2.5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">
                {rev.title || "（无标题）"}
              </span>
              {index === 0 ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  当前
                </Badge>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDateTime(rev.createdAt)}</span>
              <span aria-hidden>·</span>
              <span>{rev.authorName ?? "—"}</span>
              <StatusBadge status={rev.status} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="查看版本">
                  <EyeIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="pr-8">
                    {rev.title || "（无标题）"}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {formatDateTime(rev.createdAt)}
                      {rev.authorName ? ` · ${rev.authorName}` : ""}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <article
                    className="prose prose-stone dark:prose-invert max-w-none px-1 py-2 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: rev.content }}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <ConfirmAction
              destructive={false}
              trigger={
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <RotateCcwIcon className="size-3.5" />
                  恢复
                </Button>
              }
              title="恢复到该版本？"
              description="当前内容会先自动保存为一个新版本，然后被所选版本的内容覆盖。"
              confirmLabel="恢复此版本"
              success="已恢复到所选版本"
              onConfirm={() => restoreRevision(postId, rev.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
