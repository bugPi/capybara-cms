"use client";

import { useActionState } from "react";
import {
  updateGeneralSettings,
  type SettingsState,
} from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";

const FIELD_DEFS: {
  key: string;
  label: string;
  description?: string;
  type?: "select";
  options?: { value: string; label: string }[];
}[] = [
  {
    key: "site_name",
    label: "站点名称",
    description: "用于标题、页脚与邮件中的站点显示名称。",
  },
  {
    key: "site_description",
    label: "站点描述",
    description: "站点的一句话简介，用于首页与 SEO。",
  },
  {
    key: "site_url",
    label: "站点 URL",
    description: "站点的公开访问地址，用于生成绝对链接。",
  },
  {
    key: "default_locale",
    label: "默认语言",
    type: "select",
    options: [
      { value: "zh", label: "中文（zh）" },
      { value: "en", label: "English（en）" },
    ],
  },
  { key: "timezone", label: "时区", description: "例如 Asia/Shanghai。" },
  {
    key: "seo_title_template",
    label: "SEO 标题模板",
    description: "可用占位符：{title}、{siteName}。",
  },
  {
    key: "seo_description_length",
    label: "SEO 描述长度",
    description: "meta description 的推荐字符数。",
  },
  {
    key: "audit_retention_days",
    label: "审计日志保留天数",
    description: "超过该天数的审计日志将被清理（需配合清理任务）。",
  },
  {
    key: "media_max_size_mb",
    label: "媒体上传大小限制（MB）",
    description: "单个媒体文件的最大体积。",
  },
];

export function GeneralSettingsForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<
    SettingsState,
    FormData
  >(updateGeneralSettings, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        {FIELD_DEFS.map((def) => (
          <Field key={def.key}>
            <FieldLabel htmlFor={`set-${def.key}`}>{def.label}</FieldLabel>
            {def.type === "select" ? (
              <Select name={def.key} defaultValue={initial[def.key] ?? ""}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {def.options!.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={`set-${def.key}`}
                name={def.key}
                defaultValue={initial[def.key] ?? ""}
                required
              />
            )}
            {def.description ? (
              <FieldDescription>{def.description}</FieldDescription>
            ) : null}
          </Field>
        ))}
      </FieldGroup>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存设置"}
        </Button>
      </div>
    </form>
  );
}
