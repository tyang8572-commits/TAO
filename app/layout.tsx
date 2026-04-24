import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "羽毛球报名系统",
  description: "替代微信群接龙的羽毛球报名网址系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteNav />
        <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-screen-sm flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
