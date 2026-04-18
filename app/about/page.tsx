import type { Metadata } from "next";
import { AboutCta } from "@/components/sections/about-cta";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "Capybara CMS 专注企业内容与发布：结构化模型、API、工作流与 MCP、SEO 一体化。",
};

export default function AboutPage() {
  return <AboutCta />;
}
