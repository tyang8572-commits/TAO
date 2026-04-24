"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EVENT_STATUS, type EventStatus } from "@/lib/constants";

type Props = {
  mode: "create" | "edit";
  eventId?: string;
  initialValues?: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    venueName: string;
    venueAddress: string;
    capacity: number;
    description: string;
    status: EventStatus;
  };
};

const defaultValues = {
  title: "",
  date: "",
  startTime: "19:00",
  endTime: "21:00",
  venueName: "",
  venueAddress: "",
  capacity: 16,
  description: "",
  status: EVENT_STATUS.OPEN
};

export function AdminEventForm({ mode, eventId, initialValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues || defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(mode === "create" ? "/api/admin/events" : `/api/admin/events/${eventId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      router.push("/admin");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-[32px] border border-white/80 bg-white p-6 shadow-card">
      <div>
        <h1 className="text-2xl font-bold text-ink">{mode === "create" ? "新建活动" : "编辑活动"}</h1>
        <p className="mt-2 text-sm text-slate-500">字段尽量保持直观，方便管理员快速维护每周活动。</p>
      </div>

      <div className="grid gap-3">
        <input placeholder="活动标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-3 gap-3">
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
          <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <input
          placeholder="场馆名称"
          value={form.venueName}
          onChange={(e) => setForm({ ...form, venueName: e.target.value })}
        />
        <input
          placeholder="场馆地址"
          value={form.venueAddress}
          onChange={(e) => setForm({ ...form, venueAddress: e.target.value })}
        />
        <input
          type="number"
          min={1}
          placeholder="最大人数"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
        />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}>
          <option value={EVENT_STATUS.OPEN}>报名中</option>
          <option value={EVENT_STATUS.CANCELED}>已取消</option>
          <option value={EVENT_STATUS.ENDED}>已结束</option>
        </select>
        <textarea
          rows={6}
          placeholder="活动说明（选填）"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-brand-300"
      >
        {loading ? "保存中..." : mode === "create" ? "创建活动" : "保存修改"}
      </button>
    </div>
  );
}
