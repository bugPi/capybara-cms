import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    zh: "Capybara CMS - 企业级内容管理平台",
    en: "Capybara CMS - Enterprise Content Management Platform"
  };
  
  const descriptions = {
    zh: "企业级内容与发布平台：结构化内容、工作流与 API。支持 MCP 工具链由智能体起草与发布博客，内置 SEO 元数据、Open Graph 与结构化数据能力。",
    en: "Enterprise content management platform: structured content, workflows, and APIs. MCP-powered blog publishing with built-in SEO metadata, Open Graph, and structured data."
  };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: titles[locale as keyof typeof titles] || titles.zh,
      template: "%s | Capybara CMS",
    },
    description: descriptions[locale as keyof typeof descriptions] || descriptions.zh,
    keywords: [
      "Capybara CMS",
      "Enterprise CMS",
      "Content Management",
      "MCP",
      "Model Context Protocol",
      "Blog Publishing",
      "SEO",
      "Structured Data",
      "Headless CMS",
      "API First",
    ],
    authors: [{ name: "Capybara CMS" }],
    openGraph: {
      type: "website",
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: siteUrl,
      siteName: "Capybara CMS",
      title: titles[locale as keyof typeof titles] || titles.zh,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.zh,
    },
    twitter: {
      card: "summary_large_image",
      title: "Capybara CMS",
      description: descriptions[locale as keyof typeof descriptions] || descriptions.zh,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}