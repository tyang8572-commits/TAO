"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "登录失败");
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-white/80 bg-white p-6 shadow-card">
      <h1 className="text-2xl font-bold text-ink">管理员登录</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">第一版使用环境变量配置固定账号密码，适合快速启动 MVP。</p>

      <div className="mt-6 space-y-3">
        <input
          placeholder="管理员账号"
          value={form.username}
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
        />
        <input
          type="password"
          placeholder="管理员密码"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-5 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
      >
        {loading ? "登录中..." : "进入后台"}
      </button>
    </div>
  );
}
