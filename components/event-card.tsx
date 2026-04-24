import Link from "next/link";

import { formatDate } from "@/lib/dates";
import type { EventSummary } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

export function EventCard({ event }: { event: EventSummary }) {
  const isOpen = event.canRegister;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-3xl border border-white/80 bg-white p-4 shadow-card transition hover:-translate-y-0.5 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">最新活动</p>
          <h2 className="mt-2 text-lg font-bold leading-7 text-ink">{event.title}</h2>
        </div>
        <StatusPill label={event.displayStatus} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
        <div>
          <p className="text-xs text-brand-600">{isOpen ? "当前还可报名" : "当前报名状态"}</p>
          <p className="mt-1 text-lg font-bold text-brand-700">
            {isOpen ? `剩余 ${event.remainingSpots} 位` : event.displayStatus}
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <p>正式 {event.confirmedCount}/{event.capacity}</p>
          <p className="mt-1">候补 {event.waitlistCount}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3.5">
          <p className="text-xs text-slate-400">日期</p>
          <p className="mt-1 font-medium text-slate-900">{formatDate(new Date(event.eventDate))}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3.5">
          <p className="text-xs text-slate-400">时间</p>
          <p className="mt-1 font-medium text-slate-900">
            {event.startTime} - {event.endTime}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3.5">
          <p className="text-xs text-slate-400">场馆</p>
          <p className="mt-1 font-medium text-slate-900">{event.venueName}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3.5">
          <p className="text-xs text-slate-400">报名情况</p>
          <p className="mt-1 font-medium text-slate-900">{event.confirmedCount}/{event.capacity}</p>
          <p className="mt-1 text-xs text-slate-500">满员后会自动进入候补名单</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
        <span className="text-slate-600">点开后可直接报名、取消，并查看全部名单</span>
        <span className="font-semibold text-ink">查看详情</span>
      </div>
    </Link>
  );
}
