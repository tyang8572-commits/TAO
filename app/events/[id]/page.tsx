import { notFound } from "next/navigation";

import { EVENT_STATUS } from "@/lib/constants";
import { RegistrationPanel } from "@/components/registration-panel";
import { StatusPill } from "@/components/status-pill";
import { formatDateLong } from "@/lib/dates";
import { getEventDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventDetail(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-5 pb-12">
      <section className="rounded-[32px] border border-white/80 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">活动详情</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{event.title}</h1>
          </div>
          <StatusPill label={event.displayStatus} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs text-brand-600">剩余名额</p>
            <p className="mt-1 text-2xl font-bold text-brand-700">{Math.max(event.remainingSpots, 0)}</p>
            <p className="mt-1 text-xs text-slate-500">正式 {event.confirmedCount}/{event.capacity}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs text-amber-700">候补人数</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{event.waitlistCount}</p>
            <p className="mt-1 text-xs text-slate-500">满员后自动进入候补</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          报名前建议先看一下正式名单和候补顺序，避免重复提交。
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">日期</p>
            <p className="mt-1 font-medium text-slate-900">{formatDateLong(new Date(event.eventDate))}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">时间</p>
            <p className="mt-1 font-medium text-slate-900">
              {event.startTime} - {event.endTime}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">场馆名称</p>
            <p className="mt-1 font-medium text-slate-900">{event.venueName}</p>
            <p className="mt-1 text-slate-500">{event.venueAddress}</p>
          </div>
          {event.description.trim() ? (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">活动说明</p>
              <p className="mt-1 whitespace-pre-wrap leading-6 text-slate-700">{event.description}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">最新通知</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {event.notice || "当前暂无通知。"}
        </p>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">报名名单</h2>
            <p className="mt-2 text-sm text-slate-500">所有人都可以查看当前正式名单和候补顺序。</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center text-xs text-slate-600">
            <p>总人数</p>
            <p className="mt-1 text-sm font-semibold text-ink">{event.confirmedCount + event.waitlistCount}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-700">正式名单</p>
              <span className="text-xs text-brand-700">共 {event.confirmedList.length} 人</span>
            </div>
            <div className="mt-3 space-y-2">
              {event.confirmedList.length ? (
                event.confirmedList.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-3 text-sm">
                    <span className="text-slate-700">
                      {index + 1}. {item.name}
                    </span>
                    <StatusPill label="正式" />
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/70 px-3 py-3 text-sm text-slate-500">当前还没有正式报名成员。</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-amber-700">候补名单</p>
              <span className="text-xs text-amber-700">共 {event.waitlistList.length} 人</span>
            </div>
            <div className="mt-3 space-y-2">
              {event.waitlistList.length ? (
                event.waitlistList.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-3 text-sm">
                    <span className="text-slate-700">
                      第 {index + 1} 位 {item.name}
                    </span>
                    <StatusPill label="候补" />
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-white/70 px-3 py-3 text-sm text-slate-500">当前还没有候补成员。</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <RegistrationPanel
        eventId={event.id}
        canRegister={event.canRegister}
        displayStatus={event.displayStatus}
        started={event.started}
        ended={event.ended}
        canceled={event.status === EVENT_STATUS.CANCELED}
      />
    </div>
  );
}
