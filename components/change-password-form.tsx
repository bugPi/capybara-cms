"use client";

import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<
    ChangePasswordState,
    FormData
  >(changePassword, null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.success ? (
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>修改成功</AlertTitle>
          <AlertDescription>密码已更新，下次登录请使用新密码。</AlertDescription>
        </Alert>
      ) : null}
      {state?.error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>修改失败</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="currentPassword">当前密码</FieldLabel>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="newPassword">新密码</FieldLabel>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldDescription>至少 8 位，建议包含字母、数字与符号。</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">确认新密码</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>
      </FieldGroup>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "更新密码"}
        </Button>
      </div>
    </form>
  );
}
