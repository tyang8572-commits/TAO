import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { formatDate, formatDateTime } from "@/lib/dates";
import { getAdminEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const events = await getAdminEvents();

  return events.length === 0 ? (
    <EmptyState title="还没有活动" description="点击上方的新建活动，先创建第一场报名活动。" />
  ) : (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">{event.title}</h2>
              <p className="mt-2 text-sm text-slate-500">
                {formatDate(new Date(event.eventDate))} {event.startTime} - {event.endTime}
              </p>
              <p className="mt-1 text-sm text-slate-500">{event.venueName}</p>
              <p className="mt-1 text-sm text-slate-500">
                截止时间：{formatDateTime(new Date(event.signupDeadline))}
              </p>
            </div>
            <StatusPill label={event.displayStatus} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-brand-50 px-3 py-3">
              <p className="text-xs text-brand-600">正式</p>
              <p className="mt-1 font-semibold text-brand-700">{event.confirmedCount}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-3 py-3">
              <p className="text-xs text-amber-600">候补</p>
              <p className="mt-1 font-semibold text-amber-700">{event.waitlistCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-3">
              <p className="text-xs text-slate-500">容量</p>
              <p className="mt-1 font-semibold text-slate-700">{event.capacity}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/admin/events/${event.id}/edit`} className="rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
              编辑活动
            </Link>
            <Link
              href={`/admin/events/${event.id}/registrations`}
              className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white"
            >
              管理报名
            </Link>
            <form action={`/api/admin/events/${event.id}`} method="post">
              <input type="hidden" name="_method" value="DELETE" />
              <button className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">删除活动</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
