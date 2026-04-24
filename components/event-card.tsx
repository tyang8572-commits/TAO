import Link from "next/link";

import { formatDate } from "@/lib/dates";
import type { EventSummary } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

export function EventCard({ event }: { event: EventSummary }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-3xl border border-white/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">最新活动</p>
          <h2 className="mt-2 text-lg font-bold text-ink">{event.title}</h2>
        </div>
        <StatusPill label={event.displayStatus} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">日期</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(new Date(event.eventDate))}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">时间</p>
          <p className="mt-1 font-medium text-slate-900">
            {event.startTime} - {event.endTime}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">场馆</p>
          <p className="mt-1 font-medium text-slate-900">{event.venueName}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">报名情况</p>
          <p className="mt-1 font-medium text-slate-900">
            {event.confirmedCount}/{event.capacity}
            <span className="ml-2 text-xs text-slate-500">候补 {event.waitlistCount}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3 text-sm">
        <span className="text-slate-600">剩余名额</span>
        <span className="font-semibold text-brand-700">{event.remainingSpots}</span>
      </div>
    </Link>
  );
}
