"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createPost,
  updatePost,
  type PostFormState,
} from "@/lib/actions/posts";
import type { CategoryRow, PostStatus, TagRow } from "@/lib/db/schema";
import { POST_STATUSES } from "@/lib/db/schema";
import type { PostRevisionListItem } from "@/lib/queries";
import { RichTextEditor } from "@/components/rich-text-editor";
import { PostRevisions } from "@/components/post-revisions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, SlidersHorizontalIcon } from "lucide-react";

export type PostEditorShellPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: PostStatus;
  featured: boolean;
  categoryId: number | null;
  tagIds: number[];
  /** updatedAt 毫秒时间戳（父层用作 key，保存/恢复后重挂载载入最新内容） */
  updatedAt: number;
};

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "草稿",
  review: "提交审核",
  published: "发布",
  archived: "归档",
};

/** 从 HTML 估算字数（去标签与空白，按中文字数习惯统计） */
function countWords(html: string) {
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/g, "")
    .replace(/\s+/g, "");
  return text.length;
}

/**
 * 沉浸式文章编辑器（新建/编辑共用）：
 * - 极简顶栏：收起侧栏、返回、状态与保存提示、字数、设置、保存（⌘/Ctrl+S）
 * - 居中书写区：无边框大标题 + 精简工具栏的富文本编辑器
 * - 元信息（状态/分类/标签/slug/摘要）与版本历史统一收进右侧抽屉
 */
