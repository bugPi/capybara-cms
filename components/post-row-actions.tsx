"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  publishPost,
  moveToReview,
  moveToDraft,
  archivePost,
  softDeletePost,
  restorePost,
  hardDeletePost,
} from "@/lib/actions/posts";
import type { PostStatus } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  RotateCcwIcon,
  SendIcon,
  CheckCircle2Icon,
  ArchiveIcon,
  FileTextIcon,
  XCircleIcon,
} from "lucide-react";

export function PostRowActions({
  post,
}: {
  post: { id: number; status: PostStatus; deleted?: boolean };
}) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>, success: string) => {
    startTransition(async () => {
      try {
        await fn();
        toast.success(success);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "操作失败");
      }
    });
  };

  if (post.deleted) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => run(() => restorePost(post.id), "已从回收站恢复")}
        >
          {pending ? <Spinner data-icon="inline-start" /> : <RotateCcwIcon data-icon="inline-start" />}
          恢复
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={pending} className="text-destructive hover:text-destructive">
              <Trash2Icon data-icon="inline-start" />
              彻底删除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>彻底删除这篇文章？</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不可撤销，文章及其关联的分类、标签关系将永久删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => run(() => hardDeletePost(post.id), "文章已彻底删除")}
              >
                彻底删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/capybara/content/posts/${post.id}`}>
          <PencilIcon data-icon="inline-start" />
          编辑
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="更多操作">
            {pending ? <Spinner /> : <MoreHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>状态操作</DropdownMenuLabel>
          {post.status !== "published" && (
            <DropdownMenuItem
              onSelect={() => run(() => publishPost(post.id), "已发布")}
            >
              <CheckCircle2Icon data-icon="inline-start" />
              发布
            </DropdownMenuItem>
          )}
          {post.status !== "review" && (
            <DropdownMenuItem
              onSelect={() => run(() => moveToReview(post.id), "已提交审核")}
            >
              <SendIcon data-icon="inline-start" />
              提交审核
            </DropdownMenuItem>
          )}
          {post.status !== "draft" && (
            <DropdownMenuItem
              onSelect={() => run(() => moveToDraft(post.id), "已转为草稿")}
            >
              <FileTextIcon data-icon="inline-start" />
              转为草稿
            </DropdownMenuItem>
          )}
          {post.status !== "archived" && (
            <DropdownMenuItem
              onSelect={() => run(() => archivePost(post.id), "已归档")}
            >
              <ArchiveIcon data-icon="inline-start" />
              归档
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <XCircleIcon data-icon="inline-start" />
                移入回收站
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>移入回收站？</AlertDialogTitle>
                <AlertDialogDescription>
                  文章不会被删除，可在「内容管理 → 回收站」中恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => run(() => softDeletePost(post.id), "已移入回收站")}
                >
                  移入回收站
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
