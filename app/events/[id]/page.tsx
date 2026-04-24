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
      <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">活动详情</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">{event.title}</h1>
          </div>
          <StatusPill label={event.displayStatus} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="text-xs text-brand-600">报名人数</p>
              <p className="mt-1 text-lg font-bold text-brand-700">
                {event.confirmedCount}/{event.capacity}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs text-amber-600">候补人数</p>
              <p className="mt-1 text-lg font-bold text-amber-700">{event.waitlistCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">最新通知</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {event.notice || "当前暂无通知。"}
        </p>
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
