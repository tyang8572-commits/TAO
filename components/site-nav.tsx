import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-sm flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-base font-bold text-ink">
          羽毛球报名
        </Link>
        <nav className="grid w-full grid-cols-3 gap-2 text-center text-sm text-slate-600 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Link href="/" className="rounded-xl bg-slate-100 px-3 py-2 font-medium hover:text-ink sm:bg-transparent sm:px-0 sm:py-0">
            活动
          </Link>
          <Link href="/my" className="rounded-xl bg-slate-100 px-3 py-2 font-medium hover:text-ink sm:bg-transparent sm:px-0 sm:py-0">
            我的报名
          </Link>
          <Link href="/admin" className="rounded-xl bg-slate-100 px-3 py-2 font-medium hover:text-ink sm:bg-transparent sm:px-0 sm:py-0">
            管理后台
          </Link>
        </nav>
      </div>
    </header>
  );
}
