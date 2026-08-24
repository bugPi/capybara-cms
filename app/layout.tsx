import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@wangeditor/editor/dist/css/style.css";
import { GsapProvider } from "@/components/providers/gsap-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
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