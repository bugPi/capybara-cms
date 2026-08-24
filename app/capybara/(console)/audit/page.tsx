import Link from "next/link";
import {
  getAuditLogsPage,
  getAuditActionOptions,
  getAuditActorOptions,
} from "@/lib/queries";
import { auditActionLabel } from "@/lib/audit-labels";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { ScrollTextIcon } from "lucide-react";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
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

export const metadata = { title: "审计日志" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string {
  const v = sp[key];
  return typeof v === "string" ? v : "";
}

export default async function AuditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const action = readParam(sp, "action");
  const actor = readParam(sp, "actor");
  const page = Number(readParam(sp, "page")) || 1;

  const result = getAuditLogsPage({ page, action, actor });
  const actions = getAuditActionOptions();
  const actors = getAuditActorOptions();

  const buildQuery = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (actor) params.set("actor", actor);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `/capybara/audit?${s}` : "/capybara/audit";
  };

  const filterSelectClass =
    "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageHeader
          icon={<ScrollTextIcon />}
          title="审计日志"
          description={`记录所有后台操作，共 ${result.total} 条；日志为追加写，不可修改或删除`}
        />
      </div>

      {/* 筛选 */}
      <form method="GET" action="/capybara/audit" className="flex flex-wrap items-center gap-2">
        <select name="action" defaultValue={action} className={filterSelectClass}>
          <option value="">全部操作</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {auditActionLabel(a)}
            </option>
          ))}
        </select>
        <select name="actor" defaultValue={actor} className={filterSelectClass}>
          <option value="">全部操作者</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          筛选
        </Button>
        {(action || actor) && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/capybara/audit">清除筛选</Link>
          </Button>
        )}
      </form>

      {/* 表格 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>操作者</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>对象</TableHead>
              <TableHead>详情</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10">
                  <Empty
                    title="暂无日志"
                    description={
                      action || actor
                        ? "尝试调整筛选条件"
                        : "后台操作记录会显示在这里"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              result.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.actor}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {auditActionLabel(log.action)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId}` : ""}
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-sm text-muted-foreground">
                    {log.detail || "—"}
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
