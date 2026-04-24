"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminNoticeForm({ eventId, initialContent }: { eventId: string; initialContent: string }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/events/${eventId}/notice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "保存失败");
      }

      setMessage("通知已更新");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-ink">最新通知</h3>
      <textarea
        rows={5}
        className="mt-4 w-full"
        placeholder="输入用户端可见的最新通知"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
      {message && <p className="mt-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>}
      {error && <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
      >
        {loading ? "保存中..." : "保存通知"}
      </button>
    </div>
  );
}