export function PostEditorShell({
  post,
  categories,
  tags,
  revisions = [],
}: {
  /** 不传则为新建模式 */
  post?: PostEditorShellPost;
  categories: CategoryRow[];
  tags: TagRow[];
  revisions?: PostRevisionListItem[];
}) {
  const mode = post ? "edit" : "create";
  const action = mode === "create" ? createPost : updatePost;
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(
    action,
    null
  );

  // —— 全部字段状态化：隐藏字段随表单提交，抽屉控件仅操作 state ——
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [categoryId, setCategoryId] = useState(String(post?.categoryId ?? 0));
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [tagIds, setTagIds] = useState<number[]>(post?.tagIds ?? []);
  const [sheetOpen, setSheetOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  /** 初始快照（挂载时）：用于脏检查 */
  const [snapshot] = useState(() =>
    JSON.stringify({
      t: post?.title ?? "",
      c: post?.content ?? "",
      s: post?.slug ?? "",
      e: post?.excerpt ?? "",
      st: post?.status ?? "draft",
      cat: String(post?.categoryId ?? 0),
      f: post?.featured ?? false,
      tg: post?.tagIds ?? [],
    })
  );
  const dirty = useMemo(
    () =>
      JSON.stringify({
        t: title,
        c: content,
        s: slug,
        e: excerpt,
        st: status,
        cat: categoryId,
        f: featured,
        tg: tagIds,
      }) !== snapshot,
    [title, content, slug, excerpt, status, categoryId, featured, tagIds, snapshot]
  );

  const wordCount = useMemo(() => countWords(content), [content]);

  // 保存失败提示（成功会触发服务端刷新并重挂载，无需在此提示）
  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  // ⌘/Ctrl + S 快捷保存
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleTag = (id: number, checked: boolean) => {
    setTagIds((prev) =>
      checked ? [...prev, id] : prev.filter((t) => t !== id)
    );
  };

  return (
    <form ref={formRef} action={formAction} className="flex min-h-svh flex-1 flex-col">
      {/* —— 随表单提交的隐藏字段（值全部来自 state） —— */}
      {post ? <input type="hidden" name="id" value={post.id} readOnly /> : null}
      <input type="hidden" name="content" value={content} readOnly />
      <input type="hidden" name="slug" value={slug} readOnly />
      <input type="hidden" name="excerpt" value={excerpt} readOnly />
      <input type="hidden" name="status" value={status} readOnly />
      <input type="hidden" name="categoryId" value={categoryId} readOnly />
      {featured ? (
        <input type="hidden" name="featured" value="on" readOnly />
      ) : null}
      {tagIds.map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} readOnly />
      ))}

      {/* —— 极简顶栏 —— */}
      <div className="immersive-topbar sticky top-0 z-30 flex h-12 shrink-0 items-center gap-1.5 border-b px-2 md:px-4">
        <SidebarTrigger className="size-8" />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <Link href="/capybara/content/posts" aria-label="返回列表">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="ml-1 flex min-w-0 items-center gap-2">
          <StatusBadge status={status} />
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {pending ? "保存中…" : dirty ? "未保存更改" : mode === "edit" ? "已保存" : ""}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="mr-1 hidden text-xs tabular-nums text-muted-foreground md:inline">
            {wordCount} 字
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="文章设置与版本历史"
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontalIcon />
          </Button>
          <Button type="submit" size="sm" disabled={pending} className="px-4">
            {pending ? "保存中…" : "保存"}
          </Button>
        </div>
      </div>

      {/* —— 居中书写区 —— */}
      <div className="mx-auto w-full max-w-[760px] flex-1 px-6 pt-10 md:px-8">
        <input
          name="title"
          className="immersive-title"
          placeholder="输入标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          required
          aria-label="文章标题"
          autoComplete="off"
        />
        <div className="mt-4">
          <RichTextEditor
            initialContent={post?.content ?? ""}
            onChange={setContent}
            placeholder="开始写作…"
          />
        </div>
      </div>

      {/* —— 右侧抽屉：发布设置 + 版本历史 —— */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[360px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>文章设置</SheetTitle>
            <SheetDescription>
              状态、分类、标签等元信息；保存后生效。
            </SheetDescription>
          </SheetHeader>
          {mode === "edit" ? (
            <Tabs defaultValue="settings" className="flex min-h-0 flex-1 flex-col px-4 pb-4">
              <TabsList className="w-full">
                <TabsTrigger value="settings" className="flex-1">
                  发布设置
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  版本历史
                </TabsTrigger>
              </TabsList>
              <TabsContent value="settings" className="mt-4 overflow-y-auto">
                <SettingsPanel
                  slug={slug}
                  setSlug={setSlug}
                  excerpt={excerpt}
                  setExcerpt={setExcerpt}
                  status={status}
                  setStatus={setStatus}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                  featured={featured}
                  setFeatured={setFeatured}
                  categories={categories}
                  tags={tags}
                  tagIds={tagIds}
                  toggleTag={toggleTag}
                />
              </TabsContent>
              <TabsContent value="history" className="mt-4 overflow-y-auto">
                {post ? (
                  <PostRevisions postId={post.id} revisions={revisions} />
                ) : null}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="overflow-y-auto px-4 pb-4">
              <SettingsPanel
                slug={slug}
                setSlug={setSlug}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                status={status}
                setStatus={setStatus}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                featured={featured}
                setFeatured={setFeatured}
                categories={categories}
                tags={tags}
                tagIds={tagIds}
                toggleTag={toggleTag}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </form>
  );
}

/** 抽屉内的发布设置面板（全部受控） */
function SettingsPanel({
  slug,
  setSlug,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  categoryId,
  setCategoryId,
  featured,
  setFeatured,
  categories,
  tags,
  tagIds,
  toggleTag,
}: {
  slug: string;
  setSlug: (v: string) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  status: PostStatus;
  setStatus: (v: PostStatus) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  featured: boolean;
  setFeatured: (v: boolean) => void;
  categories: CategoryRow[];
  tags: TagRow[];
  tagIds: number[];
  toggleTag: (id: number, checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">状态</span>
        <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            {POST_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">分类</span>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">无分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">标签</span>
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            暂无标签，请先到「内容管理 → 标签管理」创建。
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {tags.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-1.5 py-1.5 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={tagIds.includes(t.id)}
                  onCheckedChange={(v) => toggleTag(t.id, v === true)}
                />
                <span className="truncate">{t.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">设为精选</span>
          <span className="text-xs text-muted-foreground">
            精选文章会在博客首页优先展示
          </span>
        </div>
        <Switch checked={featured} onCheckedChange={setFeatured} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          URL 别名（slug）
        </span>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="留空则根据标题自动生成"
        />
        <p className="text-xs text-muted-foreground">
          用于 URL：/blog/&lt;slug&gt;
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">摘要</span>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="列表页与 SEO description 使用的简短摘要"
          rows={4}
        />
      </div>
    </div>
  );
}
