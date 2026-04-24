"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  canRegister: boolean;
  displayStatus: string;
  started: boolean;
  ended: boolean;
  canceled: boolean;
};

export function RegistrationPanel({
  eventId,
  canRegister,
  displayStatus,
  started,
  ended,
  canceled
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signup" | "cancel">("signup");
  const [signupData, setSignupData] = useState({ name: "" });
  const [cancelData, setCancelData] = useState({ name: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (mode: "signup" | "cancel") => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = mode === "signup" ? signupData : cancelData;
    const endpoint = mode === "signup" ? "register" : "cancel";

    try {
      const response = await fetch(`/api/events/${eventId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "请求失败");
      }

      setMessage(result.message || "操作成功");
      if (mode === "signup") {
        setSignupData({ name: "" });
      } else {
        setCancelData({ name: "" });
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">报名操作</h3>
        <span className="text-xs text-slate-500">当前状态：{displayStatus}</span>
      </div>

      {!canRegister && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {canceled && "活动已取消，当前仅支持查看信息。"}
          {!canceled && ended && "活动已结束，当前仅支持查看信息。"}
          {!canceled && !ended && started && "活动已开始，当前不再接受报名。"}
        </div>
      )}

      <div className="mt-4 flex rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium ${
            activeTab === "signup" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          我要报名
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cancel")}
          className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium ${
            activeTab === "cancel" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          取消报名
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          placeholder="姓名"
          value={activeTab === "signup" ? signupData.name : cancelData.name}
          onChange={(event) =>
            activeTab === "signup"
              ? setSignupData((prev) => ({ ...prev, name: event.target.value }))
              : setCancelData((prev) => ({ ...prev, name: event.target.value }))
          }
        />
      </div>

      {message && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>}
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        disabled={loading || (activeTab === "signup" && !canRegister)}
        onClick={() => submit(activeTab)}
        className="mt-4 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "提交中..." : activeTab === "signup" ? "确认报名" : "确认取消"}
      </button>
    </div>
  );
}
