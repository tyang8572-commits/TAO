"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { REGISTRATION_STATUS } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { normalizeName } from "@/lib/names";
import type { RegistrationView } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

type Props = {
  eventId: string;
  confirmedList: RegistrationView[];
  waitlistList: RegistrationView[];
};

function RegistrationSection({
  title,
  emptyText,
  items,
  onDelete
}: {
  title: string;
  emptyText: string;
  items: RegistrationView[];
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{item.name}</p>
                    <StatusPill label={item.status === REGISTRATION_STATUS.CONFIRMED ? "正式" : "候补"} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">报名时间：{formatDateTime(new Date(item.createdAt))}</p>
                  {item.waitlistPosition && (
                    <p className="mt-1 text-sm text-amber-700">候补顺序：第 {item.waitlistPosition} 位</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminRegistrationManager({ eventId, confirmedList, waitlistList }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => {
    router.refresh();
  };

  const onAdd = async () => {
    const normalizedName = normalizeName(form.name);
    setLoading(true);
    setError(null);
    setMessage(null);
    setForm({ name: normalizedName });

    try {
      const response = await fetch(`/api/admin/events/${eventId}/registrations`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: normalizedName })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "新增失败");
      }

      setMessage(result.message || "报名已新增");
      setForm({ name: "" });
      refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "新增失败");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (registrationId: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/events/${eventId}/registrations/${registrationId}`, {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store"
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "删除失败");
      }

      setMessage("报名已删除，名单已自动调整");
      refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "删除失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
        <h3 className="text-lg font-bold text-ink">手动新增报名</h3>
        <div className="mt-4 grid gap-3">
          <input placeholder="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        {message && <p className="mt-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>}
        {error && <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={onAdd}
          className="mt-4 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-brand-300"
        >
          {loading ? "处理中..." : "新增报名"}
        </button>
      </div>

      <RegistrationSection title="正式名单" emptyText="当前暂无正式报名成员。" items={confirmedList} onDelete={onDelete} />
      <RegistrationSection title="候补名单" emptyText="当前暂无候补成员。" items={waitlistList} onDelete={onDelete} />
    </div>
  );
}
