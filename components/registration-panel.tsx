"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { normalizeName } from "@/lib/names";

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
  const activeName = activeTab === "signup" ? signupData.name : cancelData.name;
  const hasName = Boolean(normalizeName(activeName));

  const submit = async (mode: "signup" | "cancel") => {
    const payload = mode === "signup" ? signupData : cancelData;
    const normalizedName = normalizeName(payload.name);

    if (!normalizedName) {
      setError("请先填写姓名");
      setMessage(null);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    const endpoint = mode === "signup" ? "register" : "cancel";

    try {
      const response = await fetch(`/api/events/${eventId}/${endpoint}`, {
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">报名操作</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">报名和取消都只需要填写姓名，提交后会立刻刷新当前名单。</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">当前状态：{displayStatus}</span>
      </div>

      {!canRegister && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {canceled && "活动已取消，当前仅支持查看信息。"}
          {!canceled && ended && "活动已结束，当前仅支持查看信息。"}
          {!canceled && !ended && started && "活动已开始，当前不再接受报名。"}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[24px] bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            activeTab === "signup" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          我要报名
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cancel")}
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            activeTab === "cancel" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          取消报名
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-ink">{activeTab === "signup" ? "填写报名姓名" : "填写要取消的姓名"}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {activeTab === "signup"
            ? "如果正式名额已满，系统会自动把你放进候补名单。"
            : "请输入报名时使用的姓名，取消后如有候补会自动递补。"}
        </p>

        <div className="mt-3 space-y-3">
          <input
            aria-label={activeTab === "signup" ? "报名姓名" : "取消报名姓名"}
            placeholder="姓名"
            value={activeName}
            onChange={(event) =>
              activeTab === "signup"
                ? setSignupData((prev) => ({ ...prev, name: event.target.value }))
                : setCancelData((prev) => ({ ...prev, name: event.target.value }))
            }
          />
        </div>
      </div>

      {message && <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</p>}
      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        disabled={loading || !hasName || (activeTab === "signup" && !canRegister)}
        onClick={() => submit(activeTab)}
        className="mt-4 w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? "提交中..." : activeTab === "signup" ? "确认报名" : "确认取消"}
      </button>
    </div>
  );
}
