import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { AdminRegistrationManager } from "@/components/admin-registration-manager";
import { getEventDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({ params }: { params: { id: string } }) {
  const event = await getEventDetail(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">{event.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(event.eventDate).toLocaleDateString("zh-CN")} {event.startTime} - {event.endTime}
            </p>
            <p className="mt-1 text-sm text-slate-500">{event.venueName}</p>
          </div>
          <a
            href={`/api/admin/events/${event.id}/export`}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
          >
            导出 CSV
          </a>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href={`/admin/events/${event.id}/edit`} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            编辑活动
          </Link>
          <Link href={`/events/${event.id}`} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
            查看用户端页面
          </Link>
        </div>
      </div>

      <AdminNoticeForm eventId={event.id} initialContent={event.notice || ""} />
      <AdminRegistrationManager
        eventId={event.id}
        confirmedList={event.confirmedList}
        waitlistList={event.waitlistList}
      />
    </div>
  );
}
