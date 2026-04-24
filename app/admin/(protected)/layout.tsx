import Link from "next/link";

import { requireAdminPage } from "@/lib/auth";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  requireAdminPage();

  return (
    <div className="space-y-5">
      <div className="rounded-[30px] border border-white/80 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Admin</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">羽毛球报名后台</h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              退出登录
            </button>
          </form>
        </div>

        <nav className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link href="/admin" className="rounded-2xl bg-ink px-4 py-2 text-white">
            活动管理
          </Link>
          <Link href="/admin/events/new" className="rounded-2xl bg-brand-600 px-4 py-2 text-white">
            新建活动
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
