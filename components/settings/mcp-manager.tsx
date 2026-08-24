"use client";

import * as React from "react";
import { useTransition } from "react";
import { toast } from "sonner";
import { toggleMcpTool } from "@/lib/actions/settings";
import type { McpToolRow } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
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
import { BoxesIcon } from "lucide-react";

export function McpManager({ items }: { items: McpToolRow[] }) {
  const [pending, startTransition] = useTransition();

  const run = (id: number, enabled: boolean) => {
    startTransition(async () => {
      try {
        await toggleMcpTool(id, enabled);
        toast.success(enabled ? "工具已启用" : "工具已停用");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "操作失败");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>工具</TableHead>
              <TableHead>说明</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">启用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10">
                  <Empty title="暂无 MCP 工具" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BoxesIcon className="size-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium">
                        {t.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md text-sm text-muted-foreground">
                    {t.description || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(t.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant={t.enabled ? "default" : "outline"}>
                        {t.enabled ? "启用" : "停用"}
                      </Badge>
                      <Switch
                        checked={t.enabled}
                        disabled={pending}
                        onCheckedChange={(v) => run(t.id, v)}
                        aria-label={`${t.name} 开关`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        这些工具将暴露给已授权的 MCP 客户端（如 AI 编辑器/代理），停用后客户端无法调用。
      </p>
    </div>
  );
}
