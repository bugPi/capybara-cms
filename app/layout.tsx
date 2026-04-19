import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GsapProvider } from "@/components/providers/gsap-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSiteUrl } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Capybara CMS - 企业级内容管理平台",
    template: "%s | Capybara CMS",
  },
  description:
    "企业级内容与发布平台：结构化内容、工作流与 API。支持 MCP 工具链由智能体起草与发布博客，内置 SEO 元数据、Open Graph 与结构化数据能力。",
  keywords: [
    "Capybara CMS",
    "企业 CMS",
    "内容管理",
    "MCP",
    "Model Context Protocol",
    "博客发布",
    "SEO",
    "结构化数据",
    "Headless CMS",
    "API 优先",
  ],
  authors: [{ name: "Capybara CMS" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: "Capybara CMS",
    title: "Capybara CMS - 企业级内容管理平台",
    description:
      "支持 MCP 发博客与企业级 SEO 的内容平台：治理、集成、交付在一处完成。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Capybara CMS",
    description:
      "企业级 CMS：MCP 工具发布、SEO 与多站点编排。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GsapProvider>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </GsapProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}