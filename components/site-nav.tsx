import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-bold text-ink">
          羽毛球报名
        </Link>
        <nav className="flex items-center gap-3 text-sm text-slate-600">
          <Link href="/" className="font-medium hover:text-ink">
            活动
          </Link>
          <Link href="/my" className="font-medium hover:text-ink">
            我的报名
          </Link>
          <Link href="/admin" className="font-medium hover:text-ink">
            管理后台
          </Link>
        </nav>
      </div>
    </header>
  );
}
