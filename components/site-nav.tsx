import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-3 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-sm font-bold text-white shadow-card">
            羽
          </span>
          <span>
            <span className="block text-base font-bold text-ink">羽毛球报名</span>
            <span className="block text-xs text-slate-500">手机报名、取消、候补一站完成</span>
          </span>
        </Link>
        <nav className="grid w-full grid-cols-3 gap-2 text-center text-sm text-slate-600 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Link
            href="/"
            className="rounded-2xl bg-slate-100 px-3 py-3 font-medium text-slate-700 hover:text-ink sm:bg-transparent sm:px-0 sm:py-0"
          >
            活动
          </Link>
          <Link
            href="/my"
            className="rounded-2xl bg-slate-100 px-3 py-3 font-medium text-slate-700 hover:text-ink sm:bg-transparent sm:px-0 sm:py-0"
          >
            我的报名
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl bg-slate-100 px-3 py-3 font-medium text-slate-700 hover:text-ink sm:bg-transparent sm:px-0 sm:py-0"
          >
            管理后台
          </Link>
        </nav>
      </div>
    </header>
  );
}
