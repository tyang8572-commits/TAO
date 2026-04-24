"use client";

import Link from "next/link";
import { useState } from "react";

import type { RegistrationStatus } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { normalizeName } from "@/lib/names";
import { StatusPill } from "@/components/status-pill";

type ResultItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  status: RegistrationStatus;
  statusLabel: string;
  createdAt: string;
};

export function PhoneQueryForm() {
  const [name, setName] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    const trimmedName = normalizeName(name);
    setLoading(true);
    setMessage(null);
    setError(null);
    setName(trimmedName);

    try {
      const response = await fetch(`/api/my-registrations?name=${encodeURIComponent(trimmedName)}`, {
        credentials: "same-origin",
        cache: "no-store"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "查询失败");
      }

      setResults(result.data);
      setMessage(result.data.length ? null : "当前姓名暂无报名记录");
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "查询失败");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/80 bg-white p-5 shadow-card">
        <h2 className="text-lg font-bold text-ink">姓名查询</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">输入报名姓名，即可查看你的正式、候补与已取消记录。</p>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入姓名" />
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-brand-300"
          >
            {loading ? "查询中..." : "查询我的报名"}
          </button>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      </div>

      {results.map((item) => (
        <div key={item.id} className="rounded-3xl border border-white/80 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">{item.eventTitle}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {formatDate(new Date(item.eventDate))} {item.startTime} - {item.endTime}
              </p>
              <p className="mt-1 text-sm text-slate-500">{item.venueName}</p>
            </div>
            <StatusPill label={item.statusLabel} />
          </div>
          <Link
            href={`/events/${item.eventId}`}
            className="mt-4 inline-flex rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            查看活动详情
          </Link>
        </div>
      ))}
    </div>
  );
}
