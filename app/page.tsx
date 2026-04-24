import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { getPublicEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getPublicEvents();
  const openEvents = events.filter((event) => event.canRegister).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-ink px-5 py-6 text-white shadow-card sm:px-6 sm:py-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-100">Badminton MVP</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">手机打开网址，就能完成报名、取消和候补查看。</h1>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right text-xs text-brand-50">
            <p>当前可报名</p>
            <p className="mt-1 text-xl font-bold text-white">{openEvents}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-200">
          第一版聚焦最核心的报名流程，适合直接在微信里打开使用，也更适合把链接发到群里让大家自助操作。
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-brand-100">1</p>
            <p className="mt-1 text-white">看活动</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-brand-100">2</p>
            <p className="mt-1 text-white">填姓名</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-brand-100">3</p>
            <p className="mt-1 text-white">立刻出结果</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/my" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-ink">
            查询我的报名
          </Link>
          <Link
            href="/admin"
            className="rounded-2xl border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            管理后台
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">最新活动</h2>
            <p className="mt-1 text-sm text-slate-500">只展示未结束的活动，优先让手机里一眼看到时间、地点和剩余名额。</p>
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
