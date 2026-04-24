import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "羽毛球报名系统",
  description: "替代微信群接龙的羽毛球报名网址系统"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteNav />
        <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-screen-sm flex-col px-3 py-4 sm:min-h-[calc(100vh-64px)] sm:px-4 sm:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
