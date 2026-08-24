"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import { toast } from "sonner";
import {
  createApiKey,
  revokeApiKey,
  createWebhook,
  toggleWebhook,
  deleteWebhook,
  type SettingsState,
  type ApiKeyResult,
} from "@/lib/actions/settings";
import type { ApiKeyRow, WebhookRow } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
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
  KeyRoundIcon,
  WebhookIcon,
  PlusIcon,
  TriangleAlertIcon,
  PowerIcon,
  Trash2Icon,
  BanIcon,
} from "lucide-react";

const SCOPE_OPTIONS = [
  { value: "read", label: "读（read）", description: "读取文章与媒体" },
  { value: "write", label: "写（write）", description: "创建/更新内容" },
  { value: "publish", label: "发布（publish）", description: "发布与状态流转" },
];

const WEBHOOK_EVENTS = [
  "post.created",
  "post.updated",
  "post.published",
  "post.deleted",
];

function maskKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// API Key 表单
// ---------------------------------------------------------------------------

function ApiKeyForm() {
  const [state, formAction, pending] = useActionState<ApiKeyResult, FormData>(
    createApiKey,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      {state?.error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>创建失败</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state?.createdKey ? (
        <Alert>
          <KeyRoundIcon />
          <AlertTitle>API Key 创建成功（仅此一次展示）</AlertTitle>
          <AlertDescription className="break-all font-mono">
            {state.createdKey}
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="apikey-name">Key 名称</FieldLabel>
          <Input
            id="apikey-name"
            name="name"
            placeholder="例如：CI 发布机器人"
            required
          />
        </Field>
        <Field>
          <FieldLabel>权限范围</FieldLabel>
          <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-3">
            {SCOPE_OPTIONS.map((s) => (
              <label
                key={s.value}
                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
              >
                <input
                  type="checkbox"
                  name="scopes"
                  value={s.value}
                  defaultChecked={s.value === "read"}
                  className="mt-0.5 size-4 accent-(--primary)"
                />
                <span className="flex flex-col">
                  <span>{s.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </Field>
        <div>
          <Button type="submit" disabled={pending}>
            <PlusIcon data-icon="inline-start" />
            {pending ? "创建中…" : "创建 Key"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Webhook 表单
// ---------------------------------------------------------------------------

function WebhookForm() {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    createWebhook,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      {state?.error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>创建失败</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="wh-name">名称</FieldLabel>
          <Input
            id="wh-name"
            name="name"
            placeholder="例如：内容发布通知"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wh-url">回调 URL</FieldLabel>
          <Input
            id="wh-url"
            name="url"
            type="url"
            placeholder="https://hooks.example.com/…"
            required
          />
          <FieldDescription>必须以 http(s):// 开头；创建时自动生成签名密钥。</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>触发事件</FieldLabel>
          <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
            {WEBHOOK_EVENTS.map((ev) => (
              <label
                key={ev}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
              >
                <input
                  type="checkbox"
                  name="events"
                  value={ev}
                  defaultChecked={ev === "post.published"}
                  className="size-4 accent-(--primary)"
                />
                <span className="font-mono text-xs">{ev}</span>
              </label>
            ))}
          </div>
        </Field>
        <div>
          <Button type="submit" disabled={pending}>
            <PlusIcon data-icon="inline-start" />
            {pending ? "创建中…" : "创建 Webhook"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

// ---------------------------------------------------------------------------
// 页面主体
// ---------------------------------------------------------------------------

export function ApiManager({
  apiKeys,
  webhooks,
}: {
  apiKeys: ApiKeyRow[];
  webhooks: WebhookRow[];
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

  return (
    <div className="flex flex-col gap-8">
      {/* API Keys */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">API 密钥</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            用于外部系统通过 REST API 访问内容；密钥仅在创建时展示一次
          </p>
        </div>

        <ApiKeyForm />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>密钥</TableHead>
                <TableHead>权限</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最近使用</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10">
                    <Empty title="还没有 API Key" description="使用上方表单创建一个" />
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {maskKey(k.key)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.split(",").map((s) => (
                          <Badge key={s} variant="outline" className="font-mono text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={k.status === "active" ? "default" : "outline"}>
                        {k.status === "active" ? "启用" : "已吊销"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(k.lastUsedAt, true)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {k.status === "active" ? (
                          <ConfirmAction
                            title={`吊销 Key「${k.name}」？`}
                            description="吊销后使用该密钥的请求将立即失效，此操作不可撤销。"
                            confirmLabel="吊销"
                            onConfirm={() => revokeApiKey(k.id)}
                            success="Key 已吊销"
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <BanIcon data-icon="inline-start" />
                                吊销
                              </Button>
                            }
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Webhooks */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <WebhookIcon className="size-5 text-muted-foreground" />
            Webhooks
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            内容事件发生时向指定 URL 发送 HTTP 通知
          </p>
        </div>

        <WebhookForm />

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>事件</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10">
                    <Empty title="还没有 Webhook" description="使用上方表单创建一个" />
                  </TableCell>
                </TableRow>
              ) : (
                webhooks.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
                      {w.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(JSON.parse(w.events) as string[]).map((ev) => (
                          <Badge key={ev} variant="secondary" className="font-mono text-[10px]">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.status === "active" ? "default" : "outline"}>
                        {w.status === "active" ? "启用" : "停用"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pending}
                          onClick={() =>
                            run(
                              () =>
                                toggleWebhook(
                                  w.id,
                                  w.status === "disabled"
                                ),
                              w.status === "disabled" ? "已启用" : "已停用"
                            )
                          }
                        >
                          <PowerIcon data-icon="inline-start" />
                          {w.status === "active" ? "停用" : "启用"}
                        </Button>
                        <ConfirmAction
                          title={`删除 Webhook「${w.name}」？`}
                          description="删除后该 Webhook 将不再接收任何事件通知。"
                          onConfirm={() => deleteWebhook(w.id)}
                          success="Webhook 已删除"
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
