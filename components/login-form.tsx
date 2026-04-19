"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** 演示账号（仅用于体验；接入真实鉴权后改为服务端校验或移除） */
export const DEMO_EMAIL = "demo@capybara-cms.local";
export const DEMO_PASSWORD = "demo";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 接入真实登录 API
    router.push("/capybara/console");
  };

  const handleDemoLogin = () => {
    if (emailRef.current) emailRef.current.value = DEMO_EMAIL;
    if (passwordRef.current) passwordRef.current.value = DEMO_PASSWORD;
    formRef.current?.requestSubmit();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form ref={formRef} onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-3 font-medium"
            >
              <div className="flex size-16 items-center justify-center rounded-md">
                <svg
                  viewBox="0 0 100 100"
                  className="size-16 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M25 40C25 35 60 30 75 40C85 50 85 65 75 70C60 75 30 75 25 65V40Z" />
                  <path d="M70 45C72 45 72 48 70 48M30 35C30 32 35 32 35 35" />
                  <path d="M78 55H85M75 62H82" />
                </svg>
              </div>
              <span className="sr-only">Capybara CMS</span>
            </Link>
            <h1 className="text-xl font-bold">登录到 Capybara CMS</h1>
            <FieldDescription>
              没有账号？ <Link href="#" className="text-brand">联系销售</Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">邮箱</FieldLabel>
            <Input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              className="h-9 px-3 text-sm md:text-sm"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">密码</FieldLabel>
            <Input
              ref={passwordRef}
              id="password"
              name="password"
              type="password"
              placeholder="输入密码"
              autoComplete="current-password"
              required
              className="h-9 px-3 text-sm md:text-sm"
            />
          </Field>
          <Field>
            <Button type="submit" size="lg" className="w-full">
              登录
            </Button>
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleDemoLogin}
            >
              演示账号登录
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        点击继续即表示您同意我们的{" "}
        <Link href="/terms" className="text-brand">
          服务条款
        </Link>{" "}
        和{" "}
        <Link href="/privacy" className="text-brand">
          隐私政策
        </Link>
        。
      </FieldDescription>
    </div>
  );
}