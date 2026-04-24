import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getPublicEvents();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-ink px-6 py-8 text-white shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-100">Badminton MVP</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">手机打开网址，就能完成报名、取消和候补查看。</h1>
        <p className="mt-4 text-sm leading-6 text-slate-200">
          第一版聚焦最核心的报名流程，适合直接在微信里打开使用。
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/my" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink">
            查询我的报名
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl border border-white/30 px-4 py-3 text-sm font-semibold text-white"
          >
            管理后台
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">最新活动</h2>
            <p className="mt-1 text-sm text-slate-500">只展示未结束的活动，优先适配手机竖屏浏览。</p>
          </div>
        </div>

        {events.length === 0 ? (
          <EmptyState title="暂时没有可查看的活动" description="管理员创建活动后，这里会自动展示最新报名信息。" />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
