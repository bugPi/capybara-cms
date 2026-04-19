import type { Metadata } from "next";
import { LandingHeroBackdrop } from "@/components/layout/landing-hero-backdrop";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "登录",
  description: "登录到 Capybara CMS",
};

export default function LoginPage() {
  return (
    <div className="landing-grain relative isolate flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <LandingHeroBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}