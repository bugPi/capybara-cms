import Link from "next/link";
import {
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  FileTextIcon,
} from "lucide-react";
import { getPostsPage, getCategoriesWithCounts, getTagsWithCounts } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { PostRowActions } from "@/components/post-row-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PostStatus } from "@/lib/db/schema";

export const metadata = { title: "文章列表" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = readParam(sp, "q");
  const status = readParam(sp, "status") as PostStatus | "";
  const categoryId = Number(readParam(sp, "category")) || undefined;
  const tagId = Number(readParam(sp, "tag")) || undefined;
  const deleted = readParam(sp, "deleted") === "1";
  const page = Number(readParam(sp, "page")) || 1;

  const result = getPostsPage({ page, q, status, categoryId, tagId, deleted });
  const categories = getCategoriesWithCounts();
  const tags = getTagsWithCounts();

  const buildQuery = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (categoryId) params.set("category", String(categoryId));
    if (tagId) params.set("tag", String(tagId));
    if (deleted) params.set("deleted", "1");
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `/capybara/content/posts?${s}` : "/capybara/content/posts";
  };

  const filterSelectClass =
    "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={deleted ? <Trash2Icon /> : <FileTextIcon />}
        title={deleted ? "回收站" : "文章列表"}
        description={
          deleted
            ? "被移入回收站的文章，可恢复或彻底删除"
            : `共 ${result.total} 篇文章`
        }
        action={
          !deleted ? (
            <Button asChild>
              <Link href="/capybara/content/posts/new">
                <PlusIcon data-icon="inline-start" />
                新建文章
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* 筛选栏 */}
      <form method="GET" action="/capybara/content/posts" className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="搜索标题…"
            className="w-56 pl-8"
          />
        </div>
        <select name="status" defaultValue={status} className={filterSelectClass}>
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="review">待审核</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </select>
        <select name="category" defaultValue={categoryId ? String(categoryId) : ""} className={filterSelectClass}>
          <option value="">全部分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}（{c.postCount}）
            </option>
          ))}
        </select>
        <select name="tag" defaultValue={tagId ? String(tagId) : ""} className={filterSelectClass}>
          <option value="">全部标签</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}（{t.postCount}）
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          筛选
        </Button>
        {(q || status || categoryId || tagId) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href={deleted ? "/capybara/content/posts?deleted=1" : "/capybara/content/posts"}>
              清除筛选
            </Link>
          </Button>
        )}
        {!deleted ? (
          <Button variant="ghost" size="sm" asChild className="ml-auto text-muted-foreground">
            <Link href="/capybara/content/posts?deleted=1">
              <Trash2Icon data-icon="inline-start" />
              回收站
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" asChild className="ml-auto text-muted-foreground">
            <Link href="/capybara/content/posts">
              <FileTextIcon data-icon="inline-start" />
              返回文章列表
            </Link>
          </Button>
        )}
      </form>

      {/* 表格 */}
      <div className="anim-fade-up overflow-hidden rounded-xl border bg-card" style={{ animationDelay: "120ms" }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[42%]">标题</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10">
                  <Empty
                    title={deleted ? "回收站是空的" : "没有符合条件的文章"}
                    description={
                      deleted
                        ? "删除的文章会出现在这里"
                        : q || status || categoryId || tagId
                          ? "尝试调整筛选条件"
                          : "点击右上角「新建文章」开始创作"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/capybara/content/posts/${post.id}`}
                      className="flex flex-col gap-1"
                    >
                      <span className="truncate font-medium hover:underline">
                        {post.title}
                      </span>
                      <span className="flex flex-wrap items-center gap-1">
                        {post.featured && (
                          <Badge variant="secondary" className="text-[10px]">
                            精选
                          </Badge>
                        )}
                        {post.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-xs text-muted-foreground"
                          >
                            #{t}
                          </span>
                        ))}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.categories.join("、") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {post.authorName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(post.updatedAt, true)}
                  </TableCell>
                  <TableCell>
                    <PostRowActions post={{ id: post.id, status: post.status, deleted }} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {result.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={buildQuery({ page: page - 1 })} />
              </PaginationItem>
            )}
            {Array.from({ length: result.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href={buildQuery({ page: p })} isActive={p === page}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
            {page < result.totalPages && (
              <PaginationItem>
                <PaginationNext href={buildQuery({ page: page + 1 })} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
