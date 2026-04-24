import Link from "next/link";

import { AdminEventForm } from "@/components/admin-event-form";
import { toDateInputValue } from "@/lib/dates";
import { dbGet } from "@/lib/db";

export default async function AdminEditEventPage({ params }: { params: { id: string } }) {
  const event = (await dbGet(
    `SELECT * FROM "Event" WHERE id = ?`,
    [params.id]
  )) as
    | {
        id: string;
        title: string;
        eventDate: string;
        startTime: string;
        endTime: string;
        venueName: string;
        venueAddress: string;
        capacity: number;
        description: string;
        status: "OPEN" | "CANCELED" | "ENDED";
      }
    | undefined;

  if (!event) {
    return (
      <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">活动不存在或已被移除</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">手机端如果偶发看到这个页面，通常是当前线上数据实例不同步导致的，返回活动列表重新进入即可。</p>
        <Link href="/admin" className="mt-5 inline-flex rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white">
          返回活动管理
        </Link>
      </div>
    );
  }

  const date = toDateInputValue(new Date(event.eventDate));

  return (
    <AdminEventForm
      mode="edit"
      eventId={event.id}
      initialValues={{
        title: event.title,
        date,
        startTime: event.startTime,
        endTime: event.endTime,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        capacity: Number(event.capacity),
        description: event.description,
        status: event.status
      }}
    />
  );
}
