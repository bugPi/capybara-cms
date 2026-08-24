import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "登录",
  description: "登录到 Capybara CMS",
};

export default function LoginPage() {
  return (
    <div className="arco console-surface flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="anim-fade-up w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-sm md:p-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
