import Link from "next/link";

import { AdminNoticeForm } from "@/components/admin-notice-form";
import { AdminRegistrationManager } from "@/components/admin-registration-manager";
import { getEventDetail } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage({ params }: { params: { id: string } }) {
  const event = await getEventDetail(params.id);

  if (!event) {
    return (
      <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">活动不存在或暂时无法读取</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">如果手机端偶发进入到这个页面，请先返回后台首页再重新打开；正式上线前建议切到共享数据库以避免这种情况。</p>
        <Link href="/admin" className="mt-5 inline-flex rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          返回活动管理
        </Link>
      </div>
    );
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
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
